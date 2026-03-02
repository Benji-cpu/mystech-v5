import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserPlan, getUserSubscription } from "@/lib/db/queries";
import { getUserPlanFromRole, getOrCreateUsageRecord, checkDailyReadings } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import { BillingPageClient } from "@/components/billing/billing-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanType } from "@/types";

function BillingContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Plan card */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="h-px w-full bg-white/10" />
        {/* Usage bars */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function BillingContent() {
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
  );
}

export default function BillingPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription and view usage."
      />
      <Suspense fallback={<BillingContentSkeleton />}>
        <BillingContent />
      </Suspense>
    </div>
  );
}
