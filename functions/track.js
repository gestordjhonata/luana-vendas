export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'POST only' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  let data = null;
  try { data = await request.json(); } catch (e) { data = null; }
  const now = new Date().toISOString();
  const event_type = (data && data.event_type) ? data.event_type : 'unknown';

  // Try common D1 binding names
  const db = env.DB || env.D1 || env.D1_DB || env.DATABASE;
  if (db) {
    try {
      // ensure table exists
      await db.prepare(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, payload TEXT, created_at TEXT)`).run();
      await db.prepare(`INSERT INTO events (event_type, payload, created_at) VALUES (?, ?, ?)`)
        .bind(event_type, JSON.stringify(data || {}), now)
        .run();
      return new Response(JSON.stringify({ ok: true, stored: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // If no DB bound, just return OK (useful for testing)
  return new Response(JSON.stringify({ ok: true, stored: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
