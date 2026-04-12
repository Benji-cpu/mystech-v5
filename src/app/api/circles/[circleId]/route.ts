import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getCircleWithPaths,
  getUserCircleProgressRecord,
  getUserPathProgress,
} from "@/lib/db/queries-paths";
import type { ApiResponse, Circle, UserCircleProgress } from "@/types";

type CircleDetail = Circle & {
  progress: UserCircleProgress | null;
  paths: {
    id: string;
    name: string;
    description: string;
    themes: string[];
    iconKey: string | null;
    sortOrder: number;
    imageUrl: string | null;
    userStatus: "locked" | "active" | "paused" | "completed" | null;
  }[];
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { circleId } = await params;

  try {
    const circleWithPaths = await getCircleWithPaths(circleId);
    if (!circleWithPaths) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const circleProgress = await getUserCircleProgressRecord(
      user.id,
      circleId
    );

    // Get user status for each path
    const pathsWithStatus = await Promise.all(
      circleWithPaths.paths.map(async (p) => {
        const pathProgress = await getUserPathProgress(user.id, p.id);
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          themes: p.themes as string[],
          iconKey: p.iconKey,
          sortOrder: p.sortOrder,
          imageUrl: p.imageUrl,
          userStatus: pathProgress
            ? (pathProgress.status as "active" | "paused" | "completed")
            : null,
        };
      })
    );

    const data: CircleDetail = {
      id: circleWithPaths.id,
      name: circleWithPaths.name,
      description: circleWithPaths.description,
      sortOrder: circleWithPaths.sortOrder,
      circleNumber: circleWithPaths.circleNumber,
      themes: circleWithPaths.themes as string[],
      iconKey: circleWithPaths.iconKey,
      imageUrl: circleWithPaths.imageUrl,
      estimatedDays: circleWithPaths.estimatedDays,
      isPreset: circleWithPaths.isPreset,
      createdAt: circleWithPaths.createdAt,
      updatedAt: circleWithPaths.updatedAt,
      progress: circleProgress,
      paths: pathsWithStatus,
    };

    return NextResponse.json<ApiResponse<CircleDetail>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[GET /api/circles/[circleId]]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load section" },
      { status: 500 }
    );
  }
}
