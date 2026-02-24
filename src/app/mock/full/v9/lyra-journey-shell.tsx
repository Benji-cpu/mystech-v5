"use client";

import { useReducer, useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import {
  LYRA,
  SPRING,
  PHASE_FORMATION,
  PHASE_MOOD,
  FORMATIONS,
  type PhaseId,
} from "./lyra-journey-theme";
import { journeyReducer, initialState } from "./lyra-journey-state";
import { LyraConstellation } from "./lyra-constellation";
import { LyraParticles, type ParticleHandle } from "./lyra-particles";
import { LyraGoldenThread } from "./lyra-golden-thread";

import { AwakeningPhase } from "./phases/awakening-phase";
import { GatheringPhase } from "./phases/gathering-phase";
import { CreationPhase } from "./phases/creation-phase";
import { RevelationPhase } from "./phases/revelation-phase";
import { ReturnPhase } from "./phases/return-phase";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap" });

// ── Phase label display ─────────────────────────────────────────────

const PHASE_LABELS: Record<PhaseId, string> = {
  awakening: "Awakening",
  gathering: "The Gathering",
  creation: "Creation",
  revelation: "Revelation",
  return: "Return",
};

// ── Shell component ─────────────────────────────────────────────────

export function LyraJourneyShell() {
  const [state, dispatch] = useReducer(journeyReducer, initialState);
  const particleRef = useRef<ParticleHandle>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Track container size for golden thread pixel→viewBox conversion
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

  // Execute particle commands when state changes
  useEffect(() => {
    if (state.particleCommand.type !== "idle" && particleRef.current) {
      particleRef.current.executeCommand(state.particleCommand);
    }
  }, [state.particleCommand]);

  // Current mood for particles
  const currentMood = PHASE_MOOD[state.phase];

  // Golden thread targets (from Vega to active content area)
  const goldenThreads = useMemo(() => {
    const vega = FORMATIONS[state.formation]?.vega;
    if (!vega) return [];

    // Show thread during specific sub-phases
    if (
      state.subPhase === "name_input" ||
      state.subPhase === "intention_input" ||
      state.subPhase === "revealing"
    ) {
      return [
        {
          id: `thread-${state.subPhase}`,
          fromCx: vega.cx,
          fromCy: vega.cy,
          toX: containerSize.width / 2,
          toY: containerSize.height * 0.65,
        },
      ];
    }
    return [];
  }, [state.formation, state.subPhase, containerSize]);

  // Determine speaking state for constellation
  const isSpeaking =
    state.subPhase === "greeting" ||
    state.subPhase === "name_absorb" ||
    state.subPhase === "intention_absorb" ||
    state.subPhase === "interpreting";

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
          background: `radial-gradient(ellipse at 50% 30%, rgba(30, 10, 60, 0.6), ${LYRA.bg} 70%)`,
        }}
      />

      {/* Layer 1: Canvas particles */}
      <LyraParticles ref={particleRef} mood={currentMood} />

      {/* Layer 2: SVG constellation */}
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ height: "40%" }}>
        <LyraConstellation
          formation={state.formation}
          showConnections={state.showConnections}
          userStars={state.userStars}
          isBreathPause={state.isBreathPause}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Layer 4: Golden thread overlay */}
      <LyraGoldenThread
        threads={goldenThreads}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
      />

      {/* Layer 3: DOM content zones */}
      <div className="relative z-30 flex flex-col flex-1 min-h-0">
        {/* Phase indicator */}
        <motion.div
          className="shrink-0 pt-3 pb-1 px-4 text-center"
          layout
        >
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
          animate={{
            height: state.phase === "revelation" && (state.subPhase === "interpreting" || state.subPhase === "complete")
              ? "15%"
              : "30%",
          }}
          transition={SPRING}
        />

        {/* Content zone — phases render here */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          {/* Breath pause overlay */}
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            animate={{
              opacity: state.isBreathPause ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, ${LYRA.bg}80 100%)`,
            }}
          />

          {/* All phases always mounted — visibility controlled by isActive */}
          <PhaseWrapper isActive={state.phase === "awakening"}>
            <AwakeningPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "awakening"}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "gathering"}>
            <GatheringPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "gathering"}
              userName={state.userName}
              userIntention={state.userIntention}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "creation"}>
            <CreationPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "creation"}
              selectedStyleId={state.selectedStyleId}
              userName={state.userName}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "revelation"}>
            <RevelationPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "revelation"}
              revealedCards={state.revealedCards}
              interpretationProgress={state.interpretationProgress}
              userName={state.userName}
            />
          </PhaseWrapper>

          <PhaseWrapper isActive={state.phase === "return"}>
            <ReturnPhase
              subPhase={state.subPhase as never}
              dispatch={dispatch}
              particleRef={particleRef}
              isActive={state.phase === "return"}
              userName={state.userName}
              loopCount={state.loopCount}
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
// Keeps all phases mounted but only the active one is visible/interactive

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
