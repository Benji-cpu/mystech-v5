"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

export function DeckCollection({ className }: ContentViewProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-3 w-full max-w-[92%]">
        {/* Header */}
        <p
          className="text-xs tracking-widest uppercase font-semibold"
          style={{ color: MT.gold }}
        >
          My Decks
        </p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {MOCK_DECKS.map((deck) => (
            <div
              key={deck.id}
              className="flex flex-col rounded-lg overflow-hidden"
              style={{
                border: `1px solid ${MT.border}`,
                background: MT.surface,
              }}
            >
              {/* Cover image */}
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "3/2" }}
              >
                <img
                  src={deck.coverUrl}
                  alt={deck.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 40%, rgba(18,16,26,0.9) 100%)",
                  }}
                />
                {/* Card count pill */}
                <div
                  className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    border: `1px solid ${MT.border}`,
                  }}
                >
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: MT.textMuted }}
                  >
                    {deck.cardCount}
                  </span>
                </div>
              </div>

              {/* Deck name */}
              <div className="px-2 py-1.5">
                <p
                  className="text-xs font-semibold leading-tight truncate"
                  style={{ color: MT.text }}
                >
                  {deck.name}
                </p>
                <p
                  className="text-[10px] mt-0.5 truncate"
                  style={{ color: MT.textDim }}
                >
                  {deck.artStyleId.replace(/-/g, " ")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <p className="text-[11px]" style={{ color: MT.textDim }}>
          {MOCK_DECKS.length} decks &middot;{" "}
          {MOCK_DECKS.reduce((acc, d) => acc + d.cardCount, 0)} total cards
        </p>
      </div>
    </div>
  );
}
