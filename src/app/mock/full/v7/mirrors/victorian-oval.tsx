"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function VictorianOvalMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes victorian-glow {
          0%, 100% { opacity: 0.65; box-shadow: 0 0 30px ${MT.goldDim}; }
          50% { opacity: 1; box-shadow: 0 0 50px ${MT.goldDim}, 0 0 80px ${MT.goldDim}; }
        }
        @keyframes victorian-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .victorian-outer { animation: victorian-glow 5s ease-in-out infinite; }
        .victorian-rotate-slow { animation: victorian-rotate 60s linear infinite; }
        .victorian-rotate-reverse { animation: victorian-rotate 45s linear infinite reverse; }
      `}</style>

      {/* Outer decorative ring — slowly rotating */}
      <div className="victorian-rotate-slow absolute" style={{ width: "96%", height: "96%" }}>
        <svg viewBox="0 0 400 500" className="w-full h-full" fill="none">
          {/* Outer oval border with notches */}
          <ellipse cx="200" cy="250" rx="196" ry="246" stroke={MT.gold} strokeWidth="1" strokeDasharray="8 4" />
          {/* Decorative dots around the oval at regular intervals */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * 2 * Math.PI;
            const x = 200 + 196 * Math.cos(angle);
            const y = 250 + 246 * Math.sin(angle);
            return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.5 : 1.5}
              fill={i % 3 === 0 ? MT.gold : `${MT.gold}88`} />;
          })}
        </svg>
      </div>

      {/* Inner rotating detail */}
      <div className="victorian-rotate-reverse absolute" style={{ width: "88%", height: "88%" }}>
        <svg viewBox="0 0 400 500" className="w-full h-full" fill="none">
          <ellipse cx="200" cy="250" rx="180" ry="230" stroke={`${MT.gold}55`} strokeWidth="1" strokeDasharray="3 6" />
        </svg>
      </div>

      {/* Main oval frame */}
      <svg
        className="victorian-outer absolute inset-0 w-full h-full"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Oval outer border — layered */}
        <ellipse cx="200" cy="250" rx="188" ry="238" stroke={MT.gold} strokeWidth="4" />
        <ellipse cx="200" cy="250" rx="180" ry="230" stroke={`${MT.gold}aa`} strokeWidth="2" />
        <ellipse cx="200" cy="250" rx="170" ry="220" stroke={`${MT.gold}55`} strokeWidth="1.5" />
        <ellipse cx="200" cy="250" rx="160" ry="210" stroke={`${MT.gold}33`} strokeWidth="1" />

        {/* Top bow ornament */}
        <g transform="translate(200, 12)" fill={MT.gold}>
          <path d="M0 0 C-30 -15 -50 -5 -40 10 C-30 20 -15 15 0 8 C15 15 30 20 40 10 C50 -5 30 -15 0 0Z" opacity="0.9" />
          <path d="M0 0 C-15 -8 -25 -2 -20 5 C-15 10 -8 8 0 4 C8 8 15 10 20 5 C25 -2 15 -8 0 0Z" fill={MT.bg} />
          <circle cx="0" cy="0" r="4" />
          <circle cx="-38" cy="10" r="3" />
          <circle cx="38" cy="10" r="3" />
        </g>

        {/* Bottom bow ornament */}
        <g transform="translate(200, 488) scale(1,-1)" fill={MT.gold}>
          <path d="M0 0 C-30 -15 -50 -5 -40 10 C-30 20 -15 15 0 8 C15 15 30 20 40 10 C50 -5 30 -15 0 0Z" opacity="0.9" />
          <path d="M0 0 C-15 -8 -25 -2 -20 5 C-15 10 -8 8 0 4 C8 8 15 10 20 5 C25 -2 15 -8 0 0Z" fill={MT.bg} />
          <circle cx="0" cy="0" r="4" />
          <circle cx="-38" cy="10" r="3" />
          <circle cx="38" cy="10" r="3" />
        </g>

        {/* Side ornaments */}
        <g transform="translate(12, 250)" fill={MT.gold}>
          <path d="M0 0 C-8 -20 -4 -35 8 -28 C15 -24 15 -12 8 -6 C15 -6 15 6 8 6 C15 12 15 24 8 28 C-4 35 -8 20 0 0Z" opacity="0.8" />
          <circle cx="0" cy="0" r="4" />
        </g>
        <g transform="translate(388, 250) scale(-1,1)" fill={MT.gold}>
          <path d="M0 0 C-8 -20 -4 -35 8 -28 C15 -24 15 -12 8 -6 C15 -6 15 6 8 6 C15 12 15 24 8 28 C-4 35 -8 20 0 0Z" opacity="0.8" />
          <circle cx="0" cy="0" r="4" />
        </g>

        {/* Quatrefoil corner accents (top) */}
        <g transform="translate(120, 60)" stroke={MT.gold} strokeWidth="1.2" fill="none">
          <circle cx="0" cy="-8" r="6" />
          <circle cx="8" cy="0" r="6" />
          <circle cx="0" cy="8" r="6" />
          <circle cx="-8" cy="0" r="6" />
          <circle cx="0" cy="0" r="3" fill={`${MT.gold}55`} />
        </g>
        <g transform="translate(280, 60)" stroke={MT.gold} strokeWidth="1.2" fill="none">
          <circle cx="0" cy="-8" r="6" />
          <circle cx="8" cy="0" r="6" />
          <circle cx="0" cy="8" r="6" />
          <circle cx="-8" cy="0" r="6" />
          <circle cx="0" cy="0" r="3" fill={`${MT.gold}55`} />
        </g>
        <g transform="translate(120, 440)" stroke={MT.gold} strokeWidth="1.2" fill="none">
          <circle cx="0" cy="-8" r="6" />
          <circle cx="8" cy="0" r="6" />
          <circle cx="0" cy="8" r="6" />
          <circle cx="-8" cy="0" r="6" />
          <circle cx="0" cy="0" r="3" fill={`${MT.gold}55`} />
        </g>
        <g transform="translate(280, 440)" stroke={MT.gold} strokeWidth="1.2" fill="none">
          <circle cx="0" cy="-8" r="6" />
          <circle cx="8" cy="0" r="6" />
          <circle cx="0" cy="8" r="6" />
          <circle cx="-8" cy="0" r="6" />
          <circle cx="0" cy="0" r="3" fill={`${MT.gold}55`} />
        </g>
      </svg>

      {/* Content area — oval clipped */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "75%",
          height: "82%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 40% 35%, ${MT.surface2} 0%, ${MT.bg} 70%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
