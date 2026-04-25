import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Layers, Play, ScrollText, Users } from "lucide-react";
import type { Deck } from "@/types";

interface DeckCardProps {
  deck: Deck;
  resumeHref?: string;
  isAdopted?: boolean;
}

export function DeckCard({ deck, resumeHref, isAdopted }: DeckCardProps) {
  const isDraft = deck.status === "draft";
  const href = resumeHref ?? `/decks/${deck.id}`;

  // Badge logic — no badge for completed standard decks
  const badgeContent = isAdopted ? (
    <Badge variant="secondary" className="text-[10px] bg-black/50 backdrop-blur-sm">
      <Users className="h-3 w-3 mr-0.5" />
      Community
    </Badge>
  ) : deck.deckType === "chronicle" ? (
    <Badge variant="outline" className="text-[10px] border-gold/50 text-gold bg-black/50 backdrop-blur-sm">
      <ScrollText className="h-3 w-3 mr-0.5" />
      Chronicle
    </Badge>
  ) : isDraft ? (
    <Badge variant="outline" className="text-[10px] border-gold/50 text-gold bg-black/50 backdrop-blur-sm">
      in progress
    </Badge>
  ) : deck.status === "generating" ? (
    <Badge variant="secondary" className="text-[10px] bg-black/50 backdrop-blur-sm">
      generating
    </Badge>
  ) : null;

  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] overflow-hidden transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
    >
      {/* Cover Image — tarot proportions */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, var(--paper-card), var(--paper-warm))",
        }}
      >
        {deck.coverImageUrl ? (
          <Image
            src={deck.coverImageUrl}
            alt={deck.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Layers className="h-10 w-10 text-gold/30" />
          </div>
        )}

        {/* Badge overlay — top right */}
        {badgeContent && (
          <div className="absolute top-2 right-2 z-10">
            {badgeContent}
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Draft hover overlay */}
        {isDraft && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-8 w-8 text-gold mb-1" />
            <span className="text-sm font-medium text-gold">Resume Journey</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-white/90">
          {deck.title}
        </h3>
        <p className="mt-1 text-xs text-white/40">
          {isDraft
            ? "Continue creating your deck"
            : deck.deckType === "chronicle"
              ? `${deck.cardCount} card${deck.cardCount !== 1 ? "s" : ""} and growing`
              : `${deck.cardCount} card${deck.cardCount !== 1 ? "s" : ""}`}
        </p>
      </div>
    </Link>
  );
}
