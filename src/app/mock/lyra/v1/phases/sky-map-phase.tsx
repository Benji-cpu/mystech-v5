"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { LYRA, SPRING, TIMING, THEME_COLORS } from "../lyra-v1-theme";
import type { LyraV1Action, SkyMapSubPhase, ThemeStar } from "../lyra-v1-state";
import type { SkyParticleHandle } from "../sky-particles";

interface SkyMapPhaseProps {
  subPhase: SkyMapSubPhase;
  dispatch: React.Dispatch<LyraV1Action>;
  particleRef: React.RefObject<SkyParticleHandle | null>;
  isActive: boolean;
  themeStars: ThemeStar[];
}

export function SkyMapPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  themeStars,
}: SkyMapPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Auto-advance from revealing to contemplating
  useEffect(() => {
    if (subPhase !== "revealing" || !isActive) return;
    clearTimers();

    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "contemplating" });
    }, 1500);
    timersRef.current.push(t);

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers]);

  // Auto-advance from contemplating to ready
  useEffect(() => {
    if (subPhase !== "contemplating" || !isActive) return;

    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
    }, 2000);
    timersRef.current.push(t);

    return () => clearTimeout(t);
  }, [subPhase, isActive, dispatch]);

  const handleBeginReading = useCallback(() => {
    if (subPhase !== "ready") return;
    dispatch({ type: "START_BREATH_PAUSE" });
    const t = setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    }, TIMING.breathPause + 200);
    timersRef.current.push(t);
  }, [subPhase, dispatch]);

  const showInsights = subPhase === "contemplating" || subPhase === "ready";
  const showButton = subPhase === "ready";

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 px-4 overflow-hidden"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Title */}
      <motion.div className="text-center py-3 shrink-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          className="font-serif text-base sm:text-lg"
          style={{ color: LYRA.gold }}
        >
          Your Personal Star Map
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-xs sm:text-sm mt-1"
          style={{ color: LYRA.textDim }}
        >
          A constellation unique to your journey
        </motion.p>
      </motion.div>

      {/* Theme insights list */}
      <motion.div
        className="flex-1 min-h-0 overflow-y-auto"
        animate={{
          opacity: showInsights ? 1 : 0,
          y: showInsights ? 0 : 16,
        }}
        transition={{ ...SPRING, delay: 0.2 }}
      >
        <div className="max-w-sm mx-auto space-y-3 py-2">
          {themeStars.map((star, i) => {
            const tc = THEME_COLORS[star.theme];
            return (
              <motion.div
                key={star.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                  style={{
                    backgroundColor: star.color,
                    boxShadow: `0 0 6px ${star.glow}`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="font-serif text-sm font-medium"
                    style={{ color: star.color }}
                  >
                    {tc.label}
                  </p>
                  <p
                    className="font-serif text-xs leading-relaxed"
                    style={{ color: LYRA.textDim }}
                  >
                    {tc.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Begin Reading button */}
      <motion.div
        className="shrink-0 text-center py-4"
        animate={{
          opacity: showButton ? 1 : 0,
          y: showButton ? 0 : 12,
        }}
        transition={{ ...SPRING, delay: 0.4 }}
        style={{ pointerEvents: showButton ? "auto" : "none" }}
      >
        <motion.button
          onClick={handleBeginReading}
          className="px-8 py-3 rounded-full border min-h-[44px]"
          style={{
            borderColor: LYRA.borderGold,
            color: LYRA.gold,
            background: "rgba(201, 169, 78, 0.08)",
          }}
          whileHover={{ scale: 1.03, borderColor: LYRA.gold }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="font-serif text-sm tracking-widest uppercase">
            Begin Reading
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
