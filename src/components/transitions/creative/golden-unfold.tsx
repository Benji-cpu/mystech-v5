"use client";

import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function GoldenUnfold() {
  return (
    <DemoWrapper
      title="Golden Unfold"
      description="Origami 4-flap unfold with gold edges revealing the card beneath"
      library="Creative"
    >
      {(playing) => (
        <TransitionStage className="[perspective:800px]">
          <div className="relative" style={{ width: 150, height: 225 }}>
            {/* Card underneath */}
            <DemoCard title="Unfolded" size="md" />

            {/* Top flap */}
            <div
              className="absolute inset-x-0 top-0 h-1/2 overflow-hidden transition-transform duration-700 ease-in-out"
              style={{
                transformOrigin: "top center",
                transform: playing ? "rotateX(-180deg)" : "rotateX(0deg)",
                transitionDelay: "0ms",
                backfaceVisibility: "hidden",
                zIndex: 3,
              }}
            >
              <div className="w-full h-full bg-gradient-to-b from-[#1a0530] to-[#120225] border border-[#c9a94e]/30 rounded-t-xl">
                <div className="absolute bottom-0 inset-x-0 h-px bg-[#c9a94e]/50" />
              </div>
            </div>

            {/* Bottom flap */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden transition-transform duration-700 ease-in-out"
              style={{
                transformOrigin: "bottom center",
                transform: playing ? "rotateX(180deg)" : "rotateX(0deg)",
                transitionDelay: "100ms",
                backfaceVisibility: "hidden",
                zIndex: 3,
              }}
            >
              <div className="w-full h-full bg-gradient-to-t from-[#1a0530] to-[#120225] border border-[#c9a94e]/30 rounded-b-xl">
                <div className="absolute top-0 inset-x-0 h-px bg-[#c9a94e]/50" />
              </div>
            </div>

            {/* Left flap */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 overflow-hidden transition-transform duration-700 ease-in-out"
              style={{
                transformOrigin: "left center",
                transform: playing ? "rotateY(-180deg)" : "rotateY(0deg)",
                transitionDelay: "200ms",
                backfaceVisibility: "hidden",
                zIndex: 2,
              }}
            >
              <div className="w-full h-full bg-gradient-to-r from-[#1a0530] to-[#120225] border border-[#c9a94e]/30 rounded-l-xl">
                <div className="absolute right-0 inset-y-0 w-px bg-[#c9a94e]/50" />
              </div>
            </div>

            {/* Right flap */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 overflow-hidden transition-transform duration-700 ease-in-out"
              style={{
                transformOrigin: "right center",
                transform: playing ? "rotateY(180deg)" : "rotateY(0deg)",
                transitionDelay: "300ms",
                backfaceVisibility: "hidden",
                zIndex: 2,
              }}
            >
              <div className="w-full h-full bg-gradient-to-l from-[#1a0530] to-[#120225] border border-[#c9a94e]/30 rounded-r-xl">
                <div className="absolute left-0 inset-y-0 w-px bg-[#c9a94e]/50" />
              </div>
            </div>
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
