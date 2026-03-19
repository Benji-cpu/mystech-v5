import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { completeMilestone, getUserMilestones, computeOnboardingStage } from "@/lib/onboarding/milestones";
import { getUserTotalReadingCount, getUserChronicleDeck, getAstrologyProfile } from "@/lib/db/queries";
import { getPathPosition } from "@/lib/db/queries-paths";
import { users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { ApiResponse, OnboardingMilestone, OnboardingStage } from "@/types";

// Valid milestone names (runtime check)
const VALID_MILESTONES: Set<string> = new Set([
  "initiation_complete",
  "nav_tutorial_seen",
  "dashboard_tour_seen",
  "first_deck_explored",
  "second_reading_complete",
  "spread_types_introduced",
  "art_styles_introduced",
  "chronicle_introduced",
  "first_chronicle_entry",
  "streak_concept_seen",
  "paths_introduced",
  "astrology_introduced",
  "first_path_activated",
  "astrology_setup_complete",
  "sharing_introduced",
  "pro_features_introduced",
  "custom_art_style_introduced",
]);

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { milestone } = body as { milestone?: string };

  if (!milestone || !VALID_MILESTONES.has(milestone)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid milestone" },
      { status: 400 }
    );
  }

  await completeMilestone(user.id, milestone as OnboardingMilestone);

  // Compute updated stage
  const milestones = await getUserMilestones(user.id);
  const [readingCount, chronicleDeck, pathPosition, astroProfile, [userData]] =
    await Promise.all([
      getUserTotalReadingCount(user.id),
      getUserChronicleDeck(user.id),
      getPathPosition(user.id),
      getAstrologyProfile(user.id),
      db
        .select({ initiationCompletedAt: users.initiationCompletedAt, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, user.id)),
    ]);

  const daysSinceSignup = userData?.createdAt
    ? Math.floor((Date.now() - userData.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const stage = computeOnboardingStage(milestones, {
    hasInitiation: userData?.initiationCompletedAt != null,
    readingCount,
    hasChronicle: !!chronicleDeck,
    hasActivePath: !!pathPosition,
    hasAstroProfile: !!astroProfile,
    daysSinceSignup,
  });

  return NextResponse.json<
    ApiResponse<{ milestones: OnboardingMilestone[]; stage: OnboardingStage }>
  >({
    success: true,
    data: {
      milestones: Array.from(milestones),
      stage,
    },
  });
}
