"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function FadeScale() {
  return (
    <DemoWrapper
      title="Fade & Scale"
      description="Fade in, scale pop, and combined fade-scale — pure CSS transitions"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage>
          <div className="flex gap-4 items-center">
            {/* Fade in */}
            <div
              className="transition-all duration-700 ease-out"
              style={{
                opacity: playing ? 1 : 0,
              }}
            >
              <DemoCard title="Fade In" size="sm" />
            </div>
            {/* Scale pop */}
            <div
              className="transition-all duration-500 ease-out"
              style={{
                opacity: playing ? 1 : 0,
                transform: playing ? "scale(1)" : "scale(0.3)",
                transitionDelay: "200ms",
              }}
            >
              <DemoCard title="Scale Pop" size="sm" />
            </div>
            {/* Combo */}
            <div
              className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                opacity: playing ? 1 : 0,
                transform: playing ? "scale(1) translateY(0)" : "scale(0.5) translateY(30px)",
                transitionDelay: "400ms",
              }}
            >
              <DemoCard title="Combo" size="sm" />
            </div>
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
