import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import type { ApiResponse, DraftCard } from "@/types";

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

  const body = await request.json();
  const { updates } = body as {
    updates: Array<{
      cardNumber: number;
      action: "keep" | "remove" | "edit";
      edits?: { title?: string; meaning?: string; guidance?: string };
    }>;
  };

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "updates array is required" },
      { status: 400 }
    );
  }

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
