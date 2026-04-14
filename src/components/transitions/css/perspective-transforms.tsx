"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function PerspectiveTransforms() {
  return (
    <DemoWrapper
      title="Perspective Transforms"
      description="Tilt-in from angle, depth zoom, and parallax layer reveal"
      library="CSS"
    >
      {(playing) => (
        <TransitionStage className="[perspective:800px]">
          <div className="flex gap-4 items-center">
            {/* Tilt-in */}
            <div
              className="transition-all duration-800 ease-out"
              style={{
                transform: playing
                  ? "rotateY(0deg) rotateX(0deg) translateZ(0)"
                  : "rotateY(-40deg) rotateX(10deg) translateZ(-100px)",
                opacity: playing ? 1 : 0,
                transitionDuration: "800ms",
              }}
            >
              <DemoCard title="Tilt-In" size="sm" />
            </div>
            {/* Depth zoom */}
            <div
              className="transition-all ease-out"
              style={{
                transform: playing
                  ? "translateZ(0) scale(1)"
                  : "translateZ(-300px) scale(0.5)",
                opacity: playing ? 1 : 0,
                transitionDuration: "900ms",
                transitionDelay: "200ms",
              }}
            >
              <DemoCard title="Depth" size="sm" />
            </div>
            {/* Parallax layers */}
            <div className="relative" style={{ width: 120, height: 180 }}>
              {[0, 1, 2].map((layer) => (
                <div
                  key={layer}
                  className="absolute inset-0 transition-all ease-out"
                  style={{
                    transform: playing
                      ? `translateZ(${layer * 10}px) translateY(0)`
                      : `translateZ(${layer * 40}px) translateY(${layer * 20}px)`,
                    opacity: playing ? (layer === 2 ? 1 : 0.3) : 0,
                    transitionDuration: "800ms",
                    transitionDelay: `${400 + layer * 100}ms`,
                  }}
                >
                  <DemoCard
                    title={layer === 2 ? "Layers" : ""}
                    size="sm"
                    className={layer < 2 ? "border-gold/20" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
