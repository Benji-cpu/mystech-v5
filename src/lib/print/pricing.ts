/**
 * Print-on-Demand pricing constants.
 *
 * Phase 2 ships with a flat $49 USD price across allowed regions and a
 * conservative shipping flat-rate per country. These can move to Stripe
 * Shipping Rates objects in Phase 4 — env-keyed below for that pivot.
 */
import { PRINT_DECK_PRICE_USD_CENTS } from "@/lib/constants";

export const PRINT_DECK_PRICE_CENTS = PRINT_DECK_PRICE_USD_CENTS;
export const PRINT_DECK_CURRENCY = "usd";

/** Stripe Shipping Rate IDs by country, set via env. Optional in Phase 2. */
export const SHIPPING_RATE_IDS: Record<string, string | undefined> = {
  US: process.env.STRIPE_SHIPPING_RATE_US,
  CA: process.env.STRIPE_SHIPPING_RATE_CA,
  GB: process.env.STRIPE_SHIPPING_RATE_GB,
};

/** Countries Phase 2 ships to. */
export const ALLOWED_COUNTRIES = ["US", "CA", "GB"] as const;
export type AllowedCountry = (typeof ALLOWED_COUNTRIES)[number];

export function isAllowedCountry(c: string): c is AllowedCountry {
  return (ALLOWED_COUNTRIES as readonly string[]).includes(c);
}
