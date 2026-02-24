"use client";

import { useReducer, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { DashboardView } from "./views/dashboard";
import { DeckGridView } from "./views/deck-grid";
import { DeckDetailView } from "./views/deck-detail";
import { ReadingFlowView } from "./views/reading-flow";
import {
  type ViewId,
  type NavState,
  VIEW_ORDER,
  VIEW_LABELS,
} from "./types";

// ─── SPRING CONFIG ────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// ─── MOOD MAP ─────────────────────────────────────────────────────────────────

const viewMoods: Record<ViewId, string> = {
  dashboard: "default",
  "deck-grid": "default",
  "deck-detail": "golden",
  "reading-flow": "midnight",
};

// ─── NAV STATE REDUCER ────────────────────────────────────────────────────────

type NavAction =
  | { type: "NAVIGATE"; view: ViewId; deckId?: string }
  | { type: "BACK" };

function determineDirection(from: ViewId, to: ViewId): "forward" | "backward" {
  const fromIdx = VIEW_ORDER.indexOf(from);
  const toIdx = VIEW_ORDER.indexOf(to);
  return toIdx >= fromIdx ? "forward" : "backward";
}

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "NAVIGATE":
      return {
        currentView: action.view,
        previousView: state.currentView,
        selectedDeckId: action.deckId ?? state.selectedDeckId,
        transitionDirection: determineDirection(state.currentView, action.view),
      };
    case "BACK":
      if (!state.previousView) return state;
      return {
        currentView: state.previousView,
        previousView: null,
        selectedDeckId: state.selectedDeckId,
        transitionDirection: "backward",
      };
    default:
      return state;
  }
}

const initialState: NavState = {
  currentView: "dashboard",
  previousView: null,
  selectedDeckId: null,
  transitionDirection: "forward",
};

// ─── VIEW LAYER ───────────────────────────────────────────────────────────────

function ViewLayer({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.97,
      }}
      transition={SPRING}
      style={{
        pointerEvents: isActive ? "auto" : "none",
        zIndex: isActive ? 10 : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── MINI NAV ─────────────────────────────────────────────────────────────────

const NAV_VIEWS: ViewId[] = ["dashboard", "deck-grid", "deck-detail"];

function MiniNav({
  currentView,
  onNavigate,
}: {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
}) {
  // Hide reading-flow from nav dots — it's an overlay, not a page
  const displayedView =
    currentView === "reading-flow" ? "dashboard" : currentView;

  return (
    <div className="shrink-0 py-3 px-4 flex flex-col items-center gap-1.5 border-t border-white/5">
      {/* View label */}
      <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
        {VIEW_LABELS[currentView]}
      </p>
      {/* Dot indicators */}
      <div className="flex items-center gap-2">
        {NAV_VIEWS.map((view) => (
          <motion.button
            key={view}
            onClick={() => onNavigate(view)}
            animate={{
              width: displayedView === view ? 24 : 8,
              backgroundColor:
                displayedView === view
                  ? "rgb(201 169 78)"
                  : "rgba(255 255 255 / 0.2)",
            }}
            transition={SPRING}
            className="h-2 rounded-full"
            title={VIEW_LABELS[view]}
          />
        ))}
      </div>
    </div>
  );
}

// ─── NAVIGATION DEMO ──────────────────────────────────────────────────────────

function NavigationDemo() {
  const { setMoodPreset } = useMockImmersive();
  const [state, dispatch] = useReducer(navReducer, initialState);

  const navigate = useCallback(
    (view: ViewId, params?: { deckId?: string }) => {
      dispatch({ type: "NAVIGATE", view, deckId: params?.deckId });
      setMoodPreset(viewMoods[view]);
    },
    [setMoodPreset]
  );

  const { currentView, selectedDeckId } = state;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Back to mock hub */}
      <div className="shrink-0 px-4 pt-3 sm:px-6 sm:pt-5 pb-1 flex items-center gap-2 z-20 relative">
        <Link
          href="/mock"
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Mock Hub</span>
        </Link>
        <span className="text-white/15 text-sm mx-1">/</span>
        <span className="text-white/50 text-sm font-medium">Navigation & Transitions</span>
      </div>

      {/* View container */}
      <div className="flex-1 min-h-0 relative">
        {/* Dashboard */}
        <ViewLayer isActive={currentView === "dashboard"}>
          <DashboardView
            isActive={currentView === "dashboard"}
            onNavigate={navigate}
          />
        </ViewLayer>

        {/* Deck Grid */}
        <ViewLayer isActive={currentView === "deck-grid"}>
          <DeckGridView
            isActive={currentView === "deck-grid"}
            onNavigate={navigate}
          />
        </ViewLayer>

        {/* Deck Detail */}
        <ViewLayer isActive={currentView === "deck-detail"}>
          <DeckDetailView
            isActive={currentView === "deck-detail"}
            deckId={selectedDeckId}
            onNavigate={navigate}
          />
        </ViewLayer>

        {/* Reading Flow — overlay, not ViewLayer */}
        <ReadingFlowView
          isActive={currentView === "reading-flow"}
          onNavigate={navigate}
        />
      </div>

      {/* Mini nav dots */}
      <MiniNav currentView={currentView} onNavigate={navigate} />
    </div>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export default function NavigationMockPage() {
  return (
    <MockImmersiveShell>
      <NavigationDemo />
    </MockImmersiveShell>
  );
}
