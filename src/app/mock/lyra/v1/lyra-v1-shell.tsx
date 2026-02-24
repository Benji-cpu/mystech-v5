"use client";

import { useReducer, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import { lyraV1Reducer, initialState } from "./lyra-v1-state";
import { getZodiacById } from "./zodiac-data";
import {
  LYRA,
  SPRING,
  PHASE_MOOD,
  type LyraPhaseId,
} from "./lyra-v1-theme";
import { StarSky } from "./star-sky";
import { SkyParticles, type SkyParticleHandle } from "./sky-particles";
import { BirthSkyPhase } from "./phases/birth-sky-phase";
import { LyraAwakensPhase } from "./phases/lyra-awakens-phase";
import { ThemeGatheringPhase } from "./phases/theme-gathering-phase";
import { SkyMapPhase } from "./phases/sky-map-phase";
import { StarReadingPhase } from "./phases/star-reading-phase";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap" });

// ── Phase labels ────────────────────────────────────────────────────

const PHASE_LABELS: Record<LyraPhaseId, string> = {
  birth_sky: "Birth Sky",
  lyra_awakens: "Awakening",
  theme_gathering: "The Gathering",
  sky_map: "Your Sky",
  star_reading: "Star Reading",
};

// ── Shell component ─────────────────────────────────────────────────

export function LyraV1Shell() {
  const [state, dispatch] = useReducer(lyraV1Reducer, initialState);
  const particleRef = useRef<SkyParticleHandle>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Track container size
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Execute particle commands
  useEffect(() => {
    if (state.particleCommand.type !== "idle" && particleRef.current) {
      particleRef.current.executeCommand(state.particleCommand);
    }
  }, [state.particleCommand]);

  const currentMood = PHASE_MOOD[state.phase];
  const zodiac = state.selectedZodiac
    ? getZodiacById(state.selectedZodiac)
    : null;

  // Determine Lyra's speaking state
  const lyraSpeaking =
    state.subPhase === "greeting" ||
    state.subPhase === "cluster_complete" ||
    state.subPhase === "interpreting";

  // Whether to show Lyra connections
  const lyraConnections = state.lyraFormed;

  // Sky zone height: taller when sky is the focus, shorter during reading interpretation
  const skyZoneHeight =
    state.phase === "star_reading" &&
    (state.subPhase === "interpreting" || state.subPhase === "complete")
      ? "20%"
      : state.phase === "sky_map"
      ? "45%"
      : "35%";

  return (
    <div
      ref={shellRef}
      className={`h-[100dvh] w-full flex flex-col overflow-hidden relative ${playfair.className}`}
      style={{ background: LYRA.bg }}
    >
      {/* Layer 0: Deep background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, rgba(30, 10, 60, 0.6), ${LYRA.bg} 70%)`,
        }}
      />

      {/* Layer 1: Canvas particles */}
      <SkyParticles ref={particleRef} mood={currentMood} />

      {/* Layer 2: Star Sky SVG */}
      <motion.div
        className="absolute inset-x-0 top-0 z-20 pointer-events-none"
        layout
        animate={{ height: skyZoneHeight }}
        transition={SPRING}
      >
        <StarSky
          zodiac={zodiac ?? null}
          zodiacDrawProgress={state.zodiacDrawProgress}
          lyraFormed={state.lyraFormed}
          lyraConnections={lyraConnections}
          lyraSpeaking={lyraSpeaking}
          threadToZodiac={state.threadDrawn}
          themeStars={state.themeStars}
          clustersRevealed={state.clustersRevealed}
          readingPositions={state.readingStarPositions}
          revealedCards={state.revealedCards}
          triangleDrawn={state.triangleDrawn}
          isBreathPause={state.isBreathPause}
        />
      </motion.div>

      {/* Layer 3: DOM content zones */}
      <div className="relative z-30 flex flex-col flex-1 min-h-0">
        {/* Phase indicator */}
        <motion.div className="shrink-0 pt-3 pb-1 px-4 text-center" layout>
          <motion.p
            key={state.phase}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: state.isBreathPause ? 0.2 : 0.5, y: 0 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em]"
            style={{ color: LYRA.goldDim }}
          >
            {PHASE_LABELS[state.phase]}
          </motion.p>
        </motion.div>

        {/* Constellation spacer — reserves space for the SVG constellation zone */}
        <motion.div
          className="shrink-0"
          layout
          animate={{ height: skyZoneHeight }}
          transition={SPRING}
        />

        {/* Content zone — phases render here */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          {/* Breath pause overlay */}
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            animate={{ opacity: state.isBreathPause ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, ${LYRA.bg}80 100%)`,
            }}
          />

          {/* All phases always mounted */}
          <PhaseWrapper isActive={state.phase === "birth_sky"}>
            <BirthSkyPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "birth_sky"}
              selectedZodiac={state.selectedZodiac}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "lyra_awakens"}>
            <LyraAwakensPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "lyra_awakens"}
              selectedZodiac={state.selectedZodiac}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "theme_gathering"}>
            <ThemeGatheringPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "theme_gathering"}
              selectedZodiac={state.selectedZodiac}
              themeStars={state.themeStars}
              activeThemeIndex={state.activeThemeIndex}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "sky_map"}>
            <SkyMapPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "sky_map"}
              themeStars={state.themeStars}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "star_reading"}>
            <StarReadingPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "star_reading"}
              selectedZodiac={state.selectedZodiac}
              revealedCards={state.revealedCards}
              interpretationProgress={state.interpretationProgress}
              triangleDrawn={state.triangleDrawn}
            />
          </PhaseWrapper>
        </div>

        {/* Safe area bottom */}
        <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-40"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(10, 1, 24, 0.4) 100%)",
        }}
      />
    </div>
  );
}

// ── Phase wrapper ───────────────────────────────────────────────────

function PhaseWrapper({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      animate={{
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none",
      }}
      transition={{ duration: 0.3 }}
      style={{
        visibility: isActive ? "visible" : "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}
