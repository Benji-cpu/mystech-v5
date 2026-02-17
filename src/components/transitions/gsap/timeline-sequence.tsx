"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function TimelineSequence() {
  return (
    <DemoWrapper
      title="Timeline Sequence"
      description="Multi-card orchestrated GSAP timeline with overlapping animations"
      library="GSAP"
    >
      {(playing, onReset) => (
        <TimelineContent playing={playing} onReset={onReset} />
      )}
    </DemoWrapper>
  );
}

function TimelineContent({
  playing,
  onReset,
}: {
  playing: boolean;
  onReset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".gsap-card");

    // Set initial state
    gsap.set(cards, { opacity: 0, y: 60, scale: 0.7, rotation: -15 });

    if (playing) {
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
      })
        .to(
          cards,
          {
            y: -10,
            duration: 0.3,
            stagger: 0.08,
            ease: "power2.out",
          },
          "+=0.2"
        )
        .to(cards, {
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "bounce.out",
        });
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [playing]);

  return (
    <TransitionStage>
      <div ref={containerRef} className="flex gap-2 flex-wrap justify-center">
        {DEMO_CARDS.slice(0, 5).map((card) => (
          <div key={card.title} className="gsap-card">
            <DemoCard title={card.title} size="sm" />
          </div>
        ))}
      </div>
    </TransitionStage>
  );
}
