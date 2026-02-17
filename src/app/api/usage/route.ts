import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage/plans";
import { getOrCreateUsageRecord, checkDailyReadings } from "@/lib/usage/usage";
import { PLAN_LIMITS } from "@/lib/constants";
import type { ApiResponse, UsageStatus } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const role = (user as { role?: string }).role;

  // Determine plan: admin from role, pro from subscription, else free
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    // Check subscription for pro
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  const limits = PLAN_LIMITS[plan];

  // Admin: return unlimited status
  if (plan === "admin") {
    const data: UsageStatus = {
      plan: "admin",
      credits: { used: 0, limit: Infinity, remaining: Infinity },
      readings: { usedToday: 0, limitPerDay: Infinity },
      periodEnd: "",
      isLifetimeCredits: false,
    };
    return NextResponse.json<ApiResponse<UsageStatus>>({ success: true, data });
  }

  const record = await getOrCreateUsageRecord(user.id, plan);
  const readingStatus = await checkDailyReadings(user.id, plan);

  const data: UsageStatus = {
    plan,
    credits: {
      used: record.creditsUsed,
      limit: limits.credits,
      remaining: Math.max(0, limits.credits - record.creditsUsed),
    },
    readings: {
      usedToday: readingStatus.performedToday,
      limitPerDay: limits.readingsPerDay,
    },
    periodEnd: record.periodEnd.toISOString(),
    isLifetimeCredits: limits.creditsAreLifetime,
  };

  return NextResponse.json<ApiResponse<UsageStatus>>({ success: true, data });
}
