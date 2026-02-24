"use client";

import { useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
import type { TechniqueProps } from "../types";

/**
 * Technique 2: Layout Teleport
 * layoutId on sub-elements (title, icon, border). Each piece independently
 * flies to its new position/size. Emergent from layout change, not keyframes.
 */
export function LayoutTeleport({ morphed, onMorphComplete, children }: TechniqueProps) {
  // Fire completion after layout animations settle
  useEffect(() => {
    const timeout = setTimeout(() => onMorphComplete?.(), 600);
    return () => clearTimeout(timeout);
  }, [morphed, onMorphComplete]);

  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 28,
  };

  return (
    <LayoutGroup>
      <div className="w-full h-full flex items-center justify-center">
        {children ? (
          <motion.div
            layout
            className="w-4/5 max-w-[280px] relative overflow-hidden rounded-2xl"
            animate={{
              height: morphed ? "85%" : "auto",
              boxShadow: morphed
                ? "0 0 40px rgba(201,169,78,0.35)"
                : "none",
            }}
            style={{
              border: morphed
                ? "1px solid rgba(201,169,78,0.5)"
                : "1px solid rgba(255,255,255,0.15)",
            }}
            transition={springTransition}
          >
            {children}
          </motion.div>
        ) : (
          <>
            {!morphed ? (
              /* State A: Form layout */
              <motion.div
                layout
                className="w-4/5 max-w-[280px] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 flex flex-col items-center gap-4"
                transition={springTransition}
              >
                <motion.div
                  layoutId="morph-icon"
                  className="text-4xl"
                  transition={springTransition}
                >
                  ✦
                </motion.div>
                <motion.p
                  layoutId="morph-title"
                  className="text-white/80 font-medium text-base"
                  transition={springTransition}
                >
                  Ask the Oracle
                </motion.p>
                <motion.div
                  layoutId="morph-border"
                  className="w-full h-10 rounded-full bg-white/15 border border-white/20"
                  transition={springTransition}
                />
                <motion.div
                  layoutId="morph-frame"
                  className="w-12 h-12 rounded-full border-2 border-[#c9a94e]/50"
                  transition={springTransition}
                />
              </motion.div>
            ) : (
              /* State B: Card layout */
              <motion.div
                layout
                className="w-4/5 max-w-[280px] h-[85%] rounded-2xl bg-gradient-to-b from-[rgba(30,20,50,0.9)] to-[rgba(15,10,30,0.95)] border border-[#c9a94e]/50 p-4 flex flex-col items-center justify-center gap-3 relative"
                transition={springTransition}
                style={{
                  boxShadow: "0 0 40px rgba(201,169,78,0.35)",
                }}
              >
                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#c9a94e]/60" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#c9a94e]/60" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#c9a94e]/60" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#c9a94e]/60" />

                <motion.div
                  layoutId="morph-frame"
                  className="w-28 h-28 rounded-xl border-2 border-[#c9a94e]/40 overflow-hidden"
                  transition={springTransition}
                >
                  <img
                    src="/mock/cards/the-oracle.png"
                    alt="The Oracle"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  layoutId="morph-icon"
                  className="text-lg text-[#c9a94e]"
                  transition={springTransition}
                >
                  ✦
                </motion.div>
                <motion.p
                  layoutId="morph-title"
                  className="text-[#c9a94e] font-semibold text-base tracking-wider"
                  transition={springTransition}
                >
                  THE ORACLE
                </motion.p>
                <motion.div
                  layoutId="morph-border"
                  className="absolute inset-3 rounded-xl border border-[#c9a94e]/40 pointer-events-none"
                  transition={springTransition}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </LayoutGroup>
  );
}
