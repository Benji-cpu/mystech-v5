"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { getAllCards } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const POSITIONS = ["Past", "Present", "Future"] as const;

export function CardSpread({ className }: ContentViewProps) {
  const allCards = getAllCards();
  const spreadCards = allCards.slice(0, 3);

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-3 w-full">
        {/* Label */}
        <p
          className="text-xs tracking-widest uppercase font-semibold"
          style={{ color: MT.gold }}
        >
          Three Card Spread
        </p>

        {/* Cards row */}
        <div className="flex items-end justify-center gap-1 w-full">
          {spreadCards.map((card, i) => {
            const isCenter = i === 1;
            return (
              <div
                key={card.id}
                className="flex flex-col items-center gap-1.5"
                style={{
                  // Middle card raised slightly
                  transform: isCenter ? "translateY(-8px)" : "translateY(0)",
                  flex: "0 0 auto",
                  width: "28%",
                }}
              >
                {/* Position label */}
                <p
                  className="text-[11px] font-semibold tracking-wider uppercase"
                  style={{ color: isCenter ? MT.gold : MT.textDim }}
                >
                  {POSITIONS[i]}
                </p>

                {/* Card image */}
                <div
                  className="relative rounded overflow-hidden w-full"
                  style={{
                    aspectRatio: "2/3",
                    border: `1px solid ${isCenter ? MT.goldDim : MT.border}`,
                    boxShadow: isCenter
                      ? `0 0 16px ${MT.goldDim}, 0 4px 16px rgba(0,0,0,0.5)`
                      : `0 2px 8px rgba(0,0,0,0.4)`,
                    // Slight overlap via negative margin
                    marginLeft: i === 2 ? "-4px" : undefined,
                    marginRight: i === 0 ? "-4px" : undefined,
                    zIndex: isCenter ? 10 : i === 0 ? 5 : 5,
                    position: "relative",
                  }}
                >
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  {isCenter && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(201,169,78,0.1) 0%, transparent 60%)",
                      }}
                    />
                  )}
                </div>

                {/* Card name */}
                <p
                  className="text-[10px] text-center font-medium leading-tight"
                  style={{ color: MT.textMuted }}
                >
                  {card.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Thin gold divider */}
        <div
          className="w-12 h-px mt-1"
          style={{ background: MT.goldDim }}
        />

        {/* Guidance snippet from center card */}
        <p
          className="text-xs text-center leading-relaxed px-3"
          style={{ color: MT.textDim }}
        >
          {spreadCards[1]?.meaning.split(",")[0]}
        </p>
      </div>
    </div>
  );
}
