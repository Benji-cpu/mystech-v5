"use client";

import { useEffect, useRef } from "react";
import type { TechniqueProps } from "../types";

/**
 * Technique 9: Perspective Fold
 * 4 triangular flaps fold inward along diagonal creases (preserve-3d,
 * transform-origin at corners). Origami envelope open/close with
 * real perspective depth.
 */
export function PerspectiveFold({ morphed, onMorphComplete, children }: TechniqueProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => onMorphComplete?.(), 1000);
    return () => clearTimeout(timerRef.current);
  }, [morphed, onMorphComplete]);

  const flapTransition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: "800px" }}>
      <div
        className="w-4/5 max-w-[280px] h-[85%] relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Base card (revealed when flaps open) */}
        {children ? (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            {children}
          </div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[rgba(30,20,50,0.95)] to-[rgba(15,10,30,0.98)] rounded-2xl border border-[#c9a94e]/50"
            style={{ boxShadow: "0 0 40px rgba(201,169,78,0.35)" }}
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
        )}

        {/* Top flap */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 50% 50%)",
            transformOrigin: "50% 0%",
            transform: morphed ? "rotateX(180deg)" : "rotateX(0deg)",
            transition: flapTransition,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl flex items-start justify-center pt-8">
            <span className="text-2xl">✦</span>
          </div>
        </div>

        {/* Bottom flap */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(0% 100%, 50% 50%, 100% 100%)",
            transformOrigin: "50% 100%",
            transform: morphed ? "rotateX(-180deg)" : "rotateX(0deg)",
            transition: flapTransition,
            transitionDelay: morphed ? "0.1s" : "0.05s",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl flex items-end justify-center pb-6">
            <div className="w-3/4 h-8 rounded-full bg-white/15 border border-white/20" />
          </div>
        </div>

        {/* Left flap */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(0% 0%, 50% 50%, 0% 100%)",
            transformOrigin: "0% 50%",
            transform: morphed ? "rotateY(-180deg)" : "rotateY(0deg)",
            transition: flapTransition,
            transitionDelay: morphed ? "0.05s" : "0.1s",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-full h-full bg-white/12 backdrop-blur-xl border border-white/15 rounded-2xl" />
        </div>

        {/* Right flap */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(100% 0%, 100% 100%, 50% 50%)",
            transformOrigin: "100% 50%",
            transform: morphed ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: flapTransition,
            transitionDelay: morphed ? "0.15s" : "0s",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-full h-full bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl flex items-center justify-end pr-6">
            <p className="text-white/60 text-sm rotate-90">Oracle</p>
          </div>
        </div>
      </div>
    </div>
  );
}
