"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const exitStyles = [
  {
    label: "Shrink Away",
    exit: { scale: 0, opacity: 0, transition: { duration: 0.5 } },
  },
  {
    label: "Fly Away",
    exit: { x: 300, y: -200, rotate: 45, opacity: 0, transition: { duration: 0.6 } },
  },
  {
    label: "Dissolve",
    exit: { opacity: 0, filter: "blur(20px)", scale: 1.2, transition: { duration: 0.8 } },
  },
];

export function ExitAnimations() {
  return (
    <DemoWrapper
      title="Exit Animations"
      description="Shrink away, fly off screen, and blur dissolve exits"
      library="Framer Motion"
    >
      {(playing) => <ExitContent playing={playing} />}
    </DemoWrapper>
  );
}

function ExitContent({ playing }: { playing: boolean }) {
  const [visible, setVisible] = useState([true, true, true]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (playing && !started) {
      setStarted(true);
      setVisible([true, true, true]);
      // Stagger the exits
      exitStyles.forEach((_, i) => {
        setTimeout(() => setVisible((v) => v.map((val, j) => (j === i ? false : val))), 800 + i * 700);
      });
    }
    if (!playing) {
      setStarted(false);
      setVisible([true, true, true]);
    }
  }, [playing, started]);

  return (
    <TransitionStage>
      <div className="flex gap-3 items-center">
        {exitStyles.map((style, i) => (
          <AnimatePresence key={style.label}>
            {(playing ? visible[i] : true) && (
              <motion.div
                initial={{ opacity: playing ? 0 : 1, y: playing ? 20 : 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={style.exit}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <DemoCard title={style.label} size="sm" />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </TransitionStage>
  );
}
