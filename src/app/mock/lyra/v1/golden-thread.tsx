"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LYRA, SPRING_GENTLE } from "./lyra-v1-theme";

// ── Types ───────────────────────────────────────────────────────────

interface StarToStarThread {
  id: string;
  type: "star_to_star";
  /** SVG viewBox coords (200x100) */
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface StarToDomThread {
  id: string;
  type: "star_to_dom";
  /** SVG viewBox coords (200x100) */
  fromX: number;
  fromY: number;
  /** Pixel position of the DOM target */
  toPixelX: number;
  toPixelY: number;
}

export type GoldenThreadTarget = StarToStarThread | StarToDomThread;

interface GoldenThreadProps {
  threads: GoldenThreadTarget[];
  containerWidth: number;
  containerHeight: number;
}

// ── Component ───────────────────────────────────────────────────────

function GoldenThreadInner({ threads, containerWidth, containerHeight }: GoldenThreadProps) {
  return (
    <svg
      viewBox="0 0 200 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
      style={{ zIndex: 25 }}
    >
      <defs>
        <linearGradient id="gt-grad-v1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={LYRA.gold} stopOpacity="0.8" />
          <stop offset="50%" stopColor={LYRA.goldLight} stopOpacity="1" />
          <stop offset="100%" stopColor={LYRA.gold} stopOpacity="0.3" />
        </linearGradient>
        <filter id="gt-glow-v1">
          <feGaussianBlur stdDeviation="0.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence>
        {threads.map((thread) => {
          let toVbX: number;
          let toVbY: number;

          if (thread.type === "star_to_star") {
            toVbX = thread.toX;
            toVbY = thread.toY;
          } else {
            // Convert pixel to viewBox coords
            toVbX = containerWidth > 0 ? (thread.toPixelX / containerWidth) * 200 : 100;
            toVbY = containerHeight > 0 ? (thread.toPixelY / containerHeight) * 100 : 50;
          }

          const midX = (thread.fromX + toVbX) / 2;
          const midY = Math.min(thread.fromY, toVbY) - 8;
          const d = `M ${thread.fromX} ${thread.fromY} Q ${midX} ${midY} ${toVbX} ${toVbY}`;

          return (
            <motion.path
              key={thread.id}
              d={d}
              stroke="url(#gt-grad-v1)"
              strokeWidth="0.35"
              fill="none"
              filter="url(#gt-glow-v1)"
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

export const GoldenThread = memo(GoldenThreadInner);
