import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getPathPosition,
  getAllUserPathProgress,
  getRetreatProgressForPath,
  getWaypointProgressForRetreat,
  getUserCircleProgressAll,
} from "@/lib/db/queries-paths";
import type {
  ApiResponse,
  PathPosition,
  UserPathProgress,
  UserRetreatProgress,
  UserWaypointProgress,
  UserCircleProgress,
} from "@/types";

type ProgressStats = {
  retreatsCompleted: number;
  waypointsCompleted: number;
  totalReadings: number;
};

type PathProgressWithStats = UserPathProgress & {
  stats: ProgressStats;
  retreatProgress: UserRetreatProgress[];
};

type PathProgressResponse = {
  position: {
    pathId: string;
    pathName: string;
    retreatId: string;
    retreatName: string;
    waypointId: string;
    waypointName: string;
    suggestedIntention: string;
    requiredReadings: number;
    readingCount: number;
    nextAvailableAt: string | null;
    circleName: string | null;
    circleNumber: number | null;
  } | null;
  allProgress: PathProgressWithStats[];
  circleProgress: UserCircleProgress[];
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [pathPosition, allPathProgress, allCircleProgress] = await Promise.all([
      getPathPosition(user.id),
      getAllUserPathProgress(user.id),
      getUserCircleProgressAll(user.id),
    ]);

    // Build per-path progress detail with stats, fetching retreat + waypoint
    // progress records in parallel across all paths the user has started.
    const allProgressWithStats: PathProgressWithStats[] = await Promise.all(
      allPathProgress.map(async (pp): Promise<PathProgressWithStats> => {
        const retreatProgress = await getRetreatProgressForPath(user.id, pp.id);

        const waypointProgressArrays = await Promise.all(
          retreatProgress.map((rp) =>
            getWaypointProgressForRetreat(user.id, rp.id)
          )
        );
        const allWaypointProgress = waypointProgressArrays.flat().map(
          (wp): UserWaypointProgress => ({
            ...wp,
            status: wp.status as "active" | "completed",
          })
        );

        const stats: ProgressStats = {
          retreatsCompleted: retreatProgress.filter(
            (rp) => rp.status === "completed"
          ).length,
          waypointsCompleted: allWaypointProgress.filter(
            (wp) => wp.status === "completed"
          ).length,
          totalReadings: retreatProgress.reduce(
            (sum, rp) => sum + rp.readingCount,
            0
          ),
        };

        const pathProgress: UserPathProgress = {
          id: pp.id,
          userId: pp.userId,
          pathId: pp.pathId,
          circleProgressId: pp.circleProgressId ?? null,
          status: pp.status as UserPathProgress["status"],
          currentRetreatId: pp.currentRetreatId,
          currentWaypointId: pp.currentWaypointId,
          startedAt: pp.startedAt,
          completedAt: pp.completedAt,
        };

        return {
          ...pathProgress,
          stats,
          retreatProgress: retreatProgress.map(
            (rp): UserRetreatProgress => ({
              id: rp.id,
              userId: rp.userId,
              retreatId: rp.retreatId,
              pathProgressId: rp.pathProgressId,
              status: rp.status as UserRetreatProgress["status"],
              readingCount: rp.readingCount,
              startedAt: rp.startedAt,
              completedAt: rp.completedAt,
              artifactSummary: rp.artifactSummary,
              artifactThemes: (rp.artifactThemes as string[]) ?? [],
              artifactImageUrl: rp.artifactImageUrl,
              thresholdCardId: rp.thresholdCardId ?? null,
              thresholdRetreatCardId: rp.thresholdRetreatCardId ?? null,
            })
          ),
        };
      })
    );

    // Build the compact position object consumed by the reading setup UI.
    let position: PathProgressResponse["position"] = null;

    if (pathPosition) {
      const { path, retreat, waypoint, waypointProgress, circle } =
        pathPosition as PathPosition;

      const wpNextAt = (waypointProgress as { nextAvailableAt?: Date | null }).nextAvailableAt ?? null;

      position = {
        pathId: path.id,
        pathName: path.name,
        retreatId: retreat.id,
        retreatName: retreat.name,
        waypointId: waypoint.id,
        waypointName: waypoint.name,
        suggestedIntention: waypoint.suggestedIntention,
        requiredReadings: waypoint.requiredReadings,
        readingCount: waypointProgress.readingCount,
        nextAvailableAt: wpNextAt ? wpNextAt.toISOString() : null,
        circleName: circle?.name ?? null,
        circleNumber: circle?.circleNumber ?? null,
      };
    }

    const data: PathProgressResponse = {
      position,
      allProgress: allProgressWithStats,
      circleProgress: allCircleProgress,
    };

    return NextResponse.json<ApiResponse<PathProgressResponse>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[GET /api/paths/progress]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load path progress" },
      { status: 500 }
    );
  }
}
