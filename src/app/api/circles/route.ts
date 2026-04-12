import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getAllCircles,
  getUserCircleProgressAll,
} from "@/lib/db/queries-paths";
import { db } from "@/lib/db";
import { paths } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { ApiResponse, Circle, UserCircleProgress } from "@/types";

type CircleSummary = Circle & {
  progress: UserCircleProgress | null;
  paths: { id: string; name: string; iconKey: string | null; sortOrder: number }[];
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
    const [allCircles, circleProgress] = await Promise.all([
      getAllCircles(),
      getUserCircleProgressAll(user.id),
    ]);

    // Build progress lookup
    const progressMap = new Map(
      circleProgress.map((cp) => [cp.circleId, cp])
    );

    // Fetch paths for all circles in one query
    const allPaths = await db
      .select({
        id: paths.id,
        name: paths.name,
        circleId: paths.circleId,
        iconKey: paths.iconKey,
        sortOrder: paths.sortOrder,
      })
      .from(paths)
      .where(eq(paths.isPreset, true))
      .orderBy(asc(paths.sortOrder));

    // Group paths by circleId
    const pathsByCircle = new Map<string, typeof allPaths>();
    for (const p of allPaths) {
      if (!p.circleId) continue;
      const existing = pathsByCircle.get(p.circleId) ?? [];
      existing.push(p);
      pathsByCircle.set(p.circleId, existing);
    }

    const data: CircleSummary[] = allCircles.map((c): CircleSummary => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      circleNumber: c.circleNumber,
      themes: c.themes as string[],
      iconKey: c.iconKey,
      imageUrl: c.imageUrl,
      estimatedDays: c.estimatedDays,
      isPreset: c.isPreset,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      progress: progressMap.get(c.id) ?? null,
      paths: (pathsByCircle.get(c.id) ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        iconKey: p.iconKey,
        sortOrder: p.sortOrder,
      })),
    }));

    return NextResponse.json<ApiResponse<CircleSummary[]>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[GET /api/circles]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load sections" },
      { status: 500 }
    );
  }
}
