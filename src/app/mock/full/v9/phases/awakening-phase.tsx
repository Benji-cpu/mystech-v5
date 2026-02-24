"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { LYRA, SPRING, TIMING } from "../lyra-journey-theme";
import { ContentMaterializer } from "../content-materializer";
import type { JourneyAction, AwakeningSubPhase } from "../lyra-journey-state";
import type { ParticleHandle } from "../lyra-particles";

interface AwakeningPhaseProps {
  subPhase: AwakeningSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  particleRef: React.RefObject<ParticleHandle | null>;
  isActive: boolean;
}

const GREETING_TEXT = "Welcome, seeker. I am Lyra — your guide through the threads of meaning that weave through your story.";

function LetterByLetter({ text, isActive }: { text: string; isActive: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const el = containerRef.current;
    el.textContent = "";

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, TIMING.letterDelay);

    return () => clearInterval(interval);
  }, [isActive, text]);

  return (
    <span
      ref={containerRef}
      className="font-serif text-lg sm:text-xl leading-relaxed"
      style={{ color: LYRA.text }}
    />
  );
}

export function AwakeningPhase({ subPhase, dispatch, particleRef, isActive }: AwakeningPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Auto-advance through sub-phases
  useEffect(() => {
    if (!isActive) return;
    clearTimers();

    if (subPhase === "scattering") {
      // Stars are scattered, start converging after 1.5s
      const t = setTimeout(() => {
        dispatch({ type: "SET_FORMATION", formation: "scattered" });
        dispatch({ type: "SET_SUB_PHASE", subPhase: "converging" });
      }, 1500);
      timersRef.current.push(t);
    } else if (subPhase === "converging") {
      // Move to lyra formation and show connections
      dispatch({ type: "SET_FORMATION", formation: "lyra" });
      dispatch({ type: "SET_SHOW_CONNECTIONS", show: true });
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "greeting" });
      }, 2000);
      timersRef.current.push(t);
    } else if (subPhase === "greeting") {
      // Letter-by-letter text, then ready after text completes
      const textDuration = GREETING_TEXT.length * TIMING.letterDelay + 500;
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
      }, textDuration);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers]);

  const handleContinue = useCallback(() => {
    if (subPhase === "ready") {
      dispatch({ type: "START_BREATH_PAUSE" });
      setTimeout(() => {
        dispatch({ type: "ADVANCE_PHASE" });
        dispatch({ type: "END_BREATH_PAUSE" });
      }, TIMING.breathPause + 200);
    }
  }, [subPhase, dispatch]);

  const showGreeting = subPhase === "greeting" || subPhase === "ready";
  const showContinue = subPhase === "ready";

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      animate={{
        opacity: isActive ? 1 : 0,
      }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Greeting text */}
      <ContentMaterializer
        visible={showGreeting}
        particleRef={particleRef}
        className="text-center max-w-md mx-auto mb-8"
        id="awakening-greeting"
      >
        <LetterByLetter text={GREETING_TEXT} isActive={showGreeting} />
      </ContentMaterializer>

      {/* Continue prompt */}
      <ContentMaterializer
        visible={showContinue}
        particleRef={particleRef}
        delay={300}
        className="text-center"
        id="awakening-continue"
      >
        <motion.button
          onClick={handleContinue}
          className="px-8 py-3 rounded-full border transition-colors min-h-[44px] min-w-[44px]"
          style={{
            borderColor: LYRA.borderGold,
            color: LYRA.gold,
            background: "rgba(201, 169, 78, 0.05)",
          }}
          whileHover={{ scale: 1.03, borderColor: LYRA.gold }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="font-serif text-sm tracking-widest uppercase">Begin the Journey</span>
        </motion.button>
      </ContentMaterializer>
    </motion.div>
  );
}
