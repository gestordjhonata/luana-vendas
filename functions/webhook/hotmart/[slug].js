import { processPurchase } from '../_core.js';
import { guardSlug } from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;

  const slugFailure = guardSlug(params.slug, env.HOTMART_WEBHOOK_SLUG);
  if (slugFailure) return slugFailure;

  try {
    const rawPayload = await request.json();
    const body = rawPayload.data || {};
    const eventName = rawPayload.event || '';

    if (eventName !== 'PURCHASE_APPROVED' || body.purchase?.status !== 'APPROVED') {
      return new Response(
        JSON.stringify({ ok: true, skipped: 'not an approved purchase', event: eventName, status: body.purchase?.status }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const buyer = body.buyer || {};
    const product = body.product || {};
    const purchase = body.purchase || {};
    const price = purchase.price || purchase.full_price || {};

    const fullName = buyer.name
      || [buyer.first_name, buyer.last_name].filter(Boolean).join(' ')
      || '';

    const productIdStr = String(product.id || product.ucode || '');
    const platformUtm = parseSckBundle(purchase.origin?.sck);

    const parsed = {
      platform: 'hotmart',
      trk: purchase.origin?.xcod || '',
      email: buyer.email || '',
      name: fullName,
      phone: '',
      value: parseFloat(price.value) || 0,
      currency: price.currency_value || 'BRL',
      transactionId: purchase.transaction || '',
      productId: productIdStr,
      productName: product.name || '',
      items: [{
        productId: productIdStr,
        name: product.name || '',
        price: { value: parseFloat(price.value) || 0, currency: price.currency_value || 'BRL' },
      }],
      platformUtm,
    };

    const result = await processPurchase({ parsed, env, context });

    return new Response(
      JSON.stringify({ ok: true, event_id: result.eventId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Hotmart webhook error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function parseSckBundle(sck) {
  const empty = { utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '' };
  if (!sck || typeof sck !== 'string' || !sck.includes('|')) return empty;
  const parts = sck.split('|').map(p => {
    try { return decodeURIComponent(p); } catch (_) { return p; }
  });
  return {
    utm_source: parts[0] || '',
    utm_medium: parts[1] || '',
    utm_campaign: parts[2] || '',
    utm_content: parts[3] || '',
    utm_term: parts[4] || '',
  };
}
