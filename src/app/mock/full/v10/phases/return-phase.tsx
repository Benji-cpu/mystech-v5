"use client";

import { useEffect, useCallback, useRef } from "react";
import gsap from "gsap";
import { AURORA, TIMING } from "../aurora-journey-theme";
import { GsapContentMaterializer } from "../gsap-content-materializer";
import type { JourneyAction, ReturnSubPhase } from "../aurora-journey-state";
import type { AuroraRibbonHandle } from "../aurora-ribbons";

interface ReturnPhaseProps {
  subPhase: ReturnSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  auroraRef: React.RefObject<AuroraRibbonHandle | null>;
  isActive: boolean;
  userName: string;
  loopCount: number;
}

export function ReturnPhase({
  subPhase,
  dispatch,
  auroraRef,
  isActive,
  userName,
  loopCount,
}: ReturnPhaseProps) {
  const compressionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // GSAP timeline for sub-phase auto-advance
  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      if (subPhase === "compressing") {
        // Compression visual animation
        if (compressionRef.current) {
          const circle = compressionRef.current.querySelector(".compress-circle");
          if (circle) {
            gsap.fromTo(
              circle,
              { scale: 1, borderColor: AURORA.borderAccent },
              {
                scale: 1,
                duration: 1.5,
                ease: "sine.inOut",
                keyframes: [
                  { scale: 0.8, borderColor: AURORA.accent, duration: 0.5 },
                  { scale: 1.1, borderColor: AURORA.accentLight, duration: 0.5 },
                  { scale: 1, borderColor: AURORA.borderAccent, duration: 0.5 },
                ],
              }
            );
          }
        }

        gsap.delayedCall(1.5, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "opening" });
        });
      } else if (subPhase === "opening") {
        gsap.delayedCall(1.5, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
        });
      }
    });

    return () => ctx.revert();
  }, [subPhase, isActive, dispatch]);

  // Button entrance
  useEffect(() => {
    if (subPhase === "ready" && buttonRef.current && isActive) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: 0.3 }
      );
    }
  }, [subPhase, isActive]);

  const handleContinue = useCallback(() => {
    dispatch({ type: "START_BREATH_PAUSE" });
    gsap.delayedCall((TIMING.breathPause + 200) / 1000, () => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    });
  }, [dispatch]);

  const showText = subPhase === "opening" || subPhase === "ready";
  const showButton = subPhase === "ready";

  const returnText = loopCount === 0
    ? `The cards have spoken, ${userName || "seeker"}. But the threads of your story continue to weave. Shall we explore another pattern?`
    : `Each reading reveals new facets, ${userName || "seeker"}. The constellation grows richer with every journey. Shall we continue?`;

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Compression visual */}
      {subPhase === "compressing" && (
        <div ref={compressionRef} className="text-center">
          <div
            className="compress-circle w-16 h-16 rounded-full mx-auto border flex items-center justify-center"
            style={{
              borderColor: AURORA.borderAccent,
              background: "rgba(196, 122, 42, 0.05)",
            }}
          >
            <span className="text-2xl" style={{ color: AURORA.accent }}>
              &#10022;
            </span>
          </div>
        </div>
      )}

      {/* Return text */}
      <GsapContentMaterializer
        visible={showText}
        auroraRef={auroraRef}
        className="text-center max-w-md mx-auto mb-8"
        id="return-text"
      >
        <p className="font-serif text-lg sm:text-xl leading-relaxed" style={{ color: AURORA.text }}>
          {returnText}
        </p>
      </GsapContentMaterializer>

      {/* Continue button */}
      <GsapContentMaterializer
        visible={showButton}
        auroraRef={auroraRef}
        delay={400}
        className="text-center flex flex-col items-center gap-3"
        id="return-continue"
      >
        <button
          ref={buttonRef}
          onClick={handleContinue}
          className="px-8 py-3 rounded-full border min-h-[44px] min-w-[44px] cursor-pointer"
          style={{
            borderColor: AURORA.borderAccent,
            color: AURORA.accent,
            background: "rgba(196, 122, 42, 0.05)",
            opacity: 0,
          }}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, { scale: 1.03, duration: 0.2 });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
          }}
          onPointerDown={(e) => {
            gsap.to(e.currentTarget, { scale: 0.97, duration: 0.1 });
          }}
          onPointerUp={(e) => {
            gsap.to(e.currentTarget, { scale: 1.03, duration: 0.1 });
          }}
        >
          <span className="font-serif text-sm tracking-widest uppercase">
            Draw Again
          </span>
        </button>

        <p className="text-xs" style={{ color: AURORA.textDim }}>
          Journey {loopCount + 1} complete
        </p>
      </GsapContentMaterializer>
    </div>
  );
}
