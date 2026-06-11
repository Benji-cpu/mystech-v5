import { NextRequest } from "next/server";
import { streamObject } from "ai";
import { db } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiFreeModel, geminiProModel } from "@/lib/ai/gemini";
import { logGeneration } from "@/lib/ai/logging";
import { eq } from "drizzle-orm";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
} from "@/lib/db/queries";
import { buildSeekerContext } from "@/lib/ai/seeker-context";
import { maybeCompressUserContext } from "@/lib/ai/context-compression";
import {
  buildReadingSystemPrompt,
  buildReadingInterpretationPrompt,
  ReadingInterpretationSchema,
  STRUCTURE_TARGETS,
} from "@/lib/ai/prompts/reading-interpretation";
import type { SpreadType } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const t0 = isDev ? Date.now() : 0;
  const mark = (label: string) => isDev && console.log(`[ai/reading POST] +${Date.now() - t0}ms ${label}`);

  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  mark("auth");

  const body = await request.json();
  const { readingId } = body as { readingId?: string };

  if (!readingId) {
    return new Response(
      JSON.stringify({ error: "readingId is required" }),
      { status: 400 }
    );
  }

  // Fetch all data in parallel instead of sequentially. The seeker-context
  // builder receives the card-id promise so its journey lookup stays parallel.
  const cardsPromise = getReadingCardsWithData(readingId);
  const cardIdsPromise = cardsPromise.then((rows) =>
    rows.map((rc) => rc.cardId).filter((id): id is string => id !== null)
  );
  const [reading, cardsWithData, seeker] = await Promise.all([
    getReadingByIdForUser(readingId, user.id),
    cardsPromise,
    buildSeekerContext(user.id, {
      reading: { readingId, cardIds: cardIdsPromise },
    }),
  ]);
  mark("parallel queries");

  if (!reading) {
    return new Response(JSON.stringify({ error: "Reading not found" }), {
      status: 404,
    });
  }

  const cardsForPrompt = cardsWithData
    .filter((rc) => rc.card?.id || rc.retreatCard?.id)
    .map((rc) => {
      const c = rc.card?.id ? rc.card : null;
      const r = rc.retreatCard?.id ? rc.retreatCard : null;
      return {
        positionName: rc.positionName,
        title: (c?.title ?? r?.title)!,
        meaning: (c?.meaning ?? r?.meaning)!,
        guidance: (c?.guidance ?? r?.guidance)!,
        cardType: ((c?.cardType ?? r?.cardType) ?? 'general') as 'general' | 'obstacle' | 'threshold',
      };
    });

  if (cardsForPrompt.length === 0) {
    return new Response(
      JSON.stringify({ error: "Reading has no cards" }),
      { status: 400 }
    );
  }

  const spreadType = reading.spreadType as SpreadType;
  const { userContext, readingLength, userName, astroContext, journeyContext } = seeker;

  const prompt = buildReadingInterpretationPrompt({
    spreadType,
    question: reading.question,
    cards: cardsForPrompt,
    userContext,
    readingLength,
    astroContext,
    journeyContext,
    userName,
  });
  const { maxTokens } = STRUCTURE_TARGETS[readingLength][spreadType];
  mark("prompt built");

  const role = (user as { role?: string }).role ?? "user";
  const model = role === "admin" ? geminiProModel : geminiFreeModel;
  const readingStart = Date.now();
  const readingSystemPrompt = buildReadingSystemPrompt(readingLength, userName);

  mark("stream start");
  const result = streamObject({
    model,
    schema: ReadingInterpretationSchema,
    system: readingSystemPrompt,
    prompt,
    maxOutputTokens: maxTokens,
    onFinish: async ({ object }) => {
      try {
        // Reconstruct plain text for DB storage (backward-compatible)
        const sections = object?.cardSections?.map((s) => s.text) ?? [];
        const fullText = [
          ...sections,
          object?.synthesis ?? "",
          object?.reflectiveQuestion ?? "",
        ]
          .filter(Boolean)
          .join("\n\n");

        await db
          .update(readings)
          .set({ interpretation: fullText, updatedAt: new Date() })
          .where(eq(readings.id, readingId));

        await logGeneration({
          userId: user.id,
          readingId,
          operationType: "reading_interpretation",
          modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
          systemPrompt: readingSystemPrompt,
          userPrompt: prompt,
          rawResponse: fullText,
          durationMs: Date.now() - readingStart,
          status: "success",
        });
        // Fire-and-forget context compression
        maybeCompressUserContext(user.id!).catch(() => {});
      } catch (err) {
        console.error("[ai/reading] onFinish error:", err);
        await logGeneration({
          userId: user.id,
          readingId,
          operationType: "reading_interpretation",
          modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
          durationMs: Date.now() - readingStart,
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Unknown onFinish error",
        }).catch(() => {});
      }
    },
    onError: (err) => {
      console.error("[ai/reading] stream error:", err);
    },
  });

  return result.toTextStreamResponse();
}
