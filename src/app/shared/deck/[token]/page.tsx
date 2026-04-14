import { getSharedDeckByToken } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import { AdoptDeckButton } from "@/components/shared/adopt-deck-button";
import { SharedDeckCardGrid } from "@/components/shared/shared-deck-card-grid";
import type { Metadata } from "next";
import type { CardDetailData, CardImageStatus, CardType } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const deck = await getSharedDeckByToken(token);

  if (!deck) {
    return { title: "Deck Not Found" };
  }

  return {
    title: `${deck.title} - MysTech`,
    description:
      deck.description ?? `An oracle card deck with ${deck.cardCount} cards`,
    openGraph: {
      title: `${deck.title} - MysTech`,
      description:
        deck.description ?? `An oracle card deck with ${deck.cardCount} cards`,
      ...(deck.coverImageUrl ? { images: [deck.coverImageUrl] } : {}),
    },
  };
}

export default async function SharedDeckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const deck = await getSharedDeckByToken(token);

  if (!deck) notFound();

  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  const cards: CardDetailData[] = deck.cards.map((c) => ({
    id: c.id,
    title: c.title,
    meaning: c.meaning,
    guidance: c.guidance,
    imageUrl: c.imageUrl,
    imageStatus: c.imageStatus as CardImageStatus,
    cardType: (c.cardType ?? 'general') as CardType,
    originContext: c.originContext ?? null,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">{deck.title}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <span>
                {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
              </span>
              {deck.artStyleName && (
                <>
                  <span>&middot;</span>
                  <span>{deck.artStyleName}</span>
                </>
              )}
            </div>
          </div>
          <AdoptDeckButton deckId={deck.id} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      {/* Card gallery */}
      <SharedDeckCardGrid cards={cards} />
    </div>
  );
}
