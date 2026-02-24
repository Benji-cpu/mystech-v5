"use client";

import { useReducer, useRef, useCallback, useEffect, useState } from "react";
import type {
  TransitionState,
  TransitionAction,
  ViewId,
  TransitionMood,
  AtmosphereHandle,
  EffectsHandle,
} from "./types";
import { getAutoMood } from "./types";
import { SvgFilters, type SvgFilterHandle } from "./svg-filters";
import { ContentLayer, type ContentLayerHandle } from "./content-layer";
import { AtmosphereLayer } from "./atmosphere-layer";
import { EffectsLayer } from "./effects-layer";
import { NavBar } from "./nav-bar";
import { createTransitionTimeline } from "./transition-engine";

function reducer(
  state: TransitionState,
  action: TransitionAction,
): TransitionState {
  switch (action.type) {
    case "NAVIGATE":
      if (state.phase !== "idle" || action.to === state.currentView)
        return state;
      return {
        ...state,
        previousView: state.currentView,
        currentView: action.to,
        phase: "gather",
        activeMood: action.mood ?? state.activeMood,
      };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_MOOD":
      return { ...state, activeMood: action.mood, autoMood: false };
    case "TOGGLE_AUTO_MOOD":
      return { ...state, autoMood: !state.autoMood };
    case "SET_SPEED":
      return { ...state, speed: action.speed };
    case "TRANSITION_COMPLETE":
      return { ...state, phase: "idle", previousView: null };
    default:
      return state;
  }
}

const initialState: TransitionState = {
  currentView: "dashboard",
  previousView: null,
  phase: "idle",
  activeMood: "gentle-ripple",
  autoMood: true,
  speed: 1,
};

export function OracleChamber() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [filterUrl, setFilterUrl] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  const filterRef = useRef<SvgFilterHandle>(null);
  const contentRef = useRef<ContentLayerHandle>(null);
  const atmosphereRef = useRef<AtmosphereHandle>(null);
  const effectsRef = useRef<EffectsHandle>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Get filter URL after mount
  useEffect(() => {
    if (filterRef.current) {
      setFilterUrl(filterRef.current.getFilterUrl());
    }
  }, []);

  const handleNavigate = useCallback(
    (to: ViewId) => {
      if (state.phase !== "idle" || to === state.currentView) return;

      const mood = state.autoMood
        ? getAutoMood(state.currentView, to)
        : state.activeMood;

      // For reduced motion, do a simple crossfade
      if (reducedMotion) {
        contentRef.current?.prepareTransition(to);
        // Simple opacity swap
        const outgoing = contentRef.current?.getOutgoingEl();
        const incoming = contentRef.current?.getIncomingEl();
        if (outgoing) outgoing.style.opacity = "0";
        if (incoming) incoming.style.opacity = "1";
        setTimeout(() => {
          contentRef.current?.finalizeTransition();
          dispatch({ type: "TRANSITION_COMPLETE" });
        }, 200);
        dispatch({ type: "NAVIGATE", to, mood });
        return;
      }

      // Prepare content layer
      contentRef.current?.prepareTransition(to);

      dispatch({ type: "NAVIGATE", to, mood });

      // Kill any running timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Create and play the transition timeline
      const filter = filterRef.current;
      if (!filter) return;

      const tl = createTransitionTimeline(
        mood,
        {
          filter,
          atmosphere: atmosphereRef.current,
          effects: effectsRef.current,
          outgoingEl: contentRef.current?.getOutgoingEl() ?? null,
          incomingEl: contentRef.current?.getIncomingEl() ?? null,
        },
        {
          onSwap: () => {
            // Content swap happens here — views trade places
          },
          onPhaseChange: (phase) => {
            dispatch({ type: "SET_PHASE", phase });
          },
          onComplete: () => {
            contentRef.current?.finalizeTransition();
            dispatch({ type: "TRANSITION_COMPLETE" });
          },
        },
        state.speed,
      );

      timelineRef.current = tl;
    },
    [state.phase, state.currentView, state.autoMood, state.activeMood, state.speed, reducedMotion],
  );

  const handleMoodChange = useCallback((mood: TransitionMood) => {
    dispatch({ type: "SET_MOOD", mood });
  }, []);

  const handleToggleAutoMood = useCallback(() => {
    dispatch({ type: "TOGGLE_AUTO_MOOD" });
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    dispatch({ type: "SET_SPEED", speed });
  }, []);

  return (
    <div
      className="h-dvh w-full flex flex-col overflow-hidden"
      style={{ background: "#050012" }}
    >
      {/* Hidden SVG filter definitions */}
      <SvgFilters ref={filterRef} />

      {/* Title + phase indicator */}
      <div className="shrink-0 px-4 pt-3 pb-1 flex items-center justify-between z-10">
        <h1 className="text-sm font-semibold text-white/70">
          Oracle Chamber <span className="text-white/30 text-xs font-normal">v14</span>
        </h1>
        <div className="flex items-center gap-2">
          {state.phase !== "idle" && (
            <span className="text-[10px] text-amber-300/60 animate-pulse">
              {state.phase === "gather"
                ? "Gathering..."
                : state.phase === "threshold"
                  ? "Crossing..."
                  : "Crystallizing..."}
            </span>
          )}
          {state.autoMood && state.phase !== "idle" && (
            <span className="text-[10px] text-purple-300/50">
              {state.activeMood.replace("-", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <NavBar
        currentView={state.phase === "idle" ? state.currentView : state.previousView ?? state.currentView}
        activeMood={state.activeMood}
        autoMood={state.autoMood}
        speed={state.speed}
        isTransitioning={state.phase !== "idle"}
        onNavigate={handleNavigate}
        onMoodChange={handleMoodChange}
        onToggleAutoMood={handleToggleAutoMood}
        onSpeedChange={handleSpeedChange}
      />

      {/* Three-layer chamber */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Layer 1: Atmosphere (WebGL fluid sim) */}
        <div className="absolute inset-0">
          <AtmosphereLayer ref={atmosphereRef} className="w-full h-full" />
        </div>

        {/* Layer 2: Content (DOM + SVG filter) */}
        <ContentLayer
          ref={contentRef}
          initialView={state.currentView}
          filterUrl={filterUrl}
        />

        {/* Layer 3: Effects overlay (Canvas 2D particles) */}
        <div className="absolute inset-0 pointer-events-none">
          <EffectsLayer ref={effectsRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
