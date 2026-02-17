"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DemoCardBack } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function PageTurn() {
  return (
    <DemoWrapper
      title="Page Turn"
      description="Book page turn using CSS 3D transform-origin: left"
      library="Creative"
    >
      {(playing) => (
        <TransitionStage className="[perspective:1200px]">
          <div className="relative" style={{ width: 150, height: 225 }}>
            {/* Back page (revealed) */}
            <div className="absolute inset-0">
              <DemoCard title="Revealed" size="md" />
            </div>
            {/* Front page (turns away) */}
            <div
              className="absolute inset-0 transition-transform duration-[1200ms] ease-in-out"
              style={{
                transformOrigin: "left center",
                transform: playing ? "rotateY(-180deg)" : "rotateY(0deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div style={{ backfaceVisibility: "hidden" }}>
                <DemoCardBack size="md" />
              </div>
              {/* Shadow on the page as it turns */}
              <div
                className="absolute inset-0 rounded-xl transition-opacity duration-[1200ms]"
                style={{
                  background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.3))",
                  opacity: playing ? 1 : 0,
                  backfaceVisibility: "hidden",
                }}
              />
            </div>
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
