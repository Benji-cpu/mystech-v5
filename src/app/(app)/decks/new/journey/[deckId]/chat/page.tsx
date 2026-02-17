import { requireAuth } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getConversationForDeck, getDeckMetadata } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { ConversationChat } from "@/components/decks/conversation-chat";
import { buildReadinessFromAnchors } from "@/lib/ai/prompts/conversation";
import type { ConversationMessage, JourneyReadinessState, Anchor, DraftCard } from "@/types";

type Params = { params: Promise<{ deckId: string }> };

export default async function JourneyChatPage({ params }: Params) {
  const user = await requireAuth();
  const { deckId } = await params;

  const deck = await getDeckByIdForUser(deckId, user.id!);
  if (!deck) {
    redirect("/decks/new");
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
  const draftCards = (metadata?.draftCards as DraftCard[]) || [];
  const targetCards = deck.cardCount || 10;
  const isReady = metadata?.isReady ?? false;

  const readiness: JourneyReadinessState = {
    anchorsFound: anchors.length,
    targetCards,
    isReady,
    readinessText: buildReadinessFromAnchors(anchors.length, targetCards),
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <ConversationChat
        deckId={deckId}
        deckTitle={deck.title}
        initialMessages={messages}
        initialReadiness={readiness}
        hasDraftCards={draftCards.length > 0}
      />
    </div>
  );
}
