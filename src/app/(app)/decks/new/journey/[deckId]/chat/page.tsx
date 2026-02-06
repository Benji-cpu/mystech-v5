import { db } from "@/lib/db";
import { decks, deckMetadata } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { ConversationInterface } from "@/components/decks/conversation-interface";
import type { DraftCard, Anchor } from "@/types";

interface ChatPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const user = await requireAuth();
  const { deckId } = await params;

  // Get deck with ownership check
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id!)))
    .limit(1);

  if (!deck) {
    notFound();
  }

  // If deck is completed, redirect to view
  if (deck.status === "completed" || deck.status === "generating") {
    redirect(`/decks/${deckId}`);
  }

  // Get metadata
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId))
    .limit(1);

  const draftCards = (metadata?.draftCards as DraftCard[]) || [];
  const anchors = (metadata?.extractedAnchors as Anchor[]) || [];
  const isReady = metadata?.isReady || false;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ConversationInterface
        deckId={deckId}
        deckTitle={deck.title}
        deckTheme={deck.theme || ""}
        targetCardCount={deck.cardCount || 10}
        artStyleId={deck.artStyleId || undefined}
        initialDraftCards={draftCards}
        initialAnchorsCount={anchors.length}
        initialIsReady={isReady}
      />
    </div>
  );
}
