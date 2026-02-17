"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function GsapFlip() {
  return (
    <DemoWrapper
      title="GSAP Layout Flip"
      description="Rearrange from row to grid — GSAP animates position changes"
      library="GSAP"
    >
      {(playing) => <FlipContent playing={playing} />}
    </DemoWrapper>
  );
}

function FlipContent({ playing }: { playing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGrid, setIsGrid] = useState(false);

  useEffect(() => {
    if (!playing) {
      setIsGrid(false);
      return;
    }
    // Toggle layout after a beat
    const timer = setTimeout(() => setIsGrid(true), 300);
    return () => clearTimeout(timer);
  }, [playing]);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".flip-card");

    // Record current positions
    const positions = Array.from(cards).map((card) => {
      const rect = card.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    });

    // After layout change, animate from old positions
    requestAnimationFrame(() => {
      cards.forEach((card, i) => {
        const newRect = card.getBoundingClientRect();
        const dx = positions[i].x - newRect.left;
        const dy = positions[i].y - newRect.top;

        gsap.fromTo(
          card,
          { x: dx, y: dy },
          {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: i * 0.05,
          }
        );
      });
    });
  }, [isGrid]);

  const cards = DEMO_CARDS.slice(0, 6);

  return (
    <TransitionStage>
      <div
        ref={containerRef}
        className={`flex ${
          isGrid
            ? "flex-wrap justify-center gap-2"
            : "flex-row gap-1 overflow-hidden justify-center"
        }`}
        style={{ maxWidth: isGrid ? 280 : undefined }}
      >
        {cards.map((card) => (
          <div key={card.title} className="flip-card">
            <DemoCard title={card.title} size="sm" />
          </div>
        ))}
      </div>
    </TransitionStage>
  );
}
