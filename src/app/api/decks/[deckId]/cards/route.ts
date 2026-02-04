import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getCardsForDeck } from "@/lib/db/queries";
import type { ApiResponse, Card } from "@/types";

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
  const data: Card[] = cardRows.map((c) => ({
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
  }));

  return NextResponse.json<ApiResponse<Card[]>>({ success: true, data });
}

export async function POST(request: NextRequest, { params }: Params) {
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
  const { cardNumber, title, meaning, guidance, imagePrompt } = body as {
    cardNumber: number;
    title: string;
    meaning: string;
    guidance: string;
    imagePrompt?: string;
  };

  if (!title || !meaning || !guidance || cardNumber == null) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardNumber, title, meaning, and guidance are required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(cards)
    .values({
      deckId,
      cardNumber,
      title,
      meaning,
      guidance,
      imagePrompt: imagePrompt ?? null,
    })
    .returning();

  const data: Card = {
    id: created.id,
    deckId: created.deckId,
    cardNumber: created.cardNumber,
    title: created.title,
    meaning: created.meaning,
    guidance: created.guidance,
    imageUrl: created.imageUrl,
    imagePrompt: created.imagePrompt,
    imageStatus: created.imageStatus as Card["imageStatus"],
    createdAt: created.createdAt,
  };

  return NextResponse.json<ApiResponse<Card>>(
    { success: true, data },
    { status: 201 }
  );
}
