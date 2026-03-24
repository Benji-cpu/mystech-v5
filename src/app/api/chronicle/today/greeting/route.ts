import { NextRequest } from "next/server";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import {
  getUserChronicleDeck,
  getChronicleSettings,
  getChronicleKnowledge,
  getRecentChronicleEntries,
  getUserDisplayName,
  getUserPlan,
  getPendingEmergenceEvent,
} from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage";
import { buildChronicleGreetingPrompt } from "@/lib/ai/prompts/chronicle";
import { getPathPosition } from "@/lib/db/queries-paths";
import { eq } from "drizzle-orm";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const deck = await getUserChronicleDeck(user.id);
  if (!deck) {
    return new Response(
      JSON.stringify({ error: "Chronicle deck not found" }),
      { status: 404 }
    );
  }

  // Determine plan and model
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }
  const model = plan === "free" ? geminiModel : geminiProModel;

  // Client passes local time of day since server doesn't know timezone
  const timeOfDay = (request.nextUrl.searchParams.get("timeOfDay") ?? "morning") as
    "morning" | "afternoon" | "evening" | "night";

  // Parallel fetch all context signals
  const [settings, knowledge, recentEntries, pathPosition, userName, pendingEmergence] =
    await Promise.all([
      getChronicleSettings(deck.id),
      getChronicleKnowledge(user.id),
      getRecentChronicleEntries(user.id, 3),
      getPathPosition(user.id),
      getUserDisplayName(user.id),
      getPendingEmergenceEvent(user.id),
    ]);

  // Resolve card title for most recent entry
  const entriesWithCardTitles = await Promise.all(
    recentEntries.map(async (entry) => {
      let cardTitle: string | undefined;
      if (entry.cardId) {
        const [cardRow] = await db
          .select({ title: cards.title })
          .from(cards)
          .where(eq(cards.id, entry.cardId))
          .limit(1);
        if (cardRow) cardTitle = cardRow.title;
      }
      return {
        mood: entry.mood,
        themes: (entry.themes ?? []) as string[],
        cardTitle,
      };
    })
  );

  // Resolve emergence context if pending and ready
  let emergenceContext: { cardTitle: string; cardType: string; detectedPattern: string } | null = null;
  if (pendingEmergence?.status === "ready" && pendingEmergence.cardId) {
    const [cardRow] = await db
      .select({ title: cards.title, cardType: cards.cardType })
      .from(cards)
      .where(eq(cards.id, pendingEmergence.cardId))
      .limit(1);
    if (cardRow) {
      emergenceContext = {
        cardTitle: cardRow.title,
        cardType: cardRow.cardType,
        detectedPattern: pendingEmergence.detectedPattern,
      };
    }
  }

  const prompt = buildChronicleGreetingPrompt({
    timeOfDay,
    streakCount: settings?.streakCount ?? 0,
    recentEntries: entriesWithCardTitles,
    knowledge,
    userName,
    journeyContext: pathPosition
      ? {
          waypointName: pathPosition.waypoint.name,
          waypointLens: pathPosition.waypoint.waypointLens,
        }
      : null,
    emergenceContext,
  });

  const result = streamText({
    model,
    prompt,
    maxOutputTokens: 150,
    onError: (err) => {
      console.error("[chronicle/today/greeting] stream error:", err);
    },
  });

  return result.toTextStreamResponse();
}
