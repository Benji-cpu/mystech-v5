import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import type { ApiResponse, DraftCard } from "@/types";
import { parseBody } from "@/lib/api/validate";
import { UpdateDraftsSchema } from "@/lib/api/schemas";

type Params = { params: Promise<{ deckId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  const parsed = await parseBody(request, UpdateDraftsSchema);
  if (!parsed.ok) return parsed.response;
  const { updates } = parsed.data;

  const metadata = await getDeckMetadata(deckId);
  if (!metadata?.draftCards) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No draft cards found" },
      { status: 404 }
    );
  }

  const draftCards = metadata.draftCards as DraftCard[];
  const updatedCards = draftCards.map((card) => {
    const update = updates.find((u) => u.cardNumber === card.cardNumber);
    if (!update) return card;

    if (update.action === "remove") {
      return { ...card, removed: true };
    }

    if (update.action === "keep") {
      return { ...card, removed: false };
    }

    if (update.action === "edit" && update.edits) {
      return {
        ...card,
        ...update.edits,
        previousVersion: {
          title: card.title,
          meaning: card.meaning,
          guidance: card.guidance,
          imagePrompt: card.imagePrompt,
        },
      };
    }

    return card;
  });

  await db
    .update(deckMetadata)
    .set({ draftCards: updatedCards, updatedAt: new Date() })
    .where(eq(deckMetadata.deckId, deckId));

  return NextResponse.json<ApiResponse<{ draftCards: DraftCard[] }>>({
    success: true,
    data: { draftCards: updatedCards },
  });
}
