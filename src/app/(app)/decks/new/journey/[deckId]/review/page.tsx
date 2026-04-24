import { requireAuth } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { DraftReview } from "@/components/decks/draft-review";
import type { DraftCard } from "@/types";

type Params = { params: Promise<{ deckId: string }> };

export default async function JourneyReviewPage({ params }: Params) {
  const user = await requireAuth();
  const { deckId } = await params;

  const deck = await getDeckByIdForUser(deckId, user.id!);
  if (!deck) {
    redirect("/decks/new");
  }

  const metadata = await getDeckMetadata(deckId);
  const draftCards = (metadata?.draftCards as DraftCard[]) || [];

  // If no draft cards, redirect to chat to generate them
  if (draftCards.length === 0) {
    redirect(`/decks/new/journey/${deckId}/chat`);
  }

  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-4xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <DraftReview
          deckId={deckId}
          deckTitle={deck.title}
          initialDraftCards={draftCards}
        />
      </div>
    </div>
  );
}
