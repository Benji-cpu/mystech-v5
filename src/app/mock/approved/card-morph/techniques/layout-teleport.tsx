"use client";

import { useEffect, useRef } from "react";
import { motion, LayoutGroup, useAnimationControls } from "framer-motion";
import type { TechniqueProps } from "../types";

/**
 * Technique: Layout Teleport
 * layoutId on sub-elements — each piece independently flies to its new position/size.
 *
 * stageTransition: collapse wrapper to scale 0 → call onMidpoint → scale back to 1
 * morphed toggle: wrapper layout animation (children handle their own states)
 */
export function LayoutTeleport({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const controls = useAnimationControls();
  const prevStageKeyRef = useRef<string | null>(null);

  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 28,
  };

  // Handle stageTransition
  useEffect(() => {
    if (!stageTransition) {
      prevStageKeyRef.current = null;
      return;
    }
    if (stageTransition.key === prevStageKeyRef.current) return;
    prevStageKeyRef.current = stageTransition.key;

    const run = async () => {
      await controls.start(
        { scale: 0 },
        { type: "spring", stiffness: 350, damping: 28 },
      );

      stageTransition.onMidpoint();

      await controls.start(
        { scale: 1 },
        { type: "spring", stiffness: 250, damping: 24 },
      );

      onMorphComplete?.();
    };

    run();
  }, [stageTransition?.key]);

  // Handle morphed toggle (card reveal)
  useEffect(() => {
    if (stageTransition) return;

    const timeout = setTimeout(() => onMorphComplete?.(), 600);
    return () => clearTimeout(timeout);
  }, [morphed, onMorphComplete]);

  return (
    <LayoutGroup>
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          animate={controls}
          layout
          className="w-4/5 max-w-[280px] h-[85%] relative overflow-hidden rounded-2xl"
          style={{
            border: morphed
              ? "1px solid rgba(201,169,78,0.5)"
              : "1px solid rgba(255,255,255,0.15)",
            boxShadow: morphed
              ? "0 0 40px rgba(201,169,78,0.35)"
              : "none",
          }}
          transition={springTransition}
        >
          {children}
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
