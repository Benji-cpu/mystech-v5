"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LyraSigilProps {
  size?: "sm" | "md" | "lg" | "xl";
  state?: "dormant" | "attentive" | "speaking";
  className?: string;
}

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

export function LyraSigil({
  size = "md",
  state = "dormant",
  className,
}: LyraSigilProps) {
  const dimension = sizeMap[size];
  const baseRadius = size === "sm" ? 3.5 : size === "md" ? 4.5 : size === "lg" ? 5 : 6;

  // Animation configurations based on state
  const getStarAnimation = (index: number, star: (typeof stars)[0]) => {
    const baseCy = star.cy;
    const ease = "easeInOut" as const;

    switch (state) {
      case "dormant":
        return {
          cy: [baseCy, baseCy - 2, baseCy],
          transition: { duration: 8, repeat: Infinity, ease, delay: index * 0.3 },
        };
      case "attentive":
        return {
          cy: [baseCy, baseCy - 3, baseCy],
          transition: { duration: 4, repeat: Infinity, ease, delay: index * 0.2 },
        };
      case "speaking":
        return {
          r: [baseRadius, baseRadius * 1.5, baseRadius],
          opacity: [0.8, 1, 0.8],
          transition: { duration: 1.5, repeat: Infinity, ease, delay: index * 0.15 },
        };
      default:
        return {};
    }
  };

  const getOpacity = () => {
    switch (state) {
      case "dormant":
        return 0.6;
      case "attentive":
        return 0.9;
      case "speaking":
        return 1.0;
      default:
        return 0.6;
    }
  };

  const getStarById = (id: string) => stars.find((s) => s.id === id);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        state === "speaking" && "shadow-[0_0_20px_rgba(201,169,78,0.3)]",
        className
      )}
      style={{ opacity: getOpacity() }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
              stroke="rgba(201,169,78,0.3)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Stars */}
        {stars.map((star, index) => (
          <motion.circle
            key={star.id}
            cx={star.cx}
            cy={star.cy}
            r={baseRadius}
            fill="#c9a94e"
            animate={getStarAnimation(index, star)}
          />
        ))}
      </svg>
    </span>
  );
}
