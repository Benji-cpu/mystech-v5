"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo, useState, lazy, Suspense } from "react";
import type {
  ExplorerState,
  ExplorerAction,
  ContentTypeId,
  TransitionProps,
} from "./mirror-types";
import { MIRRORS } from "./mirrors";
import { TRANSITION_DEFINITIONS, CONTENT_DEFINITIONS } from "./mirror-registry";
import { renderContent } from "./content-renderers";
import { BottomControls } from "./control-panel";

// ─── Lazy-loaded transition components ──────────────────────────────────────

const GooeyMerge = lazy(() => import("./transitions/css-transitions").then(m => ({ default: m.GooeyMerge })));
const ChromaticSplit = lazy(() => import("./transitions/css-transitions").then(m => ({ default: m.ChromaticSplit })));
const SpringCrossfade = lazy(() => import("./transitions/framer-transitions").then(m => ({ default: m.SpringCrossfade })));
const CascadeTrail = lazy(() => import("./transitions/spring-transitions").then(m => ({ default: m.CascadeTrail })));
const LiquidClipWipe = lazy(() => import("./transitions/gsap-transitions").then(m => ({ default: m.LiquidClipWipe })));
const TurbulenceRipple = lazy(() => import("./transitions/svg-transitions").then(m => ({ default: m.TurbulenceRipple })));
const PathMorphMask = lazy(() => import("./transitions/svg-transitions").then(m => ({ default: m.PathMorphMask })));
const SpiralReveal = lazy(() => import("./transitions/svg-transitions").then(m => ({ default: m.SpiralReveal })));
const SmilSweep = lazy(() => import("./transitions/svg-transitions").then(m => ({ default: m.SmilSweep })));
const FluidSim = lazy(() => import("./transitions/canvas-transitions").then(m => ({ default: m.FluidSim })));
const InkDrop = lazy(() => import("./transitions/canvas-transitions").then(m => ({ default: m.InkDrop })));
const WaterDisplacement = lazy(() => import("./transitions/webgl-transitions").then(m => ({ default: m.WaterDisplacement })));
const SimplexDissolve = lazy(() => import("./transitions/webgl-transitions").then(m => ({ default: m.SimplexDissolve })));
const DisplacementFilter = lazy(() => import("./transitions/webgl-transitions").then(m => ({ default: m.DisplacementFilter })));

// ─── Transition component resolver ──────────────────────────────────────────

function TransitionRenderer({ transitionId, ...props }: TransitionProps & { transitionId: string }) {
  const Component = (() => {
    switch (transitionId) {
      case "gooey-merge": return GooeyMerge;
      case "chromatic-split": return ChromaticSplit;
      case "spring-crossfade": return SpringCrossfade;
      case "cascade-trail": return CascadeTrail;
      case "liquid-clip-wipe": return LiquidClipWipe;
      case "turbulence-ripple": return TurbulenceRipple;
      case "path-morph-mask": return PathMorphMask;
      case "spiral-reveal": return SpiralReveal;
      case "smil-sweep": return SmilSweep;
      case "fluid-sim": return FluidSim;
      case "ink-drop": return InkDrop;
      case "water-displacement": return WaterDisplacement;
      case "simplex-dissolve": return SimplexDissolve;
      case "displacement-filter": return DisplacementFilter;
      default: return null;
    }
  })();

  if (!Component) return null;

  return (
    <Suspense fallback={<div className="absolute inset-0">{props.oldContent}</div>}>
      <Component {...props} />
    </Suspense>
  );
}

// ─── Reducer ────────────────────────────────────────────────────────────────

const ALL_CONTENT_IDS = CONTENT_DEFINITIONS.map((c) => c.id);
const ALL_TRANSITION_IDS = TRANSITION_DEFINITIONS.map((t) => t.id);

function getRandomItem<T>(arr: T[], exclude?: T): T {
  const filtered = exclude ? arr.filter((i) => i !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

const initialState: ExplorerState = {
  selectedMirrorId: "hand-mirror",
  selectedTransitionId: "spring-crossfade",
  currentContentId: "single-card",
  nextContentId: "deck-cover",
  isTransitioning: false,
  autoPlay: false,
};

function reducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case "SELECT_MIRROR":
      return { ...state, selectedMirrorId: action.mirrorId };
    case "SELECT_TRANSITION":
      return { ...state, selectedTransitionId: action.transitionId };
    case "SELECT_NEXT_CONTENT":
      return { ...state, nextContentId: action.contentId };
    case "START_TRANSITION":
      if (state.isTransitioning || state.currentContentId === state.nextContentId) return state;
      return { ...state, isTransitioning: true };
    case "COMPLETE_TRANSITION":
      return {
        ...state,
        isTransitioning: false,
        currentContentId: state.nextContentId,
        nextContentId: getRandomItem(ALL_CONTENT_IDS, state.nextContentId),
      };
    case "TOGGLE_AUTOPLAY":
      return { ...state, autoPlay: !state.autoPlay };
    case "RANDOMIZE":
      return {
        ...state,
        selectedMirrorId: getRandomItem(MIRRORS.map((m) => m.id)),
        selectedTransitionId: getRandomItem(ALL_TRANSITION_IDS),
        nextContentId: getRandomItem(ALL_CONTENT_IDS, state.currentContentId),
      };
    default:
      return state;
  }
}

// ─── Mirror Frame Component ─────────────────────────────────────────────────

function MirrorFrame({
  mirror,
  children,
  width,
}: {
  mirror: (typeof MIRRORS)[number];
  children: React.ReactNode;
  width: number;
}) {
  const height = width / mirror.aspectRatio;
  const viewBoxWidth = 400;
  const viewBoxHeight = 600;

  return (
    <div className="relative" style={{ width, height, ...mirror.outerStyle }}>
      {/* SVG defs for clip path and gradients */}
      <svg className="absolute inset-0 w-0 h-0" aria-hidden>
        <defs>
          <clipPath id="mirror-clip" clipPathUnits="objectBoundingBox">
            <path
              d={mirror.clipPath}
              transform={`scale(${1 / viewBoxWidth}, ${1 / viewBoxHeight})`}
            />
          </clipPath>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9a94e" />
            <stop offset="50%" stopColor="#e8d48b" />
            <stop offset="100%" stopColor="#8a7235" />
          </linearGradient>
        </defs>
      </svg>

      {/* Clipped content area */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: "url(#mirror-clip)" }}
      >
        {children}
      </div>

      {/* Decorative frame overlay */}
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      >
        <g dangerouslySetInnerHTML={{ __html: mirror.frameSvg }} />
      </svg>

      {/* Shimmer animation overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          clipPath: "url(#mirror-clip)",
          background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
          backgroundSize: "200% 200%",
          animation: "shimmer 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MirrorTransitionExplorer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mirrorSize, setMirrorSize] = useState({ width: 300, height: 450 });
  const autoPlayRef = useRef(state.autoPlay);

  // Track autoplay in ref for interval
  useEffect(() => {
    autoPlayRef.current = state.autoPlay;
  }, [state.autoPlay]);

  const selectedMirror = useMemo(
    () => MIRRORS.find((m) => m.id === state.selectedMirrorId) ?? MIRRORS[0],
    [state.selectedMirrorId]
  );

  // Height-aware responsive sizing
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const headerH = 40;
      const controlsH = 148;
      const pad = 16;
      const availH = vh - headerH - controlsH - pad * 2;
      const availW = vw - pad * 2;
      const maxW = Math.min(availW * 0.85, 400);
      // Constrain by height: width / aspectRatio <= availH → width <= availH * aspectRatio
      const maxWFromHeight = availH * selectedMirror.aspectRatio;
      const mirrorW = Math.max(Math.min(maxW, maxWFromHeight), 120);
      setMirrorSize({ width: mirrorW, height: mirrorW / selectedMirror.aspectRatio });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [selectedMirror.aspectRatio]);

  // Auto-play timer
  useEffect(() => {
    if (!state.autoPlay) return;
    const interval = setInterval(() => {
      if (!autoPlayRef.current) return;
      dispatch({ type: "RANDOMIZE" });
      setTimeout(() => {
        dispatch({ type: "START_TRANSITION" });
      }, 100);
    }, 3500);
    return () => clearInterval(interval);
  }, [state.autoPlay]);

  // Safety timeout for transitions
  useEffect(() => {
    if (!state.isTransitioning) return;
    const def = TRANSITION_DEFINITIONS.find((t) => t.id === state.selectedTransitionId);
    const safetyMs = (def?.duration ?? 1500) + 500;
    const timeout = setTimeout(() => {
      dispatch({ type: "COMPLETE_TRANSITION" });
    }, safetyMs);
    return () => clearTimeout(timeout);
  }, [state.isTransitioning, state.selectedTransitionId]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        dispatch({ type: "START_TRANSITION" });
      } else if (e.key === "ArrowRight") {
        const idx = MIRRORS.findIndex((m) => m.id === state.selectedMirrorId);
        const next = MIRRORS[(idx + 1) % MIRRORS.length];
        dispatch({ type: "SELECT_MIRROR", mirrorId: next.id });
      } else if (e.key === "ArrowLeft") {
        const idx = MIRRORS.findIndex((m) => m.id === state.selectedMirrorId);
        const next = MIRRORS[(idx - 1 + MIRRORS.length) % MIRRORS.length];
        dispatch({ type: "SELECT_MIRROR", mirrorId: next.id });
      } else if (e.key === "ArrowDown") {
        const idx = ALL_TRANSITION_IDS.indexOf(state.selectedTransitionId);
        dispatch({
          type: "SELECT_TRANSITION",
          transitionId: ALL_TRANSITION_IDS[(idx + 1) % ALL_TRANSITION_IDS.length],
        });
      } else if (e.key === "ArrowUp") {
        const idx = ALL_TRANSITION_IDS.indexOf(state.selectedTransitionId);
        dispatch({
          type: "SELECT_TRANSITION",
          transitionId:
            ALL_TRANSITION_IDS[(idx - 1 + ALL_TRANSITION_IDS.length) % ALL_TRANSITION_IDS.length],
        });
      } else if (e.key === "r") {
        dispatch({ type: "RANDOMIZE" });
      } else if (e.key === "a") {
        dispatch({ type: "TOGGLE_AUTOPLAY" });
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.selectedMirrorId, state.selectedTransitionId]);

  const handleTransitionComplete = useCallback(() => {
    dispatch({ type: "COMPLETE_TRANSITION" });
  }, []);

  const currentTransition = TRANSITION_DEFINITIONS.find(
    (t) => t.id === state.selectedTransitionId
  );

  // Calculate mirror display dimensions
  const displayW = mirrorSize.width;
  const displayH = displayW / selectedMirror.aspectRatio;

  const controlProps = {
    state,
    dispatch,
    mirrors: MIRRORS,
    transitions: TRANSITION_DEFINITIONS,
    contents: CONTENT_DEFINITIONS,
  };

  return (
    <div className="h-[100dvh] bg-[#0a0118] text-white overflow-hidden flex flex-col">
      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 200%; }
          50% { background-position: 0% 0%; }
        }
      `}</style>

      {/* Header */}
      <header className="shrink-0 px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-amber-200/90 text-sm font-serif">Mirror Transition Explorer</h1>
          <p className="text-purple-300/40 text-[10px]">
            {selectedMirror.name} &middot; {currentTransition?.name ?? "\u2014"} &middot;{" "}
            {currentTransition?.library ?? ""}
          </p>
        </div>
        <div className="text-purple-300/30 text-[9px] hidden md:block">
          Space: trigger &middot; Arrows: navigate &middot; R: random &middot; A: autoplay
        </div>
      </header>

      {/* Mirror display area — flex-1, centered */}
      <div className="flex-1 flex items-center justify-center min-h-0 p-4">
        <MirrorFrame mirror={selectedMirror} width={displayW}>
          <div ref={containerRef} className="relative w-full h-full" style={{ width: displayW, height: displayH }}>
            {/* Settled layer — always mounted, hidden during transitions */}
            <div
              className="absolute inset-0"
              style={{
                opacity: state.isTransitioning ? 0 : 1,
                transition: "opacity 50ms ease",
              }}
            >
              {renderContent(state.currentContentId, displayW, displayH)}
            </div>

            {/* Transition layer — mounts during transition only */}
            {state.isTransitioning && (
              <div className="absolute inset-0">
                <TransitionRenderer
                  transitionId={state.selectedTransitionId}
                  containerRef={containerRef}
                  oldContent={renderContent(state.currentContentId, displayW, displayH)}
                  newContent={renderContent(state.nextContentId, displayW, displayH)}
                  isActive={state.isTransitioning}
                  onComplete={handleTransitionComplete}
                  dimensions={{ width: displayW, height: displayH }}
                />
              </div>
            )}
          </div>
        </MirrorFrame>
      </div>

      {/* Bottom controls — unified for all breakpoints */}
      <BottomControls {...controlProps} />
    </div>
  );
}
