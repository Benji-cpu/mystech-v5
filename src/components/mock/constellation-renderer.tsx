"use client";

import { motion } from "framer-motion";
import { CONSTELLATIONS } from "./constellation-data";

interface ConstellationRendererProps {
  themes: { id: string; color: string }[];
  phase: "conversation" | "compression" | "forging" | "revealing" | "complete";
  className?: string;
}

export function ConstellationRenderer({
  themes,
  phase,
  className,
}: ConstellationRendererProps) {
  // Filter themes that have constellation data
  const validThemes = themes.filter((theme) => CONSTELLATIONS[theme.id]);

  if (validThemes.length === 0) return null;

  // Calculate grid layout based on theme count
  const getGridLayout = (count: number) => {
    if (count === 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 };
    if (count === 3) return { cols: 3, rows: 1 };
    if (count === 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 3, rows: 2 };
    return { cols: 3, rows: Math.ceil(count / 3) };
  };

  const { cols, rows } = getGridLayout(validThemes.length);

  // Calculate region bounds for each constellation
  const getRegionBounds = (index: number, total: number) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cellWidth = 1 / cols;
    const cellHeight = 1 / rows;

    // Add padding
    const padding = 0.05;
    const x = col * cellWidth + padding;
    const y = row * cellHeight + padding;
    const width = cellWidth - padding * 2;
    const height = cellHeight - padding * 2;

    return { x, y, width, height };
  };

  // Pulsing animation during compression
  const isPulsing = phase === "compression";

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 1 1"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Define golden glow filter */}
      <defs>
        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.003" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
        </filter>
      </defs>

      {validThemes.map((theme, themeIndex) => {
        const constellation = CONSTELLATIONS[theme.id];
        if (!constellation) return null;

        const bounds = getRegionBounds(themeIndex, validThemes.length);

        // Map normalized star positions to region bounds
        const mapToRegion = (pos: { x: number; y: number }) => ({
          x: bounds.x + pos.x * bounds.width,
          y: bounds.y + pos.y * bounds.height,
        });

        const mappedStars = constellation.stars.map(mapToRegion);

        return (
          <g key={theme.id}>
            {/* Connecting lines */}
            {constellation.lines.map((line, lineIndex) => {
              const [startIdx, endIdx] = line;
              const start = mappedStars[startIdx];
              const end = mappedStars[endIdx];

              return (
                <motion.line
                  key={`line-${lineIndex}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={theme.color}
                  strokeWidth="0.0008"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: isPulsing ? [0.4, 0.8, 0.4] : 0.4,
                  }}
                  transition={
                    isPulsing
                      ? {
                          pathLength: { duration: 0.8, delay: 0.3 + lineIndex * 0.1 },
                          opacity: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }
                      : { duration: 0.8, delay: 0.3 + lineIndex * 0.1 }
                  }
                />
              );
            })}

            {/* Stars */}
            {mappedStars.map((star, starIndex) => (
              <motion.circle
                key={`star-${starIndex}`}
                cx={star.x}
                cy={star.y}
                fill={theme.color}
                filter="url(#star-glow)"
                initial={{ r: 0, opacity: 0 }}
                animate={{
                  r: 0.003,
                  opacity: isPulsing ? [0.5, 1, 0.5] : 1,
                }}
                transition={
                  isPulsing
                    ? {
                        r: { type: "spring", stiffness: 300, damping: 20, delay: starIndex * 0.15 },
                        opacity: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }
                    : {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: starIndex * 0.15,
                      }
                }
              />
            ))}

            {/* Constellation label */}
            <motion.text
              x={bounds.x + bounds.width / 2}
              y={bounds.y + bounds.height + 0.02}
              fill={theme.color}
              opacity={0.6}
              fontSize="0.012"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: constellation.stars.length * 0.15 + 0.3 }}
            >
              {constellation.name}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}
