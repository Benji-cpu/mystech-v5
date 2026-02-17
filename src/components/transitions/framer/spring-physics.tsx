"use client";

import { motion } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const configs = [
  { label: "Bouncy", stiffness: 300, damping: 10, mass: 1 },
  { label: "Smooth", stiffness: 100, damping: 20, mass: 1 },
  { label: "Heavy", stiffness: 200, damping: 15, mass: 3 },
];

export function SpringPhysics() {
  return (
    <DemoWrapper
      title="Spring Physics"
      description="Compare bouncy, smooth, and heavy spring configurations"
      library="Framer Motion"
    >
      {(playing) => (
        <TransitionStage>
          <div className="flex gap-4 items-end">
            {configs.map((cfg, i) => (
              <motion.div
                key={cfg.label}
                initial={{ y: -200, opacity: 0, scale: 0.5 }}
                animate={
                  playing
                    ? { y: 0, opacity: 1, scale: 1 }
                    : { y: -200, opacity: 0, scale: 0.5 }
                }
                transition={{
                  type: "spring",
                  stiffness: cfg.stiffness,
                  damping: cfg.damping,
                  mass: cfg.mass,
                  delay: i * 0.2,
                }}
              >
                <DemoCard title={cfg.label} size="sm" />
              </motion.div>
            ))}
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
