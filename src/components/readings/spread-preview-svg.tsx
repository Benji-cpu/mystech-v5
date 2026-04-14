"use client";

import { SPREAD_POSITIONS } from "@/lib/constants";
import type { SpreadType } from "@/types";

// Spread position coordinates for SVG previews (percentage-based, matching ceremony mock)
const SPREAD_COORDS: Record<SpreadType, { x: number; y: number; rotation?: number }[]> = {
  single: [{ x: 50, y: 50 }],
  three_card: [
    { x: 20, y: 50 },
    { x: 50, y: 50 },
    { x: 80, y: 50 },
  ],
  five_card: [
    { x: 15, y: 50 },
    { x: 50, y: 20 },
    { x: 50, y: 50 },
    { x: 50, y: 80 },
    { x: 85, y: 50 },
  ],
  celtic_cross: [
    { x: 30, y: 50 },
    { x: 30, y: 50, rotation: 90 },
    { x: 30, y: 80 },
    { x: 12, y: 50 },
    { x: 30, y: 20 },
    { x: 48, y: 50 },
    { x: 75, y: 80 },
    { x: 75, y: 60 },
    { x: 75, y: 40 },
    { x: 75, y: 20 },
  ],
  daily: [{ x: 50, y: 50 }],
  quick: [{ x: 50, y: 50 }],
};

interface SpreadPreviewSVGProps {
  spreadType: SpreadType;
  className?: string;
}

export function SpreadPreviewSVG({ spreadType, className }: SpreadPreviewSVGProps) {
  const coords = SPREAD_COORDS[spreadType];
  const positions = SPREAD_POSITIONS[spreadType];
  const svgWidth = 100;
  const svgHeight = 60;
  const cardW = 8;
  const cardH = 12;

  // Normalize positions to fit SVG viewBox
  const xs = coords.map((p) => p.x);
  const ys = coords.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padX = 15;
  const padY = 12;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const mapX = (x: number) => padX + ((x - minX) / rangeX) * (svgWidth - padX * 2);
  const mapY = (y: number) => padY + ((y - minY) / rangeY) * (svgHeight - padY * 2);

  const isSingle = coords.length === 1;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={className ?? "w-full h-24 sm:h-32 mt-2 sm:mt-4"}
    >
      {coords.map((pos, i) => {
        const cx = isSingle ? svgWidth / 2 : mapX(pos.x);
        const cy = isSingle ? svgHeight / 2 - 3 : mapY(pos.y);
        return (
          <g key={i}>
            <rect
              x={cx - cardW / 2}
              y={cy - cardH / 2}
              width={cardW}
              height={cardH}
              rx={1}
              className="fill-white/10 stroke-gold/40"
              strokeWidth={0.5}
              transform={
                pos.rotation
                  ? `rotate(${pos.rotation}, ${cx}, ${cy})`
                  : undefined
              }
            />
            <text
              x={cx}
              y={cy + cardH / 2 + 5}
              textAnchor="middle"
              className="fill-white/40"
              fontSize="3"
            >
              {positions[i]?.name ?? ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
