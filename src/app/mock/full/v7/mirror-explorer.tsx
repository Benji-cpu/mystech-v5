"use client";

import { useReducer, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MIRRORS,
  TRANSITIONS,
  CONTENTS,
  type ExplorerState,
  type ExplorerAction,
  type MirrorId,
  type TransitionId,
  type ContentId,
  type ControlTab,
} from "./mirror-types";
import { mirrorRegistry } from "./mirrors";
import { transitionRegistry } from "./transitions";
import { contentRegistry } from "./content";
import { ControlPanel } from "./controls/control-panel";
import { MT } from "./mirror-theme";

// ─── Reducer ────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: readonly { id: T }[], exclude?: T): T {
  const filtered = exclude ? arr.filter((a) => a.id !== exclude) : [...arr];
  return filtered[Math.floor(Math.random() * filtered.length)].id;
}

const initialState: ExplorerState = {
  activeMirror: "crystal-ball",
  activeTransition: "blur-dissolve",
  activeContent: "single-card",
  previousContent: null,
  transitionKey: 0,
  isTransitioning: false,
  controlsOpen: false,
  activeControlTab: "mirror",
};

function reducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case "SELECT_MIRROR":
      return { ...state, activeMirror: action.id };
    case "SELECT_TRANSITION":
      return { ...state, activeTransition: action.id };
    case "SELECT_CONTENT":
      if (action.id === state.activeContent) return state;
      return { ...state, activeContent: action.id };
    case "TRIGGER_TRANSITION":
      if (state.isTransitioning) return state;
      // Pick a different content to transition to
      const nextContent = pickRandom(CONTENTS, state.activeContent);
      return {
        ...state,
        previousContent: state.activeContent,
        activeContent: nextContent,
        transitionKey: state.transitionKey + 1,
        isTransitioning: true,
      };
    case "TRANSITION_COMPLETE":
      return { ...state, isTransitioning: false, previousContent: null };
    case "TOGGLE_CONTROLS":
      return { ...state, controlsOpen: !state.controlsOpen };
    case "SET_CONTROL_TAB":
      return { ...state, activeControlTab: action.tab };
    case "RANDOM_ALL":
      return {
        ...state,
        activeMirror: pickRandom(MIRRORS),
        activeTransition: pickRandom(TRANSITIONS),
        activeContent: pickRandom(CONTENTS, state.activeContent),
      };
    default:
      return state;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MirrorExplorer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  const MirrorFrame = mirrorRegistry[state.activeMirror];
  const TransitionEffect = transitionRegistry[state.activeTransition];
  const ActiveContent = contentRegistry[state.activeContent];
  const PreviousContent = state.previousContent
    ? contentRegistry[state.previousContent]
    : null;

  const activeMirrorMeta = MIRRORS.find((m) => m.id === state.activeMirror)!;
  const activeTransitionMeta = TRANSITIONS.find(
    (t) => t.id === state.activeTransition
  )!;
  const activeContentMeta = CONTENTS.find(
    (c) => c.id === state.activeContent
  )!;

  const handleSelectMirror = useCallback((id: MirrorId) => {
    dispatch({ type: "SELECT_MIRROR", id });
  }, []);

  const handleSelectTransition = useCallback((id: TransitionId) => {
    dispatch({ type: "SELECT_TRANSITION", id });
  }, []);

  const handleSelectContent = useCallback((id: ContentId) => {
    dispatch({ type: "SELECT_CONTENT", id });
  }, []);

  const handleTrigger = useCallback(() => {
    dispatch({ type: "TRIGGER_TRANSITION" });
  }, []);

  const handleComplete = useCallback(() => {
    dispatch({ type: "TRANSITION_COMPLETE" });
  }, []);

  const handleToggleControls = useCallback(() => {
    dispatch({ type: "TOGGLE_CONTROLS" });
  }, []);

  const handleSetTab = useCallback((tab: ControlTab) => {
    dispatch({ type: "SET_CONTROL_TAB", tab });
  }, []);

  const handleRandomAll = useCallback(() => {
    dispatch({ type: "RANDOM_ALL" });
  }, []);

  // Build outgoing/incoming nodes for transition
  const outgoingNode = useMemo(
    () => (PreviousContent ? <PreviousContent /> : <ActiveContent />),
    [PreviousContent, ActiveContent]
  );
  const incomingNode = useMemo(
    () => <ActiveContent />,
    [ActiveContent]
  );

  return (
    <div
      className="h-[100dvh] flex flex-col overflow-hidden lg:flex-row"
      style={{ background: MT.bg }}
    >
      {/* ── Mirror Display Area ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative p-4 lg:p-8">
        {/* Header info */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${state.activeMirror}-${state.activeTransition}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <h1
                  className="text-sm font-semibold truncate"
                  style={{ color: MT.text }}
                >
                  {activeMirrorMeta.name}
                </h1>
                <p className="text-xs" style={{ color: MT.textDim }}>
                  {activeTransitionMeta.name} &middot;{" "}
                  {activeContentMeta.name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile controls toggle */}
          <button
            onClick={handleToggleControls}
            className="lg:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={MT.textMuted}
              strokeWidth="2"
            >
              <path d="M12 3v18M3 12h18" />
            </svg>
          </button>
        </div>

        {/* Mirror container */}
        <div
          ref={containerRef}
          className="w-full max-w-[min(85vw,520px)] aspect-square relative flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeMirror}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full h-full"
            >
              <MirrorFrame>
                {state.isTransitioning && TransitionEffect ? (
                  <TransitionEffect
                    transitionKey={state.transitionKey}
                    outgoing={outgoingNode}
                    incoming={incomingNode}
                    onComplete={handleComplete}
                    containerRef={containerRef}
                  />
                ) : (
                  <ActiveContent />
                )}
              </MirrorFrame>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trigger button */}
        <div className="mt-6 flex items-center gap-3">
          <motion.button
            onClick={handleTrigger}
            disabled={state.isTransitioning}
            className="px-6 py-2.5 rounded-full text-sm font-medium"
            style={{
              background: state.isTransitioning
                ? "rgba(201,169,78,0.1)"
                : "rgba(201,169,78,0.2)",
              border: `1px solid ${state.isTransitioning ? "rgba(201,169,78,0.2)" : "rgba(201,169,78,0.4)"}`,
              color: state.isTransitioning
                ? "rgba(201,169,78,0.5)"
                : MT.gold,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {state.isTransitioning ? "Transitioning..." : "Trigger Transition"}
          </motion.button>

          <motion.button
            onClick={handleRandomAll}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.9 }}
            title="Randomize all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={MT.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Desktop Control Panel ──────────────────────────────────── */}
      <div
        className="hidden lg:block w-[320px] shrink-0 border-l overflow-y-auto"
        style={{
          background: MT.surface,
          borderColor: MT.border,
        }}
      >
        <ControlPanel
          state={state}
          onSelectMirror={handleSelectMirror}
          onSelectTransition={handleSelectTransition}
          onSelectContent={handleSelectContent}
          onSetTab={handleSetTab}
          onTrigger={handleTrigger}
          onRandomAll={handleRandomAll}
        />
      </div>

      {/* ── Mobile Drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {state.controlsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={handleToggleControls}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl overflow-hidden"
              style={{
                background: MT.surface,
                maxHeight: "70dvh",
              }}
            >
              <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-2" />
              <div className="overflow-y-auto" style={{ maxHeight: "calc(70dvh - 24px)" }}>
                <ControlPanel
                  state={state}
                  onSelectMirror={handleSelectMirror}
                  onSelectTransition={handleSelectTransition}
                  onSelectContent={handleSelectContent}
                  onSetTab={handleSetTab}
                  onTrigger={handleTrigger}
                  onRandomAll={handleRandomAll}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
