"use client";

import { useReducer, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { TechniquePicker } from "./technique-picker";
import { StagePicker } from "./stage-picker";
import { techniqueRegistry } from "./techniques";
import { stageRegistry, STAGES } from "./stages";
import type { StageId } from "./stages";
import {
  TECHNIQUES,
  type MorphExplorerState,
  type MorphExplorerAction,
  type TechniqueId,
} from "./types";

function reducer(
  state: MorphExplorerState,
  action: MorphExplorerAction
): MorphExplorerState {
  switch (action.type) {
    case "SELECT_TECHNIQUE":
      if (action.id === state.activeTechnique) return state;
      return {
        ...state,
        activeTechnique: action.id,
        morphed: false,
        transitioning: false,
        pendingStage: null,
      };
    case "SELECT_STAGE":
      if (action.id === state.activeStage || state.transitioning) return state;
      return {
        ...state,
        pendingStage: action.id,
        transitioning: true,
      };
    case "STAGE_MIDPOINT":
      if (!state.pendingStage) return state;
      return {
        ...state,
        activeStage: state.pendingStage,
        pendingStage: null,
        morphed: false,
      };
    case "TOGGLE_MORPH":
      if (state.transitioning) return state;
      return { ...state, transitioning: true, morphed: !state.morphed };
    case "TRANSITION_COMPLETE":
      return { ...state, transitioning: false };
    default:
      return state;
  }
}

const initialState: MorphExplorerState = {
  activeTechnique: "spring-property",
  activeStage: "oracle-card",
  pendingStage: null,
  morphed: false,
  transitioning: false,
};

export function MorphExplorer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setMoodPreset } = useMockImmersive();

  const activeMeta = TECHNIQUES.find((t) => t.id === state.activeTechnique)!;
  const activeStageMeta = STAGES.find((s) => s.id === state.activeStage)!;
  const ActiveComponent = techniqueRegistry[state.activeTechnique];
  const ActiveStage = stageRegistry[state.activeStage];

  // Mood sync per technique
  useEffect(() => {
    setMoodPreset(activeMeta.moodPreset);
  }, [activeMeta.moodPreset, setMoodPreset]);

  const handleMorphComplete = useCallback(() => {
    dispatch({ type: "TRANSITION_COMPLETE" });
  }, []);

  const handleSelectTechnique = useCallback((id: TechniqueId) => {
    dispatch({ type: "SELECT_TECHNIQUE", id });
  }, []);

  const handleSelectStage = useCallback((id: StageId) => {
    dispatch({ type: "SELECT_STAGE", id });
  }, []);

  const handleToggle = useCallback(() => {
    dispatch({ type: "TOGGLE_MORPH" });
  }, []);

  const handleStageMidpoint = useCallback(() => {
    dispatch({ type: "STAGE_MIDPOINT" });
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Header Zone */}
      <div className="shrink-0 px-4 pt-4 pb-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeMeta.id}-${state.activeStage}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-lg font-semibold text-white/90">
                {activeMeta.name}
                <span className="text-white/30 mx-1.5">&times;</span>
                <span className="text-[#c9a94e]/80">
                  {activeStageMeta.name}
                </span>
              </h1>
              <p className="text-xs text-white/40">{activeMeta.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/60 border border-white/5">
              {activeMeta.library}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage Zone — technique stays mounted, drives all transitions */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm aspect-[3/4] relative">
          <div className="w-full h-full">
            <ActiveComponent
              morphed={state.morphed}
              onMorphComplete={handleMorphComplete}
              stageTransition={
                state.pendingStage
                  ? {
                      key: `${state.activeStage}-to-${state.pendingStage}`,
                      onMidpoint: handleStageMidpoint,
                    }
                  : null
              }
            >
              <ActiveStage morphed={state.morphed} />
            </ActiveComponent>
          </div>
        </div>
      </div>

      {/* Controls Zone — all at bottom */}
      <div className="shrink-0">
        {/* Toggle Button */}
        <div className="flex justify-center px-4 pb-2">
          <motion.button
            onClick={handleToggle}
            disabled={state.transitioning}
            className="px-8 py-2.5 rounded-full text-sm font-medium transition-colors min-w-[160px]"
            style={{
              background: state.morphed
                ? "rgba(201, 169, 78, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
              border: state.morphed
                ? "1px solid rgba(201, 169, 78, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.15)",
              color: state.morphed
                ? "rgba(201, 169, 78, 0.9)"
                : "rgba(255, 255, 255, 0.8)",
              opacity: state.transitioning ? 0.5 : 1,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {state.transitioning
              ? "Morphing..."
              : state.morphed
                ? "Reset Card"
                : "Reveal Card"}
          </motion.button>
        </div>

        {/* Stage Picker */}
        <StagePicker
          activeId={state.activeStage}
          onSelect={handleSelectStage}
        />

        {/* Technique Picker */}
        <TechniquePicker
          techniques={TECHNIQUES}
          activeId={state.activeTechnique}
          onSelect={handleSelectTechnique}
        />
      </div>
    </div>
  );
}
