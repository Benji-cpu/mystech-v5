import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getConversationForDeck, getDeckMetadata } from "@/lib/db/queries";
import type { ApiResponse, ConversationMessage, JourneyReadinessState, Anchor } from "@/types";
import { buildReadinessFromAnchors } from "@/lib/ai/prompts/conversation";

type Params = { params: Promise<{ deckId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  const [conversationRows, metadata] = await Promise.all([
    getConversationForDeck(deckId),
    getDeckMetadata(deckId),
  ]);

  const messages: ConversationMessage[] = conversationRows.map((row) => ({
    id: row.id,
    deckId: row.deckId,
    role: row.role as ConversationMessage["role"],
    content: row.content,
    createdAt: row.createdAt,
  }));

  const anchors = (metadata?.extractedAnchors as Anchor[]) || [];
  const targetCards = deck.cardCount || 10;
  const isReady = metadata?.isReady ?? false;

  const readiness: JourneyReadinessState = {
    anchorsFound: anchors.length,
    targetCards,
    isReady,
    readinessText: buildReadinessFromAnchors(anchors.length, targetCards),
  };

  return NextResponse.json<
    ApiResponse<{ messages: ConversationMessage[]; readiness: JourneyReadinessState }>
  >({
    success: true,
    data: { messages, readiness },
  });
}
