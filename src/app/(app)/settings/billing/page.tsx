import { requireAuth, isAdmin } from "@/lib/auth/helpers";
import { getUserPlan, getUserSubscription } from "@/lib/db/queries";
import { getUserPlanFromRole, getOrCreateUsageRecord, checkDailyReadings } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import { BillingPageClient } from "@/components/billing/billing-page-client";
import type { PlanType } from "@/types";

export default async function BillingPage() {
  const user = await requireAuth();

  let plan: PlanType = getUserPlanFromRole((user as { role?: string }).role);
  const [sub, subPlan] = await Promise.all([
    getUserSubscription(user.id!),
    plan === "free" ? getUserPlan(user.id!) : Promise.resolve(plan),
  ]);
  if (plan === "free" && subPlan === "pro") plan = "pro";

  // Get usage data
  const [usageRecord, readingStatus] = await Promise.all([
    plan !== "admin" ? getOrCreateUsageRecord(user.id!, plan) : null,
    plan !== "admin" ? checkDailyReadings(user.id!, plan) : null,
  ]);

  const limits = PLAN_LIMITS[plan];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription and view usage."
      />
      <BillingPageClient
        plan={plan}
        status={sub?.status ?? "active"}
        currentPeriodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
        cancelAtPeriodEnd={sub?.cancelAtPeriodEnd ?? false}
        usage={{
          creditsUsed: usageRecord?.creditsUsed ?? 0,
          creditsLimit: limits.credits,
          readingsToday: readingStatus?.performedToday ?? 0,
          readingsPerDay: limits.readingsPerDay,
          isLifetimeCredits: limits.creditsAreLifetime,
          periodEnd: usageRecord?.periodEnd?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
