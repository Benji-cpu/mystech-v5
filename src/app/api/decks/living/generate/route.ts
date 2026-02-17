import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { cards, decks, livingDeckSettings } from "@/lib/db/schema";
import {
  getUserLivingDeck,
  canGenerateLivingDeckCard,
  getRecentLivingDeckCards,
  getUserReadingContext,
  getUserCardPreferences,
  getArtStyleById,
  getUserPlan,
} from "@/lib/db/queries";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import { generatedCardSchema } from "@/lib/ai/schemas";
import {
  LIVING_DECK_SYSTEM_PROMPT,
  buildManualLivingCardPrompt,
  buildAutoLivingCardPrompt,
} from "@/lib/ai/prompts/living-deck";
import { logGeneration } from "@/lib/ai/logging";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { generateCardImage } from "@/lib/ai/image-generation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const singleCardSchema = z.object({
  title: generatedCardSchema.shape.title,
  meaning: generatedCardSchema.shape.meaning,
  guidance: generatedCardSchema.shape.guidance,
  imagePrompt: generatedCardSchema.shape.imagePrompt,
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { mode, reflection } = body as {
    mode?: "manual" | "auto";
    reflection?: string;
  };

  if (!mode || (mode !== "manual" && mode !== "auto")) {
    return NextResponse.json(
      { error: "mode must be 'manual' or 'auto'" },
      { status: 400 }
    );
  }

  if (mode === "manual" && (!reflection || reflection.trim().length === 0)) {
    return NextResponse.json(
      { error: "reflection is required for manual mode" },
      { status: 400 }
    );
  }

  const deck = await getUserLivingDeck(user.id);
  if (!deck) {
    return NextResponse.json(
      { error: "No Living Deck found. Create one first." },
      { status: 404 }
    );
  }

  // Check daily limit
  const canGenerate = await canGenerateLivingDeckCard(deck.id);
  if (!canGenerate) {
    return NextResponse.json(
      { error: "You've already generated today's card. Come back tomorrow!" },
      { status: 429 }
    );
  }

  // Check credits
  const role = (user as { role?: string }).role ?? "user";
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  const creditCheck = await checkCredits(user.id, plan, 1);
  if (!creditCheck.allowed) {
    return NextResponse.json(
      { error: "Not enough credits. Upgrade to Pro for more." },
      { status: 403 }
    );
  }

  // Gather context
  const existingCards = await getRecentLivingDeckCards(deck.id, 10);
  const userContext = await getUserReadingContext(user.id);
  const preferences = await getUserCardPreferences(user.id);

  let artStyleName: string | undefined;
  let artStylePrompt: string | undefined;
  if (deck.artStyleId) {
    const style = await getArtStyleById(deck.artStyleId);
    artStyleName = style?.name;
    artStylePrompt = style?.stylePrompt;
  }

  // Build prompt
  const prompt = mode === "manual"
    ? buildManualLivingCardPrompt({
        reflection: reflection!,
        existingCards,
        userContext,
        preferences,
        artStyleName,
      })
    : buildAutoLivingCardPrompt({
        existingCards,
        userContext,
        recentReadings: userContext.recentReadings,
        preferences,
        artStyleName,
      });

  const model = plan === "free" ? geminiModel : geminiProModel;
  const genStart = Date.now();

  try {
    const result = await generateObject({
      model,
      schema: singleCardSchema,
      system: LIVING_DECK_SYSTEM_PROMPT,
      prompt,
    });

    const card = result.object;
    const nextCardNumber = deck.cardCount + 1;

    // Insert the card
    const [newCard] = await db
      .insert(cards)
      .values({
        deckId: deck.id,
        cardNumber: nextCardNumber,
        title: card.title,
        meaning: card.meaning,
        guidance: card.guidance,
        imagePrompt: card.imagePrompt,
        imageStatus: "generating",
      })
      .returning();

    // Update deck card count
    await db
      .update(decks)
      .set({
        cardCount: sql`${decks.cardCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deck.id));

    // Update lastCardGeneratedAt
    await db
      .update(livingDeckSettings)
      .set({
        lastCardGeneratedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(livingDeckSettings.deckId, deck.id));

    // Deduct credit
    await incrementCredits(user.id, plan, 1);

    await logGeneration({
      userId: user.id,
      deckId: deck.id,
      operationType: "living_deck_card",
      modelUsed: plan === "free" ? "gemini-2.5-flash-lite" : "gemini-2.5-flash",
      systemPrompt: LIVING_DECK_SYSTEM_PROMPT,
      userPrompt: prompt,
      rawResponse: JSON.stringify(card),
      durationMs: Date.now() - genStart,
      status: "success",
    });

    // Trigger image generation (fire-and-forget)
    generateCardImage(newCard.id, card.imagePrompt, artStylePrompt ?? "", deck.id).catch(
      (err) => console.error("[living-deck] Image generation failed:", err)
    );

    return NextResponse.json({
      card: {
        id: newCard.id,
        cardNumber: nextCardNumber,
        title: card.title,
        meaning: card.meaning,
        guidance: card.guidance,
        imagePrompt: card.imagePrompt,
        imageStatus: "generating",
        imageUrl: null,
        createdAt: newCard.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    await logGeneration({
      userId: user.id,
      deckId: deck.id,
      operationType: "living_deck_card",
      modelUsed: plan === "free" ? "gemini-2.5-flash-lite" : "gemini-2.5-flash",
      systemPrompt: LIVING_DECK_SYSTEM_PROMPT,
      userPrompt: prompt,
      durationMs: Date.now() - genStart,
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to generate card. Please try again." },
      { status: 502 }
    );
  }
}
