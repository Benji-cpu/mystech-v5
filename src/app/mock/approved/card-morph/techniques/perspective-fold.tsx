"use client";

import { useEffect, useRef, useState } from "react";
import type { TechniqueProps } from "../types";

/**
 * Technique: Perspective Fold
 * 4 triangular flaps fold inward along diagonal creases (preserve-3d).
 *
 * stageTransition: fold all flaps closed → call onMidpoint → unfold
 * morphed toggle: flaps open/close
 */
export function PerspectiveFold({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const midTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevStageKeyRef = useRef<string | null>(null);
  const [foldOverride, setFoldOverride] = useState<"closed" | "open" | null>(null);

  const flapTransition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

  // Handle stageTransition
  useEffect(() => {
    if (!stageTransition) {
      prevStageKeyRef.current = null;
      return;
    }
    if (stageTransition.key === prevStageKeyRef.current) return;
    prevStageKeyRef.current = stageTransition.key;

    setFoldOverride("closed");

    midTimerRef.current = setTimeout(() => {
      stageTransition.onMidpoint();

      requestAnimationFrame(() => {
        setFoldOverride("open");

        timerRef.current = setTimeout(() => {
          setFoldOverride(null);
          onMorphComplete?.();
        }, 700);
      });
    }, 650);

    return () => {
      clearTimeout(midTimerRef.current);
      clearTimeout(timerRef.current);
    };
  }, [stageTransition?.key]);

  // Handle morphed toggle
  useEffect(() => {
    if (stageTransition) return;

    timerRef.current = setTimeout(() => onMorphComplete?.(), 1000);
    return () => clearTimeout(timerRef.current);
  }, [morphed, onMorphComplete]);

  const flapsOpen = foldOverride === "open" || (foldOverride === null && morphed);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: "800px" }}>
      <div
        className="w-4/5 max-w-[280px] h-[85%] relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Base card (revealed when flaps open) */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {children}
        </div>

        {/* Top flap */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 50% 50%)",
            transformOrigin: "50% 0%",
            transform: flapsOpen ? "rotateX(180deg)" : "rotateX(0deg)",
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
            transform: flapsOpen ? "rotateX(-180deg)" : "rotateX(0deg)",
            transition: flapTransition,
            transitionDelay: flapsOpen ? "0.1s" : "0.05s",
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
            transform: flapsOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
            transition: flapTransition,
            transitionDelay: flapsOpen ? "0.05s" : "0.1s",
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
            transform: flapsOpen ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: flapTransition,
            transitionDelay: flapsOpen ? "0.15s" : "0s",
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
