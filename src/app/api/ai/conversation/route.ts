import { NextRequest } from "next/server";
import { streamText, generateObject, stepCountIs, convertToModelMessages } from "ai";
import { db } from "@/lib/db";
import { decks, conversations, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import { logGeneration } from "@/lib/ai/logging";
import { resolvePrompt } from "@/lib/ai/prompts/resolve";
import { eq, and, desc } from "drizzle-orm";
import {
  JOURNEY_CONVERSATION_SYSTEM_PROMPT,
  buildCardAwareSystemPrompt,
  buildAnchorExtractionPrompt,
  buildReadinessFromAnchors,
} from "@/lib/ai/prompts/conversation";
import { extractedAnchorsSchema } from "@/lib/ai/schemas";
import { journeyTools } from "@/lib/ai/tools/journey-tools";
import type { ConversationMessage, Anchor, DraftCard } from "@/types";

/** Extract plain text from a ModelMessage content field (string or parts array). */
function getTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p: { type: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("");
  }
  return "";
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const role = (user as { role?: string }).role ?? "user";
  const model = role === "admin" ? geminiProModel : geminiModel;

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
    messages: unknown[];
  };

  if (!deckId || !messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "deckId and messages are required" }),
      { status: 400 }
    );
  }

  // Convert UIMessages (from useChat) to ModelMessages (for streamText)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelMessages = await convertToModelMessages(messages as any);

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

  // Build context for AI — resolve prompt override for admin
  let systemPrompt = await resolvePrompt("JOURNEY_CONVERSATION_SYSTEM_PROMPT", role);
  if (draftCards.length > 0) {
    systemPrompt = buildCardAwareSystemPrompt(systemPrompt, draftCards);
  }
  if (conversationSummary) {
    systemPrompt += `\n\nPrevious conversation summary:\n${conversationSummary}`;
  }

  // Create a data stream for custom events
  const encoder = new TextEncoder();
  const customDataChunks: string[] = [];
  const conversationStart = Date.now();

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    tools: journeyTools,
    stopWhen: stepCountIs(3),
    onFinish: async ({ text, toolCalls }) => {
      // Log conversation generation
      const lastUserMsg = modelMessages.filter(m => m.role === "user").pop();
      await logGeneration({
        userId: user.id,
        deckId,
        operationType: "conversation",
        modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
        systemPrompt,
        userPrompt: lastUserMsg ? getTextContent(lastUserMsg.content) : undefined,
        rawResponse: text || undefined,
        durationMs: Date.now() - conversationStart,
        status: "success",
      });
      // Save the user's message and AI response to database
      if (lastUserMsg) {
        await db.insert(conversations).values({
          deckId,
          role: "user",
          content: getTextContent(lastUserMsg.content),
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
            const input = (toolCall as { input: { confirmed: boolean } }).input;
            if (input.confirmed) {
              // Delete the deck and all related data
              await db.delete(decks).where(eq(decks.id, deckId));
              // The cascade will delete conversations, metadata, etc.
              customDataChunks.push(
                JSON.stringify({ type: "restart", redirect: "/decks/new/journey" })
              );
            }
          } else if (toolCall.toolName === "update_card") {
            const cardInput = (toolCall as {
              input: {
                cardNumber: number;
                title: string;
                meaning: string;
                guidance: string;
                imagePrompt: string;
              };
            }).input;

            // Update the draft card
            const updatedCards = draftCards.map((c) => {
              if (c.cardNumber === cardInput.cardNumber) {
                return {
                  ...cardInput,
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
                cardNumber: cardInput.cardNumber,
                card: cardInput,
              })
            );
          }
        }
      }

      // Extract anchors from the full conversation
      if (text && !toolCalls?.length) {
        try {
          const fullConversation = modelMessages
            .filter(m => m.role === "user" || m.role === "assistant")
            .map((m) => `${m.role.toUpperCase()}: ${getTextContent(m.content)}`)
            .join("\n\n");

          const anchorStart = Date.now();
          const anchorPrompt = buildAnchorExtractionPrompt(fullConversation);
          const anchorResult = await generateObject({
            model,
            schema: extractedAnchorsSchema,
            prompt: anchorPrompt,
          });

          const newAnchors = anchorResult.object.anchors;
          await logGeneration({
            userId: user.id,
            deckId,
            operationType: "anchor_extraction",
            modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
            userPrompt: anchorPrompt,
            rawResponse: JSON.stringify(anchorResult.object),
            durationMs: Date.now() - anchorStart,
            status: "success",
          });
          const targetCards = deck[0].cardCount || 10;
          const readinessText = buildReadinessFromAnchors(
            newAnchors.length,
            targetCards
          );
          const isReady = newAnchors.length >= targetCards * 0.7;

          // Upsert metadata with new anchors
          const [existingMeta] = await db
            .select()
            .from(deckMetadata)
            .where(eq(deckMetadata.deckId, deckId))
            .limit(1);

          if (existingMeta) {
            await db
              .update(deckMetadata)
              .set({
                extractedAnchors: newAnchors,
                isReady,
                updatedAt: new Date(),
              })
              .where(eq(deckMetadata.deckId, deckId));
          } else {
            await db.insert(deckMetadata).values({
              deckId,
              extractedAnchors: newAnchors,
              isReady,
            });
          }

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

  // Return the streaming response compatible with useChat
  return result.toUIMessageStreamResponse();
}
