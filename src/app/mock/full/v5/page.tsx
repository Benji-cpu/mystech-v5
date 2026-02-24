"use client";

import { useReducer, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { inkReducer, inkInitialState } from "./ink-state";
import { InkViewTransition } from "./ink-transitions";
import InkParticles from "./ink-particles";
import type { ViewId, ViewParams } from "../_shared/types";
import {
  Home,
  Layers,
  Sparkles,
  BookOpen,
  Settings,
  ArrowLeft,
} from "lucide-react";

// View imports
import DashboardView from "./views/dashboard";
import MyDecksView from "./views/my-decks";
import CreateDeckView from "./views/create-deck";
import GenerationView from "./views/generation";
import DeckViewView from "./views/deck-view";
import CardDetailView from "./views/card-detail";
import ArtStylesGalleryView from "./views/art-styles-gallery";
import ArtStyleDetailView from "./views/art-style-detail";
import ReadingFlowView from "./views/reading-flow";
import SettingsView from "./views/settings";

export default function MagneticInkMock() {
  const [state, dispatch] = useReducer(inkReducer, inkInitialState);

  const navigate = useCallback(
    (view: ViewId, params?: ViewParams) => {
      dispatch({ type: "NAVIGATE", view, params });
    },
    []
  );

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const viewKey = useMemo(
    () =>
      `${state.currentView}-${Object.values(state.viewParams).join("-")}`,
    [state.currentView, state.viewParams]
  );

  const navItems: { id: ViewId; icon: typeof Home; label: string }[] = [
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "decks", icon: Layers, label: "Decks" },
    { id: "art-styles", icon: Sparkles, label: "Styles" },
    { id: "reading", icon: BookOpen, label: "Reading" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const canGoBack = state.history.length > 0;
  const showBackButton =
    canGoBack &&
    ![
      "dashboard",
      "decks",
      "art-styles",
      "reading",
      "settings",
    ].includes(state.currentView);

  function renderView() {
    switch (state.currentView) {
      case "dashboard":
        return <DashboardView navigate={navigate} />;
      case "decks":
        return <MyDecksView navigate={navigate} />;
      case "create-deck":
        return <CreateDeckView navigate={navigate} />;
      case "generation":
        return (
          <GenerationView
            navigate={navigate}
            params={state.viewParams}
          />
        );
      case "deck-detail":
        return (
          <DeckViewView
            navigate={navigate}
            goBack={goBack}
            params={state.viewParams}
          />
        );
      case "card-detail":
        return (
          <CardDetailView
            navigate={navigate}
            goBack={goBack}
            params={state.viewParams}
          />
        );
      case "art-styles":
        return <ArtStylesGalleryView navigate={navigate} />;
      case "art-style-detail":
        return (
          <ArtStyleDetailView
            navigate={navigate}
            goBack={goBack}
            params={state.viewParams}
          />
        );
      case "reading":
        return (
          <ReadingFlowView
            navigate={navigate}
            dispatch={dispatch}
          />
        );
      case "settings":
        return <SettingsView navigate={navigate} />;
      default:
        return <DashboardView navigate={navigate} />;
    }
  }

  return (
    <div
      className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden relative"
      style={{ background: "#020408" }}
    >
      {/* Ambient background — always mounted */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <InkParticles mood={state.mood} />
      </div>

      {/* Desktop side nav */}
      <AnimatePresence>
        {!state.hideNav && (
          <motion.nav
            initial={{ x: -72, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -72, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden md:flex flex-col items-center py-6 gap-2 z-20 relative"
            style={{
              width: 72,
              background: "rgba(2, 4, 8, 0.8)",
              borderRight: "1px solid rgba(0, 229, 255, 0.06)",
            }}
          >
            {/* Logo */}
            <div
              className="mb-6 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0, 229, 255, 0.08)",
                border: "1px solid rgba(0, 229, 255, 0.15)",
              }}
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>

            {navItems.map((item) => {
              const isActive =
                state.currentView === item.id ||
                (item.id === "decks" &&
                  [
                    "deck-detail",
                    "card-detail",
                    "create-deck",
                    "generation",
                  ].includes(state.currentView)) ||
                (item.id === "art-styles" &&
                  state.currentView === "art-style-detail");
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl text-xs transition-colors duration-200 ${
                    isActive
                      ? "text-cyan-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-ink"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "rgba(0, 229, 255, 0.06)",
                        border: "1px solid rgba(0, 229, 255, 0.1)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col z-10 relative">
        {/* Mobile top bar with back button */}
        <AnimatePresence>
          {showBackButton && !state.hideNav && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden shrink-0 flex items-center px-4 pt-3 pb-1 z-20"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-sm text-cyan-400/80 active:text-cyan-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop back button */}
        <AnimatePresence>
          {showBackButton && !state.hideNav && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:flex shrink-0 items-center px-6 pt-4 pb-1 z-20"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content with view transitions */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <InkViewTransition viewKey={viewKey}>
            {renderView()}
          </InkViewTransition>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <AnimatePresence>
        {!state.hideNav && (
          <motion.nav
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden flex items-center justify-around z-20 relative shrink-0"
            style={{
              height: 64,
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              background: "rgba(2, 4, 8, 0.9)",
              backdropFilter: "blur(16px)",
              borderTop: "1px solid rgba(0, 229, 255, 0.06)",
            }}
          >
            {navItems.map((item) => {
              const isActive =
                state.currentView === item.id ||
                (item.id === "decks" &&
                  [
                    "deck-detail",
                    "card-detail",
                    "create-deck",
                    "generation",
                  ].includes(state.currentView)) ||
                (item.id === "art-styles" &&
                  state.currentView === "art-style-detail");
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 text-xs py-2 px-3 ${
                    isActive ? "text-cyan-400" : "text-slate-500"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-ink"
                      className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-cyan-400"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
