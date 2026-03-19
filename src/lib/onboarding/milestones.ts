import { db } from "@/lib/db";
import { userMilestones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { OnboardingMilestone, OnboardingStage } from "@/types";

/**
 * Get all completed milestones for a user as a Set.
 */
export async function getUserMilestones(
  userId: string
): Promise<Set<OnboardingMilestone>> {
  const rows = await db
    .select({ milestone: userMilestones.milestone })
    .from(userMilestones)
    .where(eq(userMilestones.userId, userId));

  return new Set(rows.map((r) => r.milestone as OnboardingMilestone));
}

/**
 * Complete a milestone for a user. Idempotent via ON CONFLICT.
 */
export async function completeMilestone(
  userId: string,
  milestone: OnboardingMilestone,
  metadata?: Record<string, unknown>
): Promise<void> {
  await db
    .insert(userMilestones)
    .values({
      userId,
      milestone,
      metadata: metadata ?? null,
    })
    .onConflictDoNothing();
}

/**
 * Compute the user's onboarding stage (0-5) from their milestones.
 *
 * Also accepts inferred context (reading count, has chronicle, etc.)
 * so existing users auto-advance past tutorials they don't need.
 */
export function computeOnboardingStage(
  milestones: Set<OnboardingMilestone>,
  context: {
    hasInitiation: boolean;
    readingCount: number;
    hasChronicle: boolean;
    hasActivePath: boolean;
    hasAstroProfile: boolean;
    daysSinceSignup: number;
  }
): OnboardingStage {
  // Stage 0: Not initiated
  if (!context.hasInitiation && !milestones.has("initiation_complete")) {
    return 0;
  }

  // Stage 5: Mastery — contextual, check if stage 4 features used
  const stage4Complete =
    (milestones.has("paths_introduced") || context.hasActivePath) &&
    (milestones.has("astrology_introduced") || context.hasAstroProfile);

  if (
    stage4Complete &&
    (context.readingCount >= 10 || context.daysSinceSignup >= 14)
  ) {
    return 5;
  }

  // Stage 4: Going Deeper
  if (
    context.readingCount >= 5 ||
    context.daysSinceSignup >= 7
  ) {
    return 4;
  }

  // Stage 3: Daily Practice
  if (
    context.readingCount >= 3 ||
    context.daysSinceSignup >= 2 ||
    context.hasChronicle
  ) {
    return 3;
  }

  // Stage 2: Deepening
  if (context.readingCount >= 2) {
    return 2;
  }

  // Stage 1: Getting Oriented
  return 1;
}
