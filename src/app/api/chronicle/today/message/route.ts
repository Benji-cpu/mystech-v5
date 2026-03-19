import { NextRequest } from "next/server";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { chronicleEntries, cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getChronicleKnowledge,
  getRecentChronicleEntries,
  getUserDisplayName,
  getUserPlan,
  getEmergenceEventForUser,
} from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage";
import {
  CHRONICLE_CONVERSATION_SYSTEM_PROMPT,
  buildChronicleConversationContext,
} from "@/lib/ai/prompts/chronicle";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { getPathPosition } from "@/lib/db/queries-paths";
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
  const { message, emergenceEventId } = body as {
    message?: string;
    emergenceEventId?: string;
  };

  if (!message?.trim()) {
    return new Response(
      JSON.stringify({ error: "message is required" }),
      { status: 400 }
    );
  }

  if (message.length > 2000) {
    return new Response(
      JSON.stringify({ error: "Message too long (max 2000 characters)" }),
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
  const [knowledge, recentEntries, settings, pathPosition, userName] = await Promise.all([
    getChronicleKnowledge(user.id),
    getRecentChronicleEntries(user.id, 5),
    getChronicleSettings(deck.id),
    getPathPosition(user.id),
    getUserDisplayName(user.id),
  ]);

  // Resolve emergence context server-side from DB (never trust client data)
  let emergenceContext: { cardTitle: string; cardType: string; detectedPattern: string } | null = null;
  if (emergenceEventId) {
    const event = await getEmergenceEventForUser(emergenceEventId, user.id);
    if (event && (event.status === 'ready' || event.status === 'delivered') && event.cardId) {
      const [cardRow] = await db
        .select({ title: cards.title, cardType: cards.cardType })
        .from(cards)
        .where(eq(cards.id, event.cardId))
        .limit(1);
      if (cardRow) {
        emergenceContext = {
          cardTitle: cardRow.title,
          cardType: cardRow.cardType,
          detectedPattern: event.detectedPattern,
        };
      }
    }
  }

  const contextInjection = buildChronicleConversationContext({
    knowledge,
    recentEntries: recentEntries.map((e) => ({
      mood: e.mood,
      themes: (e.themes ?? []) as string[],
      entryDate: e.entryDate,
    })),
    interests: settings?.interests ?? null,
    userName,
    journeyContext: pathPosition
      ? {
          pathName: pathPosition.path.name,
          retreatName: pathPosition.retreat.name,
          waypointName: pathPosition.waypoint.name,
          pathLens: pathPosition.path.interpretiveLens,
          retreatLens: pathPosition.retreat.retreatLens,
          waypointLens: pathPosition.waypoint.waypointLens,
        }
      : null,
    emergenceContext,
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
