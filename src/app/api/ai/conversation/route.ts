import { NextRequest } from "next/server";
import { streamText, generateObject } from "ai";
import { db } from "@/lib/db";
import { decks, conversations, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel } from "@/lib/ai/gemini";
import { eq, and, desc } from "drizzle-orm";
import {
  JOURNEY_CONVERSATION_SYSTEM_PROMPT,
  buildAnchorExtractionPrompt,
  buildReadinessFromAnchors,
} from "@/lib/ai/prompts/conversation";
import { extractedAnchorsSchema } from "@/lib/ai/schemas";
import { journeyTools } from "@/lib/ai/tools/journey-tools";
import type { ConversationMessage, Anchor, DraftCard } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[conversation] GOOGLE_GENERATIVE_AI_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "AI service is not configured" }),
      { status: 503 }
    );
  }

  const body = await request.json();
  const { deckId, messages } = body as {
    deckId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!deckId || !messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "deckId and messages are required" }),
      { status: 400 }
    );
  }

  // Verify deck ownership
  const deck = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
    .limit(1);

  if (deck.length === 0) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
    });
  }

  // Get existing metadata
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId))
    .limit(1);

  const existingAnchors = (metadata?.extractedAnchors as Anchor[]) || [];
  const draftCards = (metadata?.draftCards as DraftCard[]) || [];
  const conversationSummary = metadata?.conversationSummary || "";

  // Build context for AI
  let systemPrompt = JOURNEY_CONVERSATION_SYSTEM_PROMPT;
  if (draftCards.length > 0) {
    systemPrompt += `\n\nThe seeker has already generated draft cards. They may want to edit them. Current cards:\n${draftCards.map((c) => `Card ${c.cardNumber}: "${c.title}"`).join("\n")}`;
  }
  if (conversationSummary) {
    systemPrompt += `\n\nPrevious conversation summary:\n${conversationSummary}`;
  }

  // Create a data stream for custom events
  const encoder = new TextEncoder();
  const customDataChunks: string[] = [];

  const result = streamText({
    model: geminiModel,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    tools: journeyTools,
    maxSteps: 3,
    onFinish: async ({ text, toolCalls }) => {
      // Save the user's message and AI response to database
      const userMessage = messages[messages.length - 1];
      if (userMessage?.role === "user") {
        await db.insert(conversations).values({
          deckId,
          role: "user",
          content: userMessage.content,
        });
      }

      if (text) {
        await db.insert(conversations).values({
          deckId,
          role: "assistant",
          content: text,
        });
      }

      // Handle tool calls
      if (toolCalls) {
        for (const toolCall of toolCalls) {
          if (toolCall.toolName === "restart_journey") {
            const args = toolCall.args as { confirmed: boolean };
            if (args.confirmed) {
              // Delete the deck and all related data
              await db.delete(decks).where(eq(decks.id, deckId));
              // The cascade will delete conversations, metadata, etc.
              customDataChunks.push(
                JSON.stringify({ type: "restart", redirect: "/decks/new/journey" })
              );
            }
          } else if (toolCall.toolName === "update_card") {
            const args = toolCall.args as {
              cardNumber: number;
              title: string;
              meaning: string;
              guidance: string;
              imagePrompt: string;
            };

            // Update the draft card
            const updatedCards = draftCards.map((c) => {
              if (c.cardNumber === args.cardNumber) {
                return {
                  ...args,
                  previousVersion: {
                    title: c.title,
                    meaning: c.meaning,
                    guidance: c.guidance,
                    imagePrompt: c.imagePrompt,
                  },
                };
              }
              return c;
            });

            await db
              .update(deckMetadata)
              .set({ draftCards: updatedCards, updatedAt: new Date() })
              .where(eq(deckMetadata.deckId, deckId));

            customDataChunks.push(
              JSON.stringify({
                type: "card_updated",
                cardNumber: args.cardNumber,
                card: args,
              })
            );
          }
        }
      }

      // Extract anchors from the full conversation
      if (text && !toolCalls?.length) {
        try {
          const fullConversation = messages
            .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n\n");

          const anchorResult = await generateObject({
            model: geminiModel,
            schema: extractedAnchorsSchema,
            prompt: buildAnchorExtractionPrompt(fullConversation),
          });

          const newAnchors = anchorResult.object.anchors;
          const targetCards = deck[0].cardCount || 10;
          const readinessText = buildReadinessFromAnchors(
            newAnchors.length,
            targetCards
          );
          const isReady = newAnchors.length >= targetCards * 0.7;

          // Update metadata with new anchors
          await db
            .update(deckMetadata)
            .set({
              extractedAnchors: newAnchors,
              isReady,
              updatedAt: new Date(),
            })
            .where(eq(deckMetadata.deckId, deckId));

          customDataChunks.push(
            JSON.stringify({
              type: "readiness",
              anchorsFound: newAnchors.length,
              targetCards,
              isReady,
              readinessText,
            })
          );
        } catch (error) {
          console.error("[conversation] Anchor extraction failed:", error);
        }
      }
    },
  });

  // Return the streaming response
  const responseStream = result.toDataStreamResponse();

  // Append custom data to the stream
  if (customDataChunks.length > 0) {
    const customData = customDataChunks.join("\n");
    const headers = new Headers(responseStream.headers);
    headers.set("X-Custom-Data", Buffer.from(customData).toString("base64"));
  }

  return responseStream;
}
