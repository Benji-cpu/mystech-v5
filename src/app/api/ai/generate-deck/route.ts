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
import { PLAN_LIMITS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

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
  const { title, description, cardCount, artStyleId } = body as {
    title?: string;
    description?: string;
    cardCount?: number;
    artStyleId?: string;
  };

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
  const deckCount = await getUserDeckCount(user.id);
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
  // This ensures no orphan decks are created if AI generation fails
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
        // No deck created - user can simply retry
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
  // Note: neon-http driver doesn't support transactions, using sequential inserts
  const [deck] = await db
    .insert(decks)
    .values({
      userId: user.id,
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
