"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_USER, MOCK_STATS } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

export function UserProfile({ className }: ContentViewProps) {
  const creditsPct = Math.round(
    (MOCK_STATS.creditsUsed / MOCK_STATS.creditsTotal) * 100
  );
  const readingsPct = Math.round((MOCK_STATS.totalReadings / 50) * 100); // 50 = pro cap for visual

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-4 w-full max-w-[90%]">
        {/* Avatar circle with initials */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0"
          style={{
            background: "linear-gradient(135deg, #3d2a6b, #1a1040)",
            border: `2px solid ${MT.goldDim}`,
            boxShadow: `0 0 16px ${MT.goldDim}`,
            color: MT.gold,
          }}
        >
          LS
        </div>

        {/* Name + plan */}
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-sm font-semibold"
            style={{ color: MT.text }}
          >
            {MOCK_USER.name}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(201,169,78,0.12)",
              border: `1px solid ${MT.goldDim}`,
              color: MT.gold,
            }}
          >
            {MOCK_USER.plan} plan
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ background: MT.border }}
        />

        {/* Stats bars */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Credits bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <p
                className="text-xs font-medium"
                style={{ color: MT.textMuted }}
              >
                Credits
              </p>
              <p
                className="text-xs"
                style={{ color: MT.textDim }}
              >
                {MOCK_STATS.creditsUsed}/{MOCK_STATS.creditsTotal}
              </p>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${creditsPct}%`,
                  background: `linear-gradient(to right, ${MT.gold}, rgba(201,169,78,0.6))`,
                }}
              />
            </div>
          </div>

          {/* Readings bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <p
                className="text-xs font-medium"
                style={{ color: MT.textMuted }}
              >
                Readings
              </p>
              <p
                className="text-xs"
                style={{ color: MT.textDim }}
              >
                {MOCK_STATS.totalReadings} total
              </p>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${readingsPct}%`,
                  background: `linear-gradient(to right, #7c3aed, rgba(124,58,237,0.5))`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Mini stats row */}
        <div
          className="w-full grid grid-cols-3 gap-1 mt-1"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${MT.border}`,
            borderRadius: "6px",
            padding: "6px 4px",
          }}
        >
          {[
            { label: "Decks", value: MOCK_STATS.totalDecks },
            { label: "Cards", value: MOCK_STATS.totalCards },
            { label: "Readings", value: MOCK_STATS.totalReadings },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <p
                className="text-sm font-bold"
                style={{ color: MT.gold }}
              >
                {value}
              </p>
              <p
                className="text-xs"
                style={{ color: MT.textDim }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
