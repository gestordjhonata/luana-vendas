// Per-product configuration for sales webhooks.
// Add the Hotmart product ID (numeric) as key under 'hotmart'.
// Meta CAPI + GA4 fire automatically off attribution — these entries only
// control optional fan-outs: Encharge tag, ManyChat tag ID, Google Ads
// conversion action ID. Leave fields empty / 0 to skip those integrations.
//
// To find the Hotmart product ID: Hotmart panel → product page → URL bar
// or in the PURCHASE_APPROVED webhook payload under data.product.id

export default {
  hotmart: {
    // Example (fill in with the real product ID):
    // '123456': {
    //   name: '21 Dias de Superação',
    //   enchargeTag: '',
    //   manychatTagId: 0,
    //   googleAdsConversionActionId: '',
    // },
  },
  eduzz: {},
  kiwify: {},
};
