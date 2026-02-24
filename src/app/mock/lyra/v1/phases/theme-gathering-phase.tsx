"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { getZodiacById, getZodiacCentroid } from "../zodiac-data";
import {
  LYRA,
  SPRING,
  TIMING,
  THEME_COLORS,
  THEME_ORDER,
  type ThemeType,
} from "../lyra-v1-theme";
import type {
  LyraV1Action,
  ThemeGatheringSubPhase,
  ThemeStar,
} from "../lyra-v1-state";
import type { SkyParticleHandle } from "../sky-particles";

interface ThemeGatheringPhaseProps {
  subPhase: ThemeGatheringSubPhase;
  dispatch: React.Dispatch<LyraV1Action>;
  particleRef: React.RefObject<SkyParticleHandle | null>;
  isActive: boolean;
  selectedZodiac: string | null;
  themeStars: ThemeStar[];
  activeThemeIndex: number;
}

const LYRA_CLUSTER_MESSAGE =
  "Look how the threads of your story write themselves across the sky. Each star a moment, each line a connection.";

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
      className="font-serif text-sm sm:text-base leading-relaxed"
      style={{ color: LYRA.text }}
    />
  );
}

export function ThemeGatheringPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  selectedZodiac,
  themeStars,
  activeThemeIndex,
}: ThemeGatheringPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const zodiac = selectedZodiac ? getZodiacById(selectedZodiac) : null;
  const centroid = zodiac ? getZodiacCentroid(zodiac) : { x: 72, y: 42 };

  // Add theme stars one by one
  useEffect(() => {
    if (subPhase !== "accumulating" || !isActive) return;
    clearTimers();

    const remaining = THEME_ORDER.slice(themeStars.length);
    if (remaining.length === 0) {
      // All added, move to clustering
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "clustering" });
      }, 800);
      timersRef.current.push(t);
      return;
    }

    const nextTheme = remaining[0];
    const index = themeStars.length;
    const angle = (index / THEME_ORDER.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 16 + (index % 3) * 3; // Varying radii for organic feel
    const x = centroid.x + Math.cos(angle) * radius;
    const y = centroid.y + Math.sin(angle) * radius;

    const tc = THEME_COLORS[nextTheme];

    // Determine cluster lines — connect to nearby theme stars
    const clusterLines: [string, string][] = [];
    const starId = `theme-${nextTheme}`;
    for (const existing of themeStars) {
      const dx = existing.x - x;
      const dy = existing.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        clusterLines.push([starId, existing.id]);
      }
    }

    const star: ThemeStar = {
      id: starId,
      theme: nextTheme,
      label: tc.label,
      x,
      y,
      color: tc.primary,
      glow: tc.glow,
      clusterId: null,
      clusterLines,
    };

    const t = setTimeout(() => {
      dispatch({ type: "ADD_THEME_STAR", star });
      dispatch({ type: "SET_ACTIVE_THEME_INDEX", index });

      // Twinkle at new star position
      particleRef.current?.executeCommand({ type: "twinkle", x, y });
    }, TIMING.themeStarGap);

    timersRef.current.push(t);

    return clearTimers;
  }, [subPhase, isActive, themeStars, dispatch, centroid, particleRef, clearTimers]);

  // Start accumulating when entering intro
  useEffect(() => {
    if (subPhase !== "intro" || !isActive) return;
    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "accumulating" });
    }, 1200);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [subPhase, isActive, dispatch]);

  // Clustering phase — reveal cluster lines, then Lyra speaks
  useEffect(() => {
    if (subPhase !== "clustering" || !isActive) return;
    clearTimers();

    dispatch({ type: "REVEAL_CLUSTERS" });

    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "cluster_complete" });
    }, THEME_ORDER.length * TIMING.clusterLineStagger + 500);
    timersRef.current.push(t);

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers]);

  // After cluster complete, auto-advance to complete
  useEffect(() => {
    if (subPhase !== "cluster_complete" || !isActive) return;
    const textDuration = LYRA_CLUSTER_MESSAGE.length * TIMING.letterDelay + 1000;
    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
    }, textDuration);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [subPhase, isActive, dispatch]);

  const handleContinue = useCallback(() => {
    if (subPhase !== "complete") return;
    dispatch({ type: "START_BREATH_PAUSE" });
    const t = setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    }, TIMING.breathPause + 200);
    timersRef.current.push(t);
  }, [subPhase, dispatch]);

  const showThemeList = subPhase === "accumulating" || subPhase === "clustering" || subPhase === "cluster_complete" || subPhase === "complete";
  const showClusterMessage = subPhase === "cluster_complete" || subPhase === "complete";
  const showContinue = subPhase === "complete";

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 px-4 overflow-hidden"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Status */}
      <motion.div className="text-center py-2 shrink-0">
        <motion.p
          key={subPhase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.7, y: 0 }}
          className="font-serif text-xs sm:text-sm"
          style={{ color: LYRA.goldDim }}
        >
          {subPhase === "intro" && "Gathering the themes of your story..."}
          {subPhase === "accumulating" && "Stars are forming around your constellation..."}
          {subPhase === "clustering" && "Patterns emerge in the starfield..."}
          {(subPhase === "cluster_complete" || subPhase === "complete") && "Your personal sky takes shape"}
        </motion.p>
      </motion.div>

      {/* Theme list — accumulating */}
      <motion.div
        className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto"
        animate={{
          opacity: showThemeList ? 1 : 0,
        }}
        transition={SPRING}
      >
        <div className="w-full max-w-sm mx-auto space-y-2 py-2">
          {themeStars.map((star, i) => {
            const isLatest = i === activeThemeIndex;
            const tc = THEME_COLORS[star.theme];
            return (
              <motion.div
                key={star.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{
                  opacity: isLatest ? 1 : 0.5,
                  x: 0,
                  scale: isLatest ? 1.02 : 1,
                }}
                transition={SPRING}
                className="flex items-center gap-3 py-1.5 px-3 rounded-lg"
                style={{
                  background: isLatest ? `${star.glow}` : "transparent",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: star.color,
                    boxShadow: isLatest ? `0 0 8px ${star.glow}` : "none",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="font-serif text-sm font-medium"
                    style={{ color: isLatest ? star.color : LYRA.text }}
                  >
                    {tc.label}
                  </p>
                  {isLatest && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      className="text-xs truncate"
                      style={{ color: LYRA.textDim }}
                    >
                      {tc.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lyra cluster message */}
        <motion.div
          animate={{
            opacity: showClusterMessage ? 1 : 0,
            y: showClusterMessage ? 0 : 12,
          }}
          transition={{ ...SPRING, delay: 0.3 }}
          className="text-center max-w-sm mx-auto mt-4 px-2"
        >
          <LetterByLetter text={LYRA_CLUSTER_MESSAGE} isActive={showClusterMessage} />
        </motion.div>

        {/* Continue */}
        <motion.div
          animate={{
            opacity: showContinue ? 1 : 0,
            y: showContinue ? 0 : 12,
          }}
          transition={{ ...SPRING, delay: 0.5 }}
          className="mt-4"
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
              View Your Sky
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
