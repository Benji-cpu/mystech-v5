import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata } from "@/lib/db/queries";
import { geminiModel } from "@/lib/ai/gemini";
import { eq } from "drizzle-orm";
import type { ApiResponse, DraftCard } from "@/types";

type Params = { params: Promise<{ deckId: string }> };

const editResultSchema = z.object({
  title: z.string(),
  meaning: z.string(),
  guidance: z.string(),
  imagePrompt: z.string(),
});

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
  const { cardNumber, instruction } = body as {
    cardNumber: number;
    instruction: string;
  };

  if (!cardNumber || !instruction?.trim()) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardNumber and instruction are required" },
      { status: 400 }
    );
  }

  const metadata = await getDeckMetadata(deckId);
  if (!metadata?.draftCards) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No draft cards found" },
      { status: 404 }
    );
  }

  const draftCards = metadata.draftCards as DraftCard[];
  const targetCard = draftCards.find((c) => c.cardNumber === cardNumber);
  if (!targetCard) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  try {
    const result = await generateObject({
      model: geminiModel,
      schema: editResultSchema,
      prompt: `You are editing an oracle card based on the user's instruction.

Deck theme: "${deck.title}"${deck.theme ? ` — ${deck.theme}` : ""}
${metadata.conversationSummary ? `Conversation context: ${metadata.conversationSummary}` : ""}

Current card:
- Title: ${targetCard.title}
- Meaning: ${targetCard.meaning}
- Guidance: ${targetCard.guidance}
- Image prompt: ${targetCard.imagePrompt}

User's edit instruction: "${instruction}"

Rewrite the card incorporating the user's requested changes. Keep the same overall structure but apply their edit. Return the updated title, meaning, guidance, and imagePrompt.`,
    });

    const edited = result.object;
    const updatedCards = draftCards.map((c) => {
      if (c.cardNumber === cardNumber) {
        return {
          ...c,
          title: edited.title,
          meaning: edited.meaning,
          guidance: edited.guidance,
          imagePrompt: edited.imagePrompt,
          previousVersion: {
            title: c.title,
            meaning: c.meaning,
            guidance: c.guidance,
            imagePrompt: c.imagePrompt,
          },
        };
      }
      return c;
    });

    await db
      .update(deckMetadata)
      .set({ draftCards: updatedCards, updatedAt: new Date() })
      .where(eq(deckMetadata.deckId, deckId));

    const updatedCard = updatedCards.find((c) => c.cardNumber === cardNumber)!;

    return NextResponse.json<ApiResponse<{ card: DraftCard }>>({
      success: true,
      data: { card: updatedCard },
    });
  } catch (error) {
    console.error("[ai-edit] Failed to edit card:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to generate card edit" },
      { status: 500 }
    );
  }
}
