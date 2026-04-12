import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { guidanceContent, userGuidanceCompletions, userPracticeProgress } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count completed practices
  const [practiceResult] = await db
    .select({ count: count() })
    .from(userPracticeProgress)
    .where(eq(userPracticeProgress.userId, user.id));
  const practiceCount = practiceResult?.count ?? 0;

  // Count completed check-in guidances
  const checkInGuidances = await db
    .select({ id: guidanceContent.id })
    .from(guidanceContent)
    .where(eq(guidanceContent.triggerLevel, "check_in"));

  const checkInIds = checkInGuidances.map((g) => g.id);

  let checkInCount = 0;
  if (checkInIds.length > 0) {
    const completions = await db
      .select({ count: count() })
      .from(userGuidanceCompletions)
      .innerJoin(guidanceContent, eq(userGuidanceCompletions.guidanceId, guidanceContent.id))
      .where(
        and(
          eq(userGuidanceCompletions.userId, user.id),
          eq(guidanceContent.triggerLevel, "check_in")
        )
      );
    checkInCount = completions[0]?.count ?? 0;
  }

  // Check if a check-in is due: every 3 completed practices
  if (practiceCount < (checkInCount + 1) * 3) {
    return NextResponse.json({ show: false, guidance: null, previouslyCompleted: false });
  }

  // Get the next check-in guidance (ordered by sortOrder)
  const allCheckIns = await db
    .select()
    .from(guidanceContent)
    .where(eq(guidanceContent.triggerLevel, "check_in"))
    .orderBy(guidanceContent.sortOrder);

  // Find the first one not yet completed
  for (const checkIn of allCheckIns) {
    const [completion] = await db
      .select()
      .from(userGuidanceCompletions)
      .where(
        and(
          eq(userGuidanceCompletions.userId, user.id),
          eq(userGuidanceCompletions.guidanceId, checkIn.id)
        )
      )
      .limit(1);

    if (!completion) {
      return NextResponse.json({
        show: true,
        guidance: {
          id: checkIn.id,
          title: checkIn.title,
          narrationText: checkIn.narrationText,
          audioUrl: checkIn.audioUrl,
          audioDurationMs: checkIn.audioDurationMs,
          deliveryMode: checkIn.deliveryMode,
        },
        previouslyCompleted: false,
      });
    }
  }

  // All check-ins completed
  return NextResponse.json({ show: false, guidance: null, previouslyCompleted: true });
}
