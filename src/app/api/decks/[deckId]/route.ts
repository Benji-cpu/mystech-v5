import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getCardsForDeck } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import type { ApiResponse, Deck, Card } from "@/types";

type Params = { params: Promise<{ deckId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
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

  const cardRows = await getCardsForDeck(deckId);

  const data: Deck & { cards: Card[] } = {
    id: deck.id,
    userId: deck.userId,
    title: deck.title,
    description: deck.description,
    theme: deck.theme,
    status: deck.status as Deck["status"],
    cardCount: deck.cardCount,
    isPublic: deck.isPublic,
    coverImageUrl: deck.coverImageUrl,
    artStyleId: deck.artStyleId,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cards: cardRows.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      cardNumber: c.cardNumber,
      title: c.title,
      meaning: c.meaning,
      guidance: c.guidance,
      imageUrl: c.imageUrl,
      imagePrompt: c.imagePrompt,
      imageStatus: c.imageStatus as Card["imageStatus"],
      createdAt: c.createdAt,
    })),
  };

  return NextResponse.json<ApiResponse<Deck & { cards: Card[] }>>({
    success: true,
    data,
  });
}

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
  const { title, description, theme } = body as {
    title?: string;
    description?: string;
    theme?: string;
  };

  const [updated] = await db
    .update(decks)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(theme !== undefined && { theme }),
      updatedAt: new Date(),
    })
    .where(eq(decks.id, deckId))
    .returning();

  const data: Deck = {
    id: updated.id,
    userId: updated.userId,
    title: updated.title,
    description: updated.description,
    theme: updated.theme,
    status: updated.status as Deck["status"],
    cardCount: updated.cardCount,
    isPublic: updated.isPublic,
    coverImageUrl: updated.coverImageUrl,
    artStyleId: updated.artStyleId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };

  return NextResponse.json<ApiResponse<Deck>>({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: Params) {
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

  // Best-effort cleanup of card images from Vercel Blob
  const cardRows = await getCardsForDeck(deckId);
  const imageUrls = cardRows
    .map((c) => c.imageUrl)
    .filter((url): url is string => !!url);

  if (imageUrls.length > 0) {
    try {
      await del(imageUrls);
    } catch {
      // Best-effort: don't block deletion if blob cleanup fails
    }
  }

  // CASCADE will delete cards and deck_metadata
  await db.delete(decks).where(eq(decks.id, deckId));

  return NextResponse.json<ApiResponse<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
