import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getArtStyleById, getUserPlan } from "@/lib/db/queries";
import { generateCardImage } from "@/lib/ai/image-generation";
import { logGeneration } from "@/lib/ai/logging";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { ART_STYLE_PRESETS, STALE_GENERATION_TIMEOUT_MS } from "@/lib/constants";
import { eq, and, lt } from "drizzle-orm";
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

  // Get art style prompt and stability preset
  let artStylePrompt = "";
  let stabilityPreset: string | undefined;
  if (deck.artStyleId) {
    const style = await getArtStyleById(deck.artStyleId);
    if (style) {
      artStylePrompt = style.stylePrompt;
    }
    const preset = ART_STYLE_PRESETS.find(p => p.id === deck.artStyleId);
    stabilityPreset = preset?.stabilityPreset;
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

  // Include cards stuck in "generating" past the stale threshold
  const staleThreshold = new Date(Date.now() - STALE_GENERATION_TIMEOUT_MS);
  const staleGeneratingCards = await db
    .select()
    .from(cards)
    .where(
      and(
        eq(cards.deckId, deckId),
        eq(cards.imageStatus, "generating"),
        lt(cards.updatedAt, staleThreshold)
      )
    )
    .orderBy(asc(cards.cardNumber));

  const cardsToProcess = [...pendingCards, ...failedCards, ...staleGeneratingCards];

  if (cardsToProcess.length === 0) {
    return NextResponse.json<ApiResponse<{ processed: number }>>(
      { success: true, data: { processed: 0 } }
    );
  }

  // Check credits upfront — block entirely if insufficient
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  const creditCheck = await checkCredits(user.id, plan, cardsToProcess.length);
  if (!creditCheck.allowed) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: `You need ${cardsToProcess.length} credits but have ${creditCheck.remaining} remaining. Upgrade to Pro for 50 credits/month.`,
      },
      { status: 403 }
    );
  }

  let processed = 0;
  let failed = 0;
  const imageStart = Date.now();

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
          deckId,
          stabilityPreset
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

  // Check if all cards are resolved (completed or failed)
  const allCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId));

  const allResolved = allCards.every(
    (c) => c.imageStatus === "completed" || c.imageStatus === "failed"
  );

  if (allResolved) {
    // Set first completed card image as deck cover
    const coverCard = allCards
      .filter((c) => c.imageStatus === "completed" && c.imageUrl)
      .sort((a, b) => (a.cardNumber ?? 0) - (b.cardNumber ?? 0))[0];
    await db
      .update(decks)
      .set({
        status: "completed",
        coverImageUrl: coverCard?.imageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));
  }

  // Increment credits for successfully processed images
  if (processed > 0) {
    await incrementCredits(user.id, plan, processed);
  }

  await logGeneration({
    userId: user.id,
    deckId,
    operationType: "image_generation",
    modelUsed: "imagen",
    userPrompt: `Batch: ${cardsToProcess.length} cards, style: ${artStylePrompt || "none"}`,
    rawResponse: JSON.stringify({ processed, failed }),
    durationMs: Date.now() - imageStart,
    status: failed === cardsToProcess.length ? "error" : "success",
    errorMessage: failed > 0 ? `${failed} of ${cardsToProcess.length} images failed` : undefined,
  });

  return NextResponse.json<ApiResponse<{ processed: number; failed: number }>>(
    { success: true, data: { processed, failed } }
  );
}
