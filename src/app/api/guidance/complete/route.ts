import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { guidanceContent, userGuidanceCompletions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { completeMilestone } from "@/lib/onboarding/milestones";
import type { OnboardingMilestone } from "@/types";

const bodySchema = z.object({
  guidanceId: z.string(),
  skipped: z.boolean().optional(),
});

// Map feature guidance to onboarding milestones
const FEATURE_MILESTONE_MAP: Record<string, OnboardingMilestone> = {
  chronicle: "chronicle_introduced",
  art_styles: "art_styles_introduced",
  astrology: "astrology_introduced",
  sharing: "sharing_introduced",
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { guidanceId, skipped } = parsed.data;

  // Upsert completion
  await db
    .insert(userGuidanceCompletions)
    .values({
      userId: user.id,
      guidanceId,
      skippedAt: skipped ? new Date() : null,
    })
    .onConflictDoNothing();

  // If feature-level guidance, also complete the corresponding onboarding milestone
  const [guidance] = await db
    .select({ featureKey: guidanceContent.featureKey })
    .from(guidanceContent)
    .where(eq(guidanceContent.id, guidanceId))
    .limit(1);

  if (guidance?.featureKey) {
    const milestone = FEATURE_MILESTONE_MAP[guidance.featureKey];
    if (milestone) {
      await completeMilestone(user.id, milestone);
    }
  }

  return NextResponse.json({ success: true });
}
