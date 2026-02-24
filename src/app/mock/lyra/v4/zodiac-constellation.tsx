"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getZodiacById, ELEMENT_STYLES, ANCHOR_THEME_COLORS, type Anchor } from "./lyra-v4-data";
import { SPRINGS } from "./lyra-v4-theme";

interface ZodiacConstellationProps {
  zodiacId: string | null;
  anchors: Anchor[];
  compact?: boolean;
  className?: string;
}

export function ZodiacConstellation({
  zodiacId,
  anchors,
  compact,
  className,
}: ZodiacConstellationProps) {
  const zodiac = zodiacId ? getZodiacById(zodiacId) : null;
  if (!zodiac) return null;

  const el = ELEMENT_STYLES[zodiac.element];

  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Constellation lines */}
        {zodiac.lines.map(([from, to], i) => (
          <motion.line
            key={`line-${i}`}
            x1={zodiac.stars[from].x * 100}
            y1={zodiac.stars[from].y * 100}
            x2={zodiac.stars[to].x * 100}
            y2={zodiac.stars[to].y * 100}
            stroke={el.haloColor}
            strokeOpacity={0.25}
            strokeWidth={compact ? 0.3 : 0.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...SPRINGS.gentle, delay: i * 0.15 }}
          />
        ))}

        {/* Main zodiac stars */}
        {zodiac.stars.map((star, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={star.x * 100}
            cy={star.y * 100}
            r={compact ? 1.2 : (star.brightness > 0.8 ? 2.5 : 1.8)}
            fill={el.haloColor}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: star.brightness * 0.8 }}
            transition={{ ...SPRINGS.snappy, delay: i * 0.1 }}
          />
        ))}

        {/* Ghost star positions (unfilled circles) and anchor stars */}
        {!compact && zodiac.ghostStarPositions.map((pos, i) => {
          const anchor = anchors.find(a => a.ghostStarIndex === i);

          if (anchor) {
            const color = ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e";
            return (
              <motion.g key={`anchor-${i}`}>
                <motion.circle
                  cx={pos.x * 100}
                  cy={pos.y * 100}
                  r={4}
                  fill={color}
                  fillOpacity={0.15}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={SPRINGS.burst}
                />
                <motion.circle
                  cx={pos.x * 100}
                  cy={pos.y * 100}
                  r={2}
                  fill={color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRINGS.burst}
                />
              </motion.g>
            );
          }

          return (
            <circle
              key={`ghost-${i}`}
              cx={pos.x * 100}
              cy={pos.y * 100}
              r={1.5}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.5}
              fill="none"
            />
          );
        })}
      </svg>
    </div>
  );
}
