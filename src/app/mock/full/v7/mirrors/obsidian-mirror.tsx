"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

// Irregular obsidian shard polygon — jagged, asymmetric
const SHARD_CLIP = "polygon(18% 0%, 72% 2%, 88% 6%, 98% 22%, 100% 48%, 96% 78%, 88% 92%, 72% 100%, 38% 98%, 12% 90%, 2% 72%, 0% 44%, 4% 18%)";
const CONTENT_CLIP = "polygon(21% 3%, 70% 5%, 86% 9%, 95% 24%, 97% 49%, 93% 76%, 85% 89%, 70% 97%, 40% 95%, 15% 88%, 5% 71%, 3% 45%, 7% 21%)";

export function ObsidianMirrorMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes obsidian-sheen {
          0% { opacity: 0; transform: translateX(-80%) translateY(-20%) rotate(-30deg); }
          20% { opacity: 0.4; }
          40% { opacity: 0; transform: translateX(200%) translateY(80%) rotate(-30deg); }
          100% { opacity: 0; transform: translateX(200%) translateY(80%) rotate(-30deg); }
        }
        @keyframes obsidian-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(80,40,120,0.4)) drop-shadow(0 0 2px ${MT.gold}22);
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(120,60,200,0.5)) drop-shadow(0 0 6px ${MT.gold}44);
          }
        }
        @keyframes obsidian-facet {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.12; }
        }
        .obsidian-sheen { animation: obsidian-sheen 8s ease-in-out infinite; }
        .obsidian-sheen-2 { animation: obsidian-sheen 8s ease-in-out infinite; animation-delay: 4s; }
        .obsidian-glow { animation: obsidian-glow 5s ease-in-out infinite; }
        .obsidian-facet { animation: obsidian-facet 6s ease-in-out infinite; }
        .obsidian-facet-2 { animation: obsidian-facet 4s ease-in-out infinite; animation-delay: 2s; }
      `}</style>

      {/* Outer shard shape with glow */}
      <div
        className="obsidian-glow absolute"
        style={{
          width: "90%",
          height: "90%",
          clipPath: SHARD_CLIP,
          background: `
            linear-gradient(
              135deg,
              rgba(60,30,100,0.9) 0%,
              rgba(20,10,40,0.95) 30%,
              rgba(8,4,20,1) 60%,
              rgba(30,15,60,0.9) 100%
            )
          `,
        }}
      />

      {/* Gold edge trim — slightly smaller */}
      <div
        className="absolute"
        style={{
          width: "90%",
          height: "90%",
          clipPath: SHARD_CLIP,
          background: "transparent",
          boxShadow: `inset 0 0 0 2px ${MT.gold}`,
          // We'll use SVG for precise edge
        }}
      />

      {/* SVG for precise edge lines */}
      <svg
        className="absolute"
        style={{ width: "90%", height: "90%" }}
        viewBox="0 0 400 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gold edge */}
        <path
          d="M72 0 L288 8.8 L352 26.4 L392 96.8 L400 211.2 L384 343.2 L352 404.8 L288 440 L152 430.6 L48 396.4 L8 316.8 L0 193.6 L16 79.2 Z"
          stroke={MT.gold}
          strokeWidth="2"
          fill="none"
        />
        {/* Inner edge */}
        <path
          d="M84 10 L280 18 L344 34 L382 102 L390 218 L374 338 L344 396 L280 430 L160 422 L58 390 L18 314 L10 200 L26 88 Z"
          stroke={`${MT.gold}55`}
          strokeWidth="1"
          fill="none"
        />

        {/* Fracture line details — natural obsidian cleavage */}
        <line x1="72" y1="0" x2="120" y2="160" stroke={`${MT.gold}22`} strokeWidth="1" />
        <line x1="352" y1="26" x2="300" y2="200" stroke={`${MT.gold}18`} strokeWidth="0.8" />
        <line x1="352" y1="405" x2="280" y2="240" stroke={`${MT.gold}15`} strokeWidth="0.8" />
        <line x1="48" y1="396" x2="140" y2="240" stroke={`${MT.gold}15`} strokeWidth="0.8" />

        {/* Edge highlight — top-left catchlight */}
        <path
          d="M72 0 L288 8.8 L352 26.4"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
        />
        {/* Edge shadow — bottom */}
        <path
          d="M48 396.4 L8 316.8"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="2"
        />
      </svg>

      {/* Surface facet reflections */}
      <div
        className="obsidian-facet absolute overflow-hidden"
        style={{ width: "90%", height: "90%", clipPath: SHARD_CLIP }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: "40%",
            height: "25%",
            background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)`,
            transform: "rotate(-10deg)",
            borderRadius: "30%",
          }}
        />
      </div>

      {/* Moving sheen — sweep across surface */}
      <div
        className="absolute overflow-hidden"
        style={{ width: "90%", height: "90%", clipPath: SHARD_CLIP }}
      >
        <div
          className="obsidian-sheen"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "35%",
            height: "120%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), rgba(200,180,255,0.04), transparent)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="obsidian-sheen-2"
          style={{
            position: "absolute",
            top: "-10%",
            left: 0,
            width: "20%",
            height: "130%",
            background: "linear-gradient(90deg, transparent, rgba(201,169,78,0.05), transparent)",
            filter: "blur(4px)",
          }}
        />
      </div>

      {/* Content area */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "80%",
          height: "80%",
          clipPath: CONTENT_CLIP,
          background: `
            radial-gradient(ellipse at 35% 30%,
              rgba(60,30,100,0.3) 0%,
              ${MT.surface}88 40%,
              ${MT.bg}f5 100%
            )
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
}
