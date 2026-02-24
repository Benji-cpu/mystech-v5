"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { LYRA, SPRING, TIMING } from "../lyra-journey-theme";
import { ContentMaterializer } from "../content-materializer";
import type { JourneyAction, ReturnSubPhase } from "../lyra-journey-state";
import type { ParticleHandle } from "../lyra-particles";

interface ReturnPhaseProps {
  subPhase: ReturnSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  particleRef: React.RefObject<ParticleHandle | null>;
  isActive: boolean;
  userName: string;
  loopCount: number;
}

export function ReturnPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  userName,
  loopCount,
}: ReturnPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) return;
    clearTimers();

    if (subPhase === "compressing") {
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "opening" });
      }, 1500);
      timersRef.current.push(t);
    } else if (subPhase === "opening") {
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
      }, 1500);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers]);

  const handleContinue = useCallback(() => {
    dispatch({ type: "START_BREATH_PAUSE" });
    setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" }); // Loops back to creation
      dispatch({ type: "END_BREATH_PAUSE" });
    }, TIMING.breathPause + 200);
  }, [dispatch]);

  const showText = subPhase === "opening" || subPhase === "ready";
  const showButton = subPhase === "ready";

  const returnText = loopCount === 0
    ? `The cards have spoken, ${userName || "seeker"}. But the threads of your story continue to weave. Shall we explore another pattern?`
    : `Each reading reveals new facets, ${userName || "seeker"}. The constellation grows richer with every journey. Shall we continue?`;

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Compression visual — stars drawing back in */}
      {subPhase === "compressing" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full mx-auto border flex items-center justify-center"
            style={{
              borderColor: LYRA.borderGold,
              background: "rgba(201, 169, 78, 0.05)",
            }}
            animate={{
              scale: [1, 0.8, 1.1, 1],
              borderColor: [LYRA.borderGold, LYRA.gold, LYRA.borderGold],
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <span className="text-2xl" style={{ color: LYRA.gold }}>
              &#10022;
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* Return text */}
      <ContentMaterializer
        visible={showText}
        particleRef={particleRef}
        className="text-center max-w-md mx-auto mb-8"
        id="return-text"
      >
        <p className="font-serif text-lg sm:text-xl leading-relaxed" style={{ color: LYRA.text }}>
          {returnText}
        </p>
      </ContentMaterializer>

      {/* Continue button */}
      <ContentMaterializer
        visible={showButton}
        particleRef={particleRef}
        delay={400}
        className="text-center flex flex-col items-center gap-3"
        id="return-continue"
      >
        <motion.button
          onClick={handleContinue}
          className="px-8 py-3 rounded-full border min-h-[44px] min-w-[44px]"
          style={{
            borderColor: LYRA.borderGold,
            color: LYRA.gold,
            background: "rgba(201, 169, 78, 0.05)",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="font-serif text-sm tracking-widest uppercase">
            Draw Again
          </span>
        </motion.button>

        <p className="text-xs" style={{ color: LYRA.textDim }}>
          Journey {loopCount + 1} complete
        </p>
      </ContentMaterializer>
    </motion.div>
  );
}
