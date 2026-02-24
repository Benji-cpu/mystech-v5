"use client";

import { useReducer, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Home, Layers, Sparkles, Palette, Settings, ArrowLeft } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import type { ViewId, ViewParams } from "../_shared/types";
import { dreamReducer, initialState, NAV_HIDDEN_VIEWS } from "./dream-state";
import { DreamParticles } from "./dream-particles";
import { DREAM, SPRING } from "./dream-theme";

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

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// ─── Nav config ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "decks", label: "Decks", icon: Layers },
  { id: "reading", label: "Read", icon: Sparkles },
  { id: "art-styles", label: "Styles", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── View Layer ──────────────────────────────────────────────────────────────

function ViewLayer({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.97,
        filter: isActive ? "blur(0px)" : "blur(6px)",
      }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none", zIndex: isActive ? 1 : 0 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

const ALL_VIEWS: ViewId[] = [
  "dashboard", "decks", "deck-detail", "card-detail",
  "create-deck", "generation", "art-styles", "art-style-detail",
  "reading", "settings",
];

export function DreamJournalShell() {
  const [state, dispatch] = useReducer(dreamReducer, initialState);
  const mountedViews = useRef<Set<ViewId>>(new Set(["dashboard"]));

  if (!mountedViews.current.has(state.currentView)) {
    mountedViews.current.add(state.currentView);
  }

  const navigate = useCallback(
    (view: ViewId, params?: ViewParams) => dispatch({ type: "NAVIGATE", view, params }),
    [],
  );
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);
  const setMood = useCallback(
    (mood: "default" | "reading" | "creating" | "viewing" | "warm") =>
      dispatch({ type: "SET_MOOD", mood }),
    [],
  );
  const setHideNav = useCallback(
    (hidden: boolean) => dispatch({ type: "SET_HIDE_NAV", hidden }),
    [],
  );

  const navProps = {
    navigate,
    goBack,
    setMood,
    setHideNav,
    currentView: state.currentView,
    viewParams: state.viewParams,
  };

  const renderView = (viewId: ViewId) => {
    if (!mountedViews.current.has(viewId)) return null;
    switch (viewId) {
      case "dashboard": return <DashboardView {...navProps} />;
      case "decks": return <DecksView {...navProps} />;
      case "deck-detail": return <DeckDetailView {...navProps} />;
      case "card-detail": return <CardDetailView {...navProps} />;
      case "create-deck": return <CreateDeckView {...navProps} />;
      case "generation": return <GenerationView {...navProps} />;
      case "art-styles": return <ArtStylesView {...navProps} />;
      case "art-style-detail": return <ArtStyleDetailView {...navProps} />;
      case "reading": return <ReadingView {...navProps} />;
      case "settings": return <SettingsView {...navProps} />;
      default: return null;
    }
  };

  return (
    <div className={`fixed inset-0 overflow-hidden bg-[#0a0b1e] ${playfair.variable}`}>
      <DreamParticles mood={state.mood} />

      <LayoutGroup>
        {/* View layers */}
        <div className="absolute inset-0 z-10">
          {ALL_VIEWS.map((viewId) => (
            <ViewLayer key={viewId} isActive={state.currentView === viewId}>
              {renderView(viewId)}
            </ViewLayer>
          ))}
        </div>

        {/* ─── Mobile Bottom Nav ─────────────────────────────────────── */}
        <motion.nav
          className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:top-0 sm:left-0 sm:right-auto sm:w-[72px] sm:h-full"
          animate={{
            y: state.hideNav ? 100 : 0,
            opacity: state.hideNav ? 0 : 1,
          }}
          transition={SPRING}
        >
          {/* Mobile */}
          <div className="sm:hidden">
            <div className={`h-[60px] ${DREAM.glass} border-t border-[#2a2b5a]/40 flex items-center justify-around px-2`}>
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
                        layoutId="dream-nav-indicator"
                        className="absolute -top-1 w-6 h-1 rounded-full bg-[#d4a843]"
                        style={{ borderRadius: "0 0 50% 50%" }}
                        transition={SPRING}
                      />
                    )}
                    <Icon
                      size={item.id === "reading" ? 22 : 18}
                      className={isActive ? "text-[#d4a843]" : "text-[#8b87a0]"}
                    />
                    <span className={`text-[10px] ${isActive ? "text-[#d4a843]" : "text-[#8b87a0]/60"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="h-[env(safe-area-inset-bottom)] bg-[#121330]/60 backdrop-blur-xl" />
          </div>

          {/* Desktop side rail */}
          <div className="hidden sm:flex flex-col items-center justify-center gap-6 h-full bg-[#121330]/60 backdrop-blur-xl border-r border-[#2a2b5a]/40 py-8">
            {/* Logo crescent */}
            <div className="relative w-8 h-8 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-[#d4a843]/60" />
              <div className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-[#0a0b1e]" />
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
                      layoutId="dream-nav-rail"
                      className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#d4a843]"
                      transition={SPRING}
                    />
                  )}
                  <Icon size={20} className={isActive ? "text-[#d4a843]" : "text-[#8b87a0]"} />
                  <span className={`text-[9px] ${isActive ? "text-[#d4a843]" : "text-[#8b87a0]/60"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      </LayoutGroup>

      {/* Back button */}
      <AnimatePresence>
        {(state.currentView === "deck-detail" ||
          state.currentView === "card-detail" ||
          state.currentView === "art-style-detail") && (
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={SPRING}
            onClick={goBack}
            className="fixed top-4 left-4 z-[60] sm:left-[88px] w-10 h-10 rounded-full bg-[#121330]/60 backdrop-blur-xl border border-[#2a2b5a]/40 flex items-center justify-center text-[#c4ceff]/60 hover:text-[#c4ceff] hover:bg-[#121330]/80 transition-colors"
          >
            <ArrowLeft size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
