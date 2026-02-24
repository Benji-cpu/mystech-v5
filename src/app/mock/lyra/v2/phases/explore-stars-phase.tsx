"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { V2State, V2Action } from "../lyra-v2-state";
import { THEME_ORDER, THEME_COLORS_3D } from "../lyra-v2-theme";

interface ExploreStarsPhaseProps {
  state: V2State;
  dispatch: React.Dispatch<V2Action>;
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

const TOTAL_THEMES = THEME_ORDER.length; // 8

function getNarration(ignitedCount: number): string {
  if (ignitedCount === 0) return "These empty spaces hunger for your stories...";
  if (ignitedCount <= 3) return "The stars begin to remember...";
  if (ignitedCount <= 6) return "Your constellation takes shape...";
  if (ignitedCount === 7) return "One final star awaits...";
  return "Your constellation is complete!";
}

export function ExploreStarsPhase({ state, dispatch }: ExploreStarsPhaseProps) {
  const { ignitedThemes } = state;
  const ignitedCount = ignitedThemes.length;
  const allIgnited = ignitedCount === TOTAL_THEMES;

  const handleIgnite = (themeId: string) => {
    if (ignitedThemes.includes(themeId)) return;
    dispatch({ type: "IGNITE_THEME", themeId });
  };

  const handleForge = () => {
    dispatch({ type: "COMPLETE_EXPLORE" });
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center"
      style={{ pointerEvents: "none" }}
    >
      {/* Top — Lyra narration */}
      <motion.div
        className="pt-12 mt-safe-top px-6 flex flex-col items-center gap-3 w-full"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
      >
        {/* Phase label */}
        <div className="flex items-center gap-2">
          <span className="text-[#c9a94e] text-sm select-none" aria-hidden>
            &#10022;
          </span>
          <p
            className="text-[10px] tracking-[0.25em] uppercase font-medium"
            style={{ color: "rgba(201,169,78,0.7)" }}
          >
            Ignite Your Stars
          </p>
          <span className="text-[#c9a94e] text-sm select-none" aria-hidden>
            &#10022;
          </span>
        </div>

        {/* Narration text — changes with count */}
        <AnimatePresence mode="wait">
          <motion.p
            key={ignitedCount}
            className="italic text-sm text-center max-w-xs leading-relaxed font-serif"
            style={{ color: "rgba(232, 230, 240, 0.75)" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
          >
            {getNarration(ignitedCount)}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section — progress + theme grid + forge button */}
      <motion.div
        className="w-full px-5 pb-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.4 }}
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-2" style={{ pointerEvents: "none" }}>
          {/* Mini star dots */}
          <div className="flex gap-1">
            {THEME_ORDER.map((themeId) => {
              const isIgnited = ignitedThemes.includes(themeId);
              const color = THEME_COLORS_3D[themeId].primary;
              return (
                <motion.div
                  key={themeId}
                  className="w-1.5 h-1.5 rounded-full"
                  animate={{
                    backgroundColor: isIgnited ? color : "rgba(255,255,255,0.15)",
                    boxShadow: isIgnited ? `0 0 6px ${color}` : "none",
                  }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </div>
          <p
            className="text-[10px] tracking-wide"
            style={{ color: "rgba(139,135,160,0.8)" }}
          >
            {ignitedCount}/{TOTAL_THEMES} stars ignited
          </p>
        </div>

        {/* Theme grid — 4 columns x 2 rows */}
        <div
          className="grid grid-cols-4 gap-2 w-full max-w-xs"
          style={{ pointerEvents: "auto" }}
        >
          {THEME_ORDER.map((themeId, i) => {
            const theme = THEME_COLORS_3D[themeId];
            const isIgnited = ignitedThemes.includes(themeId);

            return (
              <motion.button
                key={themeId}
                onClick={() => handleIgnite(themeId)}
                disabled={isIgnited}
                className="rounded-xl py-2 px-1 flex flex-col items-center gap-1 min-h-[44px] text-center relative overflow-hidden"
                style={{
                  background: isIgnited
                    ? `${theme.primary}18`
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    isIgnited ? `${theme.primary}60` : "rgba(255,255,255,0.08)"
                  }`,
                  boxShadow: isIgnited
                    ? `0 0 12px ${theme.primary}30, inset 0 0 8px ${theme.primary}10`
                    : "none",
                  cursor: isIgnited ? "default" : "pointer",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.05 * i }}
                whileHover={!isIgnited ? { scale: 1.06 } : undefined}
                whileTap={!isIgnited ? { scale: 0.94 } : undefined}
              >
                {/* Ignited glow overlay */}
                {isIgnited && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: `radial-gradient(circle at center, ${theme.primary}20, transparent 70%)`,
                    }}
                  />
                )}

                {/* Star icon */}
                <span
                  className="text-sm relative z-10 select-none"
                  style={{
                    color: isIgnited ? theme.primary : "rgba(255,255,255,0.35)",
                    textShadow: isIgnited ? `0 0 8px ${theme.primary}` : "none",
                  }}
                >
                  {isIgnited ? "★" : "☆"}
                </span>

                {/* Label */}
                <span
                  className="text-[9px] leading-tight font-medium relative z-10 tracking-tight"
                  style={{
                    color: isIgnited ? "#e8e6f0" : "rgba(255,255,255,0.45)",
                  }}
                >
                  {theme.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Forge button — appears when all ignited */}
        <AnimatePresence>
          {allIgnited && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={SPRING_GENTLE}
              style={{ pointerEvents: "auto" }}
            >
              <motion.button
                onClick={handleForge}
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
                  boxShadow: "0 0 30px rgba(201,169,78,0.4)",
                }}
                whileTap={{ scale: 0.96 }}
              >
                Forge Your Constellation
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
