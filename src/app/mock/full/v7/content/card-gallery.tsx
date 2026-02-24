"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const deck = MOCK_DECKS[0]; // Soul's Garden — 10 cards
const galleryCards = deck.cards.slice(0, 6); // 3x2 grid instead of 3x3

export function CardGallery({ className }: ContentViewProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-2.5 p-3 w-full max-w-[92%]">
        {/* Header */}
        <div className="flex flex-col items-center gap-0.5">
          <p
            className="text-xs tracking-widest uppercase font-semibold"
            style={{ color: MT.gold }}
          >
            {deck.name}
          </p>
          <p className="text-[11px]" style={{ color: MT.textDim }}>
            {deck.cardCount} cards
          </p>
        </div>

        {/* 3x2 grid */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {galleryCards.map((card, i) => (
            <div
              key={card.id}
              className="relative rounded overflow-hidden group"
              style={{
                aspectRatio: "2/3",
                border: `1px solid ${MT.border}`,
                transition: "border-color 0.2s",
              }}
            >
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover"
              />

              {/* Hover overlay with card name */}
              <div
                className="absolute inset-0 flex items-end justify-center pb-1"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,1,24,0.85) 0%, transparent 50%)",
                }}
              >
                <p
                  className="text-[11px] font-semibold text-center leading-tight px-0.5 truncate w-full"
                  style={{ color: MT.textMuted }}
                >
                  {card.title}
                </p>
              </div>

              {/* Card number badge */}
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(201,169,78,0.15)",
                  border: `1px solid ${MT.goldDim}`,
                }}
              >
                <span
                  className="text-[9px] font-bold"
                  style={{ color: MT.gold }}
                >
                  {i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
