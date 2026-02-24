"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ELEMENT_GREETINGS, getZodiacById } from "../zodiac-data";
import { LYRA, SPRING, TIMING, ELEMENT_COLORS } from "../lyra-v1-theme";
import type { LyraV1Action, LyraAwakensSubPhase } from "../lyra-v1-state";
import type { SkyParticleHandle } from "../sky-particles";

interface LyraAwakensPhaseProps {
  subPhase: LyraAwakensSubPhase;
  dispatch: React.Dispatch<LyraV1Action>;
  particleRef: React.RefObject<SkyParticleHandle | null>;
  isActive: boolean;
  selectedZodiac: string | null;
}

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
      className="font-serif text-base sm:text-lg leading-relaxed"
      style={{ color: LYRA.text }}
    />
  );
}

export function LyraAwakensPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  selectedZodiac,
}: LyraAwakensPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const zodiac = selectedZodiac ? getZodiacById(selectedZodiac) : null;
  const greetingText = zodiac
    ? ELEMENT_GREETINGS[zodiac.element]
    : "Welcome, seeker...";

  // Auto-advance sub-phases
  useEffect(() => {
    if (!isActive) return;
    clearTimers();

    if (subPhase === "scattering") {
      // Lyra stars are scattered; wait, then form
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "forming" });
      }, 1200);
      timersRef.current.push(t);
    } else if (subPhase === "forming") {
      // Move to lyra formation
      dispatch({ type: "SET_LYRA_FORMED", formed: true });
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "connecting" });
      }, TIMING.lyraConverge);
      timersRef.current.push(t);
    } else if (subPhase === "connecting") {
      // Draw golden thread
      dispatch({ type: "SET_THREAD_DRAWN", drawn: true });
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "greeting" });
      }, 1200);
      timersRef.current.push(t);
    } else if (subPhase === "greeting") {
      // Wait for letter-by-letter text to finish
      const textDuration = greetingText.length * TIMING.letterDelay + 800;
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
      }, textDuration);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers, greetingText]);

  const handleContinue = useCallback(() => {
    if (subPhase !== "ready") return;
    dispatch({ type: "START_BREATH_PAUSE" });
    const t = setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    }, TIMING.breathPause + 200);
    timersRef.current.push(t);
  }, [subPhase, dispatch]);

  const showGreeting = subPhase === "greeting" || subPhase === "ready";
  const showContinue = subPhase === "ready";
  const formingLabel =
    subPhase === "scattering"
      ? "Stars scatter across the sky..."
      : subPhase === "forming"
      ? "A constellation takes shape..."
      : subPhase === "connecting"
      ? "A golden thread draws between the stars..."
      : null;

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Formation status text */}
      <motion.div
        animate={{
          opacity: formingLabel ? 0.7 : 0,
          height: formingLabel ? "auto" : 0,
        }}
        transition={SPRING}
        className="text-center mb-4 overflow-hidden"
      >
        <p
          className="font-serif text-xs sm:text-sm italic"
          style={{ color: LYRA.goldDim }}
        >
          {formingLabel}
        </p>
      </motion.div>

      {/* Greeting text */}
      <motion.div
        animate={{
          opacity: showGreeting ? 1 : 0,
          y: showGreeting ? 0 : 12,
          scale: showGreeting ? 1 : 0.97,
        }}
        transition={{ ...SPRING, delay: showGreeting ? 0.2 : 0 }}
        className="text-center max-w-md mx-auto mb-8"
        style={{ pointerEvents: showGreeting ? "auto" : "none" }}
      >
        <LetterByLetter text={greetingText} isActive={showGreeting} />
      </motion.div>

      {/* Continue button */}
      <motion.div
        animate={{
          opacity: showContinue ? 1 : 0,
          y: showContinue ? 0 : 12,
        }}
        transition={{ ...SPRING, delay: 0.3 }}
        style={{ pointerEvents: showContinue ? "auto" : "none" }}
      >
        <motion.button
          onClick={handleContinue}
          className="px-8 py-3 rounded-full border min-h-[44px]"
          style={{
            borderColor: LYRA.borderGold,
            color: LYRA.gold,
            background: "rgba(201, 169, 78, 0.05)",
          }}
          whileHover={{ scale: 1.03, borderColor: LYRA.gold }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="font-serif text-sm tracking-widest uppercase">
            Continue
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
