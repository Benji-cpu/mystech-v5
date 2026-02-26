"use client";

import { useEffect, useRef, useState } from "react";
import type { TechniqueProps } from "../types";

/**
 * Technique: Clip-Path Sculpt
 * clip-path: polygon() vertex animation. Diamond shape expands to full rect.
 *
 * stageTransition: collapse to zero-area polygon → call onMidpoint → expand back
 * morphed toggle: diamond ↔ full rect via clip-path
 */
export function ClipPathSculpt({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const midTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevStageKeyRef = useRef<string | null>(null);
  const [clipState, setClipState] = useState<"normal" | "collapsed" | "expanding">("normal");

  const clipDiamond = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  const clipFull = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const clipCollapsed = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";

  // Handle stageTransition
  useEffect(() => {
    if (!stageTransition) {
      prevStageKeyRef.current = null;
      return;
    }
    if (stageTransition.key === prevStageKeyRef.current) return;
    prevStageKeyRef.current = stageTransition.key;

    setClipState("collapsed");

    midTimerRef.current = setTimeout(() => {
      stageTransition.onMidpoint();
      setClipState("expanding");

      timerRef.current = setTimeout(() => {
        setClipState("normal");
        onMorphComplete?.();
      }, 700);
    }, 500);

    return () => {
      clearTimeout(midTimerRef.current);
      clearTimeout(timerRef.current);
    };
  }, [stageTransition?.key]);

  // Handle morphed toggle
  useEffect(() => {
    if (stageTransition) return;

    timerRef.current = setTimeout(() => onMorphComplete?.(), 800);
    return () => clearTimeout(timerRef.current);
  }, [morphed, onMorphComplete]);

  const getClipPath = () => {
    if (clipState === "collapsed") return clipCollapsed;
    if (clipState === "expanding") return morphed ? clipFull : clipDiamond;
    return morphed ? clipFull : clipDiamond;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 max-w-[280px] h-[85%] relative">
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            clipPath: getClipPath(),
            transition: "clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
