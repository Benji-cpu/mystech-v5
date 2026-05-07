export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "";
export const STRIPE_PRINT_DECK_PRICE_ID = process.env.STRIPE_PRINT_DECK_PRICE_ID || "";

export function requireStripePriceId(): string {
  if (!STRIPE_PRO_PRICE_ID) {
    throw new Error("STRIPE_PRO_PRICE_ID is required");
  }
  return STRIPE_PRO_PRICE_ID;
}

export function requireStripePrintDeckPriceId(): string {
  if (!STRIPE_PRINT_DECK_PRICE_ID) {
    throw new Error("STRIPE_PRINT_DECK_PRICE_ID is required");
  }
  return STRIPE_PRINT_DECK_PRICE_ID;
}
