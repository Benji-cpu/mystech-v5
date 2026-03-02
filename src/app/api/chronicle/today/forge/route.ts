import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { cards, decks, chronicleEntries, chronicleSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import { logGeneration } from "@/lib/ai/logging";
import { generateCardImage } from "@/lib/ai/image-generation";
import { generatedCardSchema } from "@/lib/ai/schemas";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getChronicleKnowledge,
  getRecentChronicleCards,
  getArtStyleById,
  getUserCardPreferences,
  getUserPlan,
} from "@/lib/db/queries";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { buildChronicleCardPrompt } from "@/lib/ai/prompts/chronicle";
import { getJourneyPosition } from "@/lib/db/queries-journey";
import { eq, sql } from "drizzle-orm";
import type { ApiResponse } from "@/types";

export const maxDuration = 60;

// Single card schema — omits cardNumber since Chronicle cards are not sequentially numbered
const singleCardSchema = z.object({
  title: generatedCardSchema.shape.title,
  meaning: generatedCardSchema.shape.meaning,
  guidance: generatedCardSchema.shape.guidance,
  imagePrompt: generatedCardSchema.shape.imagePrompt,
});

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const deck = await getUserChronicleDeck(user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Chronicle deck not found" },
      { status: 404 }
    );
  }

  const entry = await getTodayChronicleEntry(user.id);
  if (!entry) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No entry for today. Start a conversation first." },
      { status: 400 }
    );
  }

  if (!entry.conversation || entry.conversation.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Have a conversation with Lyra before forging a card." },
      { status: 400 }
    );
  }

  if (entry.cardId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "A card has already been forged for today." },
      { status: 409 }
    );
  }

  // Determine plan
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  // Check credits
  const creditCheck = await checkCredits(user.id, plan, 1);
  if (!creditCheck.allowed) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "You've used all your card generation credits. Upgrade to Pro for more.",
      },
      { status: 403 }
    );
  }

  // Gather generation context
  const [existingCards, knowledge, preferences, settings, journeyPosition] = await Promise.all([
    getRecentChronicleCards(deck.id, 15),
    getChronicleKnowledge(user.id),
    getUserCardPreferences(user.id),
    getChronicleSettings(deck.id),
    getJourneyPosition(user.id),
  ]);

  // Resolve art style name
  let artStyleName: string | undefined;
  if (deck.artStyleId) {
    const artStyle = await getArtStyleById(deck.artStyleId);
    artStyleName = artStyle?.name;
  }

  const model = plan === "free" ? geminiModel : geminiProModel;
  const prompt = buildChronicleCardPrompt({
    conversation: entry.conversation,
    existingCards,
    knowledge,
    preferences,
    artStyleName,
    journeyContext: journeyPosition
      ? {
          waypointName: journeyPosition.waypoint.name,
          waypointLens: journeyPosition.waypoint.waypointLens,
        }
      : null,
  });

  const generationStart = Date.now();

  let generatedCard: z.infer<typeof singleCardSchema>;
  try {
    const { object } = await generateObject({
      model,
      schema: singleCardSchema,
      prompt,
      maxOutputTokens: 2000,
    });
    generatedCard = object;
  } catch (err) {
    console.error("[chronicle/today/forge] generateObject error:", err);
    await logGeneration({
      userId: user.id,
      deckId: deck.id,
      operationType: "chronicle_card_generation",
      modelUsed: plan === "free" ? "gemini-2.5-flash-lite" : "gemini-2.5-flash",
      userPrompt: prompt,
      durationMs: Date.now() - generationStart,
      status: "error",
      errorMessage: err instanceof Error ? err.message : "Unknown generation error",
    });
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to generate card. Please try again." },
      { status: 500 }
    );
  }

  // Determine next card number for deck
  const [cardCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cards)
    .where(eq(cards.deckId, deck.id));
  const nextCardNumber = (cardCountResult?.count ?? 0) + 1;

  // Insert card into DB
  const [card] = await db
    .insert(cards)
    .values({
      deckId: deck.id,
      cardNumber: nextCardNumber,
      title: generatedCard.title,
      meaning: generatedCard.meaning,
      guidance: generatedCard.guidance,
      imagePrompt: generatedCard.imagePrompt,
      imageStatus: "generating",
      cardType: "general",
      chronicleEntryId: entry.id,
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

  // Update entry with cardId
  await db
    .update(chronicleEntries)
    .set({ cardId: card.id })
    .where(eq(chronicleEntries.id, entry.id));

  // Update settings with last generation time
  await db
    .update(chronicleSettings)
    .set({ lastCardGeneratedAt: new Date(), updatedAt: new Date() })
    .where(eq(chronicleSettings.deckId, deck.id));

  // Deduct credit
  await incrementCredits(user.id, plan, 1);

  // Log generation
  await logGeneration({
    userId: user.id,
    deckId: deck.id,
    operationType: "chronicle_card_generation",
    modelUsed: plan === "free" ? "gemini-2.5-flash-lite" : "gemini-2.5-flash",
    userPrompt: prompt,
    rawResponse: JSON.stringify(generatedCard),
    durationMs: Date.now() - generationStart,
    status: "success",
  });

  // Fire-and-forget image generation
  const artStylePrompt = deck.artStyleId
    ? (await getArtStyleById(deck.artStyleId))?.stylePrompt ?? ""
    : "";
  generateCardImage(card.id, generatedCard.imagePrompt, artStylePrompt, deck.id).catch(
    (err) => console.error("[chronicle/today/forge] image generation error:", err)
  );

  return NextResponse.json<ApiResponse<typeof card>>(
    { success: true, data: card },
    { status: 201 }
  );
}
