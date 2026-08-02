import Stripe from "stripe";

let instance: Stripe | null = null;

function getStripe(): Stripe {
  if (!instance) {
    instance = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return instance;
}

// Lazily constructed so importing this module (e.g. during Next.js's
// build-time page-data collection) doesn't require STRIPE_SECRET_KEY to be
// set — the key is only needed once a request actually calls into Stripe.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop as keyof Stripe);
  },
});
