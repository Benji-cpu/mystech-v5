import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser } from "@/lib/db/queries";
import { eq, and } from "drizzle-orm";
import { del } from "@vercel/blob";
import type { ApiResponse, Card } from "@/types";

type Params = { params: Promise<{ deckId: string; cardId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId, cardId } = await params;
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { title, meaning, guidance, imagePrompt } = body as {
    title?: string;
    meaning?: string;
    guidance?: string;
    imagePrompt?: string;
  };

  const [updated] = await db
    .update(cards)
    .set({
      ...(title !== undefined && { title }),
      ...(meaning !== undefined && { meaning }),
      ...(guidance !== undefined && { guidance }),
      ...(imagePrompt !== undefined && { imagePrompt }),
      updatedAt: new Date(),
    })
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
    .returning();

  if (!updated) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  const data: Card = {
    id: updated.id,
    deckId: updated.deckId,
    cardNumber: updated.cardNumber,
    title: updated.title,
    meaning: updated.meaning,
    guidance: updated.guidance,
    imageUrl: updated.imageUrl,
    imagePrompt: updated.imagePrompt,
    imageStatus: updated.imageStatus as Card["imageStatus"],
    createdAt: updated.createdAt,
  };

  return NextResponse.json<ApiResponse<Card>>({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId, cardId } = await params;
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  // Get card to find image URL for cleanup
  const [card] = await db
    .select()
    .from(cards)
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)));

  if (!card) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  // Best-effort blob cleanup
  if (card.imageUrl) {
    try {
      await del(card.imageUrl);
    } catch {
      // Best-effort
    }
  }

  await db
    .delete(cards)
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)));

  return NextResponse.json<ApiResponse<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
