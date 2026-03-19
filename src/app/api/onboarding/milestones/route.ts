import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserMilestones } from "@/lib/onboarding/milestones";
import type { ApiResponse, OnboardingMilestone } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const milestones = await getUserMilestones(user.id);

  return NextResponse.json<ApiResponse<OnboardingMilestone[]>>({
    success: true,
    data: Array.from(milestones),
  });
}
