"use client";

import { useReducer, useCallback, useMemo } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import type { ViewId, ViewParams, AppState, AppAction } from "@/app/mock/full/_shared/types";
import { cn } from "@/lib/utils";

// Floor components
import { DashboardFloor } from "./components/dashboard-floor";
import { DecksFloor } from "./components/decks-floor";
import { CreateDeckFloor } from "./components/create-deck-floor";
import { GenerationFloor } from "./components/generation-floor";
import { DeckViewFloor } from "./components/deck-view-floor";
import { CardDetailFloor } from "./components/card-detail-floor";
import { ArtStylesFloor } from "./components/art-styles-floor";
import { ArtStyleDetailFloor } from "./components/art-style-detail-floor";
import { ReadingFloor } from "./components/reading-floor";
import { SettingsFloor } from "./components/settings-floor";
import { TowerSpine, getFloorIndex } from "./components/tower-spine";
import { FloorTransition } from "./components/floor-transition";

// ---- Extended State ----

interface TowerState extends AppState {
  previousView: ViewId | null;
  isTransitioning: boolean;
  transitionDirection: "up" | "down";
}

type TowerAction =
  | AppAction
  | { type: "TRANSITION_END" };

function towerReducer(state: TowerState, action: TowerAction): TowerState {
  switch (action.type) {
    case "NAVIGATE": {
      const newView = action.view;
      const prevIndex = getFloorIndex(state.currentView);
      const nextIndex = getFloorIndex(newView);
      const direction = nextIndex >= prevIndex ? "up" : "down";

      return {
        ...state,
        previousView: state.currentView,
        currentView: newView,
        viewParams: action.params || {},
        history: [...state.history, { view: state.currentView, params: state.viewParams }],
        isTransitioning: true,
        transitionDirection: direction,
      };
    }
    case "GO_BACK": {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const prevIndex = getFloorIndex(state.currentView);
      const nextIndex = getFloorIndex(last.view);
      const direction = nextIndex >= prevIndex ? "up" : "down";

      return {
        ...state,
        previousView: state.currentView,
        currentView: last.view,
        viewParams: last.params,
        history: state.history.slice(0, -1),
        isTransitioning: true,
        transitionDirection: direction,
      };
    }
    case "SET_HIDE_NAV":
      return { ...state, hideNav: action.hidden };
    case "SET_MOOD":
      return { ...state, mood: action.mood };
    case "TRANSITION_END":
      return { ...state, isTransitioning: false };
    default:
      return state;
  }
}

const initialState: TowerState = {
  currentView: "dashboard",
  viewParams: {},
  history: [],
  hideNav: false,
  mood: "default",
  previousView: null,
  isTransitioning: false,
  transitionDirection: "up",
};

// ---- Floor Layer Wrapper ----

interface FloorLayerProps {
  isActive: boolean;
  direction: "up" | "down";
  children: React.ReactNode;
}

function FloorLayer({ isActive, direction, children }: FloorLayerProps) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : direction === "up" ? "-30vh" : "30vh",
        scale: isActive ? 1 : 0.95,
        pointerEvents: isActive ? ("auto" as const) : ("none" as const),
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// ---- Tab Bar ----

const TABS: { id: ViewId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "\u2B21" },
  { id: "decks", label: "Decks", icon: "\u25A6" },
  { id: "reading", label: "Reading", icon: "\u2726" },
  { id: "art-styles", label: "Styles", icon: "\u25C8" },
  { id: "settings", label: "Settings", icon: "\u2699" },
];

interface TabBarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  hidden: boolean;
}

function TabBar({ currentView, onNavigate, hidden }: TabBarProps) {
  // Determine which tab is active (map sub-views to parent tabs)
  const activeTab = useMemo(() => {
    if (["deck-detail", "card-detail", "create-deck", "generation"].includes(currentView)) return "decks";
    if (currentView === "art-style-detail") return "art-styles";
    return currentView;
  }, [currentView]);

  return (
    <motion.div
      animate={{
        y: hidden ? 100 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 inset-x-0 z-50 px-3 pb-[env(safe-area-inset-bottom,8px)]"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mx-auto max-w-md overflow-hidden">
        <div className="flex items-center justify-around h-14 relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="relative flex flex-col items-center justify-center w-full h-full min-w-[44px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-1 bg-[#c9a94e]/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "text-lg relative z-10 transition-colors duration-200",
                    isActive ? "text-[#c9a94e]" : "text-white/30"
                  )}
                >
                  {tab.icon}
                </span>
                <span
                  className={cn(
                    "text-[10px] relative z-10 transition-colors duration-200 mt-0.5",
                    isActive ? "text-[#c9a94e]" : "text-white/30"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ---- Main Content ----

function TowerContent() {
  const [state, dispatch] = useReducer(towerReducer, initialState);

  const navigate = useCallback((view: ViewId, params?: ViewParams) => {
    dispatch({ type: "NAVIGATE", view, params });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const setHideNav = useCallback((hidden: boolean) => {
    dispatch({ type: "SET_HIDE_NAV", hidden });
  }, []);

  // Determine per-floor transition direction
  const getDirection = useCallback(
    (floorView: ViewId): "up" | "down" => {
      const currentIndex = getFloorIndex(state.currentView);
      const floorIndex = getFloorIndex(floorView);
      if (floorIndex > currentIndex) return "up";
      if (floorIndex < currentIndex) return "down";
      return state.transitionDirection;
    },
    [state.currentView, state.transitionDirection]
  );

  return (
    <LayoutGroup id="tower-mock">
      <div className="h-[100dvh] flex flex-col overflow-hidden">
        {/* Floor layers container */}
        <div className="flex-1 relative">
          <FloorLayer isActive={state.currentView === "dashboard"} direction={getDirection("dashboard")}>
            <DashboardFloor onNavigate={navigate} />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "reading"} direction={getDirection("reading")}>
            <ReadingFloor onSetHideNav={setHideNav} />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "decks"} direction={getDirection("decks")}>
            <DecksFloor onNavigate={navigate} />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "create-deck"} direction={getDirection("create-deck")}>
            <CreateDeckFloor onNavigate={navigate} onBack={goBack} />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "generation"} direction={getDirection("generation")}>
            <GenerationFloor onNavigate={navigate} />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "deck-detail"} direction={getDirection("deck-detail")}>
            <DeckViewFloor
              deckId={state.viewParams.deckId || ""}
              onNavigate={navigate}
              onBack={goBack}
            />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "card-detail"} direction={getDirection("card-detail")}>
            <CardDetailFloor
              cardId={state.viewParams.cardId || ""}
              onBack={goBack}
            />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "art-styles"} direction={getDirection("art-styles")}>
            <ArtStylesFloor onNavigate={navigate} />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "art-style-detail"} direction={getDirection("art-style-detail")}>
            <ArtStyleDetailFloor
              styleId={state.viewParams.styleId || ""}
              onNavigate={navigate}
              onBack={goBack}
            />
          </FloorLayer>

          <FloorLayer isActive={state.currentView === "settings"} direction={getDirection("settings")}>
            <SettingsFloor />
          </FloorLayer>
        </div>

        {/* Tower spine (desktop) */}
        <TowerSpine currentView={state.currentView} onNavigate={navigate} />

        {/* Floor transition particles */}
        <FloorTransition
          isTransitioning={state.isTransitioning}
          direction={state.transitionDirection}
        />

        {/* Bottom tab bar */}
        <TabBar
          currentView={state.currentView}
          onNavigate={navigate}
          hidden={state.hideNav}
        />
      </div>
    </LayoutGroup>
  );
}

// ---- Page Export ----

export default function Mock1V2Page() {
  return (
    <MockImmersiveShell>
      <TowerContent />
    </MockImmersiveShell>
  );
}
