"use client";

import { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { TechniqueProps } from "../types";

/**
 * Technique 1: Spring Property
 * Single element morphs borderRadius/size/color via spring physics.
 * Circle → card rectangle. Baseline morph.
 */
export function SpringProperty({ morphed, onMorphComplete, children }: TechniqueProps) {
  const controls = useAnimationControls();

  useEffect(() => {
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
  }, [morphed, controls, onMorphComplete]);

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
        {children || (
          <>
            {/* State A: Oracle circle content */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              animate={{ opacity: morphed ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-4xl">✦</span>
              <p className="text-white/80 font-medium text-sm">Ask the Oracle</p>
              <div className="w-3/4 h-8 rounded-full bg-white/15 border border-white/20" />
            </motion.div>

            {/* State B: Card content */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              animate={{ opacity: morphed ? 1 : 0 }}
              transition={{ duration: 0.3, delay: morphed ? 0.2 : 0 }}
            >
              <div className="absolute inset-2 border border-[#c9a94e]/40 rounded-xl pointer-events-none" />
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#c9a94e]/60" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#c9a94e]/60" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#c9a94e]/60" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#c9a94e]/60" />
              <img
                src="/mock/cards/the-oracle.png"
                alt="The Oracle"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <p className="text-[#c9a94e] font-semibold text-base tracking-wider">
                THE ORACLE
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
