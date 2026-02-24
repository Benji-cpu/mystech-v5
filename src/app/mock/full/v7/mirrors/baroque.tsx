"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function BaroqueMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes baroque-glow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 6px ${MT.goldDim}); }
          50% { opacity: 1; filter: drop-shadow(0 0 14px ${MT.gold}88); }
        }
        .baroque-frame { animation: baroque-glow 4s ease-in-out infinite; }
      `}</style>

      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: `0 0 40px ${MT.goldDim}, inset 0 0 30px rgba(10,1,24,0.8)`,
        }}
      />

      {/* SVG frame overlay */}
      <svg
        className="baroque-frame absolute inset-0 w-full h-full"
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer border */}
        <rect x="8" y="8" width="384" height="484" rx="12" ry="12"
          stroke={MT.gold} strokeWidth="3" fill="none" />
        {/* Inner border */}
        <rect x="22" y="22" width="356" height="456" rx="8" ry="8"
          stroke={MT.goldDim} strokeWidth="1.5" fill="none" />
        {/* Middle accent line */}
        <rect x="30" y="30" width="340" height="440" rx="6" ry="6"
          stroke={`${MT.gold}44`} strokeWidth="1" fill="none" />

        {/* Top-left corner ornament */}
        <g fill={MT.gold}>
          <circle cx="22" cy="22" r="5" />
          <path d="M8 22 Q22 8 36 22 Q22 36 8 22Z" opacity="0.7" />
          <path d="M22 8 Q36 22 22 36 Q8 22 22 8Z" opacity="0.7" />
          <circle cx="22" cy="22" r="2.5" fill={MT.bg} />
          <circle cx="22" cy="22" r="1.5" />
          {/* scrollwork */}
          <path d="M35 14 C40 14 44 18 44 23 C44 28 40 30 36 29" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 35 C14 40 18 44 23 44 C28 44 30 40 29 36" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="23" r="2" />
          <circle cx="23" cy="44" r="2" />
        </g>

        {/* Top-right corner ornament */}
        <g fill={MT.gold} transform="translate(400,0) scale(-1,1)">
          <circle cx="22" cy="22" r="5" />
          <path d="M8 22 Q22 8 36 22 Q22 36 8 22Z" opacity="0.7" />
          <path d="M22 8 Q36 22 22 36 Q8 22 22 8Z" opacity="0.7" />
          <circle cx="22" cy="22" r="2.5" fill={MT.bg} />
          <circle cx="22" cy="22" r="1.5" />
          <path d="M35 14 C40 14 44 18 44 23 C44 28 40 30 36 29" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 35 C14 40 18 44 23 44 C28 44 30 40 29 36" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="23" r="2" />
          <circle cx="23" cy="44" r="2" />
        </g>

        {/* Bottom-left corner ornament */}
        <g fill={MT.gold} transform="translate(0,500) scale(1,-1)">
          <circle cx="22" cy="22" r="5" />
          <path d="M8 22 Q22 8 36 22 Q22 36 8 22Z" opacity="0.7" />
          <path d="M22 8 Q36 22 22 36 Q8 22 22 8Z" opacity="0.7" />
          <circle cx="22" cy="22" r="2.5" fill={MT.bg} />
          <circle cx="22" cy="22" r="1.5" />
          <path d="M35 14 C40 14 44 18 44 23 C44 28 40 30 36 29" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 35 C14 40 18 44 23 44 C28 44 30 40 29 36" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="23" r="2" />
          <circle cx="23" cy="44" r="2" />
        </g>

        {/* Bottom-right corner ornament */}
        <g fill={MT.gold} transform="translate(400,500) scale(-1,-1)">
          <circle cx="22" cy="22" r="5" />
          <path d="M8 22 Q22 8 36 22 Q22 36 8 22Z" opacity="0.7" />
          <path d="M22 8 Q36 22 22 36 Q8 22 22 8Z" opacity="0.7" />
          <circle cx="22" cy="22" r="2.5" fill={MT.bg} />
          <circle cx="22" cy="22" r="1.5" />
          <path d="M35 14 C40 14 44 18 44 23 C44 28 40 30 36 29" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 35 C14 40 18 44 23 44 C28 44 30 40 29 36" stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="23" r="2" />
          <circle cx="23" cy="44" r="2" />
        </g>

        {/* Top center ornament */}
        <g fill={MT.gold} transform="translate(200,0)">
          <path d="M-20 8 C-10 2 10 2 20 8" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="0" cy="8" r="4" />
          <path d="M-8 14 L0 6 L8 14" fill={`${MT.gold}88`} />
        </g>

        {/* Bottom center ornament */}
        <g fill={MT.gold} transform="translate(200,500) scale(1,-1)">
          <path d="M-20 8 C-10 2 10 2 20 8" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="0" cy="8" r="4" />
          <path d="M-8 14 L0 6 L8 14" fill={`${MT.gold}88`} />
        </g>

        {/* Side center ornaments */}
        <g fill={MT.gold} transform="translate(0,250)">
          <path d="M8 -15 C2 -8 2 8 8 15" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="8" cy="0" r="4" />
        </g>
        <g fill={MT.gold} transform="translate(400,250) scale(-1,1)">
          <path d="M8 -15 C2 -8 2 8 8 15" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="8" cy="0" r="4" />
        </g>
      </svg>

      {/* Content area */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "calc(100% - 68px)",
          height: "calc(100% - 68px)",
          borderRadius: "4px",
          background: `linear-gradient(135deg, ${MT.surface} 0%, ${MT.bg} 100%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
