import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Layers, Play, ScrollText, Users } from "lucide-react";
import type { Deck } from "@/types";

interface DeckCardProps {
  deck: Deck;
  resumeHref?: string;
  isAdopted?: boolean;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  generating: "secondary",
  completed: "default",
};

export function DeckCard({ deck, resumeHref, isAdopted }: DeckCardProps) {
  const isDraft = deck.status === "draft";
  const href = resumeHref ?? `/decks/${deck.id}`;

  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition-all hover:border-[#c9a94e]/30 hover:shadow-lg hover:shadow-[#c9a94e]/5"
    >
      {/* Cover Image — tarot proportions */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
        {deck.coverImageUrl ? (
          <img
            src={deck.coverImageUrl}
            alt={deck.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Layers className="h-10 w-10 text-[#c9a94e]/30" />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Draft hover overlay */}
        {isDraft && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-8 w-8 text-[#c9a94e] mb-1" />
            <span className="text-sm font-medium text-[#c9a94e]">Resume Journey</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-1 text-white/90">
            {deck.title}
          </h3>
          {isAdopted ? (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              <Users className="h-3 w-3 mr-0.5" />
              Community
            </Badge>
          ) : deck.deckType === "chronicle" ? (
            <Badge variant="outline" className="text-[10px] shrink-0 border-[#c9a94e]/50 text-[#c9a94e]">
              <ScrollText className="h-3 w-3 mr-0.5" />
              Chronicle
            </Badge>
          ) : isDraft ? (
            <Badge variant="outline" className="text-[10px] shrink-0 border-[#c9a94e]/50 text-[#c9a94e]">
              in progress
            </Badge>
          ) : (
            <Badge variant={statusVariant[deck.status] ?? "outline"} className="text-[10px] shrink-0">
              {deck.status}
            </Badge>
          )}
        </div>
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
