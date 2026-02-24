"use client";

import type { StageContentProps } from "./index";

export function CrystalOrb({ morphed, className }: StageContentProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className ?? ""}`}>
      {/* Orb container */}
      <div className="relative w-[70%] aspect-square max-w-[260px]">
        {/* Outer glow ring */}
        <div
          className="absolute inset-[-10%] rounded-full transition-all duration-1000"
          style={{
            background: morphed
              ? "radial-gradient(circle, rgba(201,169,78,0.2) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(147,130,220,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Main orb */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden border transition-all duration-700"
          style={{
            borderColor: morphed ? "rgba(201,169,78,0.4)" : "rgba(255,255,255,0.15)",
            boxShadow: morphed
              ? "0 0 60px rgba(201,169,78,0.3), inset 0 0 40px rgba(201,169,78,0.15)"
              : "0 0 40px rgba(147,130,220,0.2), inset 0 0 60px rgba(147,130,220,0.15)",
          }}
        >
          {/* State A: Frosted/misty interior */}
          <div
            className="absolute inset-0 rounded-full transition-opacity duration-700"
            style={{ opacity: morphed ? 0 : 1 }}
          >
            {/* Swirling mist layers */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-purple-800/40" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(200,180,255,0.15) 0%, transparent 50%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full backdrop-blur-md"
              style={{
                background: "radial-gradient(circle at 60% 60%, rgba(147,130,220,0.1) 0%, transparent 40%)",
              }}
            />
            {/* Inner sparkle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl opacity-60">✦</span>
            </div>
            {/* Highlight reflection */}
            <div
              className="absolute top-[15%] left-[20%] w-[30%] h-[20%] rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)",
                transform: "rotate(-30deg)",
              }}
            />
          </div>

          {/* State B: Cleared sphere with card visible */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-700"
            style={{
              opacity: morphed ? 1 : 0,
              transitionDelay: morphed ? "0.3s" : "0s",
              background: "radial-gradient(circle, rgba(15,10,30,0.6) 0%, rgba(15,10,30,0.85) 70%)",
            }}
          >
            <img
              src="/mock/cards/the-oracle.png"
              alt="The Oracle"
              className="w-[55%] h-[55%] object-cover rounded-lg"
              style={{
                filter: "brightness(1.1) contrast(1.1)",
                boxShadow: "0 0 20px rgba(201,169,78,0.3)",
              }}
            />
            {/* Prismatic edge refraction */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(255,100,150,0.08), rgba(100,200,255,0.08), rgba(200,255,100,0.08), rgba(255,200,100,0.08), rgba(255,100,150,0.08))",
              }}
            />
            {/* Highlight */}
            <div
              className="absolute top-[12%] left-[18%] w-[25%] h-[15%] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)",
                transform: "rotate(-30deg)",
              }}
            />
          </div>
        </div>

        {/* Base/stand hint */}
        <div
          className="absolute bottom-[-8%] left-[25%] w-[50%] h-[6%] rounded-b-full transition-all duration-700"
          style={{
            background: morphed
              ? "radial-gradient(ellipse, rgba(201,169,78,0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(147,130,220,0.2) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
