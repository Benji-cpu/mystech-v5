"use client";

import { cn } from "@/lib/utils";

const glowOrbs = [
  { size: 300, x: "20%", y: "30%", delay: "0s", duration: "8s" },
  { size: 200, x: "70%", y: "60%", delay: "3s", duration: "10s" },
  { size: 250, x: "50%", y: "20%", delay: "6s", duration: "12s" },
];

export function HeroBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Breathing radial gradient */}
      <div className="absolute inset-0 animate-hero-breathe" />

      {/* Gold glow orbs */}
      {glowOrbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-glow-pulse"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(201,169,78,0.08) 0%, transparent 70%)",
            animationDelay: orb.delay,
            animationDuration: orb.duration,
          }}
        />
      ))}

      {/* Subtle star dots */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[1px] bg-white/30 rounded-full animate-star-twinkle"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
