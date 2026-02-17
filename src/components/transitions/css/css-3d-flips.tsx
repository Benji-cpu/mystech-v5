"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DemoCardBack } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function Css3dFlips() {
  return (
    <DemoWrapper
      title="3D Flips"
      description="Y-axis, X-axis, and Z-axis spin reveals using CSS 3D transforms"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage className="[perspective:1000px]">
          <div className="flex gap-4 items-center">
            {/* Y-axis flip */}
            <div
              className="relative transition-transform duration-700 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
                transform: playing ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div style={{ backfaceVisibility: "hidden" }}>
                <DemoCardBack size="sm" />
              </div>
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <DemoCard title="Y-Axis" size="sm" />
              </div>
            </div>

            {/* X-axis flip */}
            <div
              className="relative transition-transform duration-700 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
                transform: playing ? "rotateX(180deg)" : "rotateX(0deg)",
                transitionDelay: "200ms",
              }}
            >
              <div style={{ backfaceVisibility: "hidden" }}>
                <DemoCardBack size="sm" />
              </div>
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
              >
                <DemoCard title="X-Axis" size="sm" />
              </div>
            </div>

            {/* Z-axis spin */}
            <div
              className="transition-all duration-700 ease-out"
              style={{
                opacity: playing ? 1 : 0,
                transform: playing ? "rotate(0deg) scale(1)" : "rotate(540deg) scale(0)",
                transitionDelay: "400ms",
              }}
            >
              <DemoCard title="Z-Spin" size="sm" />
            </div>
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
