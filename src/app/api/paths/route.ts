import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getAllPaths, getAllCircles } from "@/lib/db/queries-paths";
import type { ApiResponse, Path } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [rows, allCircles] = await Promise.all([
      getAllPaths(),
      getAllCircles(),
    ]);

    // Build circle name lookup
    const circleNameMap = new Map(allCircles.map((c) => [c.id, c.name]));

    const data: (Path & { circleName: string | null })[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      themes: p.themes as string[],
      symbolicVocabulary: p.symbolicVocabulary as string[],
      interpretiveLens: p.interpretiveLens,
      circleId: p.circleId,
      circleName: p.circleId ? circleNameMap.get(p.circleId) ?? null : null,
      imageUrl: p.imageUrl,
      isPreset: p.isPreset,
      createdBy: p.createdBy,
      isPublic: p.isPublic,
      shareToken: p.shareToken,
      followerCount: p.followerCount,
      iconKey: p.iconKey,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json<ApiResponse<Path[]>>({ success: true, data });
  } catch (error) {
    console.error("[GET /api/paths]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load paths" },
      { status: 500 }
    );
  }
}
