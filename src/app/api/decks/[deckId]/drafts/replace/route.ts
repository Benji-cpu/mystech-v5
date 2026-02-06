import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { decks, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel } from "@/lib/ai/gemini";
import { eq, and } from "drizzle-orm";
import { buildCardRegenerationPrompt } from "@/lib/ai/prompts/journey-card-generation";
import { generatedCardSchema } from "@/lib/ai/schemas";
import type { ApiResponse, DraftCard, Anchor } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;
  const body = await request.json();
  const { cardNumber } = body as { cardNumber: number };

  if (!cardNumber) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardNumber is required" },
      { status: 400 }
    );
  }

  // Verify deck ownership
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
    .limit(1);

  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  // Get current metadata
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId))
    .limit(1);

  if (!metadata) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck metadata not found" },
      { status: 404 }
    );
  }

  const draftCards = (metadata.draftCards as DraftCard[]) || [];
  const anchors = (metadata.extractedAnchors as Anchor[]) || [];

  const cardToReplace = draftCards.find((c) => c.cardNumber === cardNumber);
  if (!cardToReplace) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  // Build regeneration prompt
  const prompt = buildCardRegenerationPrompt(
    cardNumber,
    deck.title,
    deck.theme || "",
    anchors,
    draftCards.map((c) => ({ cardNumber: c.cardNumber, title: c.title })),
    metadata.conversationSummary || undefined
  );

  try {
    const result = await generateObject({
      model: geminiModel,
      schema: generatedCardSchema,
      prompt,
    });

    const newCard = result.object;

    // Update draft cards with new version
    const updatedCards = draftCards.map((c) => {
      if (c.cardNumber === cardNumber) {
        return {
          cardNumber,
          title: newCard.title,
          meaning: newCard.meaning,
          guidance: newCard.guidance,
          imagePrompt: newCard.imagePrompt,
          previousVersion: {
            title: cardToReplace.title,
            meaning: cardToReplace.meaning,
            guidance: cardToReplace.guidance,
            imagePrompt: cardToReplace.imagePrompt,
          },
        };
      }
      return c;
    });

    await db
      .update(deckMetadata)
      .set({ draftCards: updatedCards, updatedAt: new Date() })
      .where(eq(deckMetadata.deckId, deckId));

    return NextResponse.json<ApiResponse<{ draftCards: DraftCard[] }>>(
      { success: true, data: { draftCards: updatedCards } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[drafts/replace] Regeneration failed:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to regenerate card. Please try again." },
      { status: 502 }
    );
  }
}
