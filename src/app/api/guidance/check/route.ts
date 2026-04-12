import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { guidanceContent, userGuidanceCompletions, userProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const triggerKey = request.nextUrl.searchParams.get("triggerKey");
  if (!triggerKey) {
    return NextResponse.json({ error: "triggerKey is required" }, { status: 400 });
  }

  // Check if guidance is enabled for this user
  const [profile] = await db
    .select({ guidanceEnabled: userProfiles.guidanceEnabled })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  if (profile && !profile.guidanceEnabled) {
    return NextResponse.json({ show: false, guidance: null, previouslyCompleted: false });
  }

  // Look up guidance content
  const [guidance] = await db
    .select()
    .from(guidanceContent)
    .where(eq(guidanceContent.triggerKey, triggerKey))
    .limit(1);

  if (!guidance) {
    return NextResponse.json({ show: false, guidance: null, previouslyCompleted: false });
  }

  // Check if already completed
  const [completion] = await db
    .select()
    .from(userGuidanceCompletions)
    .where(
      and(
        eq(userGuidanceCompletions.userId, user.id),
        eq(userGuidanceCompletions.guidanceId, guidance.id)
      )
    )
    .limit(1);

  const previouslyCompleted = !!completion;

  return NextResponse.json({
    show: !previouslyCompleted,
    guidance: {
      id: guidance.id,
      title: guidance.title,
      narrationText: guidance.narrationText,
      audioUrl: guidance.audioUrl,
      audioDurationMs: guidance.audioDurationMs,
      deliveryMode: guidance.deliveryMode,
    },
    previouslyCompleted,
  });
}
