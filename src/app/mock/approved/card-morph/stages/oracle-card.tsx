"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Oracle Card
 * State A: Glass panel with "Ask the Oracle" prompt, sparkle icon, input bar
 * State B: Dark card with gold borders, oracle image, "THE ORACLE" title
 */
export function OracleCard({ morphed, className }: StageContentProps) {
  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      {/* State A: Form */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl transition-opacity duration-300"
        style={{ opacity: morphed ? 0 : 1 }}
      >
        <span className="text-4xl">✦</span>
        <p className="text-white/80 font-medium text-sm">Ask the Oracle</p>
        <div className="w-3/4 h-8 rounded-full bg-white/15 border border-white/20" />
      </div>

      {/* State B: Card */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[rgba(30,20,50,0.9)] to-[rgba(15,10,30,0.95)] border border-[#c9a94e]/50 rounded-2xl overflow-hidden transition-opacity duration-300"
        style={{
          opacity: morphed ? 1 : 0,
          transitionDelay: morphed ? "0.2s" : "0s",
          boxShadow: "0 0 40px rgba(201,169,78,0.35)",
        }}
      >
        <div className="absolute inset-3 border border-[#c9a94e]/40 rounded-xl pointer-events-none" />
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#c9a94e]/60" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#c9a94e]/60" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#c9a94e]/60" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#c9a94e]/60" />
        <img
          src="/mock/cards/the-oracle.png"
          alt="The Oracle"
          className="w-28 h-28 object-cover rounded-lg"
        />
        <p className="text-[#c9a94e] font-semibold text-base tracking-wider">
          THE ORACLE
        </p>
      </div>
    </div>
  );
}
