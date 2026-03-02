import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getPathCards } from "@/lib/db/queries-journey";
import type { ApiResponse, Card } from "@/types";

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

  const cards: Card[] = rows.map((row) => ({
    id: row.id,
    deckId: row.deckId,
    cardNumber: row.cardNumber,
    title: row.title,
    meaning: row.meaning,
    guidance: row.guidance,
    imageUrl: row.imageUrl,
    imagePrompt: row.imagePrompt,
    imageStatus: row.imageStatus as Card["imageStatus"],
    cardType: (row.cardType ?? "general") as Card["cardType"],
    originContext: row.originContext ?? null,
    createdAt: row.createdAt,
  }));

  return NextResponse.json<ApiResponse<Card[]>>({ success: true, data: cards });
}
