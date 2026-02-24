"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { AURORA, TIMING } from "../aurora-journey-theme";
import { GsapTextReveal } from "../gsap-text-reveal";
import { GsapContentMaterializer } from "../gsap-content-materializer";
import type { JourneyAction, AwakeningSubPhase } from "../aurora-journey-state";
import type { AuroraRibbonHandle } from "../aurora-ribbons";

interface AwakeningPhaseProps {
  subPhase: AwakeningSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  auroraRef: React.RefObject<AuroraRibbonHandle | null>;
  isActive: boolean;
}

const GREETING_TEXT = "Welcome, seeker. I am Lyra \u2014 your guide through the threads of meaning that weave through your story.";

export function AwakeningPhase({ subPhase, dispatch, auroraRef, isActive }: AwakeningPhaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // GSAP timeline choreography for sub-phase auto-advance
  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      if (subPhase === "scattering") {
        const tl = gsap.timeline();
        tl.call(() => {
          dispatch({ type: "SET_FORMATION", formation: "scattered" });
        }, [], 0);
        tl.call(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "converging" });
        }, [], 1.5);
      } else if (subPhase === "converging") {
        dispatch({ type: "SET_FORMATION", formation: "lyra" });
        dispatch({ type: "SET_SHOW_CONNECTIONS", show: true });

        const tl = gsap.timeline();
        tl.call(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "greeting" });
        }, [], 2.0);
      } else if (subPhase === "greeting") {
        // Text reveal handles itself via GsapTextReveal onComplete
        // Auto-advance after text + 500ms buffer
        const textDuration = GREETING_TEXT.length * TIMING.charStagger + 1.0;
        const tl = gsap.timeline();
        tl.call(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
        }, [], textDuration);
      }
    });

    return () => ctx.revert();
  }, [subPhase, isActive, dispatch]);

  // Button entrance animation
  useEffect(() => {
    if (subPhase === "ready" && buttonRef.current && isActive) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 12, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)", delay: 0.2 }
      );
    }
  }, [subPhase, isActive]);

  const handleContinue = useCallback(() => {
    if (subPhase === "ready") {
      dispatch({ type: "START_BREATH_PAUSE" });
      const ctx = gsap.context(() => {
        gsap.delayedCall((TIMING.breathPause + 200) / 1000, () => {
          dispatch({ type: "ADVANCE_PHASE" });
          dispatch({ type: "END_BREATH_PAUSE" });
        });
      });
    }
  }, [subPhase, dispatch]);

  const showGreeting = subPhase === "greeting" || subPhase === "ready";
  const showContinue = subPhase === "ready";

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Greeting text — GSAP char-split reveal */}
      <GsapContentMaterializer
        visible={showGreeting}
        auroraRef={auroraRef}
        className="text-center max-w-md mx-auto mb-8"
        id="awakening-greeting"
      >
        <GsapTextReveal text={GREETING_TEXT} isActive={showGreeting} />
      </GsapContentMaterializer>

      {/* Continue prompt */}
      <GsapContentMaterializer
        visible={showContinue}
        auroraRef={auroraRef}
        delay={300}
        className="text-center"
        id="awakening-continue"
      >
        <button
          ref={buttonRef}
          onClick={handleContinue}
          className="px-8 py-3 rounded-full border transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
          style={{
            borderColor: AURORA.borderAccent,
            color: AURORA.accent,
            background: "rgba(196, 122, 42, 0.05)",
            opacity: 0,
          }}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, { scale: 1.03, borderColor: AURORA.accent, duration: 0.2 });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, { scale: 1, borderColor: AURORA.borderAccent, duration: 0.2 });
          }}
          onPointerDown={(e) => {
            gsap.to(e.currentTarget, { scale: 0.97, duration: 0.1 });
          }}
          onPointerUp={(e) => {
            gsap.to(e.currentTarget, { scale: 1.03, duration: 0.1 });
          }}
        >
          <span className="font-serif text-sm tracking-widest uppercase">Begin the Journey</span>
        </button>
      </GsapContentMaterializer>
    </div>
  );
}
