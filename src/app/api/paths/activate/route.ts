import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { activatePath } from "@/lib/db/queries-journey";
import type { ApiResponse, UserPathProgress } from "@/types";

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

  const { pathId } = body as { pathId?: string };

  if (!pathId || typeof pathId !== "string" || pathId.trim().length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "pathId is required" },
      { status: 400 }
    );
  }

  try {
    const progress = await activatePath(user.id, pathId);

    const data: UserPathProgress = {
      id: progress.id,
      userId: progress.userId,
      pathId: progress.pathId,
      status: progress.status as UserPathProgress["status"],
      currentRetreatId: progress.currentRetreatId,
      currentWaypointId: progress.currentWaypointId,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
    };

    return NextResponse.json<ApiResponse<UserPathProgress>>(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to activate path";
    const isNotFound = message === "Path not found" ||
      message === "Path has no retreats" ||
      message === "Retreat has no waypoints";

    console.error("[POST /api/paths/activate]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: message },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
