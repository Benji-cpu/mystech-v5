"use client";

import { useEffect, useRef } from "react";
import type { TechniqueProps } from "../types";

/**
 * Technique 5: Clip-Path Sculpt
 * clip-path: polygon() vertex animation. Diamond shape expands to full rect.
 * Browser-native CSS interpolation creates trapezoid/pentagon intermediates.
 * Zero JS animation runtime.
 */
export function ClipPathSculpt({ morphed, onMorphComplete, children }: TechniqueProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => onMorphComplete?.(), 800);
    return () => clearTimeout(timerRef.current);
  }, [morphed, onMorphComplete]);

  // Diamond → Full rect
  const clipA = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  const clipB = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 max-w-[280px] h-[85%] relative">
        {children ? (
          // Children path: single container with clip-path animation;
          // children handle their own State A/B transition via morphed prop.
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              clipPath: morphed ? clipB : clipA,
              transition: "clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {children}
          </div>
        ) : (
          <>
            {/* State A: Form (diamond clipped) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl"
              style={{
                clipPath: morphed ? clipB : clipA,
                transition: "clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: morphed ? 0 : 1,
                transitionProperty: "clip-path, opacity",
                transitionDuration: "0.7s, 0.3s",
                transitionDelay: morphed ? "0s, 0.5s" : "0s, 0s",
              }}
            >
              <span className="text-4xl">✦</span>
              <p className="text-white/80 font-medium text-sm">Ask the Oracle</p>
              <div className="w-3/4 h-8 rounded-full bg-white/15 border border-white/20" />
            </div>

            {/* State B: Card (rect expanding from diamond) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[rgba(30,20,50,0.9)] to-[rgba(15,10,30,0.95)] border border-[#c9a94e]/50 rounded-2xl overflow-hidden"
              style={{
                clipPath: morphed ? clipB : clipA,
                transition: "clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: morphed ? 1 : 0,
                transitionProperty: "clip-path, opacity",
                transitionDuration: "0.7s, 0.3s",
                transitionDelay: morphed ? "0s, 0s" : "0s, 0.5s",
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
          </>
        )}
      </div>
    </div>
  );
}
