"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { V2State, V2Action } from "../lyra-v2-state";
import { ELEMENT_COLORS_3D } from "../lyra-v2-theme";
import { ZODIAC_SIGNS_3D } from "../zodiac-spheres";

interface ChooseSkyPhaseProps {
  state: V2State;
  dispatch: React.Dispatch<V2Action>;
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

export function ChooseSkyPhase({ state, dispatch }: ChooseSkyPhaseProps) {
  const { selectedZodiac } = state;

  // Look up the full zodiac data from the ID
  const selectedZodiacData = selectedZodiac
    ? ZODIAC_SIGNS_3D.find((z) => z.id === selectedZodiac) ?? null
    : null;

  const elementColors = selectedZodiacData
    ? ELEMENT_COLORS_3D[selectedZodiacData.element]
    : null;

  const handleConfirm = () => {
    if (!state.selectedZodiac) return;
    dispatch({ type: "CONFIRM_ZODIAC" });
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center"
      style={{ pointerEvents: "none" }}
    >
      {/* Phase label — top center */}
      <motion.div
        className="mt-safe-top pt-12 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#c9a94e] text-base select-none" aria-hidden>
            &#10022;
          </span>
          <p
            className="text-xs tracking-[0.25em] uppercase font-medium"
            style={{ color: "#c9a94e" }}
          >
            Choose Your Sky
          </p>
          <span className="text-[#c9a94e] text-base select-none" aria-hidden>
            &#10022;
          </span>
        </div>
      </motion.div>

      {/* Center — zodiac selection info card */}
      <div className="flex-1 flex items-center justify-center w-full px-6">
        <AnimatePresence mode="wait">
          {selectedZodiacData ? (
            <motion.div
              key="zodiac-card"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -8 }}
              transition={SPRING}
              className="w-full max-w-xs rounded-2xl px-6 py-5 text-center"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Symbol with decorative glow ring */}
              <motion.div
                className="relative inline-flex items-center justify-center mb-3"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING, delay: 0.1 }}
              >
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: 72,
                    height: 72,
                    margin: "auto",
                    boxShadow: `0 0 20px ${elementColors?.primary ?? "#c9a94e"}30, 0 0 40px ${elementColors?.primary ?? "#c9a94e"}15, inset 0 0 15px ${elementColors?.primary ?? "#c9a94e"}10`,
                    border: `1px solid ${elementColors?.primary ?? "#c9a94e"}25`,
                  }}
                />
                <p
                  className="text-5xl select-none relative z-10 leading-none"
                  style={{
                    color: elementColors?.primary ?? "#c9a94e",
                    textShadow: `0 0 12px ${elementColors?.primary ?? "#c9a94e"}60, 0 0 24px ${elementColors?.primary ?? "#c9a94e"}30`,
                    width: 72,
                    height: 72,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedZodiacData.symbol}
                </p>
              </motion.div>

              {/* Name in serif with subtle letter-spacing */}
              <motion.p
                className="font-serif text-xl font-medium mb-2 tracking-wide"
                style={{ color: "#e8e6f0" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.15 }}
              >
                {selectedZodiacData.name}
              </motion.p>

              {/* Element badge */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...SPRING, delay: 0.2 }}
              >
                <span
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-medium border"
                  style={{
                    color: elementColors?.primary ?? "#c9a94e",
                    borderColor: elementColors?.primary
                      ? `${elementColors.primary}40`
                      : "rgba(201,169,78,0.3)",
                    background: elementColors?.primary
                      ? `${elementColors.primary}15`
                      : "rgba(201,169,78,0.08)",
                  }}
                >
                  {selectedZodiacData.element}
                </span>
              </motion.div>

              {/* Date range */}
              <motion.p
                className="text-xs tracking-wide"
                style={{ color: "#8b87a0" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...SPRING, delay: 0.25 }}
              >
                {selectedZodiacData.dateRange}
              </motion.p>
            </motion.div>
          ) : (
            <motion.p
              key="instruction"
              className="text-center text-sm font-serif max-w-[200px] leading-relaxed"
              style={{ color: "rgba(139, 135, 160, 0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              Touch &amp; orbit the star sphere, tap a constellation
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom — confirm button */}
      <div className="pb-12 flex flex-col items-center gap-4 w-full px-6">
        <AnimatePresence>
          {selectedZodiacData && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={SPRING_GENTLE}
              style={{ pointerEvents: "auto" }}
            >
              <motion.button
                onClick={handleConfirm}
                className="px-8 py-3 rounded-full font-serif text-sm tracking-widest uppercase min-h-[44px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,169,78,0.25), rgba(201,169,78,0.12))",
                  border: "1px solid rgba(201,169,78,0.5)",
                  color: "#c9a94e",
                  boxShadow: "0 0 20px rgba(201,169,78,0.2)",
                }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 0 30px rgba(201,169,78,0.35)",
                }}
                whileTap={{ scale: 0.96 }}
              >
                Enter the Stars
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
