import type { PlanType } from "@/types";

/**
 * Determine the user's effective plan from their role alone (sync, no DB call).
 *
 * Admin role → "admin", everyone else → "free".
 * Callers that need to detect Pro subscriptions must follow up with
 * `getUserPlan()` from `@/lib/db/queries`, which checks the subscriptions table.
 */
export function getUserPlanFromRole(role: string | undefined): PlanType {
  if (role === "admin") return "admin";
  return "free";
}
