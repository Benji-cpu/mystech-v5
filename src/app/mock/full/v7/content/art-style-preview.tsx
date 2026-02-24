"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const style = MOCK_ART_STYLES[0]; // Tarot Classic

export function ArtStylePreview({ className }: ContentViewProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-4 w-full max-w-[90%]">
        {/* Gradient header band */}
        <div
          className="w-full rounded-lg flex flex-col items-center justify-center gap-1 shrink-0"
          style={{
            background: `linear-gradient(135deg, #78350f, #b45309, #92400e)`,
            border: `1px solid ${MT.goldDim}`,
            padding: "12px 8px",
            boxShadow: `0 4px 20px rgba(180,83,9,0.3)`,
          }}
        >
          {/* Icon placeholder — crown shape */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={MT.gold}
            strokeWidth="1.5"
          >
            <path d="M2 20h20M5 20V10l7-7 7 7v10" />
            <path d="M9 20v-5h6v5" />
          </svg>
          <p
            className="text-sm font-bold tracking-wide text-center"
            style={{ color: MT.gold }}
          >
            {style.name}
          </p>
          <p
            className="text-xs text-center leading-relaxed"
            style={{ color: "rgba(201,169,78,0.7)" }}
          >
            {style.description.slice(0, 50)}
          </p>
        </div>

        {/* 2x2 image grid */}
        <div className="grid grid-cols-2 gap-1.5 w-full">
          {style.sampleImages.map((imgUrl, i) => (
            <div
              key={i}
              className="relative rounded overflow-hidden"
              style={{
                aspectRatio: "2/3",
                border: `1px solid ${MT.border}`,
              }}
            >
              <img
                src={imgUrl}
                alt={`${style.name} sample ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Subtle gold tint */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,169,78,0.06) 0%, transparent 60%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
