"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LYRA_STARS,
  LYRA_CONNECTIONS,
  LYRA_SCATTERED,
  type ZodiacSign,
  type LyraStar,
} from "./zodiac-data";
import {
  LYRA,
  SPRING_CONSTELLATION,
  SPRING_LINE_DRAW,
  ELEMENT_COLORS,
  type ThemeType,
} from "./lyra-v1-theme";
import type { ThemeStar } from "./lyra-v1-state";

// ── Seeded PRNG for deterministic scatter stars (avoids hydration mismatch) ──

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const _rand = seededRandom(42);
const SCATTER_STARS = Array.from({ length: 50 }, (_, i) => ({
  id: `scatter-${i}`,
  x: _rand() * 200,
  y: _rand() * 100,
  r: 0.2 + _rand() * 0.5,
  opacity: 0.15 + _rand() * 0.35,
  delay: _rand() * 4,
}));

// ── Props ───────────────────────────────────────────────────────────

interface StarSkyProps {
  zodiac: ZodiacSign | null;
  zodiacDrawProgress: number;
  lyraFormed: boolean;
  lyraConnections: boolean;
  lyraSpeaking: boolean;
  threadToZodiac: boolean;
  themeStars: ThemeStar[];
  clustersRevealed: boolean;
  readingPositions: { x: number; y: number }[];
  revealedCards: number[];
  triangleDrawn: boolean;
  isBreathPause: boolean;
}

function StarSkyInner({
  zodiac,
  zodiacDrawProgress,
  lyraFormed,
  lyraConnections,
  lyraSpeaking,
  threadToZodiac,
  themeStars,
  clustersRevealed,
  readingPositions,
  revealedCards,
  triangleDrawn,
  isBreathPause,
}: StarSkyProps) {
  const elementColor = zodiac ? ELEMENT_COLORS[zodiac.element] : null;

  // Build zodiac connection paths
  const zodiacPaths = useMemo(() => {
    if (!zodiac) return [];
    return zodiac.connections.map(([fromId, toId]) => {
      const from = zodiac.stars.find((s) => s.id === fromId);
      const to = zodiac.stars.find((s) => s.id === toId);
      if (!from || !to) return null;
      return { id: `z-${fromId}-${toId}`, d: `M ${from.x} ${from.y} L ${to.x} ${to.y}` };
    }).filter(Boolean) as { id: string; d: string }[];
  }, [zodiac]);

  // Build lyra connection paths
  const lyraPaths = useMemo(() => {
    return LYRA_CONNECTIONS.map(([fromId, toId]) => {
      const from = LYRA_STARS.find((s) => s.id === fromId)!;
      const to = LYRA_STARS.find((s) => s.id === toId)!;
      return { id: `l-${fromId}-${toId}`, d: `M ${from.x} ${from.y} L ${to.x} ${to.y}` };
    });
  }, []);

  // Vega position (for golden thread to zodiac)
  const vega = LYRA_STARS.find((s) => s.id === "vega")!;
  const zodiacPrimary = zodiac ? zodiac.stars[zodiac.primaryStarIndex] : null;

  // Golden thread bezier from Vega to zodiac primary star
  const goldenThreadPath = useMemo(() => {
    if (!zodiacPrimary) return "";
    const midX = (vega.x + zodiacPrimary.x) / 2;
    const midY = Math.min(vega.y, zodiacPrimary.y) - 12;
    return `M ${vega.x} ${vega.y} Q ${midX} ${midY} ${zodiacPrimary.x} ${zodiacPrimary.y}`;
  }, [zodiacPrimary, vega]);

  // Cluster lines
  const clusterLines = useMemo(() => {
    if (!clustersRevealed) return [];
    const lines: { id: string; d: string }[] = [];
    for (const star of themeStars) {
      for (const [fromId, toId] of star.clusterLines) {
        const from = themeStars.find((s) => s.id === fromId);
        const to = themeStars.find((s) => s.id === toId);
        if (from && to) {
          const id = `cl-${fromId}-${toId}`;
          if (!lines.find((l) => l.id === id)) {
            lines.push({ id, d: `M ${from.x} ${from.y} L ${to.x} ${to.y}` });
          }
        }
      }
    }
    return lines;
  }, [themeStars, clustersRevealed]);

  // Reading triangle path
  const trianglePath = useMemo(() => {
    if (readingPositions.length < 3) return "";
    const [a, b, c] = readingPositions;
    return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} Z`;
  }, [readingPositions]);

  const breathOpacity = isBreathPause ? 0.3 : 1;

  return (
    <svg
      viewBox="0 0 200 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="star-glow-v1">
          <feGaussianBlur stdDeviation="1" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="star-glow-strong-v1">
          <feGaussianBlur stdDeviation="1.8" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="theme-star-glow-v1">
          <feGaussianBlur stdDeviation="1.2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="golden-thread-v1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={LYRA.gold} stopOpacity="0.8" />
          <stop offset="50%" stopColor={LYRA.goldLight} stopOpacity="1" />
          <stop offset="100%" stopColor={LYRA.gold} stopOpacity="0.3" />
        </linearGradient>
        <filter id="thread-glow-v1">
          <feGaussianBlur stdDeviation="0.6" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Layer 1: Background scatter stars */}
      {SCATTER_STARS.map((s, i) => (
        <motion.circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="white"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [s.opacity * 0.5, s.opacity, s.opacity * 0.5],
          }}
          transition={{
            duration: 3 + (i % 5) * 0.4,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Layer 2: Zodiac constellation lines */}
      {zodiacPaths.map((path, i) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={elementColor?.primary ?? "white"}
          strokeWidth="0.4"
          fill="none"
          strokeOpacity={0.5 * breathOpacity}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: zodiacDrawProgress,
            opacity: zodiacDrawProgress > 0 ? 0.5 * breathOpacity : 0,
          }}
          transition={{
            ...SPRING_LINE_DRAW,
            delay: i * 0.15,
          }}
        />
      ))}

      {/* Layer 2: Zodiac constellation stars */}
      {zodiac?.stars.map((star) => (
        <motion.circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={1 + star.brightness * 1.2}
          fill={elementColor?.primary ?? "white"}
          filter="url(#star-glow-v1)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: zodiacDrawProgress > 0 ? star.brightness * breathOpacity : 0,
            scale: zodiacDrawProgress > 0 ? 1 : 0,
          }}
          transition={{
            ...SPRING_CONSTELLATION,
            delay: star.brightness > 0.7 ? 0 : 0.3,
          }}
        />
      ))}

      {/* Layer 3: Lyra constellation lines */}
      {lyraConnections && lyraPaths.map((path, i) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={LYRA.gold}
          strokeWidth="0.3"
          fill="none"
          strokeOpacity={0.4 * breathOpacity}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...SPRING_LINE_DRAW, delay: i * 0.12 }}
        />
      ))}

      {/* Layer 3: Lyra constellation stars */}
      {LYRA_STARS.map((star) => {
        const scattered = LYRA_SCATTERED[star.id];
        const targetX = lyraFormed ? star.x : scattered.x;
        const targetY = lyraFormed ? star.y : scattered.y;

        return (
          <motion.circle
            key={star.id}
            r={star.radius}
            fill={LYRA.gold}
            filter={lyraSpeaking ? "url(#star-glow-strong-v1)" : "url(#star-glow-v1)"}
            initial={{ cx: scattered.x, cy: scattered.y, opacity: 0.3 }}
            animate={{
              cx: targetX,
              cy: targetY,
              opacity: isBreathPause ? 0.3 : lyraSpeaking ? 1 : 0.75,
              scale: lyraSpeaking ? [1, 1.3, 1] : 1,
            }}
            transition={{
              cx: SPRING_CONSTELLATION,
              cy: SPRING_CONSTELLATION,
              opacity: { duration: 0.4 },
              scale: lyraSpeaking
                ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                : { duration: 0.3 },
            }}
          />
        );
      })}

      {/* Vega highlight */}
      {lyraFormed && (
        <motion.circle
          cx={vega.x}
          cy={vega.y}
          r={1.2}
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: isBreathPause ? 0.1 : 0.5 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Layer 4: Golden thread (Vega → zodiac primary) */}
      {threadToZodiac && goldenThreadPath && (
        <motion.path
          d={goldenThreadPath}
          stroke="url(#golden-thread-v1)"
          strokeWidth="0.4"
          fill="none"
          filter="url(#thread-glow-v1)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: breathOpacity }}
          transition={SPRING_LINE_DRAW}
        />
      )}

      {/* Layer 5: Theme stars */}
      {themeStars.map((star, i) => (
        <motion.circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={1.4}
          fill={star.color}
          filter="url(#theme-star-glow-v1)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.8, 1],
            opacity: breathOpacity * 0.85,
          }}
          transition={{
            scale: { duration: 0.6, times: [0, 0.5, 1] },
            opacity: { duration: 0.3 },
          }}
        />
      ))}

      {/* Theme star cluster lines */}
      {clusterLines.map((line, i) => (
        <motion.path
          key={line.id}
          d={line.d}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="0.25"
          strokeDasharray="1 1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 * breathOpacity }}
          transition={{ ...SPRING_LINE_DRAW, delay: i * 0.15 }}
        />
      ))}

      {/* Layer 6: Reading position highlights */}
      {readingPositions.map((pos, i) => (
        <g key={`reading-pos-${i}`}>
          {/* Outer ring */}
          <motion.circle
            cx={pos.x}
            cy={pos.y}
            r={3.5}
            fill="none"
            stroke={LYRA.gold}
            strokeWidth="0.3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: revealedCards.includes(i) ? 0.9 : 0.4,
              scale: 1,
            }}
            transition={SPRING_CONSTELLATION}
          />
          {/* Inner glow when revealed */}
          {revealedCards.includes(i) && (
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={2}
              fill={LYRA.gold}
              filter="url(#star-glow-strong-v1)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </g>
      ))}

      {/* Reading triangle */}
      {triangleDrawn && trianglePath && (
        <motion.path
          d={trianglePath}
          stroke="url(#golden-thread-v1)"
          strokeWidth="0.3"
          fill="none"
          filter="url(#thread-glow-v1)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ ...SPRING_LINE_DRAW, duration: 1.5 }}
        />
      )}
    </svg>
  );
}

export const StarSky = memo(StarSkyInner);
