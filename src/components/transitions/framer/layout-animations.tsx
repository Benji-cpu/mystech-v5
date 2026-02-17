"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function LayoutAnimations() {
  return (
    <DemoWrapper
      title="Layout Animations"
      description="layoutId shared transitions — click a card thumbnail to expand it"
      library="Framer Motion"
    >
      {(playing) => <LayoutContent playing={playing} />}
    </DemoWrapper>
  );
}

function LayoutContent({ playing }: { playing: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const cards = DEMO_CARDS.slice(0, 4);

  if (!playing) {
    return (
      <TransitionStage>
        <p className="text-xs text-muted-foreground">Press Play to begin</p>
      </TransitionStage>
    );
  }

  return (
    <TransitionStage>
      <LayoutGroup>
        <div className="flex gap-2 flex-wrap justify-center">
          {cards.map((card, i) =>
            selected === i ? null : (
              <motion.div
                key={card.title}
                layoutId={`card-${i}`}
                onClick={() => setSelected(i)}
                className="cursor-pointer"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <DemoCard title={card.title} size="sm" />
              </motion.div>
            )
          )}
        </div>
        {selected !== null && (
          <motion.div
            layoutId={`card-${selected}`}
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            onClick={() => setSelected(null)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <DemoCard title={cards[selected].title} size="lg" />
          </motion.div>
        )}
      </LayoutGroup>
    </TransitionStage>
  );
}
