"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DemoCardBack } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function FlipCardFramer() {
  return (
    <DemoWrapper
      title="Spring Flip"
      description="Card flip with spring physics — click the card to flip again"
      library="Framer Motion"
    >
      {(playing) => <FlipContent playing={playing} />}
    </DemoWrapper>
  );
}

function FlipContent({ playing }: { playing: boolean }) {
  const [flipped, setFlipped] = useState(false);

  const isFlipped = playing ? !flipped : false;

  return (
    <TransitionStage className="[perspective:1000px]">
      <motion.div
        className="relative cursor-pointer"
        style={{ transformStyle: "preserve-3d", width: 150, height: 225 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={() => playing && setFlipped((f) => !f)}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <DemoCardBack size="md" />
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <DemoCard title="Revealed" size="md" />
        </div>
      </motion.div>
      {playing && (
        <p className="absolute bottom-2 text-[10px] text-muted-foreground">
          Click to flip
        </p>
      )}
    </TransitionStage>
  );
}
