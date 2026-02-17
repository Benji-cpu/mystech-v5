"use client";

import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import Link from "next/link";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { LYRA_READING_FLOW } from "@/components/guide/lyra-constants";
import type { Deck } from "@/types";

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onSelect: (deckId: string) => void;
}

export function DeckSelector({
  decks,
  selectedDeckId,
  onSelect,
}: DeckSelectorProps) {
  if (decks.length === 0) {
    return (
      <LyraEmptyState
        message={LYRA_READING_FLOW.deckSelector.emptyMessage}
        actionLabel={LYRA_READING_FLOW.deckSelector.emptyAction}
        actionHref="/decks/new"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LyraSigil size="sm" state="attentive" />
        <h2 className="text-lg font-semibold">{LYRA_READING_FLOW.deckSelector.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {LYRA_READING_FLOW.deckSelector.subtitle}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => onSelect(deck.id)}
            className={cn(
              "relative rounded-xl p-3 text-left transition-all border",
              "hover:border-primary/50 hover:bg-accent/50",
              selectedDeckId === deck.id
                ? "border-primary bg-accent shadow-[0_0_20px_rgba(201,169,78,0.15)]"
                : "border-border/50 bg-card/50"
            )}
          >
            {/* Cover image or gradient */}
            <div className="aspect-[3/2] rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-[#1a0530] to-[#0a0118]">
              {deck.coverImageUrl ? (
                <img
                  src={deck.coverImageUrl}
                  alt={deck.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layers className="h-8 w-8 text-primary/30" />
                </div>
              )}
            </div>

            <p className="font-medium text-sm truncate">{deck.title}</p>
            <p className="text-xs text-muted-foreground">
              {deck.cardCount} cards
            </p>

            {/* Selection indicator */}
            {selectedDeckId === deck.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
