import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  retreatCards,
  readings,
  readingPathContext,
  retreats,
  paths,
  userRetreatProgress,
} from "@/lib/db/schema";
import { geminiModel } from "@/lib/ai/gemini";
import { buildThresholdCardPrompt } from "@/lib/ai/prompts/threshold-card";
import { eq, and } from "drizzle-orm";
import { ORIGIN_SOURCE } from "@/types";

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
      readingPathContext,
      eq(readings.id, readingPathContext.readingId)
    )
    .where(
      and(
        eq(readings.userId, userId),
        eq(readingPathContext.retreatId, retreatId)
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

  // Generate the card
  const prompt = buildThresholdCardPrompt({
    retreatName: retreat.name,
    retreatTheme: retreat.theme,
    retreatLens: retreat.retreatLens,
    pathName: path.name,
    readingSummaries,
  });

  const { object: generated } = await generateObject({
    model: geminiModel,
    schema: ThresholdCardSchema,
    prompt,
    maxOutputTokens: 2000,
  });

  // Insert into retreatCards (not user deck cards)
  const [card] = await db
    .insert(retreatCards)
    .values({
      retreatId,
      cardType: "threshold",
      source: "ai_generated",
      title: generated.title,
      meaning: generated.meaning,
      guidance: generated.guidance,
      imagePrompt: generated.imagePrompt,
      imageStatus: "pending",
      userId,
      originContext: {
        source: ORIGIN_SOURCE.RETREAT_COMPLETION,
        pathId: path.id,
        pathName: path.name,
        retreatId: retreat.id,
        retreatName: retreat.name,
        forgedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Link threshold card to retreat progress via new FK
  await db
    .update(userRetreatProgress)
    .set({ thresholdRetreatCardId: card.id })
    .where(eq(userRetreatProgress.id, retreatProgressId));

  return card;
}
