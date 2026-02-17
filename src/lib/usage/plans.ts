import type { PlanType } from "@/types";

/**
 * Determine the user's effective plan.
 * For now: admin role → "admin", everyone else → "free".
 * When Feature 17 (Stripe) is integrated, this will also check
 * for active pro subscriptions.
 */
export function getUserPlanFromRole(role: string | undefined): PlanType {
  if (role === "admin") return "admin";
  // TODO: Feature 17 — check subscription for "pro"
  return "free";
}
