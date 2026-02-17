import { NextRequest } from "next/server";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiFreeModel, geminiProModel } from "@/lib/ai/gemini";
import { logGeneration } from "@/lib/ai/logging";
import { eq } from "drizzle-orm";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
  getUserReadingContext,
  getUserReadingLength,
} from "@/lib/db/queries";
import { maybeCompressUserContext } from "@/lib/ai/context-compression";
import {
  buildReadingSystemPrompt,
  buildReadingInterpretationPrompt,
  STRUCTURE_TARGETS,
} from "@/lib/ai/prompts/reading-interpretation";
import type { SpreadType } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { readingId } = body as { readingId?: string };

  if (!readingId) {
    return new Response(
      JSON.stringify({ error: "readingId is required" }),
      { status: 400 }
    );
  }

  const reading = await getReadingByIdForUser(readingId, user.id);
  if (!reading) {
    return new Response(JSON.stringify({ error: "Reading not found" }), {
      status: 404,
    });
  }

  const cardsWithData = await getReadingCardsWithData(readingId);
  const cardsForPrompt = cardsWithData
    .filter((rc) => rc.card !== null)
    .map((rc) => ({
      positionName: rc.positionName,
      title: rc.card!.title,
      meaning: rc.card!.meaning,
      guidance: rc.card!.guidance,
    }));

  if (cardsForPrompt.length === 0) {
    return new Response(
      JSON.stringify({ error: "Reading has no cards" }),
      { status: 400 }
    );
  }

  const spreadType = reading.spreadType as SpreadType;

  // Fetch user context for personalized readings
  const userContext = await getUserReadingContext(user.id);
  const readingLength = await getUserReadingLength(user.id);

  const prompt = buildReadingInterpretationPrompt({
    spreadType,
    question: reading.question,
    cards: cardsForPrompt,
    userContext,
    readingLength,
  });
  const { maxTokens } = STRUCTURE_TARGETS[readingLength][spreadType];

  const role = (user as { role?: string }).role ?? "user";
  const model = role === "admin" ? geminiProModel : geminiFreeModel;
  const readingStart = Date.now();
  const readingSystemPrompt = buildReadingSystemPrompt(readingLength);

  const result = streamText({
    model,
    system: readingSystemPrompt,
    prompt,
    maxOutputTokens: maxTokens,
    onFinish: async ({ text }) => {
      await db
        .update(readings)
        .set({ interpretation: text, updatedAt: new Date() })
        .where(eq(readings.id, readingId));
      await logGeneration({
        userId: user.id,
        readingId,
        operationType: "reading_interpretation",
        modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
        systemPrompt: readingSystemPrompt,
        userPrompt: prompt,
        rawResponse: text,
        durationMs: Date.now() - readingStart,
        status: "success",
      });
      // Fire-and-forget context compression
      maybeCompressUserContext(user.id!).catch(() => {});
    },
  });

  return result.toTextStreamResponse();
}
