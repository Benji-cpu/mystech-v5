"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const deck = MOCK_DECKS[1]; // Midnight Arcana

export function DeckOverview({ className }: ContentViewProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-4 w-full max-w-[85%]">
        {/* Cover image */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: "54%",
            aspectRatio: "2/3",
            border: `1px solid ${MT.border}`,
            boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 16px ${MT.goldDim}`,
          }}
        >
          <img
            src={deck.coverUrl}
            alt={deck.name}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay at bottom for text readability */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background:
                "linear-gradient(to top, rgba(10,1,24,0.9), transparent)",
            }}
          />
        </div>

        {/* Deck name */}
        <p
          className="text-sm font-bold tracking-wide text-center"
          style={{ color: MT.text }}
        >
          {deck.name}
        </p>

        {/* Badges row */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase"
            style={{
              background: "rgba(201,169,78,0.12)",
              border: `1px solid ${MT.goldDim}`,
              color: MT.gold,
            }}
          >
            {deck.cardCount} cards
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase"
            style={{
              background: "rgba(168,180,194,0.08)",
              border: `1px solid rgba(168,180,194,0.15)`,
              color: MT.silver,
            }}
          >
            {deck.artStyleId.replace("-", " ")}
          </span>
        </div>

        {/* Description snippet */}
        <p
          className="text-xs text-center leading-relaxed px-1"
          style={{ color: MT.textDim }}
        >
          {deck.description.slice(0, 70)}...
        </p>
      </div>
    </div>
  );
}
