"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";
import { DEMO_CARDS } from "../demo-card";

export function CssCardStack() {
  return (
    <DemoWrapper
      title="Card Stack Deal"
      description="Stacked cards dealing off the top of the pile"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage>
          <div className="relative" style={{ width: 240, height: 240 }}>
            {DEMO_CARDS.slice(0, 5).map((card, i) => {
              const angle = -20 + i * 10;
              const tx = -60 + i * 30;
              const ty = 20;
              return (
                <div
                  key={card.title}
                  className="absolute transition-all ease-out"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: playing
                      ? `translate(${tx}px, ${ty}px) rotate(${angle}deg)`
                      : `translate(-50%, -50%) rotate(${i * 0.5}deg) translateY(${-i * 2}px)`,
                    transitionDuration: "600ms",
                    transitionDelay: `${i * 120}ms`,
                    zIndex: playing ? i : 5 - i,
                  }}
                >
                  <DemoCard title={card.title} size="sm" />
                </div>
              );
            })}
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
