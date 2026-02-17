"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function DeckDeal() {
  return (
    <DemoWrapper
      title="Deck Deal"
      description="Cards arc off the deck pile to spread positions in a fan"
      library="Creative"
    >
      {(playing) => <DealContent playing={playing} />}
    </DemoWrapper>
  );
}

function DealContent({ playing }: { playing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".deal-card");
    const count = cards.length;

    // Start all stacked at center
    gsap.set(cards, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 0.9,
      opacity: 1,
    });

    if (playing) {
      cards.forEach((card, i) => {
        const angle = -30 + (60 / (count - 1)) * i;
        const rad = (angle * Math.PI) / 180;
        const radius = 100;
        const targetX = Math.sin(rad) * radius;
        const targetY = -Math.cos(rad) * radius + radius * 0.3;

        gsap.to(card, {
          x: targetX,
          y: targetY,
          rotation: angle * 0.5,
          scale: 1,
          duration: 0.5,
          delay: i * 0.12,
          ease: "back.out(1.2)",
        });
      });
    }
  }, [playing]);

  return (
    <TransitionStage>
      <div
        ref={containerRef}
        className="relative"
        style={{ width: 280, height: 280 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3">
          {DEMO_CARDS.slice(0, 5).map((card, i) => (
            <div
              key={card.title}
              className="deal-card absolute"
              style={{
                top: -90,
                left: -60,
                zIndex: i,
              }}
            >
              <DemoCard title={card.title} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </TransitionStage>
  );
}
