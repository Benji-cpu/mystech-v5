import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { userGuidanceCompletions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  guidanceId: z.string(),
});

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

  const { guidanceId } = parsed.data;

  await db
    .update(userGuidanceCompletions)
    .set({
      listenedAgainCount: sql`${userGuidanceCompletions.listenedAgainCount} + 1`,
    })
    .where(
      and(
        eq(userGuidanceCompletions.userId, user.id),
        eq(userGuidanceCompletions.guidanceId, guidanceId)
      )
    );

  return NextResponse.json({ success: true });
}
