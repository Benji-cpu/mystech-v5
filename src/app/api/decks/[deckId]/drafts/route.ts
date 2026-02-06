import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { decks, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel } from "@/lib/ai/gemini";
import { eq, and } from "drizzle-orm";
import { buildCardEditPrompt } from "@/lib/ai/prompts/journey-card-generation";
import { generatedCardSchema } from "@/lib/ai/schemas";
import type { ApiResponse, DraftCard, Anchor } from "@/types";

export async function PATCH(
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
  const { cardNumber, instruction, cards: directCards } = body as {
    cardNumber?: number;
    instruction?: string;
    cards?: DraftCard[];
  };

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

  // Direct card update (for undo)
  if (directCards) {
    await db
      .update(deckMetadata)
      .set({ draftCards: directCards, updatedAt: new Date() })
      .where(eq(deckMetadata.deckId, deckId));

    return NextResponse.json<ApiResponse<{ draftCards: DraftCard[] }>>(
      { success: true, data: { draftCards: directCards } },
      { status: 200 }
    );
  }

  // AI-assisted edit
  if (!cardNumber || !instruction) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardNumber and instruction are required" },
      { status: 400 }
    );
  }

  const cardToEdit = draftCards.find((c) => c.cardNumber === cardNumber);
  if (!cardToEdit) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  // Build edit prompt
  const prompt = buildCardEditPrompt(
    {
      title: cardToEdit.title,
      meaning: cardToEdit.meaning,
      guidance: cardToEdit.guidance,
      imagePrompt: cardToEdit.imagePrompt,
    },
    instruction,
    metadata.conversationSummary || undefined
  );

  try {
    const result = await generateObject({
      model: geminiModel,
      schema: generatedCardSchema,
      prompt,
    });

    const updatedCard = result.object;

    // Update draft cards with new version
    const updatedCards = draftCards.map((c) => {
      if (c.cardNumber === cardNumber) {
        return {
          cardNumber,
          title: updatedCard.title,
          meaning: updatedCard.meaning,
          guidance: updatedCard.guidance,
          imagePrompt: updatedCard.imagePrompt,
          previousVersion: {
            title: cardToEdit.title,
            meaning: cardToEdit.meaning,
            guidance: cardToEdit.guidance,
            imagePrompt: cardToEdit.imagePrompt,
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
    console.error("[drafts/patch] Edit failed:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to edit card. Please try again." },
      { status: 502 }
    );
  }
}
