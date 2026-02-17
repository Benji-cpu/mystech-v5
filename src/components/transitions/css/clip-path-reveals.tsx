"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const reveals = [
  {
    label: "Circle",
    from: "circle(0% at 50% 50%)",
    to: "circle(75% at 50% 50%)",
  },
  {
    label: "Diamond",
    from: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    to: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  {
    label: "H-Wipe",
    from: "inset(0 100% 0 0)",
    to: "inset(0 0% 0 0)",
  },
  {
    label: "Diagonal",
    from: "polygon(0 0, 0 0, 0 0)",
    to: "polygon(0 0, 200% 0, 0 200%)",
  },
  {
    label: "Star",
    from: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    to: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  },
];

export function ClipPathReveals() {
  return (
    <DemoWrapper
      title="Clip-Path Reveals"
      description="Circle expand, diamond, horizontal wipe, diagonal, and starburst"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage>
          <div className="flex flex-wrap gap-3 justify-center">
            {reveals.map((r, i) => (
              <div
                key={r.label}
                className="transition-all duration-700 ease-out"
                style={{
                  clipPath: playing ? r.to : r.from,
                  transitionDelay: `${i * 200}ms`,
                  transitionDuration: "800ms",
                }}
              >
                <DemoCard title={r.label} size="sm" />
              </div>
            ))}
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
