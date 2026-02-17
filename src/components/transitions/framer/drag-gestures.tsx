"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function DragGestures() {
  return (
    <DemoWrapper
      title="Drag Gestures"
      description="Tinder-style swipe cards — drag left or right to dismiss"
      library="Framer Motion"
    >
      {(playing) => <SwipeContent playing={playing} />}
    </DemoWrapper>
  );
}

function SwipeContent({ playing }: { playing: boolean }) {
  const [cards, setCards] = useState(DEMO_CARDS.slice(0, 4));

  if (!playing) {
    return (
      <TransitionStage>
        <p className="text-xs text-muted-foreground">Press Play to begin</p>
      </TransitionStage>
    );
  }

  return (
    <TransitionStage>
      <div className="relative w-[160px] h-[240px]">
        {cards.map((card, i) => (
          <SwipeCard
            key={card.title}
            card={card}
            isTop={i === cards.length - 1}
            onSwipe={() => setCards((c) => c.slice(0, -1))}
            style={{ zIndex: i }}
          />
        ))}
        {cards.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            All swiped!
          </p>
        )}
      </div>
    </TransitionStage>
  );
}

function SwipeCard({
  card,
  isTop,
  onSwipe,
  style,
}: {
  card: (typeof DEMO_CARDS)[0];
  isTop: boolean;
  onSwipe: () => void;
  style?: React.CSSProperties;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, opacity, ...style, cursor: isTop ? "grab" : "default" }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipe();
        }
      }}
    >
      <DemoCard title={card.title} size="md" />
    </motion.div>
  );
}
