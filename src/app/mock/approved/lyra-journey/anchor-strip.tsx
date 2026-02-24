"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Anchor } from "./lyra-v4-data";
import { ANCHOR_CHIP_COLORS, DEFAULT_CHIP_COLOR, SPRINGS } from "./lyra-v4-theme";

interface AnchorStripProps {
  anchors: Anchor[];
  maxSlots?: number;
  readinessPercent: number;
  highlightedAnchorId: string | null;
  onAnchorTap: (anchorId: string) => void;
  className?: string;
}

export function AnchorStrip({
  anchors,
  maxSlots = 6,
  readinessPercent,
  highlightedAnchorId,
  onAnchorTap,
  className,
}: AnchorStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest anchor chip
  useEffect(() => {
    if (scrollRef.current && anchors.length > 0) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [anchors.length]);

  const ghostSlots = Math.max(0, maxSlots - anchors.length);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Readiness meter */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[9px] uppercase tracking-widest text-white/25 shrink-0">
          Anchors
        </span>
        <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-500/50"
            initial={{ width: 0 }}
            animate={{ width: `${readinessPercent}%` }}
            transition={SPRINGS.gentle}
          />
        </div>
        <span className="text-[9px] text-amber-300/40 tabular-nums shrink-0">
          {anchors.length}/{maxSlots}
        </span>
      </div>

      {/* Scrollable chip row */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1 px-1"
      >
        <AnimatePresence mode="popLayout">
          {anchors.map((anchor) => {
            const colors = ANCHOR_CHIP_COLORS[anchor.theme] ?? DEFAULT_CHIP_COLOR;
            const isHighlighted = highlightedAnchorId === anchor.id;

            return (
              <motion.button
                key={anchor.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={SPRINGS.burst}
                onClick={() => onAnchorTap(anchor.id)}
                className={cn(
                  "snap-start shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-full",
                  "touch-manipulation transition-shadow duration-200",
                  isHighlighted && "ring-1 ring-white/20"
                )}
                style={{
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: isHighlighted ? colors.dot : colors.border,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: colors.dot }}
                />
                <span
                  className="text-xs whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  {anchor.name}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Ghost chips for remaining slots */}
        {Array.from({ length: ghostSlots }).map((_, i) => (
          <div
            key={`ghost-${i}`}
            className="snap-start shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-full border border-dashed border-white/8"
          >
            <span className="w-2 h-2 rounded-full bg-white/5 shrink-0" />
            <span className="text-xs text-white/10 whitespace-nowrap">...</span>
          </div>
        ))}
      </div>
    </div>
  );
}
