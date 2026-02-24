"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function RococoMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes rococo-shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes rococo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .rococo-glow { animation: rococo-shimmer 5s ease-in-out infinite; }
        .rococo-top { animation: rococo-float 6s ease-in-out infinite; }
        .rococo-bottom { animation: rococo-float 6s ease-in-out infinite reverse; }
      `}</style>

      {/* Base frame rectangle */}
      <div
        className="absolute"
        style={{
          inset: "30px 20px",
          background: `linear-gradient(135deg, ${MT.surface2} 0%, ${MT.surface} 50%, ${MT.surface2} 100%)`,
          border: `2px solid ${MT.gold}`,
          borderRadius: "4px",
          boxShadow: `0 0 30px ${MT.goldDim}, inset 0 0 20px rgba(0,0,0,0.6)`,
        }}
      />
      <div
        className="absolute"
        style={{
          inset: "40px 30px",
          border: `1px solid ${MT.gold}66`,
          borderRadius: "3px",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          inset: "48px 38px",
          border: `1px solid ${MT.gold}33`,
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />

      {/* Ornate SVG flourishes */}
      <svg
        className="rococo-glow absolute inset-0 w-full h-full"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top center elaborate crest */}
        <g className="rococo-top" transform="translate(200, 30)" fill={MT.gold}>
          {/* Shell / coquille */}
          <path d="M0 -28 C-6 -22 -14 -14 -12 -4 C-10 6 -4 8 0 6 C4 8 10 6 12 -4 C14 -14 6 -22 0 -28Z" opacity="0.9" />
          {/* Shell ridges */}
          <path d="M0 -28 L0 6" stroke={MT.bg} strokeWidth="1" />
          <path d="M0 -28 C-3 -18 -5 -8 -4 0" stroke={MT.bg} strokeWidth="0.8" />
          <path d="M0 -28 C3 -18 5 -8 4 0" stroke={MT.bg} strokeWidth="0.8" />

          {/* Left asymmetric scroll */}
          <path d="M-12 -4 C-22 -8 -36 -4 -38 6 C-40 16 -32 22 -24 18 C-18 15 -16 8 -20 4 C-24 0 -32 4 -28 10"
            stroke={MT.gold} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="-28" cy="10" r="3" fill={MT.gold} />
          {/* Extra left curlicue */}
          <path d="M-38 6 C-48 0 -52 10 -46 16 C-40 22 -32 18 -34 10"
            stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="-46" cy="16" r="2" fill={MT.gold} />

          {/* Right scroll (asymmetric — longer) */}
          <path d="M12 -4 C24 -10 40 -8 44 4 C48 16 40 24 30 20 C22 17 20 8 26 4 C32 0 40 6 36 12"
            stroke={MT.gold} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="12" r="3" fill={MT.gold} />
          {/* Extra right curlicues */}
          <path d="M44 4 C54 -2 58 10 52 16 C46 22 38 18 40 10"
            stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M52 16 C58 22 56 32 48 30 C42 28 42 22 46 20"
            stroke={MT.gold} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="16" r="2" />
          <circle cx="48" cy="30" r="2" />

          {/* Leaves/petals */}
          <path d="M-30 -2 C-26 -10 -20 -10 -18 -4 C-16 2 -22 6 -28 2Z" fill={`${MT.gold}88`} />
          <path d="M30 -4 C26 -12 32 -14 36 -8 C40 -2 36 4 30 2Z" fill={`${MT.gold}88`} />
          <path d="M-48 10 C-52 4 -46 0 -42 4 C-38 8 -40 14 -46 12Z" fill={`${MT.gold}66`} />
          <path d="M50 4 C54 -2 58 2 56 8 C54 14 48 14 50 8Z" fill={`${MT.gold}66`} />
        </g>

        {/* Bottom center flourish */}
        <g className="rococo-bottom" transform="translate(200, 470)" fill={MT.gold}>
          {/* Inverted shell */}
          <path d="M0 28 C-6 22 -14 14 -12 4 C-10 -6 -4 -8 0 -6 C4 -8 10 -6 12 4 C14 14 6 22 0 28Z" opacity="0.9" />
          <path d="M0 28 L0 -6" stroke={MT.bg} strokeWidth="1" />
          <path d="M0 28 C-3 18 -5 8 -4 0" stroke={MT.bg} strokeWidth="0.8" />
          <path d="M0 28 C3 18 5 8 4 0" stroke={MT.bg} strokeWidth="0.8" />

          <path d="M-12 4 C-22 8 -36 4 -38 -6 C-40 -16 -32 -22 -24 -18 C-18 -15 -16 -8 -20 -4 C-24 0 -32 -4 -28 -10"
            stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M12 4 C24 10 38 6 40 -4 C42 -14 34 -20 26 -16 C20 -13 20 -6 26 -2 C32 2 38 -2 34 -8"
            stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="-28" cy="-10" r="2" fill={MT.gold} />
          <circle cx="34" cy="-8" r="2" fill={MT.gold} />
        </g>

        {/* Top-left corner ornament */}
        <g transform="translate(20, 80)" fill={MT.gold} stroke={MT.gold} strokeWidth="1.2" strokeLinecap="round">
          <path d="M0 0 C-5 -15 5 -22 10 -14 C15 -6 8 2 0 0Z" fill={`${MT.gold}88`} />
          <path d="M10 -14 C18 -24 28 -20 24 -10 C20 0 10 -2 10 -14Z" fill={`${MT.gold}66`} />
          <path d="M0 0 C10 8 16 20 8 28 C0 36 -8 28 -4 18" fill="none" />
          <circle cx="-4" cy="18" r="2.5" />
        </g>

        {/* Top-right corner ornament (mirrored) */}
        <g transform="translate(380, 80) scale(-1,1)" fill={MT.gold} stroke={MT.gold} strokeWidth="1.2" strokeLinecap="round">
          <path d="M0 0 C-5 -15 5 -22 10 -14 C15 -6 8 2 0 0Z" fill={`${MT.gold}88`} />
          <path d="M10 -14 C18 -24 28 -20 24 -10 C20 0 10 -2 10 -14Z" fill={`${MT.gold}66`} />
          <path d="M0 0 C10 8 16 20 8 28 C0 36 -8 28 -4 18" fill="none" />
          <circle cx="-4" cy="18" r="2.5" />
        </g>

        {/* Bottom-left corner */}
        <g transform="translate(20, 420) scale(1,-1)" fill={MT.gold} stroke={MT.gold} strokeWidth="1.2" strokeLinecap="round">
          <path d="M0 0 C-5 -15 5 -22 10 -14 C15 -6 8 2 0 0Z" fill={`${MT.gold}88`} />
          <path d="M0 0 C10 8 16 20 8 28 C0 36 -8 28 -4 18" fill="none" />
          <circle cx="-4" cy="18" r="2.5" />
        </g>

        {/* Bottom-right corner */}
        <g transform="translate(380, 420) scale(-1,-1)" fill={MT.gold} stroke={MT.gold} strokeWidth="1.2" strokeLinecap="round">
          <path d="M0 0 C-5 -15 5 -22 10 -14 C15 -6 8 2 0 0Z" fill={`${MT.gold}88`} />
          <path d="M0 0 C10 8 16 20 8 28 C0 36 -8 28 -4 18" fill="none" />
          <circle cx="-4" cy="18" r="2.5" />
        </g>

        {/* Side mid ornaments */}
        <g transform="translate(20, 250)" fill={MT.gold}>
          <path d="M0 -20 C-8 -10 -8 10 0 20 C8 10 8 -10 0 -20Z" opacity="0.7" />
          <path d="M0 -20 C-4 -10 -4 10 0 20" stroke={MT.bg} strokeWidth="1" fill="none" />
          <circle cx="0" cy="0" r="4" />
          <circle cx="0" cy="0" r="2" fill={MT.bg} />
        </g>
        <g transform="translate(380, 250)" fill={MT.gold}>
          <path d="M0 -20 C-8 -10 -8 10 0 20 C8 10 8 -10 0 -20Z" opacity="0.7" />
          <path d="M0 -20 C4 -10 4 10 0 20" stroke={MT.bg} strokeWidth="1" fill="none" />
          <circle cx="0" cy="0" r="4" />
          <circle cx="0" cy="0" r="2" fill={MT.bg} />
        </g>
      </svg>

      {/* Content area */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "calc(100% - 56px)",
          height: "calc(100% - 80px)",
          borderRadius: "3px",
          background: `linear-gradient(135deg, ${MT.surface2}ee 0%, ${MT.bg} 100%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
