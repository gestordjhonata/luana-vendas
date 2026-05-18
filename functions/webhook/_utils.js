export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function guardSlug(paramSlug, expectedSlug) {
  if (!expectedSlug) {
    return new Response(
      JSON.stringify({ error: 'webhook not configured on this instance' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (!paramSlug || !timingSafeEqual(paramSlug, expectedSlug)) {
    return new Response(
      JSON.stringify({ error: 'not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}
