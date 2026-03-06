"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MockWaypoint } from "./path-journey-data";

interface TrailMapProps {
  waypoints: MockWaypoint[];
  currentWaypointIndex: number;
  completedWaypoints: number[];
  trailProgress: number; // 0.0–1.0
  className?: string;
}

// Waypoint Y positions in SVG viewBox (0-600)
const WAYPOINT_Y = [120, 300, 480];
// X positions with some winding
const WAYPOINT_X = [150, 250, 150];

// SVG path segments — a winding trail
const TRAIL_PATH = `
  M 150 20
  C 150 60, 250 80, 250 120
  C 250 160, 150 200, 150 240
  C 150 260, 250 280, 250 300
  C 250 340, 150 380, 150 420
  C 150 440, 150 460, 150 480
  L 150 580
`;

export function TrailMap({
  waypoints,
  currentWaypointIndex,
  completedWaypoints,
  trailProgress,
  className,
}: TrailMapProps) {
  // Calculate viewBox offset based on trail progress — scrolls vertically
  const viewBoxY = trailProgress * 300; // 0 to 300 scroll range

  return (
    <motion.div
      className={cn("w-full h-full overflow-hidden", className)}
      layout
    >
      <motion.svg
        viewBox={`0 ${viewBoxY} 400 400`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        animate={{ viewBox: `0 ${viewBoxY} 400 400` }}
        transition={{ type: "spring", stiffness: 100, damping: 25, duration: 1.2 }}
      >
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trail path — dim base */}
        <path
          d={TRAIL_PATH}
          stroke="rgba(201,169,78,0.15)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 4"
        />

        {/* Trail path — progress highlight (no glow filter) */}
        <motion.path
          d={TRAIL_PATH}
          stroke="rgba(201,169,78,0.5)"
          strokeWidth="2.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: trailProgress }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />

        {/* Waypoint markers */}
        {waypoints.map((wp, i) => {
          const isCompleted = completedWaypoints.includes(i);
          const isCurrent = i === currentWaypointIndex;
          const isFuture = i > currentWaypointIndex;
          const cx = WAYPOINT_X[i];
          const cy = WAYPOINT_Y[i];

          return (
            <g key={wp.name}>
              {/* Outer glow for current waypoint */}
              {isCurrent && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill="none"
                  stroke="#c9a94e"
                  strokeWidth="1"
                  opacity={0.4}
                  filter="url(#softGlow)"
                  animate={{
                    r: [18, 22, 18],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Main marker circle */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={10}
                fill={
                  isCompleted
                    ? "#10b981" // emerald
                    : isCurrent
                      ? "#c9a94e"
                      : "rgba(255,255,255,0.1)"
                }
                stroke={
                  isCompleted
                    ? "#10b981"
                    : isCurrent
                      ? "#c9a94e"
                      : "rgba(255,255,255,0.2)"
                }
                strokeWidth="2"
                animate={
                  isCurrent
                    ? { scale: [1, 1.15, 1] }
                    : {}
                }
                transition={
                  isCurrent
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : undefined
                }
              />

              {/* Completed check */}
              {isCompleted && (
                <motion.path
                  d={`M ${cx - 4} ${cy} L ${cx - 1} ${cy + 3} L ${cx + 5} ${cy - 4}`}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                />
              )}

              {/* Lock icon for future waypoints */}
              {isFuture && !isCompleted && (
                <g transform={`translate(${cx - 4}, ${cy - 5})`}>
                  <rect x="1" y="4" width="6" height="5" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                  <path d="M 2 4 L 2 2 C 2 0, 6 0, 6 2 L 6 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                </g>
              )}

              {/* Waypoint label */}
              <text
                x={cx + 20}
                y={cy + 4}
                fill={
                  isCompleted
                    ? "#10b981"
                    : isCurrent
                      ? "#c9a94e"
                      : "rgba(255,255,255,0.3)"
                }
                fontSize="11"
                fontFamily="system-ui, sans-serif"
                fontWeight={isCurrent ? "600" : "400"}
              >
                {wp.name}
              </text>
            </g>
          );
        })}

        {/* Traveler indicator — gold dot on the path */}
        <motion.circle
          cx={WAYPOINT_X[currentWaypointIndex]}
          cy={WAYPOINT_Y[currentWaypointIndex]}
          r={5}
          fill="#c9a94e"
          animate={{
            cx: WAYPOINT_X[currentWaypointIndex],
            cy: WAYPOINT_Y[currentWaypointIndex],
          }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />

      </motion.svg>
    </motion.div>
  );
}
