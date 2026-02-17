"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const directions = [
  { label: "Left", x: "-120px", y: "0" },
  { label: "Right", x: "120px", y: "0" },
  { label: "Top", x: "0", y: "-120px" },
  { label: "Bottom", x: "0", y: "120px" },
];

export function SlideVariants() {
  return (
    <DemoWrapper
      title="Slide Variants"
      description="Slide in from all 4 directions with smooth easing"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage>
          <div className="grid grid-cols-2 gap-3">
            {directions.map((dir, i) => (
              <div
                key={dir.label}
                className="transition-all duration-600 ease-out"
                style={{
                  opacity: playing ? 1 : 0,
                  transform: playing
                    ? "translate(0, 0)"
                    : `translate(${dir.x}, ${dir.y})`,
                  transitionDelay: `${i * 150}ms`,
                  transitionDuration: "600ms",
                }}
              >
                <DemoCard title={dir.label} size="sm" />
              </div>
            ))}
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
