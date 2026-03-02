import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  cards,
  decks,
  readings,
  readingJourneyContext,
  retreats,
  paths,
  userRetreatProgress,
} from "@/lib/db/schema";
import { geminiModel } from "@/lib/ai/gemini";
import { generateCardImage } from "@/lib/ai/image-generation";
import { getArtStyleById } from "@/lib/db/queries";
import { getPreferredDeckForPathCards } from "@/lib/db/queries-journey";
import { buildThresholdCardPrompt } from "@/lib/ai/prompts/threshold-card";
import { eq, and, sql } from "drizzle-orm";

const ThresholdCardSchema = z.object({
  title: z.string().describe("The card title — evocative, feels like an achievement"),
  meaning: z.string().describe("What this card represents — recognition, not prediction"),
  guidance: z.string().describe("How to carry this wisdom forward"),
  imagePrompt: z.string().describe("Detailed image prompt with threshold/crossing imagery"),
});

export async function generateThresholdCard(
  userId: string,
  retreatId: string,
  retreatProgressId: string
) {
  // Find target deck
  const targetDeck = await getPreferredDeckForPathCards(userId, retreatId);
  if (!targetDeck) {
    console.error("[threshold-card] No target deck found for user:", userId);
    return;
  }

  // Fetch retreat + path info
  const [retreat] = await db
    .select()
    .from(retreats)
    .where(eq(retreats.id, retreatId));
  if (!retreat) return;

  const [path] = await db
    .select()
    .from(paths)
    .where(eq(paths.id, retreat.pathId));
  if (!path) return;

  // Fetch all readings for the retreat
  const retreatReadings = await db
    .select({
      question: readings.question,
      interpretation: readings.interpretation,
    })
    .from(readings)
    .innerJoin(
      readingJourneyContext,
      eq(readings.id, readingJourneyContext.readingId)
    )
    .where(
      and(
        eq(readings.userId, userId),
        eq(readingJourneyContext.retreatId, retreatId)
      )
    );

  const readingSummaries = retreatReadings
    .map((r, i) => {
      const q = r.question ? `Question: "${r.question}"` : "No specific question";
      const interp = r.interpretation
        ? r.interpretation.slice(0, 300)
        : "No interpretation";
      return `Reading ${i + 1}:\n${q}\n${interp}`;
    })
    .join("\n\n");

  // Get art style name for the deck
  let artStyleName: string | undefined;
  if (targetDeck.artStyleId) {
    const style = await getArtStyleById(targetDeck.artStyleId);
    artStyleName = style?.name;
  }

  // Generate the card
  const prompt = buildThresholdCardPrompt({
    retreatName: retreat.name,
    retreatTheme: retreat.theme,
    retreatLens: retreat.retreatLens,
    pathName: path.name,
    readingSummaries,
    artStyleName,
  });

  const { object: generated } = await generateObject({
    model: geminiModel,
    schema: ThresholdCardSchema,
    prompt,
    maxOutputTokens: 2000,
  });

  // Determine next card number
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cards)
    .where(eq(cards.deckId, targetDeck.id));
  const nextCardNumber = (countResult?.count ?? 0) + 1;

  // Insert card with threshold type
  const [card] = await db
    .insert(cards)
    .values({
      deckId: targetDeck.id,
      cardNumber: nextCardNumber,
      title: generated.title,
      meaning: generated.meaning,
      guidance: generated.guidance,
      imagePrompt: generated.imagePrompt,
      imageStatus: "generating",
      cardType: "threshold",
      originContext: {
        source: "retreat_completion",
        pathId: path.id,
        pathName: path.name,
        retreatId: retreat.id,
        retreatName: retreat.name,
        forgedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Increment deck card count
  await db
    .update(decks)
    .set({
      cardCount: sql`${decks.cardCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, targetDeck.id));

  // Link threshold card to retreat progress
  await db
    .update(userRetreatProgress)
    .set({ thresholdCardId: card.id })
    .where(eq(userRetreatProgress.id, retreatProgressId));

  // Fire-and-forget image generation — no credit deduction
  const artStylePrompt = targetDeck.artStyleId
    ? (await getArtStyleById(targetDeck.artStyleId))?.stylePrompt ?? ""
    : "";
  generateCardImage(card.id, generated.imagePrompt, artStylePrompt, targetDeck.id).catch(
    (err) => console.error("[threshold-card] image generation error:", err)
  );

  return card;
}
