import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { decks, cards, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserDeckCount } from "@/lib/db/queries";
import { geminiModel } from "@/lib/ai/gemini";
import { generatedDeckSchema, type GeneratedCard } from "@/lib/ai/schemas";
import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "@/lib/ai/prompts/deck-generation";
import {
  JOURNEY_CARD_GENERATION_SYSTEM_PROMPT,
  buildJourneyCardGenerationPrompt,
} from "@/lib/ai/prompts/journey-card-generation";
import { PLAN_LIMITS } from "@/lib/constants";
import { eq, and } from "drizzle-orm";
import type { ApiResponse, Anchor, DraftCard } from "@/types";

const MAX_RETRIES = 2;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check API key before doing any work
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[generate-deck] GOOGLE_GENERATIVE_AI_API_KEY is not set");
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AI service is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { mode, deckId, title, description, cardCount, artStyleId } = body as {
    mode?: "simple" | "journey";
    deckId?: string;
    title?: string;
    description?: string;
    cardCount?: number;
    artStyleId?: string;
  };

  // Journey mode: generate draft cards for existing deck
  if (mode === "journey" && deckId) {
    return handleJourneyMode(user.id, deckId, cardCount || 10);
  }

  // Simple mode: original flow
  return handleSimpleMode(user.id, title, description, cardCount, artStyleId);
}

async function handleSimpleMode(
  userId: string,
  title: string | undefined,
  description: string | undefined,
  cardCount: number | undefined,
  artStyleId: string | undefined
) {
  if (!title || !description || !cardCount) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "title, description, and cardCount are required" },
      { status: 400 }
    );
  }

  if (cardCount < 1 || cardCount > 30) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardCount must be between 1 and 30" },
      { status: 400 }
    );
  }

  // Check deck limit (excludes draft decks)
  const deckCount = await getUserDeckCount(userId);
  if (deckCount >= PLAN_LIMITS.free.maxDecks) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Deck limit reached. Upgrade to Pro for unlimited decks.",
      },
      { status: 403 }
    );
  }

  const userPrompt = buildDeckGenerationUserPrompt(title, description, cardCount);

  // Generate card definitions with retries BEFORE creating deck
  let generatedCards: GeneratedCard[] | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generateObject({
        model: geminiModel,
        schema: generatedDeckSchema,
        system: DECK_GENERATION_SYSTEM_PROMPT,
        prompt: userPrompt,
      });
      generatedCards = result.object.cards;
      break;
    } catch (error) {
      console.error(
        `[generate-deck] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        error
      );
      if (attempt === MAX_RETRIES) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: "Failed to generate cards. Please try again.",
          },
          { status: 502 }
        );
      }
    }
  }

  if (!generatedCards || generatedCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AI returned no cards. Please try again." },
      { status: 502 }
    );
  }

  // Create deck first, then cards and metadata
  const [deck] = await db
    .insert(decks)
    .values({
      userId,
      title,
      description,
      status: "generating",
      cardCount: generatedCards.length,
      artStyleId: artStyleId ?? null,
    })
    .returning();

  await db.insert(cards).values(
    generatedCards.map((card, i) => ({
      deckId: deck.id,
      cardNumber: i + 1,
      title: card.title,
      meaning: card.meaning,
      guidance: card.guidance,
      imagePrompt: card.imagePrompt,
      imageStatus: "pending",
    }))
  );

  await db.insert(deckMetadata).values({
    deckId: deck.id,
    generationPrompt: userPrompt,
  });

  return NextResponse.json<ApiResponse<{ deckId: string }>>(
    { success: true, data: { deckId: deck.id } },
    { status: 201 }
  );
}

async function handleJourneyMode(
  userId: string,
  deckId: string,
  cardCount: number
) {
  // Verify deck ownership and get metadata
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);

  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  if (deck.status !== "draft") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck is not in draft status" },
      { status: 400 }
    );
  }

  // Get metadata with anchors and conversation summary
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId))
    .limit(1);

  const anchors = (metadata?.extractedAnchors as Anchor[]) || [];
  const conversationSummary = metadata?.conversationSummary || "";

  // Build journey-specific prompt
  const userPrompt = buildJourneyCardGenerationPrompt(
    deck.title,
    deck.theme || "",
    cardCount,
    anchors,
    conversationSummary
  );

  // Generate cards with retries
  let generatedCards: GeneratedCard[] | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generateObject({
        model: geminiModel,
        schema: generatedDeckSchema,
        system: JOURNEY_CARD_GENERATION_SYSTEM_PROMPT,
        prompt: userPrompt,
      });
      generatedCards = result.object.cards;
      break;
    } catch (error) {
      console.error(
        `[generate-deck-journey] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        error
      );
      if (attempt === MAX_RETRIES) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: "Failed to generate cards. Please try again.",
          },
          { status: 502 }
        );
      }
    }
  }

  if (!generatedCards || generatedCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AI returned no cards. Please try again." },
      { status: 502 }
    );
  }

  // Convert to draft cards format (store in metadata, not cards table)
  const draftCards: DraftCard[] = generatedCards.map((card, i) => ({
    cardNumber: i + 1,
    title: card.title,
    meaning: card.meaning,
    guidance: card.guidance,
    imagePrompt: card.imagePrompt,
  }));

  // Update metadata with draft cards
  await db
    .update(deckMetadata)
    .set({
      draftCards,
      generationPrompt: userPrompt,
      updatedAt: new Date(),
    })
    .where(eq(deckMetadata.deckId, deckId));

  return NextResponse.json<ApiResponse<{ draftCards: DraftCard[] }>>(
    { success: true, data: { draftCards } },
    { status: 200 }
  );
}
