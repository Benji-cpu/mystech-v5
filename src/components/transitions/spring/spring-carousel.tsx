"use client";

import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function SpringCarousel() {
  return (
    <DemoWrapper
      title="Spring Carousel"
      description="Horizontal flick carousel with spring physics — drag or use arrows"
      library="React Spring"
    >
      {(playing) => <CarouselContent playing={playing} />}
    </DemoWrapper>
  );
}

function CarouselContent({ playing }: { playing: boolean }) {
  const cards = DEMO_CARDS;
  const [index, setIndex] = useState(0);
  const cardWidth = 140;
  const gap = 12;

  const [spring, api] = useSpring(() => ({
    x: 0,
    config: { tension: 200, friction: 25 },
  }));

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, i));
    setIndex(clamped);
    api.start({ x: -clamped * (cardWidth + gap) });
  };

  const bind = useDrag(
    ({ movement: [mx], direction: [dx], cancel, active }) => {
      if (!playing) return;
      if (!active) {
        if (Math.abs(mx) > cardWidth / 3) {
          goTo(index + (dx > 0 ? -1 : 1));
        } else {
          api.start({ x: -index * (cardWidth + gap) });
        }
        return;
      }
      api.start({ x: -index * (cardWidth + gap) + mx, immediate: true });
    },
    { axis: "x" }
  );

  if (!playing) {
    return (
      <TransitionStage>
        <p className="text-xs text-muted-foreground">Press Play to begin</p>
      </TransitionStage>
    );
  }

  return (
    <TransitionStage className="overflow-hidden">
      <div className="flex flex-col gap-3 items-center w-full">
        <div className="overflow-hidden w-full flex justify-center" style={{ touchAction: "pan-y" }}>
          <animated.div
            {...bind()}
            className="flex gap-3 cursor-grab active:cursor-grabbing"
            style={{
              x: spring.x,
              width: cards.length * (cardWidth + gap),
            }}
          >
            {cards.map((card) => (
              <div key={card.title} style={{ width: cardWidth, flexShrink: 0 }}>
                <DemoCard title={card.title} size="sm" />
              </div>
            ))}
          </animated.div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="px-2 py-1 text-xs rounded bg-white/10 disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-xs text-muted-foreground px-2 py-1">
            {index + 1}/{cards.length}
          </span>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === cards.length - 1}
            className="px-2 py-1 text-xs rounded bg-white/10 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </TransitionStage>
  );
}
