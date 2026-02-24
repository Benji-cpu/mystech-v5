"use client";

import { useRef, useEffect, useState, useCallback } from "react";

function generateBolt(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  jitter = 15
): string {
  const points: [number, number][] = [[x1, y1]];
  const segments = 6 + Math.floor(Math.random() * 4);

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter * 2;
    const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter * 2;
    points.push([mx, my]);
  }
  points.push([x2, y2]);

  return (
    "M " + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ")
  );
}

// Anchor points along the perimeter (percentage)
const ANCHORS: [number, number][] = [
  [10, 0],
  [50, 0],
  [90, 0],
  [100, 25],
  [100, 50],
  [100, 75],
  [90, 100],
  [50, 100],
  [10, 100],
  [0, 75],
  [0, 50],
  [0, 25],
];

export function LightningCage({ children }: { children: React.ReactNode }) {
  const [bolts, setBolts] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const regenerate = useCallback(() => {
    const w = 300,
      h = 450; // viewBox dimensions
    const newBolts: string[] = [];
    const count = 3 + Math.floor(Math.random() * 2); // 3-4 bolts

    for (let i = 0; i < count; i++) {
      const a1 = ANCHORS[Math.floor(Math.random() * ANCHORS.length)];
      let a2 = ANCHORS[Math.floor(Math.random() * ANCHORS.length)];
      while (a2 === a1) {
        a2 = ANCHORS[Math.floor(Math.random() * ANCHORS.length)];
      }

      newBolts.push(
        generateBolt(
          (a1[0] / 100) * w,
          (a1[1] / 100) * h,
          (a2[0] / 100) * w,
          (a2[1] / 100) * h,
          12
        )
      );
    }
    setBolts(newBolts);
  }, []);

  useEffect(() => {
    regenerate();
    intervalRef.current = setInterval(
      regenerate,
      200 + Math.random() * 200
    );
    return () => clearInterval(intervalRef.current);
  }, [regenerate]);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{ background: "#060510" }}
    >
      {/* Lightning SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 300 450"
        preserveAspectRatio="none"
        style={{ zIndex: 2 }}
      >
        <defs>
          <filter
            id="lightning-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {bolts.map((d, i) => (
          <g key={`${i}-${d.slice(0, 20)}`}>
            {/* Glow layer */}
            <path
              d={d}
              fill="none"
              stroke="rgba(180,160,255,0.4)"
              strokeWidth="4"
              filter="url(#lightning-glow)"
            />
            {/* Core bolt */}
            <path
              d={d}
              fill="none"
              stroke="rgba(220,200,255,0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      {/* Content */}
      <div
        className="absolute inset-[10px] overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {children}
      </div>

      {/* Ambient edge glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 30px rgba(120,100,200,0.15)",
          zIndex: 3,
        }}
      />
    </div>
  );
}
