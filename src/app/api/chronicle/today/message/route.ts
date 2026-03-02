import { NextRequest } from "next/server";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { chronicleEntries } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getChronicleKnowledge,
  getRecentChronicleEntries,
} from "@/lib/db/queries";
import { getUserPlan } from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage";
import {
  CHRONICLE_CONVERSATION_SYSTEM_PROMPT,
  buildChronicleConversationContext,
} from "@/lib/ai/prompts/chronicle";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { getJourneyPosition } from "@/lib/db/queries-journey";
import type { ChronicleConversationMessage } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { message } = body as { message?: string };

  if (!message?.trim()) {
    return new Response(
      JSON.stringify({ error: "message is required" }),
      { status: 400 }
    );
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

  // Get or create today's entry
  const today = new Date().toISOString().split("T")[0];
  let entry = await getTodayChronicleEntry(user.id);

  if (!entry) {
    const [created] = await db
      .insert(chronicleEntries)
      .values({
        userId: user.id,
        deckId: deck.id,
        entryDate: today,
        conversation: [],
        status: "in_progress",
      })
      .returning();
    entry = {
      id: created.id,
      userId: created.userId,
      deckId: created.deckId,
      cardId: created.cardId,
      entryDate: created.entryDate,
      conversation: [],
      mood: created.mood,
      themes: (created.themes ?? []) as string[],
      miniReading: created.miniReading,
      status: created.status as "in_progress",
      createdAt: created.createdAt,
      completedAt: created.completedAt,
    };
  }

  // Append user message to conversation
  const userMessage: ChronicleConversationMessage = {
    role: "user",
    content: message.trim(),
    timestamp: new Date().toISOString(),
  };
  const updatedConversation: ChronicleConversationMessage[] = [
    ...entry.conversation,
    userMessage,
  ];

  // Save user message immediately
  await db
    .update(chronicleEntries)
    .set({ conversation: updatedConversation })
    .where(eq(chronicleEntries.id, entry.id));

  // Build context for Lyra
  const [knowledge, recentEntries, settings, journeyPosition] = await Promise.all([
    getChronicleKnowledge(user.id),
    getRecentChronicleEntries(user.id, 5),
    getChronicleSettings(deck.id),
    getJourneyPosition(user.id),
  ]);

  const contextInjection = buildChronicleConversationContext({
    knowledge,
    recentEntries: recentEntries.map((e) => ({
      mood: e.mood,
      themes: (e.themes ?? []) as string[],
      entryDate: e.entryDate,
    })),
    interests: settings?.interests ?? null,
    journeyContext: journeyPosition
      ? {
          pathName: journeyPosition.path.name,
          retreatName: journeyPosition.retreat.name,
          waypointName: journeyPosition.waypoint.name,
          pathLens: journeyPosition.path.interpretiveLens,
          retreatLens: journeyPosition.retreat.retreatLens,
          waypointLens: journeyPosition.waypoint.waypointLens,
        }
      : null,
  });

  // Build messages array for AI
  const aiMessages = updatedConversation.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  const systemPrompt = contextInjection
    ? `${CHRONICLE_CONVERSATION_SYSTEM_PROMPT}\n${contextInjection}`
    : CHRONICLE_CONVERSATION_SYSTEM_PROMPT;

  const entryId = entry.id;

  const result = streamText({
    model,
    system: systemPrompt,
    messages: aiMessages,
    maxOutputTokens: 800,
    onFinish: async ({ text }) => {
      try {
        const assistantMessage: ChronicleConversationMessage = {
          role: "assistant",
          content: text,
          timestamp: new Date().toISOString(),
        };
        const finalConversation: ChronicleConversationMessage[] = [
          ...updatedConversation,
          assistantMessage,
        ];
        await db
          .update(chronicleEntries)
          .set({ conversation: finalConversation })
          .where(eq(chronicleEntries.id, entryId));
      } catch (err) {
        console.error("[chronicle/today/message] onFinish error:", err);
      }
    },
    onError: (err) => {
      console.error("[chronicle/today/message] stream error:", err);
    },
  });

  return result.toTextStreamResponse();
}
