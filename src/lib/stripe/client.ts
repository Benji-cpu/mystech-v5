import Stripe from "stripe";

// Placeholder at build time — no API calls are made until runtime request handlers execute.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder", {
  typescript: true,
});
