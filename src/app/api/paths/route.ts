import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getAllPaths } from "@/lib/db/queries-journey";
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
    const rows = await getAllPaths();

    const data: Path[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      themes: p.themes as string[],
      symbolicVocabulary: p.symbolicVocabulary as string[],
      interpretiveLens: p.interpretiveLens,
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
