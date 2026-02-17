import { getSharedDeckByToken } from "@/lib/db/queries";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { OracleCard } from "@/components/cards/oracle-card";
import { AdoptDeckButton } from "@/components/shared/adopt-deck-button";
import type { Metadata } from "next";
import type { Card, CardImageStatus } from "@/types";

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

  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{deck.title}</h1>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {deck.cards.map((c) => {
          const card: Card = {
            id: c.id,
            deckId: c.deckId,
            cardNumber: c.cardNumber,
            title: c.title,
            meaning: c.meaning,
            guidance: c.guidance,
            imageUrl: c.imageUrl,
            imagePrompt: c.imagePrompt,
            imageStatus: c.imageStatus as CardImageStatus,
            createdAt: c.createdAt,
          };

          return <OracleCard key={c.id} card={card} size="fill" />;
        })}
      </div>
    </div>
  );
}
