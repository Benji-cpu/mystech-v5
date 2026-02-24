"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function ArtDecoMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes deco-shimmer {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .deco-frame { animation: deco-shimmer 3s ease-in-out infinite; }
      `}</style>

      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${MT.surface} 0%, ${MT.bg} 50%, ${MT.surface} 100%)`,
        }}
      />

      {/* SVG Art Deco Frame */}
      <svg
        className="deco-frame absolute inset-0 w-full h-full"
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chamfered outer rectangle */}
        <path
          d="M30 8 L370 8 L392 30 L392 470 L370 492 L30 492 L8 470 L8 30 Z"
          stroke={MT.gold} strokeWidth="2.5" fill="none"
        />
        {/* Inner rectangle */}
        <path
          d="M42 20 L358 20 L380 42 L380 458 L358 480 L42 480 L20 458 L20 42 Z"
          stroke={`${MT.gold}88`} strokeWidth="1" fill="none"
        />
        {/* Inner content border */}
        <path
          d="M54 32 L346 32 L368 54 L368 446 L346 468 L54 468 L32 446 L32 54 Z"
          stroke={`${MT.gold}44`} strokeWidth="1" fill="none"
        />

        {/* Top fan motif */}
        <g transform="translate(200, 8)" fill={MT.gold}>
          {/* Fan lines radiating up */}
          {[-40,-28,-16,-4,4,16,28,40].map((x, i) => (
            <line key={i} x1={x * 0.3} y1="0" x2={x} y2="-18"
              stroke={MT.gold} strokeWidth="1.5" opacity={0.7 + (i % 2) * 0.3} />
          ))}
          {/* Fan arc */}
          <path d="M-42 -18 A42 18 0 0 1 42 -18" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="0" cy="-20" r="4" />
          <rect x="-42" y="-3" width="84" height="3" fill={`${MT.gold}55`} />
        </g>

        {/* Bottom fan motif (inverted) */}
        <g transform="translate(200, 492)" fill={MT.gold}>
          {[-40,-28,-16,-4,4,16,28,40].map((x, i) => (
            <line key={i} x1={x * 0.3} y1="0" x2={x} y2="18"
              stroke={MT.gold} strokeWidth="1.5" opacity={0.7 + (i % 2) * 0.3} />
          ))}
          <path d="M-42 18 A42 18 0 0 0 42 18" stroke={MT.gold} strokeWidth="2" fill="none" />
          <circle cx="0" cy="20" r="4" />
          <rect x="-42" y="0" width="84" height="3" fill={`${MT.gold}55`} />
        </g>

        {/* Left fan motif */}
        <g transform="translate(8, 250) rotate(-90)">
          {[-30,-20,-10,0,10,20,30].map((x, i) => (
            <line key={i} x1={x * 0.3} y1="0" x2={x} y2="-14"
              stroke={MT.gold} strokeWidth="1.2" opacity={0.7} />
          ))}
          <path d="M-32 -14 A32 14 0 0 1 32 -14" stroke={MT.gold} strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="-16" r="3" fill={MT.gold} />
        </g>

        {/* Right fan motif */}
        <g transform="translate(392, 250) rotate(90)">
          {[-30,-20,-10,0,10,20,30].map((x, i) => (
            <line key={i} x1={x * 0.3} y1="0" x2={x} y2="-14"
              stroke={MT.gold} strokeWidth="1.2" opacity={0.7} />
          ))}
          <path d="M-32 -14 A32 14 0 0 1 32 -14" stroke={MT.gold} strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="-16" r="3" fill={MT.gold} />
        </g>

        {/* Corner geometric stepped detail — top left */}
        <g stroke={MT.gold} fill="none" strokeWidth="1">
          <line x1="8" y1="60" x2="30" y2="60" />
          <line x1="8" y1="80" x2="24" y2="80" />
          <line x1="8" y1="100" x2="18" y2="100" />
          <line x1="60" y1="8" x2="60" y2="30" />
          <line x1="80" y1="8" x2="80" y2="24" />
          <line x1="100" y1="8" x2="100" y2="18" />
        </g>

        {/* Corner — top right */}
        <g stroke={MT.gold} fill="none" strokeWidth="1">
          <line x1="392" y1="60" x2="370" y2="60" />
          <line x1="392" y1="80" x2="376" y2="80" />
          <line x1="392" y1="100" x2="382" y2="100" />
          <line x1="340" y1="8" x2="340" y2="30" />
          <line x1="320" y1="8" x2="320" y2="24" />
          <line x1="300" y1="8" x2="300" y2="18" />
        </g>

        {/* Corner — bottom left */}
        <g stroke={MT.gold} fill="none" strokeWidth="1">
          <line x1="8" y1="440" x2="30" y2="440" />
          <line x1="8" y1="420" x2="24" y2="420" />
          <line x1="8" y1="400" x2="18" y2="400" />
          <line x1="60" y1="492" x2="60" y2="470" />
          <line x1="80" y1="492" x2="80" y2="476" />
          <line x1="100" y1="492" x2="100" y2="482" />
        </g>

        {/* Corner — bottom right */}
        <g stroke={MT.gold} fill="none" strokeWidth="1">
          <line x1="392" y1="440" x2="370" y2="440" />
          <line x1="392" y1="420" x2="376" y2="420" />
          <line x1="392" y1="400" x2="382" y2="400" />
          <line x1="340" y1="492" x2="340" y2="470" />
          <line x1="320" y1="492" x2="320" y2="476" />
          <line x1="300" y1="492" x2="300" y2="482" />
        </g>

        {/* Horizontal accent lines */}
        <line x1="32" y1="250" x2="50" y2="250" stroke={MT.gold} strokeWidth="2" />
        <line x1="350" y1="250" x2="368" y2="250" stroke={MT.gold} strokeWidth="2" />
        <circle cx="32" cy="250" r="3" fill={MT.gold} />
        <circle cx="368" cy="250" r="3" fill={MT.gold} />
      </svg>

      {/* Content area */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "calc(100% - 80px)",
          height: "calc(100% - 80px)",
          clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)",
          background: `linear-gradient(135deg, ${MT.surface2} 0%, ${MT.bg} 100%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
