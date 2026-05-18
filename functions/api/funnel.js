// GET /api/funnel?key=...&days=30
// Returns sales funnel metrics: sessions, checkout_sessions, purchases, trk_rate, fbp_rate

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!env.DASH_KEY || key !== env.DASH_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const days = clampInt(url.searchParams.get('days'), 30, 1, 365);
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  try {
    const [sessions, checkouts, purchases, fbpCoverage] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) as total FROM sessions WHERE created_at >= ?`).bind(since).first(),
      env.DB.prepare(`SELECT COUNT(*) as total FROM checkout_sessions WHERE created_at >= ?`).bind(since).first(),
      env.DB.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN trk != '' AND trk IS NOT NULL THEN 1 ELSE 0 END) as with_trk,
          SUM(CASE WHEN meta_response_ok = 1 THEN 1 ELSE 0 END) as meta_ok,
          SUM(CASE WHEN ga4_response_ok = 1 THEN 1 ELSE 0 END) as ga4_ok
        FROM purchase_log WHERE created_at >= ?
      `).bind(since).first(),
      env.DB.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN fbp IS NOT NULL AND fbp != '' THEN 1 ELSE 0 END) as with_fbp,
          SUM(CASE WHEN fbc IS NOT NULL AND fbc != '' THEN 1 ELSE 0 END) as with_fbc
        FROM sessions WHERE created_at >= ?
      `).bind(since).first(),
    ]);

    const totalSessions = Number(sessions?.total || 0);
    const totalCheckouts = Number(checkouts?.total || 0);
    const totalPurchases = Number(purchases?.total || 0);
    const withTrk = Number(purchases?.with_trk || 0);
    const withFbp = Number(fbpCoverage?.with_fbp || 0);
    const withFbc = Number(fbpCoverage?.with_fbc || 0);

    return json({
      days,
      sessions: totalSessions,
      checkout_sessions: totalCheckouts,
      purchases: totalPurchases,
      trk_rate: totalPurchases > 0 ? Math.round((withTrk / totalPurchases) * 100) : null,
      fbp_coverage: totalSessions > 0 ? Math.round((withFbp / totalSessions) * 100) : null,
      fbc_coverage: totalSessions > 0 ? Math.round((withFbc / totalSessions) * 100) : null,
      meta_ok: Number(purchases?.meta_ok || 0),
      ga4_ok: Number(purchases?.ga4_ok || 0),
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function clampInt(raw, fallback, min, max) {
  const n = parseInt(raw || '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
