export async function onRequest(context) {
  const { request, env } = context;
  // Only allow GET for listing
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ ok: false, message: 'GET only' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const db = env.DB || env.D1 || env.D1_DB || env.DATABASE;
  if (!db) {
    return new Response(JSON.stringify({ ok: false, error: 'No D1 binding configured. Bind a D1 database as `DB`.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1000);
    const stmt = `SELECT id, event_type, payload, created_at FROM events ORDER BY created_at DESC LIMIT ${limit}`;
    const res = await db.prepare(stmt).all();
    return new Response(JSON.stringify({ ok: true, results: res.results || [] }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
