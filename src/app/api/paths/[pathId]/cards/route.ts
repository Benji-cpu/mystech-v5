import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getPathCards } from "@/lib/db/queries-paths";
import type { ApiResponse, RetreatCard } from "@/types";

type Params = { params: Promise<{ pathId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { pathId } = await params;

  const rows = await getPathCards(user.id, pathId);

  const cards: RetreatCard[] = rows.map((row) => ({
    id: row.id,
    retreatId: row.retreatId,
    cardType: row.cardType as RetreatCard["cardType"],
    source: row.source as RetreatCard["source"],
    title: row.title,
    meaning: row.meaning,
    guidance: row.guidance,
    imageUrl: row.imageUrl,
    imagePrompt: row.imagePrompt,
    imageStatus: (row.imageStatus ?? "pending") as RetreatCard["imageStatus"],
    sortOrder: row.sortOrder ?? 0,
    userId: row.userId,
    originContext: row.originContext as RetreatCard["originContext"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return NextResponse.json<ApiResponse<RetreatCard[]>>({ success: true, data: cards });
}
