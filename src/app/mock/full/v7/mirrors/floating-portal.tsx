"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

const NUM_PARTICLES = 24;

export function FloatingPortalMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes portal-rotate-outer {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes portal-rotate-inner {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes portal-particle {
          0% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes portal-energy {
          0%, 100% {
            box-shadow:
              0 0 20px rgba(139,92,246,0.4),
              0 0 40px rgba(139,92,246,0.2),
              inset 0 0 30px rgba(139,92,246,0.1);
          }
          50% {
            box-shadow:
              0 0 35px rgba(201,169,78,0.5),
              0 0 70px rgba(201,169,78,0.2),
              inset 0 0 40px rgba(201,169,78,0.08);
          }
        }
        @keyframes portal-inner-glow {
          0%, 100% {
            background: radial-gradient(circle, rgba(80,40,140,0.4) 0%, ${MT.surface}cc 40%, ${MT.bg} 100%);
          }
          50% {
            background: radial-gradient(circle, rgba(120,60,180,0.5) 0%, ${MT.surface}cc 40%, ${MT.bg} 100%);
          }
        }
        @keyframes portal-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }
        .portal-outer-ring { animation: portal-rotate-outer 12s linear infinite; }
        .portal-middle-ring { animation: portal-rotate-inner 8s linear infinite; }
        .portal-inner-ring { animation: portal-rotate-outer 20s linear infinite; }
        .portal-energy { animation: portal-energy 3s ease-in-out infinite; }
        .portal-glow { animation: portal-inner-glow 3s ease-in-out infinite; }
        .portal-float { animation: portal-float 6s ease-in-out infinite; }
      `}</style>

      {/* Floating wrapper */}
      <div className="portal-float relative" style={{ width: "85%", aspectRatio: "1" }}>

        {/* Outer particle ring */}
        <div className="portal-outer-ring absolute inset-0">
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            {Array.from({ length: NUM_PARTICLES }).map((_, i) => {
              const angle = (i / NUM_PARTICLES) * 2 * Math.PI;
              const r = 190;
              const x = 200 + r * Math.cos(angle);
              const y = 200 + r * Math.sin(angle);
              const size = i % 3 === 0 ? 4 : i % 3 === 1 ? 2.5 : 1.5;
              const opacity = i % 3 === 0 ? 1 : 0.6;
              return (
                <circle key={i} cx={x} cy={y} r={size}
                  fill={i % 4 === 0 ? MT.gold : `rgba(139,92,246,0.8)`}
                  opacity={opacity}
                />
              );
            })}
            <circle cx="200" cy="200" r="192" stroke={`${MT.gold}33`} strokeWidth="0.5" strokeDasharray="2 6" />
          </svg>
        </div>

        {/* Middle ring — energy flow */}
        <div className="portal-middle-ring absolute" style={{ inset: "6%" }}>
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            {/* Dashed arc ring */}
            <circle cx="200" cy="200" r="195"
              stroke={MT.gold}
              strokeWidth="2"
              strokeDasharray="12 6"
              fill="none"
            />
            <circle cx="200" cy="200" r="188"
              stroke={`rgba(139,92,246,0.6)`}
              strokeWidth="1.5"
              strokeDasharray="6 12"
              fill="none"
            />
            {/* Energy bolts */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 2 * Math.PI;
              const x1 = 200 + 180 * Math.cos(angle);
              const y1 = 200 + 180 * Math.sin(angle);
              const x2 = 200 + 200 * Math.cos(angle + 0.1);
              const y2 = 200 + 200 * Math.sin(angle + 0.1);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={MT.gold} strokeWidth="2" opacity="0.8" />;
            })}
          </svg>
        </div>

        {/* Inner ring */}
        <div className="portal-inner-ring absolute" style={{ inset: "12%" }}>
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            <circle cx="200" cy="200" r="194"
              stroke={`rgba(139,92,246,0.8)`}
              strokeWidth="3"
              fill="none"
            />
            <circle cx="200" cy="200" r="186"
              stroke={`${MT.gold}66`}
              strokeWidth="1"
              fill="none"
            />
            {/* Small diamond nodes at cardinal points */}
            {[0, 90, 180, 270].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x = 200 + 192 * Math.cos(rad);
              const y = 200 + 192 * Math.sin(rad);
              return (
                <g key={deg} transform={`translate(${x},${y}) rotate(${deg + 45})`}>
                  <rect x="-5" y="-5" width="10" height="10"
                    fill={MT.gold} transform="rotate(45)" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Energy glow ring */}
        <div
          className="portal-energy absolute"
          style={{
            inset: "18%",
            borderRadius: "50%",
          }}
        />

        {/* Portal void + content */}
        <div
          className="portal-glow absolute overflow-hidden"
          style={{
            inset: "18%",
            borderRadius: "50%",
            border: `2px solid ${MT.gold}88`,
          }}
        >
          {/* Portal center swirl */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 200 200"
            fill="none"
          >
            {[20, 40, 60, 80].map((r) => (
              <circle key={r} cx="100" cy="100" r={r}
                stroke="rgba(139,92,246,0.6)" strokeWidth="0.5" />
            ))}
            <path d="M100 20 Q140 60 120 100 Q100 140 60 120 Q20 100 40 60 Q60 20 100 20"
              stroke={`${MT.gold}88`} strokeWidth="0.8" fill="none" />
          </svg>
          {children}
        </div>
      </div>
    </div>
  );
}
