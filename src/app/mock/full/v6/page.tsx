"use client";

import { useReducer, useCallback } from "react";
import { Playfair_Display } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

import { marionetteReducer, marionetteInitialState } from "./marionette-state";
import { MarionetteThreads } from "./marionette-threads";
import { T } from "./marionette-theme";

import { MarionetteDashboard } from "./views/dashboard";
import { MarionetteMyDecks } from "./views/my-decks";
import { MarionetteCreateDeck } from "./views/create-deck";
import { MarionetteDeckGeneration } from "./views/deck-generation";
import { MarionetteDeckView } from "./views/deck-view";
import { MarionetteCardDetail } from "./views/card-detail";
import { MarionetteArtStylesGallery } from "./views/art-styles-gallery";
import { MarionetteArtStyleDetail } from "./views/art-style-detail";
import { MarionetteReadingFlow } from "./views/reading-flow";
import { MarionetteSettings } from "./views/settings-profile";

import type { ViewId, ViewParams, MoodId } from "../_shared/types";

// ─── Font ───────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

// ─── Nav Items ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    id: "decks",
    label: "Decks",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
      </svg>
    ),
  },
  {
    id: "create-deck",
    label: "Create",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    id: "reading",
    label: "Reading",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ─── Active view detection for nav ──────────────────────────────────────────

function getActiveNavId(view: ViewId): ViewId {
  switch (view) {
    case "dashboard":
      return "dashboard";
    case "decks":
    case "deck-detail":
    case "card-detail":
    case "art-styles":
    case "art-style-detail":
      return "decks";
    case "create-deck":
    case "generation":
      return "create-deck";
    case "reading":
      return "reading";
    case "settings":
      return "settings";
    default:
      return "dashboard";
  }
}

// ─── View Transition Variants ───────────────────────────────────────────────

const viewVariants = {
  initial: { opacity: 0, filter: "blur(6px)", scale: 0.98 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: { opacity: 0, filter: "blur(6px)", scale: 0.98 },
};

const viewTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// ─── Main Page Component ────────────────────────────────────────────────────

export default function MarionetteStringsMock() {
  const [state, dispatch] = useReducer(marionetteReducer, marionetteInitialState);

  const navigate = useCallback(
    (view: ViewId, params?: ViewParams) => {
      dispatch({ type: "NAVIGATE", view, params });
    },
    []
  );

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const setMood = useCallback((mood: MoodId) => {
    dispatch({ type: "SET_MOOD", mood });
  }, []);

  const setHideNav = useCallback((hidden: boolean) => {
    dispatch({ type: "SET_HIDE_NAV", hidden });
  }, []);

  const activeNavId = getActiveNavId(state.currentView);
  const canGoBack = state.history.length > 0;

  // ─── Render current view ────────────────────────────────────────────────

  function renderView() {
    switch (state.currentView) {
      case "dashboard":
        return <MarionetteDashboard onNavigate={navigate} />;
      case "decks":
        return <MarionetteMyDecks onNavigate={navigate} />;
      case "create-deck":
        return <MarionetteCreateDeck onNavigate={navigate} onBack={goBack} />;
      case "generation":
        return <MarionetteDeckGeneration onNavigate={navigate} />;
      case "deck-detail":
        return (
          <MarionetteDeckView
            deckId={state.viewParams.deckId ?? ""}
            onNavigate={navigate}
            onBack={goBack}
          />
        );
      case "card-detail":
        return (
          <MarionetteCardDetail
            cardId={state.viewParams.cardId ?? ""}
            onBack={goBack}
          />
        );
      case "art-styles":
        return <MarionetteArtStylesGallery onNavigate={navigate} />;
      case "art-style-detail":
        return (
          <MarionetteArtStyleDetail
            styleId={state.viewParams.styleId ?? ""}
            onBack={goBack}
            onNavigate={navigate}
          />
        );
      case "reading":
        return (
          <MarionetteReadingFlow
            onNavigate={navigate}
            onSetMood={setMood}
            onSetHideNav={setHideNav}
          />
        );
      case "settings":
        return <MarionetteSettings onNavigate={navigate} />;
      default:
        return <MarionetteDashboard onNavigate={navigate} />;
    }
  }

  return (
    <div
      className={`${playfair.variable} font-sans`}
      style={{ background: T.bg, color: T.text }}
    >
      {/* ── Golden Thread Background ─────────────────────────────────────── */}
      <MarionetteThreads mood={state.mood} />

      {/* ── App Shell ────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-[100dvh] flex flex-col md:flex-row overflow-hidden">
        {/* ── Desktop Side Nav (≥768px) ──────────────────────────────────── */}
        <AnimatePresence>
          {!state.hideNav && (
            <motion.nav
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:flex flex-col w-[72px] shrink-0 py-4 items-center gap-1 border-r"
              style={{ background: `${T.bg}ee`, borderColor: "rgba(201,169,78,0.10)" }}
            >
              {/* Logo */}
              <div
                className="mb-4 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,169,78,0.08)", border: "1px solid rgba(201,169,78,0.15)" }}
              >
                <svg className="w-5 h-5" style={{ color: T.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>

              {NAV_ITEMS.map((item) => {
                const isActive = activeNavId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors"
                    style={{
                      color: isActive ? T.gold : T.textMuted,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-active-marionette"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "rgba(201,169,78,0.08)", border: "1px solid rgba(201,169,78,0.15)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.icon}</span>
                    <span className="relative z-10 text-[9px] mt-0.5 font-medium">{item.label}</span>
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* ── Main Content Area ───────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          {/* Back button for sub-views */}
          <AnimatePresence>
            {canGoBack && !state.hideNav && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="shrink-0 px-4 pt-3 pb-1"
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: T.textMuted }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View content with transitions */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentView + JSON.stringify(state.viewParams)}
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={viewTransition}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ── Mobile Bottom Nav (<768px) ──────────────────────────────────── */}
        <AnimatePresence>
          {!state.hideNav && (
            <motion.nav
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden shrink-0 flex items-center justify-around px-2 py-2 border-t"
              style={{
                background: `${T.bg}ee`,
                borderColor: "rgba(201,169,78,0.10)",
                paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeNavId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className="relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors"
                    style={{
                      color: isActive ? T.gold : T.textMuted,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-active-marionette"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "rgba(201,169,78,0.08)", border: "1px solid rgba(201,169,78,0.15)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.icon}</span>
                    <span className="relative z-10 text-[9px] mt-0.5 font-medium">{item.label}</span>
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
