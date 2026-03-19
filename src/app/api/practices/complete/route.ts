import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  markPracticeComplete,
  getPathPosition,
  checkAndAdvanceWaypoint,
} from "@/lib/db/queries-paths";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  practiceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request body" } satisfies ApiResponse<never>,
      { status: 400 }
    );
  }

  const { practiceId } = parsed.data;

  try {
    // Mark practice complete (upsert)
    await markPracticeComplete(user.id, practiceId);

    // Look up the practice's waypointId to trigger advancement check
    const [practice] = await db
      .select({ waypointId: practices.waypointId })
      .from(practices)
      .where(eq(practices.id, practiceId));

    if (practice?.waypointId) {
      // Load current path position and check advancement
      const pathPosition = await getPathPosition(user.id);
      if (pathPosition && pathPosition.waypoint.id === practice.waypointId) {
        await checkAndAdvanceWaypoint(user.id, pathPosition);
      }
    }

    return NextResponse.json(
      { success: true, data: { completed: true } } satisfies ApiResponse<{ completed: true }>,
    );
  } catch (err) {
    console.error("[practices/complete] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to complete practice" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
