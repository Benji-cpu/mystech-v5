import { generateObject, generateText } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { cards, decks, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { geminiProModel, geminiFreeModel } from "@/lib/ai/gemini";
import { generateCardImage } from "@/lib/ai/image-generation";
import { logGeneration } from "@/lib/ai/logging";
import {
  getEmergenceEventHistory,
  createEmergenceEvent,
  updateEmergenceEvent,
  getArtStyleById,
  getUserPlan,
  hasEmergenceEventToday,
} from "@/lib/db/queries";
import { ORIGIN_SOURCE } from "@/types";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import {
  buildChronicleObstacleCardPrompt,
  buildChronicleThresholdCardPrompt,
  buildEmergenceDetectionPrompt,
  buildEmergenceLyraMessagePrompt,
  buildEmergenceLyraMessageFallback,
} from "@/lib/ai/prompts/chronicle-emergence";
import type { ChronicleKnowledge, EmergenceEvent, PlanType } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function getLastEventDate(events: EmergenceEvent[], type: string): Date | null {
  const matching = events.filter((e) => e.eventType === type && e.status !== "dismissed");
  if (matching.length === 0) return null;
  return matching.reduce((latest, e) =>
    e.createdAt > latest ? e.createdAt : latest,
    matching[0].createdAt
  );
}

// ── AI-Powered detection ─────────────────────────────────────────────

const emergenceDetectionSchema = z.object({
  shouldEmerge: z.boolean().describe("Whether an emergence event should occur"),
  emergenceType: z.enum(["obstacle", "threshold"]).describe("Type of emergence"),
  detectedPattern: z.string().describe("The pattern detected in the seeker's knowledge graph"),
  patternEvidence: z.string().describe("Why this pattern matters — specific evidence from the knowledge graph"),
  relevantExcerpts: z.array(z.string()).describe("Key phrases/themes from the knowledge graph that support this detection"),
  confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
});

async function detectEmergenceWithAI(
  knowledge: ChronicleKnowledge,
  existingEvents: EmergenceEvent[],
  plan: PlanType,
): Promise<{
  type: "obstacle" | "threshold";
  detectedPattern: string;
  patternFrequency: number;
  patternEvidence: string;
  relevantExcerpts: string[];
  confidence: number;
} | null> {
  // Compute cooldowns
  const lastObstacle = getLastEventDate(existingEvents, "obstacle");
  const lastThreshold = getLastEventDate(existingEvents, "threshold");

  const obstacleCooledDown = !lastObstacle || daysSince(lastObstacle.toISOString()) >= 10;
  const thresholdCooledDown = !lastThreshold || daysSince(lastThreshold.toISOString()) >= 14;

  // If both are in cooldown, skip AI call entirely
  if (!obstacleCooledDown && !thresholdCooledDown) return null;

  const prompt = buildEmergenceDetectionPrompt(knowledge, existingEvents, {
    obstacleCooledDown,
    thresholdCooledDown,
  });

  const model = plan === "free" ? geminiFreeModel : geminiProModel;

  try {
    const { object: result } = await generateObject({
      model,
      schema: emergenceDetectionSchema,
      prompt,
      maxOutputTokens: 2000,
    });

    if (!result.shouldEmerge || result.confidence < 0.6) return null;

    // Validate the AI didn't pick a type that's in cooldown
    if (result.emergenceType === "obstacle" && !obstacleCooledDown) return null;
    if (result.emergenceType === "threshold" && !thresholdCooledDown) return null;

    // Estimate frequency from knowledge graph for the detected pattern
    const matchedEmotional = (knowledge.emotionalPatterns ?? []).find(
      (p) => p.pattern.toLowerCase() === result.detectedPattern.toLowerCase()
    );
    const matchedTheme = Object.entries(knowledge.themes ?? {}).find(
      ([theme]) => theme.toLowerCase() === result.detectedPattern.toLowerCase()
    );
    const patternFrequency = matchedEmotional?.frequency ?? matchedTheme?.[1]?.count ?? 1;

    return {
      type: result.emergenceType,
      detectedPattern: result.detectedPattern,
      patternFrequency,
      patternEvidence: result.patternEvidence,
      relevantExcerpts: result.relevantExcerpts,
      confidence: result.confidence,
    };
  } catch (err) {
    console.error("[chronicle-emergence] AI detection error:", err);
    return null;
  }
}

// ── Card generation schema ─────────────────────────────────────────────

const emergenceCardSchema = z.object({
  title: z.string().describe("Evocative card title"),
  meaning: z.string().describe("The card's core meaning"),
  guidance: z.string().describe("Personal, actionable guidance"),
  imagePrompt: z.string().describe("Visual scene description (2-3 sentences) for oracle card image generation"),
});

// ── Card generation ────────────────────────────────────────────────────

async function generateEmergenceCard(
  event: EmergenceEvent,
  knowledge: ChronicleKnowledge,
  deckId: string,
  userId: string,
  plan: PlanType,
): Promise<void> {
  // Check credits — generate text-only card if exhausted
  const creditCheck = await checkCredits(userId, plan, 1);
  const hasCredits = creditCheck.allowed;

  await updateEmergenceEvent(event.id, { status: "generating" });

  try {
    // Get art style from deck
    const [deck] = await db
      .select({ artStyleId: decks.artStyleId })
      .from(decks)
      .where(eq(decks.id, deckId));

    let artStyleName: string | undefined;
    let artStylePrompt = "";
    if (deck?.artStyleId) {
      const artStyle = await getArtStyleById(deck.artStyleId);
      artStyleName = artStyle?.name;
      artStylePrompt = artStyle?.stylePrompt ?? "";
    }

    // Get existing obstacle titles to avoid duplication
    const existingObstacles = await db
      .select({ title: cards.title, meaning: cards.meaning })
      .from(cards)
      .where(
        eq(cards.deckId, deckId)
      );
    const obstacleList = existingObstacles
      .filter((c) => c.title) // safety check
      .map(({ title, meaning }) => ({ title, meaning }));

    // Build prompt based on event type
    const knowledgeSummary = knowledge.summary ?? "";
    const prompt = event.eventType === "obstacle"
      ? buildChronicleObstacleCardPrompt({
          detectedPattern: event.detectedPattern,
          patternFrequency: event.patternFrequency,
          knowledgeSummary,
          relevantExcerpts: event.relevantExcerpts ?? [],
          existingObstacles: obstacleList,
          artStyleName,
        })
      : buildChronicleThresholdCardPrompt({
          detectedPattern: event.detectedPattern,
          knowledgeSummary,
          relevantExcerpts: event.relevantExcerpts ?? [],
          artStyleName,
        });

    const generationStart = Date.now();

    const { object: generatedCard } = await generateObject({
      model: geminiProModel,
      schema: emergenceCardSchema,
      prompt,
      maxOutputTokens: 4000,
    });

    // Get next card number
    const [cardCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cards)
      .where(eq(cards.deckId, deckId));
    const nextCardNumber = (cardCountResult?.count ?? 0) + 1;

    // Insert card — text-only if no credits
    const [card] = await db
      .insert(cards)
      .values({
        deckId,
        cardNumber: nextCardNumber,
        title: generatedCard.title,
        meaning: generatedCard.meaning,
        guidance: generatedCard.guidance,
        imagePrompt: hasCredits ? generatedCard.imagePrompt : null,
        imageStatus: hasCredits ? "generating" : "none",
        cardType: event.eventType as "obstacle" | "threshold",
        originContext: {
          source: ORIGIN_SOURCE.CHRONICLE_EMERGENCE,
          detectedPattern: event.detectedPattern,
          forgedAt: new Date().toISOString(),
        },
      })
      .returning();

    // Update deck card count
    await db
      .update(decks)
      .set({
        cardCount: sql`${decks.cardCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));

    // Log generation
    await logGeneration({
      userId,
      deckId,
      operationType: `emergence_${event.eventType}_generation`,
      modelUsed: "gemini-2.5-flash",
      userPrompt: prompt,
      rawResponse: JSON.stringify(generatedCard),
      durationMs: Date.now() - generationStart,
      status: "success",
    });

    // Only generate image and deduct credit when credits are available
    if (hasCredits) {
      await incrementCredits(userId, plan, 1);
      generateCardImage(card.id, generatedCard.imagePrompt, artStylePrompt, deckId).catch(
        (err) => console.error("[chronicle-emergence] image gen error:", err)
      );
    }

    // Generate AI-powered Lyra delivery message
    let lyraMessage: string;
    try {
      const lyraPrompt = buildEmergenceLyraMessagePrompt({
        eventType: event.eventType as "obstacle" | "threshold",
        detectedPattern: event.detectedPattern,
        patternEvidence: event.aiEvidence ?? event.detectedPattern,
        cardTitle: generatedCard.title,
        cardMeaning: generatedCard.meaning,
        knowledgeSummary: knowledge.summary ?? "",
        userName: undefined, // We don't have userName here; the message still works
      });
      const lyraResult = await generateText({
        model: geminiFreeModel,
        prompt: lyraPrompt,
        maxOutputTokens: 300,
      });
      lyraMessage = lyraResult.text.trim();
    } catch (lyraErr) {
      console.error("[chronicle-emergence] Lyra message generation failed, using fallback:", lyraErr);
      lyraMessage = buildEmergenceLyraMessageFallback(
        event.eventType as "obstacle" | "threshold",
        event.detectedPattern,
        generatedCard.title,
      );
    }

    // Update event to ready
    await updateEmergenceEvent(event.id, {
      status: "ready",
      cardId: card.id,
      lyraMessage,
    });
  } catch (err) {
    console.error("[chronicle-emergence] card generation error:", err);
    await updateEmergenceEvent(event.id, { status: "dismissed" });
  }
}

// ── Main analysis function ─────────────────────────────────────────────

export async function analyzeForEmergence(
  userId: string,
  deckId: string,
  knowledge: ChronicleKnowledge,
  totalEntries: number,
): Promise<void> {
  // Minimum entry threshold
  if (totalEntries < 7) return;

  // Prevent duplicate detections on the same day (retries, race conditions)
  if (await hasEmergenceEventToday(userId)) return;

  // Resolve plan once (needed for both detection and generation)
  const [userRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  let plan: PlanType = getUserPlanFromRole(userRow?.role);
  if (plan === "free") {
    const subPlan = await getUserPlan(userId);
    if (subPlan === "pro") plan = "pro";
  }

  // Get existing events for cooldown checks
  const existingEvents = await getEmergenceEventHistory(userId, 50);

  // AI-powered detection
  const candidate = await detectEmergenceWithAI(knowledge, existingEvents, plan);
  if (!candidate) return;

  const event = await createEmergenceEvent({
    userId,
    deckId,
    eventType: candidate.type,
    detectedPattern: candidate.detectedPattern,
    patternFrequency: candidate.patternFrequency,
    relevantExcerpts: candidate.relevantExcerpts,
    aiEvidence: candidate.patternEvidence,
    confidence: Math.round(candidate.confidence * 100),
  });

  await generateEmergenceCard(event, knowledge, deckId, userId, plan);
}
