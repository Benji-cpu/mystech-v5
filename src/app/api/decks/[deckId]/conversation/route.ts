import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, conversations, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, and, asc } from "drizzle-orm";
import { buildReadinessFromAnchors } from "@/lib/ai/prompts/conversation";
import type { ApiResponse, ConversationMessage, Anchor, DraftCard, JourneyReadinessState } from "@/types";

type ConversationHistoryResponse = {
  messages: ConversationMessage[];
  readiness: JourneyReadinessState;
  draftCards: DraftCard[];
  conversationSummary: string | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;

  // Verify deck ownership
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
    .limit(1);

  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  // Get conversation history
  const conversationHistory = await db
    .select()
    .from(conversations)
    .where(eq(conversations.deckId, deckId))
    .orderBy(asc(conversations.createdAt));

  // Get metadata
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId))
    .limit(1);

  const anchors = (metadata?.extractedAnchors as Anchor[]) || [];
  const draftCards = (metadata?.draftCards as DraftCard[]) || [];
  const targetCards = deck.cardCount || 10;
  const readinessText = buildReadinessFromAnchors(anchors.length, targetCards);
  const isReady = metadata?.isReady || anchors.length >= targetCards * 0.7;

  const response: ConversationHistoryResponse = {
    messages: conversationHistory.map((m) => ({
      id: m.id,
      deckId: m.deckId,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      createdAt: m.createdAt,
    })),
    readiness: {
      anchorsFound: anchors.length,
      targetCards,
      isReady,
      readinessText,
    },
    draftCards,
    conversationSummary: metadata?.conversationSummary || null,
  };

  return NextResponse.json<ApiResponse<ConversationHistoryResponse>>(
    { success: true, data: response },
    { status: 200 }
  );
}
