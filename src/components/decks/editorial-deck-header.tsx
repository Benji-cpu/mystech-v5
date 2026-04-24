import Link from "next/link";
import { ArrowLeft, Pencil, Palette, Play } from "lucide-react";
import { DeleteDeckButton } from "./delete-deck-button";
import { ShareButton } from "@/components/shared/share-button";
import { AdoptDeckButton } from "@/components/shared/adopt-deck-button";
import type { Deck } from "@/types";

interface EditorialDeckHeaderProps {
  deck: Deck;
  artStyleName?: string;
  artStyleId?: string | null;
  shareToken?: string | null;
  isAdopter?: boolean;
  ownerName?: string | null;
}

export function EditorialDeckHeader({
  deck,
  artStyleName,
  artStyleId,
  shareToken,
  isAdopter,
  ownerName,
}: EditorialDeckHeaderProps) {
  const isChronicle = deck.deckType === "chronicle";
  const cardCountLabel = isChronicle
    ? `${deck.cardCount} ${deck.cardCount === 1 ? "card" : "cards"} and growing`
    : `${deck.cardCount} ${deck.cardCount === 1 ? "card" : "cards"}`;

  return (
    <header>
      <Link
        href="/decks"
        className="eyebrow inline-flex items-center gap-2 hover:underline"
      >
        <ArrowLeft size={14} /> Decks
      </Link>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {isChronicle && <p className="eyebrow" style={{ color: "var(--accent-gold)" }}>Chronicle</p>}
          <h1
            className="display mt-2 text-[clamp(2rem,7vw,3.25rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            {deck.title}
          </h1>
          {deck.description && (
            <p
              className="whisper mt-3 max-w-xl text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {deck.description}
            </p>
          )}
          <p className="mt-3 text-sm" style={{ color: "var(--ink-mute)" }}>
            {cardCountLabel}
            {artStyleName && (
              <>
                <span className="mx-2" style={{ color: "var(--ink-faint)" }}>·</span>
                {artStyleName}
              </>
            )}
            {isAdopter && ownerName && (
              <>
                <span className="mx-2" style={{ color: "var(--ink-faint)" }}>·</span>
                by {ownerName}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {deck.status === "completed" && !isAdopter && (
            <Link
              href={`/readings/new?deckId=${deck.id}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              <Play size={14} strokeWidth={2} />
              Draw from this
            </Link>
          )}

          {isAdopter && (
            <AdoptDeckButton deckId={deck.id} isAdopted />
          )}

          {!isAdopter && deck.status === "completed" && (
            <>
              <ShareButton
                shareEndpoint={`/api/decks/${deck.id}/share`}
                revokeEndpoint={`/api/decks/${deck.id}/share`}
                contentType="deck"
                existingShareToken={shareToken}
              />
              {artStyleId && (
                <Link
                  href={`/studio/styles/${artStyleId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors hover:border-[var(--ink-soft)]"
                  style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
                >
                  <Palette size={14} />
                  <span className="hidden sm:inline">Style</span>
                </Link>
              )}
              <Link
                href={`/decks/${deck.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors hover:border-[var(--ink-soft)]"
                style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
              >
                <Pencil size={14} />
                Edit
              </Link>
              <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
            </>
          )}
        </div>
      </div>

      {deck.theme && (
        <div
          className="mt-8 border-t pt-6 hair"
        >
          <p className="eyebrow">Seed</p>
          <p
            className="whisper mt-2 text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            &ldquo;{deck.theme}&rdquo;
          </p>
        </div>
      )}
    </header>
  );
}
