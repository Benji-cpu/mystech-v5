import { getSharedDeckByToken } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdoptDeckButton } from "@/components/shared/adopt-deck-button";
import { SharedDeckCardGrid } from "@/components/shared/shared-deck-card-grid";
import { StudioStyleBadge } from "@/components/studio/studio-style-badge";
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
    imagePrompt: null,
    imageStatus: c.imageStatus as CardImageStatus,
    cardType: (c.cardType ?? 'general') as CardType,
    originContext: c.originContext ?? null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">A shared deck</p>
          <h1
            className="display mt-3 text-[clamp(2rem,7vw,3.25rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            {deck.title}
          </h1>
          {deck.description && (
            <p
              className="whisper mt-3 max-w-2xl text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {deck.description}
            </p>
          )}
          <div
            className="mt-3 flex flex-wrap items-center gap-3 text-sm"
            style={{ color: "var(--ink-mute)" }}
          >
            <span>
              {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
            </span>
            {deck.artStyleName && (
              <>
                <span style={{ color: "var(--ink-faint)" }}>·</span>
                <StudioStyleBadge
                  styleName={deck.artStyleName}
                  styleId={deck.artStyleId}
                  linkToStudio={false}
                />
              </>
            )}
          </div>
        </div>
        <AdoptDeckButton deckId={deck.id} isLoggedIn={isLoggedIn} />
      </header>

      <SharedDeckCardGrid cards={cards} />

      {deck.artStyleName && (
        <div className="mt-12 text-center">
          <Link
            href={isLoggedIn ? "/decks/new" : "/api/auth/signin"}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors hover:border-[var(--ink)]"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            Create your own deck with this style →
          </Link>
        </div>
      )}
    </div>
  );
}
