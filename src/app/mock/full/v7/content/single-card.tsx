"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const card = MOCK_DECKS[0].cards[0];

export function SingleCard({ className }: ContentViewProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-2 p-4 w-full max-w-[85%]">
        {/* Card image */}
        <div
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{
            width: "52%",
            aspectRatio: "2/3",
            border: `1px solid ${MT.border}`,
            boxShadow: `0 0 20px ${MT.goldDim}`,
          }}
        >
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
          />
          {/* Gold overlay shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,169,78,0.08) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* Title */}
        <p
          className="text-sm font-semibold tracking-widest uppercase text-center mt-1"
          style={{ color: MT.gold }}
        >
          {card.title}
        </p>

        {/* Divider */}
        <div
          className="w-8 h-px"
          style={{ background: MT.goldDim }}
        />

        {/* Meaning */}
        <p
          className="text-xs text-center leading-relaxed px-1"
          style={{ color: MT.textMuted }}
        >
          {card.meaning}
        </p>
      </div>
    </div>
  );
}
