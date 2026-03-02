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

// Decoration shapes per waypoint type
function WaypointDecoration({ type, x, y }: { type: string; x: number; y: number }) {
  switch (type) {
    case "archway":
      return (
        <g transform={`translate(${x - 18}, ${y - 30})`} opacity={0.3}>
          <path d="M 0 24 L 0 0 C 0 -8, 36 -8, 36 0 L 36 24" stroke="#c9a94e" strokeWidth="1.5" fill="none" />
          <line x1="0" y1="24" x2="36" y2="24" stroke="#c9a94e" strokeWidth="1" />
        </g>
      );
    case "mirror":
      return (
        <g transform={`translate(${x + 24}, ${y - 14})`} opacity={0.3}>
          <ellipse cx="0" cy="0" rx="12" ry="16" stroke="#c9a94e" strokeWidth="1.5" fill="none" />
          <line x1="0" y1="16" x2="0" y2="24" stroke="#c9a94e" strokeWidth="1.5" />
          <line x1="-6" y1="24" x2="6" y2="24" stroke="#c9a94e" strokeWidth="1.5" />
        </g>
      );
    case "cliff":
      return (
        <g transform={`translate(${x - 30}, ${y + 8})`} opacity={0.3}>
          <polyline points="0,20 10,0 20,12 30,2 40,16 50,6 60,20" stroke="#c9a94e" strokeWidth="1.5" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

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
        {/* Fog/mist gradient overlays */}
        <defs>
          <linearGradient id="trailFog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(10,1,24,0.8)" />
            <stop offset="30%" stopColor="rgba(10,1,24,0)" />
            <stop offset="70%" stopColor="rgba(10,1,24,0)" />
            <stop offset="100%" stopColor="rgba(10,1,24,0.8)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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

        {/* Trail path — progress highlight */}
        <motion.path
          d={TRAIL_PATH}
          stroke="rgba(201,169,78,0.5)"
          strokeWidth="2.5"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: trailProgress }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />

        {/* Waypoint decorations */}
        {waypoints.map((wp, i) => (
          <WaypointDecoration
            key={`dec-${i}`}
            type={wp.decorationIcon}
            x={WAYPOINT_X[i]}
            y={WAYPOINT_Y[i]}
          />
        ))}

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
          filter="url(#glow)"
          animate={{
            cx: WAYPOINT_X[currentWaypointIndex],
            cy: WAYPOINT_Y[currentWaypointIndex],
          }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />

        {/* Fog overlay */}
        <rect x="0" y={viewBoxY} width="400" height="400" fill="url(#trailFog)" />
      </motion.svg>
    </motion.div>
  );
}
