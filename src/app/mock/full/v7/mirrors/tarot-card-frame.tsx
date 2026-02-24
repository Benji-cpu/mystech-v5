"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function TarotCardFrameMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes tarot-glow {
          0%, 100% {
            box-shadow:
              0 0 20px ${MT.goldDim},
              0 4px 30px rgba(0,0,0,0.6),
              inset 0 0 15px rgba(0,0,0,0.5);
          }
          50% {
            box-shadow:
              0 0 40px ${MT.goldDim},
              0 4px 50px rgba(0,0,0,0.6),
              inset 0 0 20px rgba(0,0,0,0.5);
          }
        }
        @keyframes tarot-shimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.6; }
        }
        @keyframes tarot-corner-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .tarot-card { animation: tarot-glow 5s ease-in-out infinite; }
        .tarot-corner { animation: tarot-corner-pulse 5s ease-in-out infinite; }
        .tarot-shimmer { animation: tarot-shimmer 6s ease-in-out infinite; }
      `}</style>

      {/* Card outer body — 2:3 aspect ratio */}
      <div
        className="tarot-card relative overflow-hidden"
        style={{
          aspectRatio: "2/3",
          height: "min(100%, calc(100vw * 0.6))",
          maxHeight: "100%",
          background: `linear-gradient(160deg, ${MT.surface2} 0%, ${MT.surface} 40%, ${MT.surface2} 100%)`,
          borderRadius: "12px",
          border: `3px solid ${MT.gold}`,
        }}
      >
        {/* Outer border line */}
        <div
          className="absolute"
          style={{
            inset: "8px",
            border: `1px solid ${MT.gold}99`,
            borderRadius: "8px",
            pointerEvents: "none",
          }}
        />
        {/* Inner border line */}
        <div
          className="absolute"
          style={{
            inset: "14px",
            border: `1px solid ${MT.gold}44`,
            borderRadius: "6px",
            pointerEvents: "none",
          }}
        />
        {/* Innermost line */}
        <div
          className="absolute"
          style={{
            inset: "20px",
            border: `1px solid ${MT.gold}22`,
            borderRadius: "4px",
            pointerEvents: "none",
          }}
        />

        {/* SVG Corner ornaments */}
        <svg
          className="tarot-corner absolute inset-0 w-full h-full"
          viewBox="0 0 200 300"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Top-left corner ornament */}
          <g fill={MT.gold}>
            {/* Star/cross shape */}
            <path d="M22 18 L25 22 L30 22 L26 25 L28 30 L22 27 L16 30 L18 25 L14 22 L19 22 Z" opacity="0.9" />
            {/* Corner bracket lines */}
            <line x1="8" y1="8" x2="8" y2="36" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="36" y2="8" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="18" y2="8" stroke={MT.gold} strokeWidth="2.5" />
            <line x1="8" y1="8" x2="8" y2="18" stroke={MT.gold} strokeWidth="2.5" />
          </g>

          {/* Top-right corner ornament */}
          <g fill={MT.gold} transform="translate(200,0) scale(-1,1)">
            <path d="M22 18 L25 22 L30 22 L26 25 L28 30 L22 27 L16 30 L18 25 L14 22 L19 22 Z" opacity="0.9" />
            <line x1="8" y1="8" x2="8" y2="36" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="36" y2="8" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="18" y2="8" stroke={MT.gold} strokeWidth="2.5" />
            <line x1="8" y1="8" x2="8" y2="18" stroke={MT.gold} strokeWidth="2.5" />
          </g>

          {/* Bottom-left corner ornament */}
          <g fill={MT.gold} transform="translate(0,300) scale(1,-1)">
            <path d="M22 18 L25 22 L30 22 L26 25 L28 30 L22 27 L16 30 L18 25 L14 22 L19 22 Z" opacity="0.9" />
            <line x1="8" y1="8" x2="8" y2="36" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="36" y2="8" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="18" y2="8" stroke={MT.gold} strokeWidth="2.5" />
            <line x1="8" y1="8" x2="8" y2="18" stroke={MT.gold} strokeWidth="2.5" />
          </g>

          {/* Bottom-right corner ornament */}
          <g fill={MT.gold} transform="translate(200,300) scale(-1,-1)">
            <path d="M22 18 L25 22 L30 22 L26 25 L28 30 L22 27 L16 30 L18 25 L14 22 L19 22 Z" opacity="0.9" />
            <line x1="8" y1="8" x2="8" y2="36" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="36" y2="8" stroke={MT.gold} strokeWidth="1.5" />
            <line x1="8" y1="8" x2="18" y2="8" stroke={MT.gold} strokeWidth="2.5" />
            <line x1="8" y1="8" x2="8" y2="18" stroke={MT.gold} strokeWidth="2.5" />
          </g>

          {/* Top center ornament — small sun/star */}
          <g transform="translate(100, 14)" fill={MT.gold}>
            <circle cx="0" cy="0" r="4" />
            {[0,45,90,135,180,225,270,315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return <line key={i} x1={0} y1={0}
                x2={7 * Math.cos(rad)} y2={7 * Math.sin(rad)}
                stroke={MT.gold} strokeWidth={i % 2 === 0 ? "1.5" : "1"} />;
            })}
          </g>

          {/* Bottom center ornament */}
          <g transform="translate(100, 286)" fill={MT.gold}>
            <circle cx="0" cy="0" r="4" />
            {[0,45,90,135,180,225,270,315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return <line key={i} x1={0} y1={0}
                x2={7 * Math.cos(rad)} y2={7 * Math.sin(rad)}
                stroke={MT.gold} strokeWidth={i % 2 === 0 ? "1.5" : "1"} />;
            })}
          </g>

          {/* Side center ornaments */}
          <g transform="translate(14, 150)" fill={MT.gold}>
            <path d="M-4 0 L0 -6 L4 0 L0 6 Z" />
          </g>
          <g transform="translate(186, 150)" fill={MT.gold}>
            <path d="M-4 0 L0 -6 L4 0 L0 6 Z" />
          </g>

          {/* Decorative band at top and bottom */}
          <rect x="20" y="36" width="160" height="4" fill={`${MT.gold}22`} />
          <rect x="20" y="260" width="160" height="4" fill={`${MT.gold}22`} />

          {/* Dot pattern along the bands */}
          {[35,55,75,95,115,135,155].map((x) => (
            <circle key={x} cx={x} cy="38" r="1" fill={`${MT.gold}66`} />
          ))}
          {[35,55,75,95,115,135,155].map((x) => (
            <circle key={x} cx={x} cy="262" r="1" fill={`${MT.gold}66`} />
          ))}
        </svg>

        {/* Shimmer overlay */}
        <div
          className="tarot-shimmer absolute"
          style={{
            inset: 0,
            background: `linear-gradient(135deg, transparent 30%, rgba(201,169,78,0.04) 50%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Content area */}
        <div
          className="absolute z-10 overflow-hidden"
          style={{
            inset: "26px 22px",
            borderRadius: "4px",
            background: `linear-gradient(160deg, ${MT.surface}cc 0%, ${MT.bg}f0 100%)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
