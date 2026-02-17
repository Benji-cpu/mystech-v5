"use client";

import { useState, useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function UseTransitionList() {
  return (
    <DemoWrapper
      title="useTransition List"
      description="Add/remove cards with animated enter and exit transitions"
      library="React Spring"
    >
      {(playing) => <TransitionListContent playing={playing} />}
    </DemoWrapper>
  );
}

function TransitionListContent({ playing }: { playing: boolean }) {
  const [items, setItems] = useState<typeof DEMO_CARDS>([]);

  useEffect(() => {
    if (!playing) {
      setItems([]);
      return;
    }
    // Add cards one by one
    DEMO_CARDS.slice(0, 4).forEach((card, i) => {
      setTimeout(() => {
        setItems((prev) => [...prev, card]);
      }, i * 400);
    });
  }, [playing]);

  const transitions = useTransition(items, {
    keys: (item) => item.title,
    from: { opacity: 0, transform: "translateX(-40px) scale(0.8)" },
    enter: { opacity: 1, transform: "translateX(0px) scale(1)" },
    leave: { opacity: 0, transform: "translateX(40px) scale(0.8)" },
    config: { tension: 220, friction: 20 },
  });

  return (
    <TransitionStage>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-2 flex-wrap justify-center">
          {transitions((style, item) => (
            <animated.div
              style={style}
              className="cursor-pointer"
              onClick={() => setItems((prev) => prev.filter((c) => c.title !== item.title))}
            >
              <DemoCard title={item.title} size="sm" />
            </animated.div>
          ))}
        </div>
        {playing && items.length > 0 && (
          <p className="text-[10px] text-muted-foreground">Click a card to remove</p>
        )}
      </div>
    </TransitionStage>
  );
}
