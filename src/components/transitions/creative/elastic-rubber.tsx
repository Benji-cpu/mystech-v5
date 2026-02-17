"use client";

import { motion } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function ElasticRubber() {
  return (
    <DemoWrapper
      title="Elastic Rubber"
      description="Rubber band stretch-snap — card stretches in then snaps to shape"
      library="Creative"
    >
      {(playing) => (
        <TransitionStage>
          <motion.div
            animate={
              playing
                ? {
                    scaleX: [0.1, 1.4, 0.85, 1.1, 0.95, 1],
                    scaleY: [3, 0.6, 1.2, 0.9, 1.05, 1],
                    opacity: [0, 1, 1, 1, 1, 1],
                  }
                : { scaleX: 0.1, scaleY: 3, opacity: 0 }
            }
            transition={{
              duration: 1,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              ease: "easeOut",
            }}
          >
            <DemoCard title="Elastic" size="md" />
          </motion.div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
