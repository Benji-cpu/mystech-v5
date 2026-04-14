"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────

type SigilState = "idle" | "attentive" | "thinking" | "speaking" | "excited";
type LegacySigilState = "dormant";
export type SigilStateProp = SigilState | LegacySigilState;

interface LyraSigilProps {
  size?: "sm" | "md" | "lg" | "xl";
  state?: SigilStateProp;
  showLabel?: boolean;
  className?: string;
}

// ── Constants ────────────────────────────────────────────────────────────

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 80,
};

// Lyra constellation star positions (approximate, in 100x100 viewBox)
const stars = [
  { id: "vega", cx: 50, cy: 15, name: "Vega" },
  { id: "sheliak", cx: 35, cy: 45, name: "Sheliak" },
  { id: "sulafat", cx: 65, cy: 45, name: "Sulafat" },
  { id: "delta", cx: 30, cy: 75, name: "Delta Lyrae" },
  { id: "zeta", cx: 70, cy: 75, name: "Zeta Lyrae" },
];

// Constellation lines
const connections = [
  { from: "vega", to: "sheliak" },
  { from: "vega", to: "sulafat" },
  { from: "sheliak", to: "sulafat" },
  { from: "sheliak", to: "delta" },
  { from: "sulafat", to: "zeta" },
];

// Thinking state: sequential order tracing constellation shape
const thinkingOrder = ["vega", "sulafat", "zeta", "delta", "sheliak"];

// Excited state: hand-tuned non-uniform delays per star
const excitedDelays = [0, 0.4, 0.15, 0.55, 0.3];

// ── Component ────────────────────────────────────────────────────────────

export function LyraSigil({
  size = "md",
  state = "idle",
  showLabel,
  className,
}: LyraSigilProps) {
  const filterId = useId();
  const prefersReducedMotion = useReducedMotion();
  const dimension = sizeMap[size];
  const baseRadius = size === "sm" ? 4.5 : size === "md" ? 5.5 : size === "lg" ? 7 : 9;

  // Normalize legacy state
  const normalizedState: SigilState = state === "dormant" ? "idle" : state;

  const getStarAnimation = (index: number, star: (typeof stars)[0]) => {
    const baseCy = star.cy;
    const r = star.id === "vega" ? baseRadius + 1.5 : baseRadius;
    const ease = "easeInOut" as const;

    // Reduced motion: static for idle, subtle opacity-only for others
    if (prefersReducedMotion) {
      if (normalizedState === "idle") return { r, opacity: 0.8, cy: baseCy };
      return {
        opacity: [0.7, 1, 0.7],
        r,
        cy: baseCy,
        transition: { duration: 3, repeat: Infinity, ease },
      };
    }

    switch (normalizedState) {
      case "idle":
        return {
          opacity: [0.6, 0.85, 0.6],
          r,
          cy: baseCy,
          transition: { duration: 8, repeat: Infinity, ease, delay: index * 0.3 },
        };
      case "attentive":
        return {
          cy: [baseCy, baseCy - 3, baseCy],
          r: [r, r * 1.08, r],
          opacity: [0.8, 1, 0.8],
          transition: { duration: 4, repeat: Infinity, ease, delay: index * 0.2 },
        };
      case "thinking": {
        const sequenceIndex = thinkingOrder.indexOf(star.id);
        const delay = sequenceIndex >= 0 ? sequenceIndex * 0.5 : index * 0.5;
        return {
          r: [r, r * 1.4, r],
          opacity: [0.5, 1, 0.5],
          cy: baseCy,
          transition: { duration: 2.5, repeat: Infinity, ease, delay },
        };
      }
      case "speaking":
        return {
          r: [r, r * 1.5, r],
          opacity: [0.8, 1, 0.8],
          cy: baseCy,
          transition: { duration: 1.5, repeat: Infinity, ease, delay: index * 0.15 },
        };
      case "excited":
        return {
          r: [r, r * 1.6, r],
          opacity: [0.7, 1, 0.7],
          cy: baseCy,
          transition: { duration: 1.0, repeat: Infinity, ease, delay: excitedDelays[index] },
        };
      default:
        return { r, opacity: 0.8, cy: baseCy };
    }
  };

  const getLineAnimation = () => {
    if (prefersReducedMotion) return {};

    switch (normalizedState) {
      case "speaking":
      case "excited":
        return {
          strokeOpacity: [0.3, 0.7, 0.3],
          strokeWidth: [1.5, 2.5, 1.5],
          transition: {
            duration: normalizedState === "excited" ? 1.0 : 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };
      case "thinking":
        return {
          strokeOpacity: [0.2, 0.55, 0.2],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
        };
      default:
        return {};
    }
  };

  const getOpacity = () => {
    switch (normalizedState) {
      case "idle":
        return 0.8;
      case "attentive":
        return 0.9;
      case "thinking":
        return 0.95;
      case "speaking":
      case "excited":
        return 1.0;
      default:
        return 0.8;
    }
  };

  const getStarById = (id: string) => stars.find((s) => s.id === id);
  const glowId = `star-glow-${filterId}`;
  const lineAnim = getLineAnimation();

  const sigil = (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        !showLabel && className
      )}
      style={{ opacity: getOpacity() }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Lyra constellation sigil"
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Constellation lines */}
        {connections.map((conn, index) => {
          const fromStar = getStarById(conn.from);
          const toStar = getStarById(conn.to);
          if (!fromStar || !toStar) return null;

          return (
            <motion.line
              key={`line-${index}`}
              x1={fromStar.cx}
              y1={fromStar.cy}
              x2={toStar.cx}
              y2={toStar.cy}
              stroke="rgba(201,169,78,0.55)"
              initial={{ strokeWidth: 1.5, strokeOpacity: 0.55 }}
              animate={lineAnim}
            />
          );
        })}

        {/* Stars — gold body with glow, white hot core */}
        {stars.map((star, index) => {
          const r = star.id === "vega" ? baseRadius + 1.5 : baseRadius;
          return (
            <g key={star.id} filter={`url(#${glowId})`}>
              <motion.circle
                cx={star.cx}
                initial={{ cy: star.cy, r, opacity: 0.8 }}
                fill="var(--gold)"
                animate={getStarAnimation(index, star)}
              />
              {/* Bright white core — stays static */}
              <circle
                cx={star.cx}
                cy={star.cy}
                r={r * 0.4}
                fill="rgba(255,255,255,0.9)"
              />
            </g>
          );
        })}
      </svg>
    </span>
  );

  if (showLabel) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {sigil}
        <span className="text-[10px] text-gold/50 tracking-[0.25em] uppercase">
          Lyra
        </span>
      </div>
    );
  }

  return sigil;
}
