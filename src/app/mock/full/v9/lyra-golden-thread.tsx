"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LYRA, SPRING_GENTLE } from "./lyra-journey-theme";

interface GoldenThreadTarget {
  id: string;
  /** Percentage position in SVG viewBox (0-100) */
  fromCx: number;
  fromCy: number;
  /** Pixel position relative to viewport — will be converted to viewBox % */
  toX: number;
  toY: number;
}

interface LyraGoldenThreadProps {
  threads: GoldenThreadTarget[];
  /** Container dimensions for pixel → viewBox conversion */
  containerWidth: number;
  containerHeight: number;
}

function LyraGoldenThreadInner({ threads, containerWidth, containerHeight }: LyraGoldenThreadProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full z-25 pointer-events-none"
      preserveAspectRatio="none"
      style={{ zIndex: 25 }}
    >
      <defs>
        <linearGradient id="golden-thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={LYRA.gold} stopOpacity="0.8" />
          <stop offset="50%" stopColor={LYRA.goldLight} stopOpacity="1" />
          <stop offset="100%" stopColor={LYRA.gold} stopOpacity="0.3" />
        </linearGradient>
        <filter id="thread-glow">
          <feGaussianBlur stdDeviation="0.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence>
        {threads.map((thread) => {
          // Convert pixel target to viewBox percentage
          const toCxPct = containerWidth > 0 ? (thread.toX / containerWidth) * 100 : 50;
          const toCyPct = containerHeight > 0 ? (thread.toY / containerHeight) * 100 : 50;

          // Bezier control point — arc upward between source and target
          const midX = (thread.fromCx + toCxPct) / 2;
          const midY = Math.min(thread.fromCy, toCyPct) - 8;

          const d = `M ${thread.fromCx} ${thread.fromCy} Q ${midX} ${midY} ${toCxPct} ${toCyPct}`;

          return (
            <motion.path
              key={thread.id}
              d={d}
              stroke="url(#golden-thread-grad)"
              strokeWidth="0.3"
              fill="none"
              filter="url(#thread-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={SPRING_GENTLE}
            />
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

export const LyraGoldenThread = memo(LyraGoldenThreadInner);
