"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { TechniqueProps } from "../types";

/**
 * Technique: Spring Property
 * Single element morphs borderRadius/size/color via spring physics.
 *
 * stageTransition: squish to scaleX/Y 0 → call onMidpoint → spring back
 * morphed toggle: morph shape from circle to card rectangle
 */
export function SpringProperty({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const controls = useAnimationControls();
  const prevStageKeyRef = useRef<string | null>(null);

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
        { scaleX: 0, scaleY: 0 },
        { type: "spring", stiffness: 300, damping: 25 },
      );

      stageTransition.onMidpoint();

      await controls.start(
        { scaleX: morphed ? 1 : 0.7, scaleY: morphed ? 1 : 0.7 },
        { type: "spring", stiffness: 200, damping: 22 },
      );

      onMorphComplete?.();
    };

    run();
  }, [stageTransition?.key]);

  // Handle morphed toggle (card reveal)
  useEffect(() => {
    if (stageTransition) return;

    controls
      .start({
        borderRadius: morphed ? 16 : "50%",
        scaleX: morphed ? 1 : 0.7,
        scaleY: morphed ? 1 : 0.7,
        background: morphed
          ? "linear-gradient(145deg, rgba(30,20,50,0.9), rgba(15,10,30,0.95))"
          : "linear-gradient(145deg, rgba(201,169,78,0.3), rgba(150,120,50,0.2))",
        boxShadow: morphed
          ? "0 0 40px rgba(201,169,78,0.3), inset 0 0 30px rgba(201,169,78,0.1)"
          : "0 0 60px rgba(201,169,78,0.4), inset 0 0 40px rgba(201,169,78,0.2)",
      })
      .then(() => onMorphComplete?.());
  }, [morphed]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        animate={controls}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 1.2,
        }}
        className="w-full h-full relative overflow-hidden border border-white/15"
        style={{
          borderRadius: "50%",
          scaleX: 0.7,
          scaleY: 0.7,
          background:
            "linear-gradient(145deg, rgba(201,169,78,0.3), rgba(150,120,50,0.2))",
          boxShadow:
            "0 0 60px rgba(201,169,78,0.4), inset 0 0 40px rgba(201,169,78,0.2)",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
