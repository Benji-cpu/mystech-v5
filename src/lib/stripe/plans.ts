if (!process.env.STRIPE_PRO_PRICE_ID && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_PRO_PRICE_ID is required in production");
}

export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "";
