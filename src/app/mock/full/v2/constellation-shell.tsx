"use client";

import { useReducer, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Home,
  Layers,
  Sparkles,
  Palette,
  Settings,
  ArrowLeft,
} from "lucide-react";
import type { ViewId, AppState, AppAction, MoodId, ViewParams } from "../_shared/types";
import { ConstellationBg } from "./constellation-bg";

import { DashboardView } from "./views/dashboard-view";
import { DecksView } from "./views/decks-view";
import { DeckDetailView } from "./views/deck-detail-view";
import { CardDetailView } from "./views/card-detail-view";
import { CreateDeckView } from "./views/create-deck-view";
import { GenerationView } from "./views/generation-view";
import { ArtStylesView } from "./views/art-styles-view";
import { ArtStyleDetailView } from "./views/art-style-detail-view";
import { ReadingView } from "./views/reading-view";
import { SettingsView } from "./views/settings-view";

// ─── Mood map per view ───────────────────────────────────────────────────────

const VIEW_MOOD: Record<ViewId, MoodId> = {
  dashboard: "default",
  decks: "viewing",
  "deck-detail": "viewing",
  "card-detail": "warm",
  "create-deck": "creating",
  generation: "creating",
  "art-styles": "viewing",
  "art-style-detail": "viewing",
  reading: "reading",
  settings: "default",
};

// ─── Views that hide nav ─────────────────────────────────────────────────────

const NAV_HIDDEN_VIEWS: ViewId[] = ["reading", "generation"];

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: AppState = {
  currentView: "dashboard",
  viewParams: {},
  history: [],
  hideNav: false,
  mood: "default",
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE": {
      const newView = action.view;
      const newParams = action.params ?? {};
      return {
        ...state,
        currentView: newView,
        viewParams: newParams,
        history: [...state.history, { view: state.currentView, params: state.viewParams }],
        hideNav: NAV_HIDDEN_VIEWS.includes(newView),
        mood: VIEW_MOOD[newView],
      };
    }
    case "GO_BACK": {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        currentView: prev.view,
        viewParams: prev.params,
        history: state.history.slice(0, -1),
        hideNav: NAV_HIDDEN_VIEWS.includes(prev.view),
        mood: VIEW_MOOD[prev.view],
      };
    }
    case "SET_HIDE_NAV":
      return { ...state, hideNav: action.hidden };
    case "SET_MOOD":
      return { ...state, mood: action.mood };
    default:
      return state;
  }
}

// ─── Nav config ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "decks", label: "Decks", icon: Layers },
  { id: "reading", label: "Reading", icon: Sparkles },
  { id: "art-styles", label: "Styles", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── View Layer ──────────────────────────────────────────────────────────────

function ViewLayer({
  isActive,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.97,
        filter: isActive ? "blur(0px)" : "blur(8px)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ pointerEvents: isActive ? "auto" : "none", zIndex: isActive ? 1 : 0 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

export function ConstellationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mountedViews = useRef<Set<ViewId>>(new Set(["dashboard"]));

  // Track mounted views (lazy mount, never unmount)
  if (!mountedViews.current.has(state.currentView)) {
    mountedViews.current.add(state.currentView);
  }

  const navigate = useCallback(
    (view: ViewId, params?: ViewParams) => dispatch({ type: "NAVIGATE", view, params }),
    [],
  );

  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);

  const navProps = { navigate, goBack, currentView: state.currentView, viewParams: state.viewParams };

  const renderView = (viewId: ViewId) => {
    if (!mountedViews.current.has(viewId)) return null;
    switch (viewId) {
      case "dashboard":
        return <DashboardView {...navProps} />;
      case "decks":
        return <DecksView {...navProps} />;
      case "deck-detail":
        return <DeckDetailView {...navProps} />;
      case "card-detail":
        return <CardDetailView {...navProps} />;
      case "create-deck":
        return <CreateDeckView {...navProps} />;
      case "generation":
        return <GenerationView {...navProps} />;
      case "art-styles":
        return <ArtStylesView {...navProps} />;
      case "art-style-detail":
        return <ArtStyleDetailView {...navProps} />;
      case "reading":
        return <ReadingView {...navProps} />;
      case "settings":
        return <SettingsView {...navProps} />;
      default:
        return null;
    }
  };

  const ALL_VIEWS: ViewId[] = [
    "dashboard", "decks", "deck-detail", "card-detail",
    "create-deck", "generation", "art-styles", "art-style-detail",
    "reading", "settings",
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0118]">
      <ConstellationBg mood={state.mood} />

      <LayoutGroup>
        {/* View layers */}
        <div className="absolute inset-0 z-10">
          {ALL_VIEWS.map((viewId) => (
            <ViewLayer key={viewId} isActive={state.currentView === viewId}>
              {renderView(viewId)}
            </ViewLayer>
          ))}
        </div>

        {/* Navigation bar */}
        <motion.nav
          className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:top-0 sm:left-0 sm:right-auto sm:w-[72px] sm:h-full"
          animate={{
            y: state.hideNav ? 100 : 0,
            x: 0,
            opacity: state.hideNav ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Mobile bottom bar */}
          <div className="sm:hidden">
            <div className="h-[60px] bg-white/5 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2">
              {NAV_ITEMS.map((item) => {
                const isActive = state.currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[56px]"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute -top-1 w-8 h-0.5 rounded-full bg-[#c9a94e]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={item.id === "reading" ? 22 : 18}
                      className={isActive ? "text-[#c9a94e]" : "text-white/40"}
                    />
                    <span className={`text-[10px] ${isActive ? "text-[#c9a94e]" : "text-white/30"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Safe area */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white/5 backdrop-blur-xl" />
          </div>

          {/* Desktop side rail */}
          <div className="hidden sm:flex flex-col items-center justify-center gap-6 h-full bg-white/5 backdrop-blur-xl border-r border-white/10 py-8">
            {/* Logo dot */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a94e] to-amber-600 flex items-center justify-center mb-4">
              <Sparkles size={14} className="text-white" />
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive = state.currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className="relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors hover:bg-white/5"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow-desktop"
                      className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#c9a94e]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={20}
                    className={isActive ? "text-[#c9a94e]" : "text-white/40"}
                  />
                  <span className={`text-[9px] ${isActive ? "text-[#c9a94e]" : "text-white/30"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      </LayoutGroup>

      {/* Back button overlay for detail views */}
      <AnimatePresence>
        {(state.currentView === "deck-detail" ||
          state.currentView === "card-detail" ||
          state.currentView === "art-style-detail") && (
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={goBack}
            className="fixed top-4 left-4 z-[60] sm:left-[88px] w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
          >
            <ArrowLeft size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
