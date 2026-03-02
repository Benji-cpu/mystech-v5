import { NextRequest } from "next/server";
import { streamObject } from "ai";
import { db } from "@/lib/db";
import { readings, astrologyProfiles, readingAstrology, readingJourneyContext } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiFreeModel, geminiProModel } from "@/lib/ai/gemini";
import { logGeneration } from "@/lib/ai/logging";
import { eq } from "drizzle-orm";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
  getUserReadingContext,
} from "@/lib/db/queries";
import { getCardJourneyHistory } from "@/lib/db/queries-journey";
import { maybeCompressUserContext } from "@/lib/ai/context-compression";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import {
  buildReadingSystemPrompt,
  buildReadingInterpretationPrompt,
  ReadingInterpretationSchema,
  STRUCTURE_TARGETS,
} from "@/lib/ai/prompts/reading-interpretation";
import type { SpreadType, AstrologicalReadingContext, JourneyContextForPrompt } from "@/types";

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

  // Fetch all data in parallel instead of sequentially
  const [reading, cardsWithData, userContextWithLength, astroProfileResult] = await Promise.all([
    getReadingByIdForUser(readingId, user.id),
    getReadingCardsWithData(readingId),
    getUserReadingContext(user.id),
    db.select().from(astrologyProfiles).where(eq(astrologyProfiles.userId, user.id)),
  ]);
  mark("parallel queries");

  if (!reading) {
    return new Response(JSON.stringify({ error: "Reading not found" }), {
      status: 404,
    });
  }

  const cardsForPrompt = cardsWithData
    .filter((rc) => rc.card !== null)
    .map((rc) => ({
      positionName: rc.positionName,
      title: rc.card!.title,
      meaning: rc.card!.meaning,
      guidance: rc.card!.guidance,
      cardType: (rc.card!.cardType ?? 'general') as 'general' | 'obstacle' | 'threshold',
    }));

  if (cardsForPrompt.length === 0) {
    return new Response(
      JSON.stringify({ error: "Reading has no cards" }),
      { status: 400 }
    );
  }

  const spreadType = reading.spreadType as SpreadType;
  const { readingLength, ...userContext } = userContextWithLength;

  // Build astrology context if profile exists
  let astroContext: AstrologicalReadingContext | undefined;
  const astroProfile = astroProfileResult[0];

  if (astroProfile) {
    const celestial = getCurrentCelestialContext();
    astroContext = {
      sunSign: astroProfile.sunSign,
      moonSign: astroProfile.moonSign,
      risingSign: astroProfile.risingSign,
      elementBalance: astroProfile.elementBalance as AstrologicalReadingContext["elementBalance"],
      currentMoonPhase: celestial.moonPhase,
      currentMoonSign: celestial.moonSign,
    };
  }

  // Build journey context if this reading has a journey context snapshot
  let journeyContext: JourneyContextForPrompt | undefined;
  const [journeyContextRow] = await db
    .select()
    .from(readingJourneyContext)
    .where(eq(readingJourneyContext.readingId, readingId));

  if (journeyContextRow) {
    // Get card IDs for "Cards Remember" lookup
    const cardIds = cardsWithData
      .map((rc) => rc.cardId)
      .filter((id): id is string => id !== null);

    const cardsRemember = await getCardJourneyHistory(
      user.id,
      cardIds,
      readingId,
      journeyContextRow.retreatId
    );

    journeyContext = {
      pathName: "", // We'll use the snapshot lens text directly
      pathLens: journeyContextRow.pathLensSnapshot,
      retreatName: "", // Filled from snapshot context below
      retreatLens: journeyContextRow.retreatLensSnapshot,
      waypointName: "",
      waypointLens: journeyContextRow.waypointLensSnapshot,
      suggestedIntention: journeyContextRow.waypointIntentionSnapshot,
      cardsRemember,
    };

    // Fetch the actual names for display in the prompt
    const { paths, retreats, waypoints } = await import("@/lib/db/schema");
    const [pathRow, retreatRow, waypointRow] = await Promise.all([
      db.select({ name: paths.name }).from(paths).where(eq(paths.id, journeyContextRow.pathId)).then((r) => r[0]),
      db.select({ name: retreats.name }).from(retreats).where(eq(retreats.id, journeyContextRow.retreatId)).then((r) => r[0]),
      db.select({ name: waypoints.name }).from(waypoints).where(eq(waypoints.id, journeyContextRow.waypointId)).then((r) => r[0]),
    ]);
    journeyContext.pathName = pathRow?.name ?? "Unknown Path";
    journeyContext.retreatName = retreatRow?.name ?? "Unknown Retreat";
    journeyContext.waypointName = waypointRow?.name ?? "Unknown Waypoint";
  }

  const prompt = buildReadingInterpretationPrompt({
    spreadType,
    question: reading.question,
    cards: cardsForPrompt,
    userContext,
    readingLength,
    astroContext,
    journeyContext,
  });
  const { maxTokens } = STRUCTURE_TARGETS[readingLength][spreadType];
  mark("prompt built");

  const role = (user as { role?: string }).role ?? "user";
  const model = role === "admin" ? geminiProModel : geminiFreeModel;
  const readingStart = Date.now();
  const readingSystemPrompt = buildReadingSystemPrompt(readingLength);

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

        // Save astrology snapshot if astro context was used
        if (astroContext && object?.astroContext) {
          const cardAssociations = object.cardSections
            ?.filter((s) => s?.astroResonance)
            .map((s) => ({
              cardTitle: s.positionName,
              positionName: s.positionName,
              rulingSign: s.astroResonance!.rulingSign,
              rulingPlanet: s.astroResonance!.rulingPlanet,
              elementHarmony: s.astroResonance!.elementHarmony,
              relevantPlacement: s.astroResonance!.relevantPlacement,
              astroNote: "",
            })) ?? [];

          await db
            .insert(readingAstrology)
            .values({
              readingId,
              moonPhase: astroContext.currentMoonPhase,
              moonSign: astroContext.currentMoonSign,
              cardAssociations,
            })
            .onConflictDoUpdate({
              target: readingAstrology.readingId,
              set: {
                moonPhase: astroContext.currentMoonPhase,
                moonSign: astroContext.currentMoonSign,
                cardAssociations,
              },
            })
            .catch((err) => console.error("[ai/reading] astrology save error:", err));
        }

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
