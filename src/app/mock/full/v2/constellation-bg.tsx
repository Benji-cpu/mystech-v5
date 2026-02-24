"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { MoodId } from "../_shared/types";

const STAR_COUNT = 45;

const moodColors: Record<MoodId, { bg: string; starColor: string; lineColor: string }> = {
  default: { bg: "from-[#0a0118] via-[#110225] to-[#0a0118]", starColor: "rgba(201,169,78,0.6)", lineColor: "rgba(201,169,78,0.08)" },
  reading: { bg: "from-[#05001a] via-[#0a0030] to-[#05001a]", starColor: "rgba(147,130,255,0.6)", lineColor: "rgba(147,130,255,0.08)" },
  creating: { bg: "from-[#0a0118] via-[#1a0530] to-[#0a0118]", starColor: "rgba(255,170,200,0.6)", lineColor: "rgba(255,170,200,0.08)" },
  viewing: { bg: "from-[#080118] via-[#0d0220] to-[#080118]", starColor: "rgba(170,200,255,0.6)", lineColor: "rgba(170,200,255,0.08)" },
  warm: { bg: "from-[#0a0118] via-[#1a1005] to-[#0a0118]", starColor: "rgba(201,169,78,0.8)", lineColor: "rgba(201,169,78,0.12)" },
};

interface Star {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  duration: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: 0.3 + Math.random() * 1.2,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    });
  }
  return stars;
}

function generateLines(stars: Star[]): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].cx - stars[j].cx;
      const dy = stars[i].cy - stars[j].cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 18 && lines.length < 20) {
        lines.push({ x1: stars[i].cx, y1: stars[i].cy, x2: stars[j].cx, y2: stars[j].cy });
      }
    }
  }
  return lines;
}

export const ConstellationBg = memo(function ConstellationBg({ mood }: { mood: MoodId }) {
  const { stars, lines } = useMemo(() => {
    const s = generateStars(STAR_COUNT);
    const l = generateLines(s);
    return { stars: s, lines: l };
  }, []);

  const colors = moodColors[mood];

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Gradient base */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${colors.bg}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Star field SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Constellation lines */}
        {lines.map((line, i) => (
          <motion.line
            key={`line-${i}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke={colors.lineColor}
            strokeWidth="0.08"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, delay: i * 0.3, repeat: Infinity }}
          />
        ))}

        {/* Stars */}
        {stars.map((star, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={`${star.cx}%`}
            cy={`${star.cy}%`}
            r={star.r}
            fill={colors.starColor}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-radial-[at_50%_30%] from-purple-900/10 via-transparent to-transparent" />
    </div>
  );
});
