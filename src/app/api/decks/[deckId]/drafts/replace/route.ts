import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata } from "@/lib/db/queries";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import { generatedCardSchema } from "@/lib/ai/schemas";
import { buildCardRegenerationPrompt } from "@/lib/ai/prompts/journey-card-generation";
import { logGeneration } from "@/lib/ai/logging";
import { eq } from "drizzle-orm";
import type { ApiResponse, DraftCard, Anchor } from "@/types";

const MAX_RETRIES = 2;

type Params = { params: Promise<{ deckId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AI service is not configured" },
      { status: 503 }
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

  const metadata = await getDeckMetadata(deckId);
  if (!metadata?.draftCards) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No draft cards found" },
      { status: 404 }
    );
  }

  const draftCards = metadata.draftCards as DraftCard[];
  const anchors = (metadata.extractedAnchors as Anchor[]) || [];
  const removedCards = draftCards.filter((c) => c.removed);

  if (removedCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No removed cards to replace" },
      { status: 400 }
    );
  }

  const existingCards = draftCards
    .filter((c) => !c.removed)
    .map((c) => ({ cardNumber: c.cardNumber, title: c.title }));

  const role = (user as { role?: string }).role ?? "user";
  const replaceModel = role === "admin" ? geminiProModel : geminiModel;
  let replacedCount = 0;
  const updatedCards = [...draftCards];

  for (const removed of removedCards) {
    const prompt = buildCardRegenerationPrompt(
      removed.cardNumber,
      deck.title,
      deck.theme || deck.description || "",
      anchors,
      existingCards,
      metadata.conversationSummary || undefined
    );

    let success = false;
    const replaceStart = Date.now();
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await generateObject({
          model: replaceModel,
          schema: generatedCardSchema,
          prompt,
        });

        const idx = updatedCards.findIndex(
          (c) => c.cardNumber === removed.cardNumber
        );
        if (idx !== -1) {
          updatedCards[idx] = {
            cardNumber: removed.cardNumber,
            title: result.object.title,
            meaning: result.object.meaning,
            guidance: result.object.guidance,
            imagePrompt: result.object.imagePrompt,
          };
          replacedCount++;
          existingCards.push({
            cardNumber: removed.cardNumber,
            title: result.object.title,
          });
        }
        await logGeneration({
          userId: user.id,
          deckId,
          operationType: "card_replace",
          modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
          userPrompt: prompt,
          rawResponse: JSON.stringify(result.object),
          durationMs: Date.now() - replaceStart,
          status: "success",
        });
        success = true;
        break;
      } catch (error) {
        console.error(
          `[drafts/replace] Card ${removed.cardNumber} attempt ${attempt + 1} failed:`,
          error
        );
        if (attempt === MAX_RETRIES) {
          await logGeneration({
            userId: user.id,
            deckId,
            operationType: "card_replace",
            userPrompt: prompt,
            durationMs: Date.now() - replaceStart,
            status: "error",
            errorMessage: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    if (!success) {
      console.error(
        `[drafts/replace] Failed to replace card ${removed.cardNumber} after retries`
      );
    }
  }

  await db
    .update(deckMetadata)
    .set({ draftCards: updatedCards, updatedAt: new Date() })
    .where(eq(deckMetadata.deckId, deckId));

  return NextResponse.json<
    ApiResponse<{ draftCards: DraftCard[]; replacedCount: number }>
  >({
    success: true,
    data: { draftCards: updatedCards, replacedCount },
  });
}
