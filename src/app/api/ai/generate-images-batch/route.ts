import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getArtStyleById } from "@/lib/db/queries";
import { generateCardImage } from "@/lib/ai/image-generation";
import { eq, and } from "drizzle-orm";
import { asc } from "drizzle-orm";
import type { ApiResponse } from "@/types";

const CONCURRENCY_LIMIT = 3; // Process 3 cards at once
const DELAY_BETWEEN_BATCHES_MS = 500;

// Helper to chunk array into batches
function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!process.env.STABILITY_AI_API_KEY) {
    console.error("[generate-images-batch] STABILITY_AI_API_KEY is not set");
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Image service is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { deckId } = body as { deckId?: string };

  if (!deckId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "deckId is required" },
      { status: 400 }
    );
  }

  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  // Get art style prompt
  let artStylePrompt = "";
  if (deck.artStyleId) {
    const style = await getArtStyleById(deck.artStyleId);
    if (style) {
      artStylePrompt = style.stylePrompt;
    }
  }

  // Get cards that need images (pending or failed)
  const pendingCards = await db
    .select()
    .from(cards)
    .where(
      and(
        eq(cards.deckId, deckId),
        eq(cards.imageStatus, "pending")
      )
    )
    .orderBy(asc(cards.cardNumber));

  const failedCards = await db
    .select()
    .from(cards)
    .where(
      and(
        eq(cards.deckId, deckId),
        eq(cards.imageStatus, "failed")
      )
    )
    .orderBy(asc(cards.cardNumber));

  const cardsToProcess = [...pendingCards, ...failedCards];

  if (cardsToProcess.length === 0) {
    return NextResponse.json<ApiResponse<{ processed: number }>>(
      { success: true, data: { processed: 0 } }
    );
  }

  let processed = 0;
  let failed = 0;

  // Process in parallel batches for better performance
  const batches = chunk(cardsToProcess, CONCURRENCY_LIMIT);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    const results = await Promise.all(
      batch.map((card) => {
        if (!card.imagePrompt) {
          return Promise.resolve({ success: false, error: "No image prompt" });
        }
        return generateCardImage(
          card.id,
          card.imagePrompt,
          artStylePrompt,
          deckId
        );
      })
    );

    // Count results
    for (const result of results) {
      if (result.success) {
        processed++;
      } else {
        console.error(`[generate-images-batch] Card failed:`, result.error);
        failed++;
      }
    }

    // Delay between batches (not between individual cards)
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS)
      );
    }
  }

  // Check if all cards are completed
  const allCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId));

  const allCompleted = allCards.every(
    (c) => c.imageStatus === "completed"
  );

  if (allCompleted) {
    // Set first card image as deck cover
    const firstCard = allCards.find((c) => c.cardNumber === 1);
    await db
      .update(decks)
      .set({
        status: "completed",
        coverImageUrl: firstCard?.imageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));
  }

  return NextResponse.json<ApiResponse<{ processed: number; failed: number }>>(
    { success: true, data: { processed, failed } }
  );
}
