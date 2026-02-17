"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function DominoCascade() {
  return (
    <DemoWrapper
      title="Domino Cascade"
      description="Sequential tipping domino chain — each card triggers the next"
      library="Creative"
    >
      {(playing) => <DominoContent playing={playing} />}
    </DemoWrapper>
  );
}

function DominoContent({ playing }: { playing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".domino-card");

    gsap.set(cards, { rotateX: -90, opacity: 0, transformOrigin: "bottom center" });

    if (playing) {
      gsap.to(cards, {
        rotateX: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.15,
        ease: "back.out(1.5)",
      });
    }
  }, [playing]);

  return (
    <TransitionStage className="[perspective:600px]">
      <div ref={containerRef} className="flex gap-2 items-end">
        {DEMO_CARDS.slice(0, 5).map((card) => (
          <div key={card.title} className="domino-card">
            <DemoCard title={card.title} size="sm" />
          </div>
        ))}
      </div>
    </TransitionStage>
  );
}
