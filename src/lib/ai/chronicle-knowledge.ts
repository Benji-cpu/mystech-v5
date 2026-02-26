import { generateObject, generateText } from "ai";
import { z } from "zod";
import { geminiFreeModel, geminiProModel } from "@/lib/ai/gemini";
import {
  CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
  buildKnowledgeExtractionPrompt,
} from "@/lib/ai/prompts/chronicle";
import {
  getChronicleKnowledge,
  upsertChronicleKnowledge,
  getChronicleCompletedEntryCount,
} from "@/lib/db/queries";
import type { ChronicleKnowledge, PlanType } from "@/types";

const KNOWLEDGE_EXTRACTION_SCHEMA = z.object({
  themes: z
    .array(z.string())
    .describe("Key themes discussed in the conversation"),
  mood: z.string().describe("Primary emotional tone (one word)"),
  lifeAreas: z
    .array(z.string())
    .describe("Life domains touched on"),
  symbols: z
    .array(z.string())
    .describe("Recurring symbols, metaphors, or images"),
  keyEvent: z
    .string()
    .nullable()
    .describe("Significant life event mentioned, or null"),
});

type ExtractionResult = z.infer<typeof KNOWLEDGE_EXTRACTION_SCHEMA>;

const COMPRESSION_THRESHOLD = 10;

/**
 * Extract themes, mood, symbols from a Chronicle conversation
 * and merge into the user's knowledge graph.
 */
export async function extractAndMergeKnowledge(
  userId: string,
  conversation: { role: string; content: string }[],
  plan: PlanType
): Promise<{ mood: string; themes: string[] }> {
  const model = plan === "free" ? geminiFreeModel : geminiProModel;

  // Extract structured knowledge from conversation
  const { object: extraction } = await generateObject({
    model,
    system: CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
    prompt: buildKnowledgeExtractionPrompt(conversation),
    schema: KNOWLEDGE_EXTRACTION_SCHEMA,
    maxOutputTokens: 300,
  });

  // Merge into knowledge graph
  await mergeExtraction(userId, extraction);

  // Check if we need to regenerate the compressed summary
  const entryCount = await getChronicleCompletedEntryCount(userId);
  const knowledge = await getChronicleKnowledge(userId);
  const lastCompressedVersion = knowledge?.version ?? 0;

  if (entryCount - lastCompressedVersion >= COMPRESSION_THRESHOLD) {
    await regenerateKnowledgeSummary(userId, knowledge, model);
  }

  return {
    mood: extraction.mood,
    themes: extraction.themes,
  };
}

async function mergeExtraction(
  userId: string,
  extraction: ExtractionResult
) {
  const existing = await getChronicleKnowledge(userId);
  const today = new Date().toISOString().split("T")[0];

  // Merge themes
  const themes = { ...(existing?.themes ?? {}) };
  for (const theme of extraction.themes) {
    const key = theme.toLowerCase();
    if (themes[key]) {
      themes[key] = { count: themes[key].count + 1, lastSeen: today };
    } else {
      themes[key] = { count: 1, lastSeen: today };
    }
  }

  // Merge life areas
  const lifeAreas = { ...(existing?.lifeAreas ?? {}) };
  for (const area of extraction.lifeAreas) {
    const key = area.toLowerCase();
    if (lifeAreas[key]) {
      lifeAreas[key] = { count: lifeAreas[key].count + 1, lastSeen: today };
    } else {
      lifeAreas[key] = { count: 1, lastSeen: today };
    }
  }

  // Merge symbols
  const symbols = [...(existing?.recurringSymbols ?? [])];
  for (const symbol of extraction.symbols) {
    const existingSymbol = symbols.find(
      (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
    );
    if (existingSymbol) {
      existingSymbol.count += 1;
      existingSymbol.lastSeen = today;
    } else {
      symbols.push({ symbol, count: 1, lastSeen: today });
    }
  }

  // Add key event if present
  const keyEvents = [...(existing?.keyEvents ?? [])];
  if (extraction.keyEvent) {
    keyEvents.push({
      event: extraction.keyEvent,
      date: today,
      themes: extraction.themes,
    });
    // Keep only last 20 key events
    if (keyEvents.length > 20) {
      keyEvents.splice(0, keyEvents.length - 20);
    }
  }

  // Merge emotional pattern
  const emotionalPatterns = [...(existing?.emotionalPatterns ?? [])];
  const existingMood = emotionalPatterns.find(
    (p) => p.pattern.toLowerCase() === extraction.mood.toLowerCase()
  );
  if (existingMood) {
    existingMood.frequency += 1;
    existingMood.lastSeen = today;
  } else {
    emotionalPatterns.push({
      pattern: extraction.mood,
      frequency: 1,
      lastSeen: today,
    });
  }

  await upsertChronicleKnowledge(userId, {
    themes,
    lifeAreas,
    recurringSymbols: symbols,
    keyEvents,
    emotionalPatterns,
  });
}

async function regenerateKnowledgeSummary(
  userId: string,
  existing: ChronicleKnowledge | null,
  model: typeof geminiFreeModel
) {
  if (!existing) return;

  const topThemes = Object.entries(existing.themes)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([theme, data]) => `${theme} (${data.count}x)`);

  const topAreas = Object.entries(existing.lifeAreas)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([area, data]) => `${area} (${data.count}x)`);

  const topMoods = existing.emotionalPatterns
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5)
    .map((p) => `${p.pattern} (${p.frequency}x)`);

  const recentEvents = existing.keyEvents
    .slice(-5)
    .map((e) => `${e.date}: ${e.event}`);

  const dataPoints = [
    topThemes.length > 0 && `Recurring themes: ${topThemes.join(", ")}`,
    topAreas.length > 0 && `Life areas: ${topAreas.join(", ")}`,
    topMoods.length > 0 && `Emotional patterns: ${topMoods.join(", ")}`,
    recentEvents.length > 0 && `Recent events:\n${recentEvents.join("\n")}`,
    existing.personalityNotes && `Personality: ${existing.personalityNotes}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { text } = await generateText({
    model,
    system:
      "You are a factual note-taker. Compress the following user profile data into a brief summary (under 500 tokens). Write in plain data notes style. No mystic language. Focus on what's most useful for personalizing daily conversations.",
    prompt: `${existing.summary ? `Previous summary:\n${existing.summary}\n\n` : ""}Current data:\n${dataPoints}\n\nProduce an updated factual summary of this user's patterns, interests, and life context.`,
    maxOutputTokens: 500,
  });

  const entryCount = await getChronicleCompletedEntryCount(userId);

  await upsertChronicleKnowledge(userId, {
    summary: text,
    version: entryCount,
  });
}
