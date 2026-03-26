import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is required in production");
}

// Placeholder at build time — no API calls are made until runtime request handlers execute.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder", {
  typescript: true,
});
