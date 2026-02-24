"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ZODIAC_SIGNS, type ZodiacSign } from "../zodiac-data";
import { LYRA, SPRING, ELEMENT_COLORS, TIMING } from "../lyra-v1-theme";
import type { LyraV1Action, BirthSkySubPhase } from "../lyra-v1-state";
import type { SkyParticleHandle } from "../sky-particles";

interface BirthSkyPhaseProps {
  subPhase: BirthSkySubPhase;
  dispatch: React.Dispatch<LyraV1Action>;
  particleRef: React.RefObject<SkyParticleHandle | null>;
  isActive: boolean;
  selectedZodiac: string | null;
}

export function BirthSkyPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  selectedZodiac,
}: BirthSkyPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Animate zodiac draw progress
  useEffect(() => {
    if (subPhase !== "drawing" || !isActive) return;
    clearTimers();

    const startTime = performance.now();
    const duration = TIMING.zodiacDraw;
    let raf: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      dispatch({ type: "SET_ZODIAC_DRAW_PROGRESS", progress });

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        const t = setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
        }, 500);
        timersRef.current.push(t);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
    };
  }, [subPhase, isActive, dispatch, clearTimers]);

  const handleSelectZodiac = useCallback(
    (sign: ZodiacSign) => {
      if (subPhase !== "picking") return;
      dispatch({ type: "SET_ZODIAC", zodiacId: sign.id });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "drawing" });

      // Twinkle at the zodiac centroid
      const primary = sign.stars[sign.primaryStarIndex];
      particleRef.current?.executeCommand({
        type: "twinkle",
        x: primary.x,
        y: primary.y,
      });
    },
    [subPhase, dispatch, particleRef]
  );

  const handleContinue = useCallback(() => {
    if (subPhase !== "complete") return;
    dispatch({ type: "START_BREATH_PAUSE" });
    const t = setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    }, TIMING.breathPause + 200);
    timersRef.current.push(t);
  }, [subPhase, dispatch]);

  const showPicker = subPhase === "picking";
  const showComplete = subPhase === "complete";
  const selectedSign = selectedZodiac
    ? ZODIAC_SIGNS.find((z) => z.id === selectedZodiac)
    : null;

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 px-4 min-h-0 overflow-hidden"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Zodiac picker grid */}
      <motion.div
        animate={{
          opacity: showPicker ? 1 : 0,
          scale: showPicker ? 1 : 0.95,
          height: showPicker ? "auto" : 0,
        }}
        transition={SPRING}
        className="overflow-hidden w-full max-w-lg mx-auto"
        style={{ pointerEvents: showPicker ? "auto" : "none" }}
      >
        <p
          className="text-center font-serif text-sm sm:text-base mb-4"
          style={{ color: LYRA.textDim }}
        >
          Choose your birth sign
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-2">
          {ZODIAC_SIGNS.map((sign) => {
            const ec = ELEMENT_COLORS[sign.element];
            return (
              <motion.button
                key={sign.id}
                onClick={() => handleSelectZodiac(sign)}
                className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border transition-colors min-h-[60px] sm:min-h-[44px]"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  background: "rgba(255, 255, 255, 0.03)",
                }}
                whileHover={{
                  borderColor: ec.primary,
                  background: `${ec.glow}`,
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl sm:text-2xl" style={{ color: ec.primary }}>
                  {sign.symbol}
                </span>
                <span
                  className="text-[11px] sm:text-[10px] uppercase tracking-wider font-medium"
                  style={{ color: LYRA.text }}
                >
                  {sign.name}
                </span>
                <span
                  className="text-[9px] sm:text-[8px]"
                  style={{ color: LYRA.textDim }}
                >
                  {sign.dateRange}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Completion message */}
      <motion.div
        animate={{
          opacity: showComplete ? 1 : 0,
          y: showComplete ? 0 : 12,
        }}
        transition={SPRING}
        className="text-center"
        style={{ pointerEvents: showComplete ? "auto" : "none" }}
      >
        {selectedSign && (
          <>
            <p
              className="text-3xl sm:text-4xl mb-2"
              style={{ color: ELEMENT_COLORS[selectedSign.element].primary }}
            >
              {selectedSign.symbol}
            </p>
            <p
              className="font-serif text-lg sm:text-xl mb-1"
              style={{ color: LYRA.text }}
            >
              {selectedSign.name}
            </p>
            <p
              className="font-serif text-xs sm:text-sm mb-6"
              style={{ color: LYRA.textDim }}
            >
              {selectedSign.dateRange}
            </p>
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
                Step Beneath Your Stars
              </span>
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
