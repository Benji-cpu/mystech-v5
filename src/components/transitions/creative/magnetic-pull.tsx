"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function MagneticPull() {
  return (
    <DemoWrapper
      title="Magnetic Pull"
      description="Cards accelerate from edges toward a center magnet point"
      library="Creative"
    >
      {(playing) => <MagneticContent playing={playing} />}
    </DemoWrapper>
  );
}

function MagneticContent({ playing }: { playing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".mag-card");

    // Start scattered
    const startPositions = [
      { x: -180, y: -120, r: -30 },
      { x: 160, y: -100, r: 20 },
      { x: -150, y: 80, r: -15 },
      { x: 170, y: 100, r: 25 },
      { x: 0, y: -150, r: 10 },
    ];

    cards.forEach((card, i) => {
      const pos = startPositions[i];
      gsap.set(card, { x: pos.x, y: pos.y, rotation: pos.r, opacity: 0, scale: 0.6 });
    });

    if (playing) {
      cards.forEach((card, i) => {
        const targetX = -50 + i * 25;
        gsap.to(card, {
          x: targetX,
          y: 0,
          rotation: -10 + i * 5,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: i * 0.08,
          ease: "power3.in", // Accelerating = magnetic pull effect
        });
      });
    }
  }, [playing]);

  return (
    <TransitionStage>
      {/* Magnet point indicator */}
      {playing && (
        <div className="absolute w-3 h-3 rounded-full bg-[#c9a94e]/50 animate-pulse z-0" />
      )}
      <div
        ref={containerRef}
        className="relative z-10"
        style={{ width: 280, height: 240 }}
      >
        {DEMO_CARDS.slice(0, 5).map((card, i) => (
          <div key={card.title} className="mag-card absolute" style={{ top: "50%", left: "50%", marginTop: -90, marginLeft: -60 }}>
            <DemoCard title={card.title} size="sm" />
          </div>
        ))}
      </div>
    </TransitionStage>
  );
}
