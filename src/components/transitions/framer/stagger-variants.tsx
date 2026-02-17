"use client";

import { motion } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function StaggerVariants() {
  return (
    <DemoWrapper
      title="Stagger Variants"
      description="Grid of 6 cards staggering in with spring physics"
      library="Framer Motion"
    >
      {(playing) => (
        <TransitionStage>
          <motion.div
            className="grid grid-cols-3 gap-2"
            variants={container}
            initial="hidden"
            animate={playing ? "show" : "hidden"}
          >
            {DEMO_CARDS.map((card) => (
              <motion.div key={card.title} variants={item}>
                <DemoCard title={card.title} size="sm" />
              </motion.div>
            ))}
          </motion.div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
