"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const variants = {
  enter: { opacity: 0, scale: 0.5, rotateZ: -10, y: 60 },
  center: { opacity: 1, scale: 1, rotateZ: 0, y: 0 },
  exit: { opacity: 0, scale: 0.3, rotateZ: 15, y: -80 },
};

export function AnimatePresenceDemo() {
  return (
    <DemoWrapper
      title="AnimatePresence"
      description="Mount/unmount with creative enter + exit — cycles through cards"
      library="Framer Motion"
    >
      {(playing) => <PresenceContent playing={playing} />}
    </DemoWrapper>
  );
}

function PresenceContent({ playing }: { playing: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % DEMO_CARDS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <TransitionStage>
      <AnimatePresence mode="wait">
        {playing && (
          <motion.div
            key={index}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <DemoCard title={DEMO_CARDS[index].title} size="md" />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionStage>
  );
}
