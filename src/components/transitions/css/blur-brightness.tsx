"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function BlurBrightness() {
  return (
    <DemoWrapper
      title="Blur & Brightness"
      description="Blur focus-in and brightness pulse effects"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage>
          <div className="flex gap-6 items-center">
            {/* Blur focus */}
            <div
              className="transition-all duration-1000 ease-out"
              style={{
                filter: playing ? "blur(0px) brightness(1)" : "blur(20px) brightness(0.3)",
                opacity: playing ? 1 : 0.5,
              }}
            >
              <DemoCard title="Focus In" size="sm" />
            </div>
            {/* Brightness pulse */}
            <div
              style={{
                animation: playing ? "brightnessPulse 1.5s ease-out forwards" : "none",
                opacity: playing ? 1 : 0,
              }}
            >
              <DemoCard title="Brightness" size="sm" />
            </div>
          </div>
          <style jsx>{`
            @keyframes brightnessPulse {
              0% { filter: brightness(0) blur(10px); opacity: 0; }
              30% { filter: brightness(3) blur(2px); opacity: 1; }
              60% { filter: brightness(1.5) blur(0px); }
              100% { filter: brightness(1) blur(0px); }
            }
          `}</style>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
