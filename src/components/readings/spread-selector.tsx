"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, ChevronDown } from "lucide-react";
import { PLAN_LIMITS, SPREAD_POSITIONS } from "@/lib/constants";
import { SpreadPreviewSVG } from "./spread-preview-svg";
import { ContextualHint } from "@/components/guide/contextual-hint";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import type { PlanType, SpreadType } from "@/types";

interface SpreadSelectorProps {
  selectedSpread: SpreadType | null;
  onSelect: (spread: SpreadType) => void;
  deckCardCount: number;
  userPlan?: PlanType;
  /** @deprecated Use userPlan instead */
  userRole?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** Controlled expanded state — overrides internal state when provided */
  expanded?: boolean;
  /** Callback when header is clicked in controlled mode */
  onToggleExpanded?: () => void;
  className?: string;
}

const SPREAD_OPTIONS: {
  type: SpreadType;
  label: string;
  description: string;
  count: number;
}[] = [
  {
    type: "single",
    label: "Single Card",
    description: "A focused moment of clarity",
    count: 1,
  },
  {
    type: "three_card",
    label: "Three Card",
    description: "Past, Present, Future",
    count: 3,
  },
  {
    type: "five_card",
    label: "Five Card Cross",
    description: "Situation, Challenge, Foundation, Past, Future",
    count: 5,
  },
  {
    type: "celtic_cross",
    label: "Celtic Cross",
    description: "The classic 10-card deep reading",
    count: 10,
  },
];

export function SpreadSelector({
  selectedSpread,
  onSelect,
  deckCardCount,
  userPlan,
  userRole,
  collapsible,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onToggleExpanded,
  className,
}: SpreadSelectorProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  const handleToggle = () => {
    if (isControlled) {
      onToggleExpanded?.();
    } else {
      setInternalExpanded(!expanded);
    }
  };

  const { hasMilestone, completeMilestone, stage } = useOnboarding();

  const effectivePlan: PlanType =
    userPlan ?? (userRole === "admin" ? "admin" : "free");
  const allowedSpreads = PLAN_LIMITS[effectivePlan].spreads as readonly string[];

  const selectedLabel =
    SPREAD_OPTIONS.find((s) => s.type === selectedSpread)?.label ?? null;

  // Show spread hint at stage 2+ if not yet seen
  const showSpreadHint =
    stage >= 2 && !hasMilestone("spread_types_introduced");

  const content = (
    <>
      {showSpreadHint && (
        <ContextualHint
          message="Ready for more depth? Try a five-card spread for a richer reading."
          autoDismissMs={10000}
          onDismiss={() => completeMilestone("spread_types_introduced")}
          className="mb-3"
        />
      )}
      {/* Mobile: compact list with dot previews */}
      <div className="space-y-2 sm:hidden">
        {SPREAD_OPTIONS.map((spread, idx) => {
          const isLocked = !allowedSpreads.includes(spread.type);
          const positions = SPREAD_POSITIONS[spread.type];
          const tooFewCards = deckCardCount < positions.length;
          const isSelected = selectedSpread === spread.type;

          return (
            <motion.button
              key={spread.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: idx * 0.06,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              whileTap={!isLocked && !tooFewCards ? { scale: 0.98 } : {}}
              onClick={() => !isLocked && !tooFewCards && onSelect(spread.type)}
              disabled={isLocked || tooFewCards}
              className={cn(
                "w-full bg-white/[0.03] backdrop-blur-sm border rounded-xl p-4 flex items-center justify-between",
                isLocked || tooFewCards
                  ? "border-white/5 opacity-50 cursor-not-allowed"
                  : "border-white/10 cursor-pointer",
                isSelected && "border-primary shadow-[0_0_20px_rgba(201,169,78,0.15)]"
              )}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white/90">
                    {spread.label}
                  </h3>
                  {isLocked && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      <Lock className="h-3 w-3" />
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-xs">
                  {spread.count} {spread.count === 1 ? "card" : "cards"}
                </p>
                {tooFewCards && !isLocked && (
                  <p className="text-xs text-destructive mt-0.5">
                    Needs {positions.length} cards (have {deckCardCount})
                  </p>
                )}
              </div>
              {/* Inline dot preview */}
              <div className="flex gap-1 items-center">
                {Array.from({ length: Math.min(spread.count, 10) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-3 rounded-sm border",
                        isSelected
                          ? "bg-gold/30 border-gold/50"
                          : "bg-white/10 border-white/20"
                      )}
                    />
                  )
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Desktop: 2-col grid with SVG previews */}
      <div className="hidden sm:grid grid-cols-2 gap-4">
        {SPREAD_OPTIONS.map((spread, idx) => {
          const isLocked = !allowedSpreads.includes(spread.type);
          const positions = SPREAD_POSITIONS[spread.type];
          const tooFewCards = deckCardCount < positions.length;
          const isSelected = selectedSpread === spread.type;

          return (
            <motion.button
              key={spread.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: idx * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              whileHover={
                !isLocked && !tooFewCards
                  ? { scale: 1.02, y: -4 }
                  : {}
              }
              whileTap={!isLocked && !tooFewCards ? { scale: 0.98 } : {}}
              onClick={() => !isLocked && !tooFewCards && onSelect(spread.type)}
              disabled={isLocked || tooFewCards}
              className={cn(
                "relative bg-white/[0.03] backdrop-blur-sm border rounded-2xl p-5 text-left overflow-hidden group",
                isLocked || tooFewCards
                  ? "border-white/5 opacity-50 cursor-not-allowed"
                  : "border-white/10 cursor-pointer",
                isSelected && "border-primary shadow-[0_0_20px_rgba(201,169,78,0.15)]"
              )}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/10 group-hover:to-transparent transition-all duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white/90">
                    {spread.label}
                  </h3>
                  {isLocked && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      <Lock className="h-3 w-3" />
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm mb-2">
                  {spread.count} {spread.count === 1 ? "card" : "cards"}
                </p>
                {tooFewCards && !isLocked && (
                  <p className="text-xs text-destructive mb-2">
                    Needs {positions.length} cards (have {deckCardCount})
                  </p>
                )}
                <SpreadPreviewSVG spreadType={spread.type} />
              </div>

              {/* Selection check */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </>
  );

  if (collapsible) {
    return (
      <div className={cn(className)}>
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between py-2 px-1 text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/70">Spread</span>
            {!expanded && selectedLabel && (
              <span className="text-xs text-white/40">({selectedLabel})</span>
            )}
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="pb-2">{content}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <label className="text-sm font-medium text-white/70 mb-3 block">
        Choose your spread
      </label>
      {content}
    </div>
  );
}
