import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { decks, cards, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserDeckCount } from "@/lib/db/queries";
import { geminiModel } from "@/lib/ai/gemini";
import { generatedDeckSchema } from "@/lib/ai/schemas";
import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "@/lib/ai/prompts/deck-generation";
import { PLAN_LIMITS } from "@/lib/constants";
import { eq } from "drizzle-orm";
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

  // Check deck limit
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

  // Create deck in draft status
  const [deck] = await db
    .insert(decks)
    .values({
      userId: user.id,
      title,
      description,
      status: "draft",
      cardCount,
      artStyleId: artStyleId ?? null,
    })
    .returning();

  const userPrompt = buildDeckGenerationUserPrompt(title, description, cardCount);

  // Store generation metadata
  await db.insert(deckMetadata).values({
    deckId: deck.id,
    generationPrompt: userPrompt,
  });

  // Generate card definitions with retries
  let generatedCards;
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
      if (attempt === MAX_RETRIES) {
        // Leave deck as draft so user can retry
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

  // Insert cards into database
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

  // Update deck with actual card count and status
  await db
    .update(decks)
    .set({
      cardCount: generatedCards.length,
      status: "generating",
      updatedAt: new Date(),
    })
    .where(eq(decks.id, deck.id));

  return NextResponse.json<ApiResponse<{ deckId: string }>>(
    { success: true, data: { deckId: deck.id } },
    { status: 201 }
  );
}
