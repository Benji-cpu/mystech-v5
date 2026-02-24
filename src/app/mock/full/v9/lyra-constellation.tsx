"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  STARS,
  CONNECTIONS,
  FORMATIONS,
  SPRING_CONSTELLATION,
  LYRA,
  type FormationId,
} from "./lyra-journey-theme";
import type { UserStar } from "./lyra-journey-state";

interface LyraConstellationProps {
  formation: FormationId;
  showConnections: boolean;
  userStars: UserStar[];
  isBreathPause: boolean;
  /** Whether stars are in "speaking" state (pulsing) */
  isSpeaking?: boolean;
}

function LyraConstellationInner({
  formation,
  showConnections,
  userStars,
  isBreathPause,
  isSpeaking = false,
}: LyraConstellationProps) {
  const positions = FORMATIONS[formation];

  // Build connection paths
  const connectionPaths = useMemo(() => {
    return CONNECTIONS.map(([fromId, toId]) => {
      const from = positions[fromId];
      const to = positions[toId];
      if (!from || !to) return null;
      return { id: `${fromId}-${toId}`, d: `M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}` };
    }).filter(Boolean) as { id: string; d: string }[];
  }, [positions]);

  // User star connection paths
  const userConnectionPaths = useMemo(() => {
    return userStars.map((us) => {
      const target = positions[us.connectedTo];
      if (!target) return null;
      return { id: `user-${us.id}`, d: `M ${us.cx} ${us.cy} L ${target.cx} ${target.cy}` };
    }).filter(Boolean) as { id: string; d: string }[];
  }, [userStars, positions]);

  const breathOpacity = isBreathPause ? 0.3 : 1;

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="1.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="star-glow-strong">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="user-star-glow">
          <feGaussianBlur stdDeviation="2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Constellation connection lines */}
      {connectionPaths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="0.3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: showConnections ? 1 : 0,
            opacity: showConnections ? breathOpacity * 0.5 : 0,
          }}
          transition={SPRING_CONSTELLATION}
        />
      ))}

      {/* User star connection lines (golden) */}
      {userConnectionPaths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={LYRA.gold}
          strokeWidth="0.25"
          fill="none"
          strokeDasharray="1 1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: breathOpacity * 0.4 }}
          transition={{ ...SPRING_CONSTELLATION, delay: 0.3 }}
        />
      ))}

      {/* Main constellation stars */}
      {STARS.map((star) => {
        const pos = positions[star.id];
        if (!pos) return null;

        return (
          <motion.circle
            key={star.id}
            r={star.baseRadius}
            fill={LYRA.gold}
            filter={isSpeaking ? "url(#star-glow-strong)" : "url(#star-glow)"}
            initial={{ cx: 50, cy: 50, opacity: 0, scale: 0 }}
            animate={{
              cx: pos.cx,
              cy: pos.cy,
              opacity: isBreathPause ? 0.3 : isSpeaking ? 1 : 0.8,
              scale: isSpeaking ? [1, 1.3, 1] : 1,
            }}
            transition={{
              cx: SPRING_CONSTELLATION,
              cy: SPRING_CONSTELLATION,
              opacity: { duration: 0.4 },
              scale: isSpeaking
                ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                : { duration: 0.3 },
            }}
          />
        );
      })}

      {/* Vega highlight — always slightly brighter */}
      {positions.vega && (
        <motion.circle
          r={2}
          fill="white"
          opacity={0.4}
          animate={{
            cx: positions.vega.cx,
            cy: positions.vega.cy,
            opacity: isBreathPause ? 0.1 : 0.4,
          }}
          transition={SPRING_CONSTELLATION}
        />
      )}

      {/* User stars */}
      {userStars.map((us) => (
        <motion.circle
          key={us.id}
          cx={us.cx}
          cy={us.cy}
          r={3}
          fill={LYRA.goldLight}
          filter="url(#user-star-glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 1],
            opacity: isBreathPause ? 0.3 : 0.9,
          }}
          transition={{
            scale: { duration: 0.6, times: [0, 0.6, 1] },
            opacity: { duration: 0.4 },
          }}
        />
      ))}
    </svg>
  );
}

export const LyraConstellation = memo(LyraConstellationInner);
