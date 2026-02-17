import { db } from "@/lib/db";
import { generationLogs } from "@/lib/db/schema";

export type LogGenerationData = {
  userId: string;
  deckId?: string;
  readingId?: string;
  operationType: string;
  modelUsed?: string;
  systemPrompt?: string;
  userPrompt?: string;
  rawResponse?: string;
  tokenUsage?: object;
  durationMs?: number;
  status: "success" | "error";
  errorMessage?: string;
};

export async function logGeneration(data: LogGenerationData) {
  try {
    await db.insert(generationLogs).values({
      userId: data.userId,
      deckId: data.deckId ?? null,
      readingId: data.readingId ?? null,
      operationType: data.operationType,
      modelUsed: data.modelUsed ?? null,
      systemPrompt: data.systemPrompt ?? null,
      userPrompt: data.userPrompt ?? null,
      rawResponse: data.rawResponse ?? null,
      tokenUsage: data.tokenUsage ?? null,
      durationMs: data.durationMs ?? null,
      status: data.status,
      errorMessage: data.errorMessage ?? null,
    });
  } catch (error) {
    // Fire-and-forget — never break the main flow
    console.error("[logGeneration] Failed to log:", error);
  }
}
