"use client";

import { cn } from "@/lib/utils";
import type { Card } from "@/types";

interface CompactCardStripProps {
  cards: { card: Card; positionName: string }[];
  className?: string;
}

export function CompactCardStrip({ cards, className }: CompactCardStripProps) {
  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto px-4 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10",
        className
      )}
    >
      {cards.map(({ card, positionName }) => (
        <div
          key={card.id}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="w-12 h-16 rounded-md overflow-hidden border border-white/10 bg-white/5">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8px] text-white/30">
                {card.title.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-[9px] text-white/40 text-center max-w-[48px] truncate">
            {positionName}
          </span>
        </div>
      ))}
    </div>
  );
}
