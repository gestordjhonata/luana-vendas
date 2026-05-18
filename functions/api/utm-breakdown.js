const ALLOWED_DIMENSIONS = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!env.DASH_KEY || key !== env.DASH_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const dimension = url.searchParams.get('dimension') || 'utm_source';
  if (!ALLOWED_DIMENSIONS.has(dimension)) {
    return json({ error: `dimension must be one of ${[...ALLOWED_DIMENSIONS].join(', ')}` }, 400);
  }
  const days = clampInt(url.searchParams.get('days'), 30, 1, 365);
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const filterClauses = [], filterBindings = [], activeFilters = {};
  for (const field of ALLOWED_DIMENSIONS) {
    if (field === dimension) continue;
    const val = url.searchParams.get(field);
    if (val != null && val !== '') { filterClauses.push(`${field} = ?`); filterBindings.push(val); activeFilters[field] = val; }
  }
  const whereClause = ['created_at >= ?', ...filterClauses].join(' AND ');
  const query = `SELECT COALESCE(NULLIF(${dimension}, ''), '(not set)') as value, COUNT(*) as sales, COALESCE(SUM(value), 0) as revenue, COALESCE(AVG(value), 0) as aov FROM purchase_log WHERE ${whereClause} GROUP BY value ORDER BY revenue DESC`;
  try {
    const rows = await env.DB.prepare(query).bind(since, ...filterBindings).all();
    return json({ dimension, days, filters: activeFilters, rows: rows.results || [] });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}

function clampInt(raw, fallback, min, max) {
  const n = parseInt(raw || '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
