"use client";

import { motion } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function MorphShapes() {
  return (
    <DemoWrapper
      title="Shape Morph"
      description="Circle morphs into card rectangle with spring transition"
      library="Framer Motion"
    >
      {(playing) => (
        <TransitionStage>
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={
                playing
                  ? {
                      borderRadius: "12px",
                      width: 150,
                      height: 225,
                      background: "linear-gradient(to bottom, var(--surface-mid), var(--surface-deep))",
                    }
                  : {
                      borderRadius: "50%",
                      width: 80,
                      height: 80,
                      background: "linear-gradient(135deg, var(--gold), var(--gold-dim))",
                    }
              }
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 1.5,
              }}
              className="border border-gold/40 flex items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={{ opacity: playing ? 1 : 0, scale: playing ? 1 : 0.5 }}
                transition={{ delay: playing ? 0.5 : 0, duration: 0.3 }}
              >
                {playing && <DemoCard title="Morphed" size="md" className="border-0" />}
              </motion.div>
            </motion.div>
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
