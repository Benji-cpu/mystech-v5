"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function ScryingPoolMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes pool-ripple-1 {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.0); opacity: 0; }
        }
        @keyframes pool-ripple-2 {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(1.0); opacity: 0; }
        }
        @keyframes pool-ripple-3 {
          0% { transform: scale(0.4); opacity: 0.5; }
          100% { transform: scale(1.0); opacity: 0; }
        }
        @keyframes pool-shimmer {
          0% { transform: rotate(0deg); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: rotate(360deg); opacity: 0.3; }
        }
        @keyframes pool-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes water-drift {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.2; }
          33% { transform: translateX(4px) translateY(-3px); opacity: 0.4; }
          66% { transform: translateX(-3px) translateY(2px); opacity: 0.3; }
        }
        .pool-ripple-1 {
          animation: pool-ripple-1 3s ease-out infinite;
          animation-delay: 0s;
        }
        .pool-ripple-2 {
          animation: pool-ripple-2 3s ease-out infinite;
          animation-delay: 1s;
        }
        .pool-ripple-3 {
          animation: pool-ripple-3 3s ease-out infinite;
          animation-delay: 2s;
        }
        .pool-shimmer { animation: pool-shimmer 12s linear infinite; }
        .pool-glow { animation: pool-glow 4s ease-in-out infinite; }
        .water-drift { animation: water-drift 7s ease-in-out infinite; }
      `}</style>

      {/* Outer stone rim glow */}
      <div
        className="pool-glow absolute"
        style={{
          width: "90%",
          aspectRatio: "1",
          borderRadius: "50%",
          boxShadow: `0 0 40px ${MT.goldDim}, 0 0 80px rgba(139,92,246,0.15)`,
        }}
      />

      {/* Ripple rings */}
      {["pool-ripple-1", "pool-ripple-2", "pool-ripple-3"].map((cls) => (
        <div
          key={cls}
          className={`${cls} absolute`}
          style={{
            width: "88%",
            aspectRatio: "1",
            borderRadius: "50%",
            border: `1px solid ${MT.gold}`,
          }}
        />
      ))}

      {/* Stone rim outer */}
      <div
        className="absolute"
        style={{
          width: "88%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: `radial-gradient(circle, transparent 82%, ${MT.surface2} 85%, ${MT.border} 90%, ${MT.surface2} 94%, ${MT.gold}33 96%, transparent 100%)`,
        }}
      />

      {/* Gold ring border */}
      <div
        className="absolute"
        style={{
          width: "88%",
          aspectRatio: "1",
          borderRadius: "50%",
          border: `3px solid ${MT.gold}`,
          boxSizing: "border-box",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "82%",
          aspectRatio: "1",
          borderRadius: "50%",
          border: `1.5px solid ${MT.gold}66`,
          boxSizing: "border-box",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "78%",
          aspectRatio: "1",
          borderRadius: "50%",
          border: `1px solid ${MT.gold}33`,
          boxSizing: "border-box",
        }}
      />

      {/* Cardinal point ornaments on the rim */}
      {[0, 90, 180, 270].map((deg) => (
        <div
          key={deg}
          className="absolute"
          style={{
            width: "88%",
            aspectRatio: "1",
            borderRadius: "50%",
            transform: `rotate(${deg}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "12px",
              height: "12px",
              background: MT.gold,
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            }}
          />
        </div>
      ))}

      {/* Slow rotating shimmer on water surface */}
      <div
        className="pool-shimmer absolute overflow-hidden"
        style={{
          width: "76%",
          aspectRatio: "1",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-20%",
            width: "60%",
            height: "30%",
            background: `linear-gradient(90deg, transparent, rgba(201,169,78,0.08), transparent)`,
            borderRadius: "50%",
            transform: "rotate(-30deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-10%",
            width: "40%",
            height: "20%",
            background: `linear-gradient(90deg, transparent, rgba(201,169,78,0.06), transparent)`,
            borderRadius: "50%",
            transform: "rotate(15deg)",
          }}
        />
      </div>

      {/* Water surface sheen */}
      <div
        className="water-drift absolute overflow-hidden"
        style={{
          width: "76%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 30% 25%, rgba(180,160,255,0.08) 0%, transparent 60%)`,
        }}
      />

      {/* The pool — dark reflective surface with content */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "76%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 30%,
            rgba(80,60,120,0.3) 0%,
            ${MT.surface}88 30%,
            ${MT.bg}ee 70%,
            ${MT.bg} 100%
          )`,
        }}
      >
        {/* Inner ripple lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 300"
          fill="none"
          opacity="0.2"
        >
          <ellipse cx="150" cy="150" rx="80" ry="20" stroke={MT.gold} strokeWidth="0.5" />
          <ellipse cx="150" cy="150" rx="120" ry="35" stroke={MT.gold} strokeWidth="0.5" />
          <ellipse cx="148" cy="148" rx="55" ry="14" stroke={MT.gold} strokeWidth="0.5" />
        </svg>
        {children}
      </div>
    </div>
  );
}
