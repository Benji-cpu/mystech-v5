"use client";

import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { PLAN_LIMITS, SPREAD_POSITIONS } from "@/lib/constants";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_READING_FLOW } from "@/components/guide/lyra-constants";
import type { PlanType, SpreadType } from "@/types";

interface SpreadSelectorProps {
  selectedSpread: SpreadType | null;
  onSelect: (spread: SpreadType) => void;
  deckCardCount: number;
  userPlan?: PlanType;
  /** @deprecated Use userPlan instead */
  userRole?: string;
}

const SPREAD_OPTIONS: {
  type: SpreadType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    type: "single",
    label: "Single Card",
    description: "A single card for focused clarity",
    icon: "1",
  },
  {
    type: "three_card",
    label: "Three Card",
    description: "Past, Present, Future",
    icon: "3",
  },
  {
    type: "five_card",
    label: "Five Card Cross",
    description: "Situation, Challenge, Foundation, Past, Future",
    icon: "5",
  },
  {
    type: "celtic_cross",
    label: "Celtic Cross",
    description: "The classic 10-card deep reading",
    icon: "10",
  },
];

export function SpreadSelector({
  selectedSpread,
  onSelect,
  deckCardCount,
  userPlan,
  userRole,
}: SpreadSelectorProps) {
  // Resolve plan: prefer userPlan prop, fall back to role-based detection
  const effectivePlan: PlanType = userPlan ?? (userRole === "admin" ? "admin" : "free");
  const allowedSpreads = PLAN_LIMITS[effectivePlan].spreads as readonly string[];
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LyraSigil size="sm" state="attentive" />
        <h2 className="text-lg font-semibold">{LYRA_READING_FLOW.spreadSelector.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {LYRA_READING_FLOW.spreadSelector.subtitle}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {SPREAD_OPTIONS.map((spread) => {
          const isLocked = !allowedSpreads.includes(spread.type);
          const positions = SPREAD_POSITIONS[spread.type];
          const tooFewCards = deckCardCount < positions.length;

          return (
            <button
              key={spread.type}
              onClick={() => !isLocked && !tooFewCards && onSelect(spread.type)}
              disabled={isLocked || tooFewCards}
              className={cn(
                "relative rounded-xl p-4 text-left transition-all border",
                isLocked || tooFewCards
                  ? "border-border/30 bg-card/30 opacity-50 cursor-not-allowed"
                  : "hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
                selectedSpread === spread.type
                  ? "border-primary bg-accent shadow-[0_0_20px_rgba(201,169,78,0.15)]"
                  : !isLocked && !tooFewCards
                    ? "border-border/50 bg-card/50"
                    : ""
              )}
            >
              {/* Card count badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary/80">
                  {spread.icon}
                </span>
                {isLocked && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />
                    Pro
                  </span>
                )}
              </div>

              <p className="font-medium text-sm">{spread.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {spread.description}
              </p>

              {tooFewCards && !isLocked && (
                <p className="text-xs text-destructive mt-1">
                  Needs {positions.length} cards (deck has {deckCardCount})
                </p>
              )}

              {/* Selection indicator */}
              {selectedSpread === spread.type && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
