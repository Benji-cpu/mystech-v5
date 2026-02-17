"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { AdoptDeckButton } from "@/components/shared/adopt-deck-button";
import type { DeckWithOwner } from "@/types";

interface PublicDeckCardProps {
  deck: DeckWithOwner;
}

export function PublicDeckCard({ deck }: PublicDeckCardProps) {
  return (
    <div className="group rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-[#c9a94e]/30 hover:shadow-lg">
      {/* Cover Image */}
      <Link href={`/decks/${deck.id}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
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
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <Link href={`/decks/${deck.id}`}>
            <h3 className="text-sm font-semibold leading-tight line-clamp-1 hover:text-[#c9a94e] transition-colors">
              {deck.title}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Creator + adopt */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {deck.ownerImage ? (
              <img
                src={deck.ownerImage}
                alt=""
                className="h-5 w-5 rounded-full shrink-0"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {deck.ownerName ?? "Unknown"}
            </span>
          </div>

          <AdoptDeckButton
            deckId={deck.id}
            isAdopted={deck.isAdopted}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
