"use client";

import { useTrail, animated } from "@react-spring/web";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function TrailStagger() {
  return (
    <DemoWrapper
      title="Trail Stagger"
      description="Cascade waterfall using useTrail — cards flow in sequence"
      library="React Spring"
    >
      {(playing) => <TrailContent playing={playing} />}
    </DemoWrapper>
  );
}

function TrailContent({ playing }: { playing: boolean }) {
  const cards = DEMO_CARDS.slice(0, 5);

  const trail = useTrail(cards.length, {
    from: { opacity: 0, y: 60, scale: 0.7, rotate: -10 },
    to: playing
      ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
      : { opacity: 0, y: 60, scale: 0.7, rotate: -10 },
    config: { tension: 280, friction: 22 },
  });

  return (
    <TransitionStage>
      <div className="flex gap-2 items-end flex-wrap justify-center">
        {trail.map((style, i) => (
          <animated.div
            key={cards[i].title}
            style={{
              opacity: style.opacity,
              transform: style.y.to(
                (y) =>
                  `translateY(${y}px) scale(${style.scale.get()}) rotate(${style.rotate.get()}deg)`
              ),
            }}
          >
            <DemoCard title={cards[i].title} size="sm" />
          </animated.div>
        ))}
      </div>
    </TransitionStage>
  );
}
