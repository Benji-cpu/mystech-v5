import { NextResponse } from "next/server";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { cards, chronicleEntries } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getChronicleKnowledge,
  getUserPlan,
} from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage";
import { buildChronicleMiniReadingPrompt } from "@/lib/ai/prompts/chronicle";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

export const maxDuration = 60;

export async function POST() {
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

  const entry = await getTodayChronicleEntry(user.id);
  if (!entry) {
    return new Response(
      JSON.stringify({ error: "No entry found for today." }),
      { status: 404 }
    );
  }

  if (!entry.cardId) {
    return new Response(
      JSON.stringify({ error: "No card has been forged yet. Forge a card first." }),
      { status: 400 }
    );
  }

  // Fetch the card data
  const [card] = await db
    .select({
      id: cards.id,
      title: cards.title,
      meaning: cards.meaning,
      guidance: cards.guidance,
    })
    .from(cards)
    .where(eq(cards.id, entry.cardId));

  if (!card) {
    return new Response(
      JSON.stringify({ error: "Card not found." }),
      { status: 404 }
    );
  }

  // Determine plan
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }
  const isPro = plan !== "free";
  const model = plan === "free" ? geminiModel : geminiProModel;

  const [knowledge, settings] = await Promise.all([
    getChronicleKnowledge(user.id),
    getChronicleSettings(deck.id),
  ]);

  const prompt = buildChronicleMiniReadingPrompt({
    card,
    conversation: entry.conversation,
    knowledge,
    streakCount: settings?.streakCount ?? 0,
    isPro,
  });

  const entryId = entry.id;

  const result = streamText({
    model,
    prompt,
    maxOutputTokens: isPro ? 800 : 500,
    onFinish: async ({ text }) => {
      try {
        await db
          .update(chronicleEntries)
          .set({ miniReading: text })
          .where(eq(chronicleEntries.id, entryId));
      } catch (err) {
        console.error("[chronicle/today/reading] onFinish error:", err);
      }
    },
    onError: (err) => {
      console.error("[chronicle/today/reading] stream error:", err);
    },
  });

  return result.toTextStreamResponse();
}
