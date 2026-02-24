"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ELEMENT_STYLES, ANCHOR_THEME_COLORS } from "./lyra-v4-data";
import type { ZodiacConstellation as ZodiacSign, ZodiacElement, Anchor } from "./lyra-v4-data";
import { SPRINGS } from "./lyra-v4-theme";

interface ZodiacConstellationProps {
  sign: ZodiacSign;
  anchors: Anchor[];
  highlightedAnchorId: string | null;
  compact?: boolean;
  className?: string;
}

export function ZodiacConstellation({
  sign,
  anchors,
  highlightedAnchorId,
  compact = false,
  className,
}: ZodiacConstellationProps) {
  const element = ELEMENT_STYLES[sign.element];
  const lineAnimProps = getLineAnimation(sign.element);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        {/* Layer 1: Background haze */}
        <defs>
          <radialGradient id={`haze-${sign.id}`} cx="50%" cy="45%" r="45%">
            <stop offset="0%" stopColor={element.haloColor} stopOpacity={compact ? 0.04 : 0.08} />
            <stop offset="100%" stopColor={element.haloColor} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={50} cy={45} r={45} fill={`url(#haze-${sign.id})`} />

        {/* Layer 2: Ghost stars (anchor birth positions) */}
        {!compact &&
          sign.ghostStarPositions.map((gs, i) => {
            const isBorn = anchors.some((a) => a.ghostStarIndex === i);
            if (isBorn) return null;
            return (
              <motion.circle
                key={`ghost-${i}`}
                cx={gs.x * 100}
                cy={gs.y * 100}
                r={1.5}
                fill="#c9a94e"
                animate={{ opacity: [0.04, 0.10, 0.04] }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            );
          })}

        {/* Layer 3: Constellation lines */}
        {sign.lines.map(([from, to], i) => {
          const s1 = sign.stars[from];
          const s2 = sign.stars[to];
          return (
            <motion.line
              key={`line-${i}`}
              x1={s1.x * 100}
              y1={s1.y * 100}
              x2={s2.x * 100}
              y2={s2.y * 100}
              stroke={element.haloColor}
              strokeWidth={compact ? 0.5 : 0.8}
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: 1,
                ...lineAnimProps,
              }}
              transition={{
                pathLength: {
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: i * 0.12,
                },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          );
        })}

        {/* Layer 4: Zodiac stars with halos */}
        {sign.stars.map((star, i) => {
          const coreR = compact
            ? star.brightness > 0.7 ? 2 : 1.5
            : star.brightness > 0.7 ? 3.5 : 2.5;
          const haloR = compact
            ? star.brightness > 0.7 ? 4 : 3
            : star.brightness > 0.7 ? 8 : 5;

          return (
            <motion.g key={`star-${i}`}>
              {/* Outer halo (element-colored) */}
              {!compact && (
                <motion.circle
                  cx={star.x * 100}
                  cy={star.y * 100}
                  r={haloR}
                  fill={element.haloGlow}
                  animate={{
                    opacity: [0.08, 0.20, 0.08],
                    r: [haloR, haloR + 1.5, haloR],
                  }}
                  transition={{
                    duration: 3 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              {/* Gold core */}
              <motion.circle
                cx={star.x * 100}
                cy={star.y * 100}
                r={coreR}
                fill="#c9a94e"
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  scale: SPRINGS.snappy,
                  opacity: {
                    duration: 2.5 + i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
            </motion.g>
          );
        })}

        {/* Layer 5: Born anchor stars */}
        {anchors.map((anchor) => {
          const ghostPos = sign.ghostStarPositions[anchor.ghostStarIndex];
          if (!ghostPos) return null;
          const color = ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e";
          const isHighlighted = highlightedAnchorId === anchor.id;
          const r = compact ? 2 : isHighlighted ? 4 : 3;

          return (
            <motion.g key={anchor.id}>
              {/* Glow ring */}
              <motion.circle
                cx={ghostPos.x * 100}
                cy={ghostPos.y * 100}
                r={r + (compact ? 2 : 4)}
                fill="none"
                stroke={color}
                strokeWidth={0.5}
                animate={{
                  opacity: isHighlighted ? [0.3, 0.6, 0.3] : [0.05, 0.15, 0.05],
                  r: isHighlighted
                    ? [r + 4, r + 6, r + 4]
                    : [r + 3, r + 4, r + 3],
                }}
                transition={{
                  duration: isHighlighted ? 1.2 : 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Core */}
              <motion.circle
                cx={ghostPos.x * 100}
                cy={ghostPos.y * 100}
                r={r}
                fill={color}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: isHighlighted ? 1 : 0.85,
                }}
                transition={SPRINGS.burst}
              />
            </motion.g>
          );
        })}

        {/* Layer 6: Zodiac name label */}
        {!compact && (
          <motion.text
            x={50}
            y={94}
            textAnchor="middle"
            fill="rgba(201, 169, 78, 0.45)"
            fontSize={5}
            fontFamily="serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 0.5 }}
          >
            {sign.name} {sign.symbol}
          </motion.text>
        )}
      </svg>
    </div>
  );
}

// ── Element-specific line animation ──────────────────────────────────────

function getLineAnimation(element: ZodiacElement) {
  switch (element) {
    case "fire":
      return { opacity: [0.3, 0.6, 0.2, 0.5, 0.3] }; // flicker
    case "earth":
      return { opacity: [0.35, 0.45, 0.35] }; // solid, subtle
    case "air":
      return { opacity: [0.2, 0.4, 0.25, 0.45, 0.2] }; // wavy shimmer
    case "water":
      return { opacity: [0.25, 0.5, 0.3, 0.5, 0.25] }; // flowing pulse
  }
}
