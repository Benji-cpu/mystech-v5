"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_STATS } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const creditsPct = Math.round(
  (MOCK_STATS.creditsUsed / MOCK_STATS.creditsTotal) * 100
);

export function StatsDashboard({ className }: ContentViewProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-4 w-full max-w-[92%]">
        {/* Header */}
        <p
          className="text-xs tracking-widest uppercase font-semibold"
          style={{ color: MT.gold }}
        >
          Your Stats
        </p>

        {/* Large number stat cards — 3 column grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            { label: "Decks", value: MOCK_STATS.totalDecks, accent: MT.gold },
            { label: "Cards", value: MOCK_STATS.totalCards, accent: "#7c3aed" },
            {
              label: "Readings",
              value: MOCK_STATS.totalReadings,
              accent: MT.silver,
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${MT.border}`,
                padding: "10px 4px",
              }}
            >
              <p
                className="text-xl font-bold leading-none"
                style={{ color: accent }}
              >
                {value}
              </p>
              <p
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: MT.textDim }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: MT.border }} />

        {/* Credits progress section */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold" style={{ color: MT.textMuted }}>
              Image Credits
            </p>
            <p className="text-xs" style={{ color: MT.textDim }}>
              {MOCK_STATS.creditsUsed} / {MOCK_STATS.creditsTotal}
            </p>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-2 rounded-full overflow-hidden relative"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${creditsPct}%`,
                background: `linear-gradient(to right, ${MT.gold}, rgba(201,169,78,0.5))`,
                boxShadow: `0 0 8px ${MT.goldDim}`,
              }}
            />
          </div>

          <p className="text-[11px]" style={{ color: MT.textDim }}>
            {creditsPct}% used &mdash; {MOCK_STATS.creditsTotal - MOCK_STATS.creditsUsed} remaining
          </p>
        </div>

        {/* Plan badge */}
        <div
          className="w-full flex items-center justify-between rounded px-3 py-2"
          style={{
            background: "rgba(201,169,78,0.06)",
            border: `1px solid ${MT.goldDim}`,
          }}
        >
          <p className="text-xs font-medium" style={{ color: MT.textMuted }}>
            Current Plan
          </p>
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(201,169,78,0.15)",
              color: MT.gold,
            }}
          >
            {MOCK_STATS.plan}
          </span>
        </div>
      </div>
    </div>
  );
}
