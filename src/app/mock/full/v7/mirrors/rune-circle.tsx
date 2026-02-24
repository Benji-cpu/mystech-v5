"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

// Elder Futhark runes as unicode characters
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];
const OUTER_RUNES = RUNES.slice(0, 16);
const INNER_RUNES = RUNES.slice(8, 20);

export function RuneCircleMirror({ children, className }: MirrorFrameProps) {
  const outerR = 46; // % radius for outer rune ring
  const innerR = 36; // % radius for inner rune ring

  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes rune-rotate-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rune-rotate-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes rune-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes rune-glow {
          0%, 100% { box-shadow: 0 0 20px ${MT.goldDim}; }
          50% { box-shadow: 0 0 40px ${MT.goldDim}, 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes rune-center-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .rune-outer-ring { animation: rune-rotate-cw 30s linear infinite; }
        .rune-inner-ring { animation: rune-rotate-ccw 20s linear infinite; }
        .rune-tick-cw { animation: rune-rotate-cw 8s linear infinite; }
        .rune-tick-ccw { animation: rune-rotate-ccw 6s linear infinite; }
        .rune-pulse { animation: rune-pulse 4s ease-in-out infinite; }
        .rune-glow { animation: rune-glow 4s ease-in-out infinite; }
        .rune-center { animation: rune-center-pulse 5s ease-in-out infinite; }
      `}</style>

      {/* Outer glow halo */}
      <div
        className="rune-glow absolute"
        style={{
          width: "96%",
          aspectRatio: "1",
          borderRadius: "50%",
        }}
      />

      {/* Outer rune ring — rotates clockwise */}
      <div
        className="rune-outer-ring absolute"
        style={{ width: "96%", aspectRatio: "1" }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full" overflow="visible">
          {OUTER_RUNES.map((rune, i) => {
            const angle = (i / OUTER_RUNES.length) * 2 * Math.PI - Math.PI / 2;
            const x = 200 + 178 * Math.cos(angle);
            const y = 200 + 178 * Math.sin(angle);
            const rotateDeg = (i / OUTER_RUNES.length) * 360 + 90;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
                fill={i % 4 === 0 ? MT.gold : `${MT.gold}99`}
                fontWeight={i % 4 === 0 ? "bold" : "normal"}
                transform={`rotate(${rotateDeg}, ${x}, ${y})`}
                style={{ fontFamily: "serif" }}
              >
                {rune}
              </text>
            );
          })}
          {/* Outer circle border */}
          <circle cx="200" cy="200" r="192" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="200" cy="200" r="185" stroke={`${MT.gold}55`} strokeWidth="1" fill="none" />
          {/* Tick marks between runes */}
          {OUTER_RUNES.map((_, i) => {
            const angle = ((i + 0.5) / OUTER_RUNES.length) * 2 * Math.PI - Math.PI / 2;
            const x1 = 200 + 190 * Math.cos(angle);
            const y1 = 200 + 190 * Math.sin(angle);
            const x2 = 200 + 196 * Math.cos(angle);
            const y2 = 200 + 196 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${MT.gold}88`} strokeWidth="1" />;
          })}
        </svg>
      </div>

      {/* Inner rune ring — rotates counter-clockwise */}
      <div
        className="rune-inner-ring absolute"
        style={{ width: "75%", aspectRatio: "1" }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full" overflow="visible">
          {INNER_RUNES.map((rune, i) => {
            const angle = (i / INNER_RUNES.length) * 2 * Math.PI - Math.PI / 2;
            const x = 200 + 178 * Math.cos(angle);
            const y = 200 + 178 * Math.sin(angle);
            const rotateDeg = (i / INNER_RUNES.length) * 360 + 90;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                fill={`${MT.gold}bb`}
                transform={`rotate(${rotateDeg}, ${x}, ${y})`}
                style={{ fontFamily: "serif" }}
              >
                {rune}
              </text>
            );
          })}
          <circle cx="200" cy="200" r="192" stroke={`${MT.gold}66`} strokeWidth="1.5" fill="none" />
          <circle cx="200" cy="200" r="185" stroke={`${MT.gold}33`} strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Dashed tick ring — counter-clockwise */}
      <div
        className="rune-tick-ccw absolute"
        style={{ width: "58%", aspectRatio: "1" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="95" stroke={`${MT.gold}66`} strokeWidth="1"
            fill="none" strokeDasharray="3 5" />
        </svg>
      </div>

      {/* Inner decorative ring with triangular nodes */}
      <div
        className="rune-pulse absolute"
        style={{ width: "54%", aspectRatio: "1" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
          <circle cx="100" cy="100" r="92" stroke={MT.gold} strokeWidth="1.5" />
          {/* 8 triangular nodes */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
            const x = 100 + 92 * Math.cos(angle);
            const y = 100 + 92 * Math.sin(angle);
            const deg = (i / 8) * 360 + 90;
            return (
              <g key={i} transform={`translate(${x},${y}) rotate(${deg})`}>
                <path d="M0 -5 L4 3 L-4 3 Z" fill={MT.gold} />
              </g>
            );
          })}
          {/* Central star */}
          <path
            d="M100 78 L104 94 L120 94 L107 104 L112 120 L100 110 L88 120 L93 104 L80 94 L96 94 Z"
            fill={`${MT.gold}55`}
            stroke={MT.gold}
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Content circle */}
      <div
        className="rune-center relative z-10 overflow-hidden"
        style={{
          width: "48%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${MT.surface2} 0%, ${MT.bg}f0 60%, ${MT.bg} 100%)`,
          border: `1px solid ${MT.gold}44`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
