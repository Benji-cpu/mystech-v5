"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

// Gothic arch path: rectangle bottom + pointed arch top
// For viewBox 400x500, arch apex at top-center
const ARCH_CLIP = "polygon(50% 0%, 92% 8%, 100% 20%, 100% 100%, 0% 100%, 0% 20%, 8% 8%)";
const ARCH_CLIP_INNER = "polygon(50% 2%, 90% 10%, 98% 22%, 98% 98%, 2% 98%, 2% 22%, 10% 10%)";

export function GothicArchMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes gothic-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes gothic-keystone {
          0%, 100% { filter: drop-shadow(0 0 4px ${MT.goldDim}); }
          50% { filter: drop-shadow(0 0 10px ${MT.gold}88); }
        }
        .gothic-glow { animation: gothic-pulse 5s ease-in-out infinite; }
        .gothic-keystone { animation: gothic-keystone 4s ease-in-out infinite; }
      `}</style>

      {/* Stone texture outer frame */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: ARCH_CLIP,
          background: `linear-gradient(180deg, ${MT.surface2} 0%, ${MT.surface} 60%, ${MT.surface2} 100%)`,
        }}
      />

      {/* Stone border effect - slightly smaller */}
      <div
        className="absolute"
        style={{
          inset: "6px",
          clipPath: ARCH_CLIP,
          background: `linear-gradient(180deg, ${MT.border} 0%, ${MT.surface} 100%)`,
          boxShadow: `inset 0 0 20px rgba(0,0,0,0.8)`,
        }}
      />

      {/* Gold trim line */}
      <svg
        className="gothic-keystone absolute inset-0 w-full h-full"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer arch outline */}
        <path
          d="M200 6 L368 40 L394 80 L394 494 L6 494 L6 80 L32 40 Z"
          stroke={MT.gold} strokeWidth="3" fill="none"
        />
        {/* Inner arch outline */}
        <path
          d="M200 24 L356 54 L376 90 L376 476 L24 476 L24 90 L44 54 Z"
          stroke={`${MT.gold}66`} strokeWidth="1.5" fill="none"
        />
        {/* Second inner line */}
        <path
          d="M200 36 L348 64 L364 98 L364 464 L36 464 L36 98 L52 64 Z"
          stroke={`${MT.gold}33`} strokeWidth="1" fill="none"
        />

        {/* Keystone at apex */}
        <path d="M200 6 L218 28 L182 28 Z" fill={MT.gold} opacity="0.9" />
        <circle cx="200" cy="10" r="5" fill={MT.gold} />
        <circle cx="200" cy="10" r="2" fill={MT.bg} />

        {/* Gothic tracery - trefoil at top */}
        <g transform="translate(200, 70)">
          {/* Central circle */}
          <circle cx="0" cy="0" r="20" stroke={MT.gold} strokeWidth="1.5" fill={`${MT.bg}cc`} />
          {/* Three lobes */}
          <circle cx="0" cy="-28" r="14" stroke={MT.gold} strokeWidth="1.2" fill={`${MT.bg}aa`} />
          <circle cx="24" cy="14" r="14" stroke={MT.gold} strokeWidth="1.2" fill={`${MT.bg}aa`} />
          <circle cx="-24" cy="14" r="14" stroke={MT.gold} strokeWidth="1.2" fill={`${MT.bg}aa`} />
          {/* Center diamond */}
          <path d="M0 -8 L6 0 L0 8 L-6 0 Z" fill={MT.gold} opacity="0.8" />
        </g>

        {/* Vertical stone lines */}
        <line x1="24" y1="200" x2="24" y2="400" stroke={`${MT.border}88`} strokeWidth="1" />
        <line x1="376" y1="200" x2="376" y2="400" stroke={`${MT.border}88`} strokeWidth="1" />

        {/* Horizontal stone courses */}
        {[180, 240, 300, 360, 420].map((y) => (
          <line key={y} x1="24" y1={y} x2="376" y2={y}
            stroke={`${MT.border}55`} strokeWidth="1" />
        ))}

        {/* Corner column bases */}
        <rect x="6" y="440" width="30" height="54" fill={`${MT.surface2}88`} stroke={MT.gold} strokeWidth="1" />
        <rect x="364" y="440" width="30" height="54" fill={`${MT.surface2}88`} stroke={MT.gold} strokeWidth="1" />

        {/* Bottom decorative band */}
        <rect x="24" y="455" width="352" height="8" fill={`${MT.gold}22`} stroke={MT.gold} strokeWidth="0.5" />
        {[40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360].map((x) => (
          <line key={x} x1={x} y1="455" x2={x} y2="463" stroke={`${MT.gold}66`} strokeWidth="0.5" />
        ))}
      </svg>

      {/* Content area with arch clip */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "calc(100% - 80px)",
          height: "calc(100% - 80px)",
          clipPath: "polygon(50% 2%, 90% 10%, 98% 22%, 98% 98%, 2% 98%, 2% 22%, 10% 10%)",
          background: `linear-gradient(180deg, ${MT.surface}cc 0%, ${MT.bg} 100%)`,
          marginTop: "-10px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
