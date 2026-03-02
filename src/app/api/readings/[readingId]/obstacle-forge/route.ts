import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks, readings, readingJourneyContext } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getPreferredDeckForPathCards, getPathById } from "@/lib/db/queries-journey";
import { getArtStyleById } from "@/lib/db/queries";
import { generateCardImage } from "@/lib/ai/image-generation";
import { eq, and, sql } from "drizzle-orm";
import type { ApiResponse, Card } from "@/types";

type Params = { params: Promise<{ readingId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;
  const body = await request.json();
  const { title, meaning, guidance, imagePrompt, pattern, retreatId } = body as {
    title: string;
    meaning: string;
    guidance: string;
    imagePrompt: string;
    pattern: string;
    retreatId: string;
  };

  if (!title || !meaning || !guidance || !imagePrompt || !retreatId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify reading belongs to user
  const [reading] = await db
    .select()
    .from(readings)
    .where(and(eq(readings.id, readingId), eq(readings.userId, user.id)));

  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  // Get journey context
  const [journeyCtx] = await db
    .select()
    .from(readingJourneyContext)
    .where(eq(readingJourneyContext.readingId, readingId));

  // Find target deck
  const targetDeck = await getPreferredDeckForPathCards(user.id, retreatId);
  if (!targetDeck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No suitable deck found" },
      { status: 400 }
    );
  }

  // Get path info for origin context
  const path = journeyCtx ? await getPathById(journeyCtx.pathId) : null;

  // Determine next card number
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cards)
    .where(eq(cards.deckId, targetDeck.id));
  const nextCardNumber = (countResult?.count ?? 0) + 1;

  // Insert obstacle card — no credit deduction
  const [card] = await db
    .insert(cards)
    .values({
      deckId: targetDeck.id,
      cardNumber: nextCardNumber,
      title,
      meaning,
      guidance,
      imagePrompt,
      imageStatus: "generating",
      cardType: "obstacle",
      originContext: {
        source: "obstacle_detection",
        pathId: journeyCtx?.pathId,
        pathName: path?.name,
        retreatId,
        detectedPattern: pattern,
        readingIds: [readingId],
        forgedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Increment deck card count
  await db
    .update(decks)
    .set({
      cardCount: sql`${decks.cardCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, targetDeck.id));

  // Fire-and-forget image generation — no credit deduction
  const artStylePrompt = targetDeck.artStyleId
    ? (await getArtStyleById(targetDeck.artStyleId))?.stylePrompt ?? ""
    : "";
  generateCardImage(card.id, imagePrompt, artStylePrompt, targetDeck.id).catch(
    (err) => console.error("[obstacle-forge] image generation error:", err)
  );

  const data: Card = {
    id: card.id,
    deckId: card.deckId,
    cardNumber: card.cardNumber,
    title: card.title,
    meaning: card.meaning,
    guidance: card.guidance,
    imageUrl: card.imageUrl,
    imagePrompt: card.imagePrompt,
    imageStatus: card.imageStatus as Card["imageStatus"],
    cardType: card.cardType as Card["cardType"],
    originContext: card.originContext ?? null,
    createdAt: card.createdAt,
  };

  return NextResponse.json<ApiResponse<Card>>(
    { success: true, data },
    { status: 201 }
  );
}
