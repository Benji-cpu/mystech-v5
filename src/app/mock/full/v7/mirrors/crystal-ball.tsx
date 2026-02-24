"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function CrystalBallMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex flex-col items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes crystal-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes crystal-inner {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes crystal-aura {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes crystal-shimmer {
          0% { transform: translateX(-100%) rotate(-20deg); }
          100% { transform: translateX(300%) rotate(-20deg); }
        }
        @keyframes crystal-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes crystal-stand-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .crystal-outer { animation: crystal-pulse 4s ease-in-out infinite; }
        .crystal-aura { animation: crystal-aura 4s ease-in-out infinite; }
        .crystal-float { animation: crystal-float 5s ease-in-out infinite; }
        .crystal-shimmer {
          animation: crystal-shimmer 5s ease-in-out infinite;
        }
        .crystal-stand { animation: crystal-stand-glow 4s ease-in-out infinite; }
      `}</style>

      {/* Outer aura glow */}
      <div
        className="crystal-aura absolute"
        style={{
          width: "82%",
          paddingBottom: "82%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${MT.goldDim} 0%, transparent 70%)`,
          top: "5%",
          left: "9%",
        }}
      />

      {/* Crystal ball */}
      <div
        className="crystal-float relative"
        style={{ width: "78%", aspectRatio: "1", marginBottom: "2%" }}
      >
        {/* Outer glow ring */}
        <div
          className="crystal-outer absolute inset-0"
          style={{
            borderRadius: "50%",
            boxShadow: `0 0 30px ${MT.goldDim}, 0 0 60px rgba(139,92,246,0.2)`,
          }}
        />

        {/* Main sphere */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%,
              rgba(220,210,255,0.15) 0%,
              rgba(160,140,220,0.08) 20%,
              rgba(80,60,160,0.12) 45%,
              ${MT.surface2} 70%,
              ${MT.bg} 100%
            )`,
            border: `2px solid ${MT.gold}66`,
            overflow: "hidden",
          }}
        >
          {/* Refraction highlight — halved opacity */}
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "18%",
              width: "28%",
              height: "18%",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              transform: "rotate(-20deg)",
              filter: "blur(4px)",
              zIndex: 2,
            }}
          />

          {/* Secondary shimmer spot — halved opacity */}
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "28%",
              width: "14%",
              height: "8%",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              transform: "rotate(-15deg)",
              filter: "blur(2px)",
              zIndex: 2,
            }}
          />

          {/* Moving shimmer band */}
          <div
            className="crystal-shimmer"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "30%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
              zIndex: 2,
            }}
          />

          {/* Inner depth gradient — much more transparent, edge-only vignette */}
          <div
            style={{
              position: "absolute",
              inset: "2%",
              borderRadius: "50%",
              background: `radial-gradient(circle at 45% 40%, ${MT.surface}22 0%, ${MT.bg}44 100%)`,
              zIndex: 1,
            }}
          />

          {/* Subtle inner glow — makes the ball feel alive */}
          <div
            style={{
              position: "absolute",
              inset: "10%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
              zIndex: 1,
            }}
          />

          {/* Content inside the ball — z-index 5 to render above decorative layers */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: "6%", zIndex: 5 }}>
            <div className="w-full h-full overflow-hidden" style={{ borderRadius: "50%" }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Stand */}
      <div className="crystal-stand relative flex flex-col items-center" style={{ width: "60%", marginTop: "-1%" }}>
        <svg viewBox="0 0 240 80" className="w-full" fill="none">
          {/* Neck */}
          <path
            d="M105 0 C105 0 98 15 90 30 L150 30 C142 15 135 0 135 0 Z"
            fill={`linear-gradient(180deg, ${MT.surface2}, ${MT.surface})`}
            stroke={MT.gold}
            strokeWidth="1.5"
            style={{ fill: MT.surface2 }}
          />
          {/* Neck highlight */}
          <path
            d="M112 0 C110 10 107 20 104 30"
            stroke={`${MT.gold}44`} strokeWidth="1" fill="none"
          />

          {/* Base platform */}
          <path
            d="M70 30 L170 30 L190 55 L50 55 Z"
            fill={MT.surface}
            stroke={MT.gold}
            strokeWidth="1.5"
          />
          {/* Base bottom */}
          <ellipse cx="120" cy="57" rx="72" ry="8"
            fill={MT.surface2}
            stroke={MT.gold}
            strokeWidth="1.5"
          />
          {/* Base glow line */}
          <path d="M50 55 L190 55" stroke={`${MT.gold}88`} strokeWidth="1" />
          {/* Base ornament dots */}
          <circle cx="80" cy="43" r="2.5" fill={MT.gold} opacity="0.7" />
          <circle cx="120" cy="40" r="3" fill={MT.gold} />
          <circle cx="160" cy="43" r="2.5" fill={MT.gold} opacity="0.7" />

          {/* Glow under base */}
          <ellipse cx="120" cy="65" rx="60" ry="6"
            fill={MT.goldDim}
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}
