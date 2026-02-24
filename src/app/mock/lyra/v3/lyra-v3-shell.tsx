"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";

import {
  lyraV3Reducer,
  initialState,
  ZONE_PROPORTIONS,
} from "./lyra-v3-state";
import type { LyraV3Phase, AnchorStar } from "./lyra-v3-state";

import {
  ZODIAC_SIGNS,
  LYRA_DIALOGUE,
  MOCK_CONVERSATION,
  THEME_CONSTELLATIONS,
  MOCK_READING_CARDS,
  MOCK_INTERPRETATION,
  MOCK_TIMELINE,
  VIGNETTES,
  CONVERGENCE_NAME,
  ELEMENT_STYLES,
  getZodiacById,
} from "./lyra-v3-data";
import type { ThemeConstellation } from "./lyra-v3-data";

import { LyraSVGReveal, LyraGuide } from "./lyra-v3-guide";
import { LyraNarration, LyraChatNarration } from "./lyra-v3-narration";
import { ZodiacPicker, ZodiacSkyDisplay } from "./lyra-v3-zodiac-picker";
import { StarMap } from "./lyra-v3-star-map";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// ── Phase labels ────────────────────────────────────────────────────────

const PHASE_LABELS: Record<LyraV3Phase, string> = {
  first_light: "First Light",
  birth_sky: "Birth Sky",
  star_birth: "Star Birth",
  your_sky: "Your Sky",
  cards_speak: "The Cards Speak",
  constellation_history: "Your Journey",
  showcase: "Lyra\u2019s Many Faces",
};

// ── Bottom Nav ──────────────────────────────────────────────────────────

const NAV_ITEMS: { phase: LyraV3Phase; label: string; icon: string }[] = [
  { phase: "your_sky", label: "Sky Map", icon: "\u2726" },
  { phase: "star_birth", label: "Create", icon: "\u2728" },
  { phase: "cards_speak", label: "Reading", icon: "\u2605" },
  { phase: "constellation_history", label: "Journey", icon: "\u231A" },
];

// ── Shell Component ─────────────────────────────────────────────────────

export function LyraV3Shell() {
  const [state, dispatch] = useReducer(lyraV3Reducer, initialState);
  const { setMoodPreset } = useMockImmersive();

  const phase = state.phase;
  const zones = ZONE_PROPORTIONS[phase];
  const showBottomNav = ["your_sky", "cards_speak", "constellation_history", "showcase"].includes(phase);

  // Mood shifts + entry narration per phase
  useEffect(() => {
    const moodMap: Record<string, string> = {
      first_light: "midnight",
      birth_sky: "default",
      star_birth: "default",
      your_sky: "default",
      cards_speak: "card-draw",
      constellation_history: "default",
      showcase: "default",
    };
    setMoodPreset(moodMap[phase] || "default");

    // Set entry narration for phases that need it
    if (phase === "your_sky") {
      setTimeout(() => {
        dispatch({ type: "SET_NARRATION", text: LYRA_DIALOGUE.yourSky.approach });
        dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
        setTimeout(() => dispatch({ type: "SET_LYRA_STATE", state: "attentive" }), 4000);
      }, 1000);
    } else if (phase === "cards_speak") {
      dispatch({ type: "SET_NARRATION", text: LYRA_DIALOGUE.cardsSpeak.beforeDraw });
      dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
    }
  }, [phase, setMoodPreset]);

  // ── Phase 1: First Light — instant reveal + auto-advance ──────────────

  useEffect(() => {
    if (phase !== "first_light") return;

    // Instantly reveal everything
    dispatch({ type: "SHOW_VEGA" });
    for (let i = 0; i < 5; i++) dispatch({ type: "REVEAL_LYRA_STAR" });
    for (let i = 0; i < 5; i++) dispatch({ type: "REVEAL_LYRA_LINE" });
    dispatch({ type: "START_BREATHING" });
    dispatch({ type: "SET_LYRA_STATE", state: "speaking" });

    // Fade in narration text after 300ms
    const t1 = setTimeout(() => {
      dispatch({ type: "SET_NARRATION", text: LYRA_DIALOGUE.firstLight.intro });
    }, 300);

    // Auto-advance to Phase 2 after 1500ms
    const t2 = setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" });
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  // ── Phase 2: Zodiac selection handler ─────────────────────────────────

  const handleZodiacSelect = useCallback((zodiacId: string, element: "fire" | "earth" | "air" | "water") => {
    dispatch({ type: "SELECT_ZODIAC", zodiacId, element });
    dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
    dispatch({ type: "SET_LYRA_POSITION", position: { x: 0.15, y: 0.15 } });

    const sign = getZodiacById(zodiacId);
    if (sign) {
      dispatch({ type: "SET_NARRATION", text: sign.lyraGreeting });
    }

    // Show ghost stars after greeting animation
    setTimeout(() => {
      dispatch({ type: "SHOW_GHOST_STARS" });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "ghost_stars" });
    }, 1200);

    setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
      dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
    }, 2500);
  }, []);

  // ── Phase 3: Auto-playing conversation ────────────────────────────────

  const conversationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedMessagesRef = useRef(new Set<number>());
  const [chatVisibleCount, setChatVisibleCount] = useState(0);
  const [chatTypingIndex, setChatTypingIndex] = useState(-1);

  // Drawer state for Your Sky phase
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"constellation" | "all-anchors" | null>(null);
  const [drawerConstellationId, setDrawerConstellationId] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "star_birth") return;
    if (state.subPhase !== "intro" && state.subPhase !== "conversing") return;

    // Start conversation auto-play
    if (state.subPhase === "intro") {
      dispatch({ type: "SET_NARRATION", text: "" });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "conversing" });
      setChatVisibleCount(0);
      setChatTypingIndex(-1);

      // Start with first message
      setTimeout(() => {
        setChatVisibleCount(1);
        setChatTypingIndex(0); // Lyra types first message
      }, 400);
    }
  }, [phase, state.subPhase]);

  const handleChatMessageComplete = useCallback((index: number) => {
    if (completedMessagesRef.current.has(index)) return;
    completedMessagesRef.current.add(index);

    const nextIndex = index + 1;

    // Check if the completed message had an anchor
    const completedLine = MOCK_CONVERSATION[index];
    if (completedLine?.anchor) {
      const sign = state.selectedZodiac ? getZodiacById(state.selectedZodiac) : null;
      const ghostPos = sign?.ghostStarPositions[completedLine.anchor.ghostStarIndex];
      if (ghostPos) {
        const anchor: AnchorStar = {
          id: `anchor-${completedLine.anchor.ghostStarIndex}`,
          name: completedLine.anchor.name,
          theme: completedLine.anchor.theme,
          ghostStarIndex: completedLine.anchor.ghostStarIndex,
          x: ghostPos.x,
          y: ghostPos.y,
          born: true,
        };
        dispatch({ type: "BIRTH_ANCHOR", anchor });
        dispatch({ type: "SET_LYRA_STATE", state: "speaking" });

        // Brief speaking flash then back to attentive
        setTimeout(() => {
          dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
        }, 800);
      }
    }

    // Advance to next message after delay
    if (nextIndex < MOCK_CONVERSATION.length) {
      const delay = MOCK_CONVERSATION[nextIndex].speaker === "user" ? 600 : 400;
      conversationTimerRef.current = setTimeout(() => {
        setChatVisibleCount(nextIndex + 1);
        setChatTypingIndex(nextIndex);
      }, delay);
    } else {
      // Conversation complete → trigger convergence
      setTimeout(() => {
        dispatch({ type: "TRIGGER_CONVERGENCE" });
        dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
        dispatch({
          type: "SET_NARRATION",
          text: LYRA_DIALOGUE.starBirth.convergence,
        });
      }, 1000);

      setTimeout(() => {
        dispatch({ type: "NAME_CONSTELLATION" });
      }, 3000);
    }
  }, [state.selectedZodiac]);

  // Auto-complete user messages instantly
  useEffect(() => {
    if (chatTypingIndex === -1) return;
    const msg = MOCK_CONVERSATION[chatTypingIndex];
    if (msg?.speaker === "user") {
      // User messages appear instantly
      setTimeout(() => handleChatMessageComplete(chatTypingIndex), 600);
    }
  }, [chatTypingIndex, handleChatMessageComplete]);

  // Cleanup conversation timer
  useEffect(() => {
    return () => {
      if (conversationTimerRef.current) clearTimeout(conversationTimerRef.current);
    };
  }, []);

  // ── Phase 5: Card reading sequence ────────────────────────────────────

  const [interpretationText, setInterpretationText] = useState("");
  const [cardFlipStates, setCardFlipStates] = useState<("hidden" | "revealing" | "revealed")[]>(
    ["hidden", "hidden", "hidden"]
  );

  const startReading = useCallback(() => {
    dispatch({ type: "SET_SUB_PHASE", subPhase: "drawing" });
    dispatch({
      type: "SET_READING_STARS",
      stars: [
        { x: 0.3, y: 0.35, label: "Past", born: false, absorbed: false },
        { x: 0.5, y: 0.25, label: "Present", born: false, absorbed: false },
        { x: 0.7, y: 0.35, label: "Future", born: false, absorbed: false },
      ],
    });

    // Sequential card reveals
    const positions = ["past", "present", "future"] as const;
    let delay = 1000;

    positions.forEach((pos, i) => {
      setTimeout(() => {
        setCardFlipStates((prev) => {
          const next = [...prev];
          next[i] = "revealing";
          return next;
        });
        dispatch({ type: "REVEAL_CARD", index: i });
        dispatch({ type: "BIRTH_READING_STAR", index: i });
        dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
        dispatch({
          type: "SET_NARRATION",
          text: LYRA_DIALOGUE.cardsSpeak.positions[pos],
        });

        setTimeout(() => {
          setCardFlipStates((prev) => {
            const next = [...prev];
            next[i] = "revealed";
            return next;
          });
        }, 600);
      }, delay);
      delay += 2500;
    });

    // Draw reading lines after all reveals
    setTimeout(() => {
      dispatch({ type: "DRAW_READING_LINES" });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "interpreting" });
      setInterpretationText(MOCK_INTERPRETATION);
    }, delay + 500);

    // After interpretation, absorb stars
    setTimeout(() => {
      dispatch({ type: "ABSORB_STARS" });
      dispatch({
        type: "SET_NARRATION",
        text: LYRA_DIALOGUE.cardsSpeak.afterInterpretation,
      });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
    }, delay + 8000);
  }, []);

  // ── Phase 6: Scroll tracking for timeline ─────────────────────────────

  const timelineRef = useRef<HTMLDivElement>(null);

  // ── Advance phase ─────────────────────────────────────────────────────

  const advancePhase = useCallback(() => {
    dispatch({ type: "ADVANCE_PHASE" });
    dispatch({ type: "SET_NARRATION", text: "" });
    // Reset phase-specific state
    completedMessagesRef.current.clear();
    setChatVisibleCount(0);
    setChatTypingIndex(-1);
    setCardFlipStates(["hidden", "hidden", "hidden"]);
    setInterpretationText("");
  }, []);

  const goToPhase = useCallback((p: LyraV3Phase) => {
    dispatch({ type: "GO_TO_PHASE", phase: p });
    dispatch({ type: "SET_NARRATION", text: "" });
    completedMessagesRef.current.clear();
    setChatVisibleCount(0);
    setChatTypingIndex(-1);
    setCardFlipStates(["hidden", "hidden", "hidden"]);
    setInterpretationText("");
  }, []);

  // ── Phase 2: Auto-transition to picker ────────────────────────────────

  useEffect(() => {
    if (phase !== "birth_sky") return;
    if (state.subPhase !== "transition_in") return;
    // Auto-transition to picking after brief delay
    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "picking" });
    }, 600);
    return () => clearTimeout(t);
  }, [phase, state.subPhase]);

  // Get current zodiac sign data
  const selectedSign = state.selectedZodiac ? getZodiacById(state.selectedZodiac) : null;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden relative bg-[#0a0118]">
      {/* ── Sky Zone ── */}
      <motion.div
        layout
        className="relative min-h-0 overflow-hidden"
        animate={{
          flex: zones.sky,
          opacity: zones.sky > 0 ? 1 : 0,
        }}
        transition={SPRING}
      >
        {/* Phase 1: SVG Lyra Reveal */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
            phase === "first_light" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="w-48 h-48 sm:w-64 sm:h-64">
            <LyraSVGReveal
              starsRevealed={state.lyraStarsRevealed}
              linesRevealed={state.lyraLinesRevealed}
              breathing={state.lyraBreathing}
            />
          </div>
        </div>

        {/* Phase 2+: Star Map Canvas */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            phase !== "first_light" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <StarMap
            zodiacSign={selectedSign}
            element={state.zodiacElement}
            anchors={state.anchors}
            ghostStarPositions={selectedSign?.ghostStarPositions ?? []}
            constellations={
              state.convergenceTriggered ? THEME_CONSTELLATIONS : []
            }
            readingStars={state.readingStars}
            readingLinesDrawn={state.readingLinesDrawn}
            lyraState={state.lyraState}
            lyraPosition={state.lyraPosition}
            lyraPointingTarget={state.lyraPointingTarget}
            highlightId={state.highlightedConstellationId}
            shootingStarsEnabled={state.shootingStarsEnabled}
            showNebulae={phase === "your_sky" || phase === "constellation_history"}
            showBackgroundStars={phase !== "first_light"}
            showElementParticles={phase === "your_sky" || phase === "star_birth"}
            mini={phase === "cards_speak"}
            onConstellationTap={(id) => {
              dispatch({ type: "HIGHLIGHT_CONSTELLATION", id });
              setDrawerConstellationId(id);
              setDrawerMode("constellation");
              setDrawerOpen(true);
            }}
            onEmptyTap={() => {
              dispatch({ type: "HIGHLIGHT_CONSTELLATION", id: null });
              if (phase === "your_sky") {
                dispatch({
                  type: "SET_NARRATION",
                  text: LYRA_DIALOGUE.yourSky.emptyRegion,
                });
                dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
                setTimeout(() => dispatch({ type: "SET_LYRA_STATE", state: "attentive" }), 3000);
              }
            }}
          />

          {/* Zodiac sky display overlay (Phase 2) */}
          {selectedSign && phase === "birth_sky" && (
            <div className="absolute right-4 top-4 w-24 h-24 sm:w-32 sm:h-32">
              <ZodiacSkyDisplay
                sign={selectedSign}
                showGhostStars={state.ghostStarsVisible}
              />
            </div>
          )}

          {/* Your Sky: Floating "Anchors" button */}
          {phase === "your_sky" && state.anchors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              className="absolute bottom-16 right-4 z-10"
            >
              <Button
                onClick={() => {
                  setDrawerMode("all-anchors");
                  setDrawerOpen(true);
                }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 text-amber-200/80 hover:bg-white/10 rounded-full px-4 py-2 text-xs"
              >
                <span className="mr-1.5">&#x2726;</span>
                Anchors ({state.anchors.length})
              </Button>
            </motion.div>
          )}

          {/* Your Sky: Sheet Drawer */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent
              side="bottom"
              showCloseButton={false}
              className="bg-[#0a0118]/95 backdrop-blur-xl border-t border-white/10 max-h-[60vh] rounded-t-2xl"
            >
              <SheetHeader className="pb-2">
                <SheetTitle className="text-amber-200/90 font-serif text-base">
                  {drawerMode === "constellation" && drawerConstellationId
                    ? THEME_CONSTELLATIONS.find((c) => c.id === drawerConstellationId)?.name ?? "Constellation"
                    : "Your Anchors"}
                </SheetTitle>
                <SheetDescription className="text-white/40 text-xs">
                  {drawerMode === "constellation"
                    ? "Stars in this constellation"
                    : "All anchor stars from your journey"}
                </SheetDescription>
              </SheetHeader>

              {/* Constellation detail view */}
              {drawerMode === "constellation" && drawerConstellationId && (
                <ConstellationDrawerContent
                  constellationId={drawerConstellationId}
                  anchors={state.anchors}
                  onAnchorTap={(anchor) => {
                    dispatch({ type: "HIGHLIGHT_CONSTELLATION", id: anchor.theme });
                    setDrawerOpen(false);
                  }}
                />
              )}

              {/* All anchors view */}
              {drawerMode === "all-anchors" && (
                <AllAnchorsDrawerContent
                  anchors={state.anchors}
                  onAnchorTap={(anchor) => {
                    dispatch({ type: "HIGHLIGHT_CONSTELLATION", id: anchor.theme });
                    setDrawerOpen(false);
                  }}
                />
              )}
            </SheetContent>
          </Sheet>

          {/* Your Sky: Lyra narration overlay */}
          {phase === "your_sky" && state.narrationText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-16 left-4 right-4 p-3 rounded-xl bg-black/40 backdrop-blur"
            >
              <LyraNarration
                text={state.narrationText}
                speed={25}
                onComplete={() => {
                  setTimeout(() => dispatch({ type: "SET_NARRATION", text: "" }), 4000);
                }}
              />
            </motion.div>
          )}

          {/* Phase 6: Timeline overlay */}
          {phase === "constellation_history" && (
            <div className="absolute inset-0 bg-black/50">
              <div
                ref={timelineRef}
                className="h-full overflow-y-auto py-8 px-4 space-y-4"
              >
                {MOCK_TIMELINE.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SPRING, delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
                    onClick={() => dispatch({ type: "FOCUS_TIMELINE_ENTRY", entryId: entry.id })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">
                        {entry.date}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/60">
                        {entry.type.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-sm font-serif text-amber-200/90">{entry.title}</h3>
                    <p className="text-xs text-white/50 mt-1">{entry.description}</p>
                    {entry.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.themes.map((theme) => (
                          <span
                            key={theme}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Lyra bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-black/60 backdrop-blur-xl border-t border-white/5 flex items-center px-4">
                <LyraNarration
                  text={
                    state.focusedTimelineEntry
                      ? MOCK_TIMELINE.findIndex((e) => e.id === state.focusedTimelineEntry) <= 1
                        ? LYRA_DIALOGUE.constellationHistory.early
                        : MOCK_TIMELINE.findIndex((e) => e.id === state.focusedTimelineEntry) <= 3
                          ? LYRA_DIALOGUE.constellationHistory.mid
                          : LYRA_DIALOGUE.constellationHistory.final
                      : LYRA_DIALOGUE.constellationHistory.early
                  }
                  speed={18}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Status Zone ── */}
      <motion.div
        layout
        className="min-h-0 px-4 flex flex-col justify-center"
        animate={{
          flex: zones.status,
          opacity: zones.status > 0 ? 1 : 0,
        }}
        transition={SPRING}
      >
        {zones.status > 0 && (
          <>
            {/* Phase indicator */}
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2"
            >
              {PHASE_LABELS[phase]}
            </motion.p>

            {/* Narration (Phase 1 only — simple fade-in, no typing) */}
            {phase === "first_light" && state.narrationText && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-sm font-serif text-amber-200/70 leading-relaxed"
              >
                {state.narrationText}
              </motion.p>
            )}
          </>
        )}
      </motion.div>

      {/* ── Content Zone ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: zones.content,
          opacity: zones.content > 0 ? 1 : 0,
        }}
        transition={SPRING}
      >
        {/* Phase 2: Zodiac Picker */}
        <div
          className={cn(
            "overflow-y-auto transition-opacity duration-300",
            phase === "birth_sky" && state.subPhase === "picking"
              ? "h-full opacity-100"
              : "opacity-0 pointer-events-none h-0 overflow-hidden"
          )}
        >
          <ZodiacPicker
            onSelect={handleZodiacSelect}
            selectedId={state.selectedZodiac}
            className="pb-4"
          />
        </div>

        {/* Phase 2: Post-selection content */}
        <div
          className={cn(
            "flex flex-col items-center justify-center px-4 transition-opacity duration-300",
            phase === "birth_sky" && (state.subPhase === "selected" || state.subPhase === "ghost_stars" || state.subPhase === "greeting" || state.subPhase === "ready")
              ? "h-full opacity-100"
              : "opacity-0 pointer-events-none h-0 overflow-hidden"
          )}
        >
          {selectedSign && (
            <div className="text-center space-y-3">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-serif text-amber-200/80"
              >
                {selectedSign.symbol} {selectedSign.name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/40"
              >
                {ELEMENT_STYLES[selectedSign.element].label} Sign
              </motion.p>
              {state.narrationText && (
                <div className="mt-4 max-w-sm">
                  <LyraNarration
                    text={state.narrationText}
                    speed={20}
                    onComplete={() => {
                      dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phase 3: Chat conversation */}
        <div
          className={cn(
            "flex flex-col transition-opacity duration-300",
            phase === "star_birth" ? "h-full opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
          )}
        >
          {/* Chat area */}
          <LyraChatNarration
            messages={MOCK_CONVERSATION}
            visibleCount={chatVisibleCount}
            typingIndex={chatTypingIndex}
            onMessageComplete={handleChatMessageComplete}
            className="flex-1 px-4 py-2"
            footer={
              <>
                {state.convergenceTriggered && state.narrationText && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING}
                    className="flex justify-center py-2"
                  >
                    <div className="max-w-[90%] rounded-xl px-4 py-3 bg-gradient-to-r from-amber-900/10 to-purple-900/10 border border-amber-500/10 text-center">
                      <LyraNarration text={state.narrationText} speed={22} />
                    </div>
                  </motion.div>
                )}
                {state.constellationNamed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="text-center py-3"
                  >
                    <p className="text-base font-serif text-amber-200/90 tracking-wide">
                      {CONVERGENCE_NAME}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Your first constellation</p>
                  </motion.div>
                )}
              </>
            }
          />
        </div>

        {/* Phase 5: Card Reading */}
        <div
          className={cn(
            "flex flex-col transition-opacity duration-300",
            phase === "cards_speak" ? "h-full opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
          )}
        >
          {/* Card spread */}
          <div className="flex-1 flex items-center justify-center gap-3 px-4">
            {MOCK_READING_CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                className="relative"
                style={{
                  width: "min(28vw, 120px)",
                  aspectRatio: "2/3",
                  perspective: "600px",
                }}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{
                    rotateY: cardFlipStates[i] !== "hidden" ? 0 : 180,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Front face */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-lg overflow-hidden",
                      "bg-gradient-to-b from-amber-900/30 to-purple-900/30",
                      "border border-amber-500/20 backdrop-blur",
                      "flex flex-col items-center justify-center p-2"
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-amber-300/50 mb-1">
                      {card.position}
                    </p>
                    <p className="text-xs font-serif text-amber-200/90 text-center">
                      {card.title}
                    </p>
                  </div>

                  {/* Back face */}
                  <div
                    className="absolute inset-0 rounded-lg bg-gradient-to-b from-purple-900/60 to-[#0a0118] border border-white/10 flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="w-8 h-8 opacity-20">
                      <svg viewBox="0 0 100 100" fill="none">
                        <circle cx={50} cy={50} r={20} stroke="rgba(201,169,78,0.3)" strokeWidth={1} />
                        <circle cx={50} cy={50} r={3} fill="rgba(201,169,78,0.3)" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Position label */}
                <p className="text-[9px] text-white/30 text-center mt-1.5">
                  {card.position}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Narration / interpretation */}
          <div className="shrink-0 max-h-[35%] overflow-y-auto px-4 py-2">
            {state.narrationText && (
              <LyraNarration text={state.narrationText} speed={22} />
            )}
            {interpretationText && state.subPhase === "interpreting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
              >
                <LyraNarration text={interpretationText} speed={8} />
              </motion.div>
            )}
            {state.starsAbsorbed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="text-xs text-white/40 text-center mt-3"
              >
                The reading stars have merged into your constellation.
              </motion.p>
            )}
          </div>
        </div>

        {/* Phase 7: Showcase vignettes */}
        <div
          className={cn(
            "overflow-y-auto transition-opacity duration-300",
            phase === "showcase" ? "h-full opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
          )}
        >
          <div className="p-4 space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-serif text-amber-200/80 text-center mb-6"
            >
              Lyra&apos;s Many Faces
            </motion.h2>

            {VIGNETTES.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: i * 0.06 }}
                className={cn(
                  "p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10",
                  "active:bg-white/8 transition-colors touch-manipulation"
                )}
                onClick={() => {
                  dispatch({
                    type: "SET_ACTIVE_VIGNETTE",
                    vignetteId: state.activeVignette === v.id ? null : v.id,
                  });
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{v.icon}</span>
                  <h3 className="text-sm font-serif text-amber-200/90">{v.title}</h3>
                </div>
                <p className="text-xs text-white/50">{v.description}</p>

                {/* Active vignette demo area */}
                <AnimatePresence>
                  {state.activeVignette === v.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={SPRING}
                      className="overflow-hidden"
                    >
                      <VignetteDemo vignetteId={v.id} element={state.zodiacElement} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Action Zone ── */}
      <motion.div
        layout
        className="min-h-0 flex items-center justify-center px-4 py-2"
        animate={{
          flex: zones.action,
          opacity: zones.action > 0 ? 1 : 0,
        }}
        transition={SPRING}
      >
        {/* Phase 2: Continue after zodiac selection */}
        {phase === "birth_sky" && state.subPhase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
          >
            <Button
              onClick={advancePhase}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
            >
              Begin the Journey
            </Button>
          </motion.div>
        )}

        {/* Phase 2: loading indicator while transitioning to picker */}
        {phase === "birth_sky" && state.subPhase === "transition_in" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="text-xs text-white/30"
          >
            ...
          </motion.p>
        )}

        {/* Phase 3: Continue after constellation naming */}
        {phase === "star_birth" && (state.subPhase === "naming" || state.subPhase === "complete") && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
          >
            <Button
              onClick={advancePhase}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
            >
              See Your Sky
            </Button>
          </motion.div>
        )}

        {/* Phase 5: Draw cards / Continue */}
        {phase === "cards_speak" && state.subPhase === "setup" && (
          <Button
            onClick={startReading}
            className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
          >
            Draw Cards
          </Button>
        )}
        {phase === "cards_speak" && state.subPhase === "complete" && (
          <Button
            onClick={advancePhase}
            className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
          >
            View Journey
          </Button>
        )}
      </motion.div>

      {/* ── Bottom Navigation Strip ── */}
      {showBottomNav && (
        <motion.div
          initial={{ y: 48 }}
          animate={{ y: 0 }}
          transition={SPRING}
          className="shrink-0 h-12 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.phase}
              onClick={() => goToPhase(item.phase)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] justify-center",
                phase === item.phase
                  ? "text-amber-300/90"
                  : "text-white/30 hover:text-white/50"
              )}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="text-[9px]">{item.label}</span>
            </button>
          ))}
          {/* Showcase nav item */}
          <button
            onClick={() => goToPhase("showcase")}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] justify-center",
              phase === "showcase"
                ? "text-amber-300/90"
                : "text-white/30 hover:text-white/50"
            )}
          >
            <span className="text-sm">&#x2734;</span>
            <span className="text-[9px]">Explore</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Vignette Demo Components ─────────────────────────────────────────

function VignetteDemo({
  vignetteId,
  element,
}: {
  vignetteId: string;
  element: "fire" | "earth" | "air" | "water" | null;
}) {
  const [demoState, setDemoState] = useState(0);

  const cycleState = () => setDemoState((s) => (s + 1) % 3);

  return (
    <div className="mt-3 p-3 rounded-xl bg-black/20 border border-white/5 min-h-[100px] flex items-center justify-center">
      {vignetteId === "sigil" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4 items-end">
            {(["sm", "md", "lg"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <LyraGuide
                  state={
                    demoState === 0 ? "dormant" : demoState === 1 ? "attentive" : "speaking"
                  }
                  size={size === "sm" ? 32 : size === "md" ? 48 : 72}
                  breathing
                />
                <span className="text-[9px] text-white/30">{size}</span>
              </div>
            ))}
          </div>
          <button
            onClick={cycleState}
            className="text-[10px] text-amber-400/60 mt-1"
          >
            Tap to cycle: {["dormant", "attentive", "speaking"][demoState]}
          </button>
        </div>
      )}

      {vignetteId === "voice" && (
        <div className="w-full">
          <LyraNarration
            key={demoState}
            text={
              demoState === 0
                ? "Hello. The stars have been waiting for you."
                : demoState === 1
                  ? "I sense something stirring in the constellation tonight."
                  : "Your sky is fuller than when we first met."
            }
            speed={25}
          />
          <button
            onClick={cycleState}
            className="text-[10px] text-amber-400/60 mt-2 block"
          >
            Tap for next message
          </button>
        </div>
      )}

      {vignetteId === "breath" && (
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="w-3 h-3 rounded-full bg-amber-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-[9px] text-white/30">Mechanical</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <LyraGuide state="dormant" size={40} breathing />
            <span className="text-[9px] text-white/30">Organic</span>
          </div>
        </div>
      )}

      {vignetteId === "elements" && (
        <div className="flex gap-3">
          {(["fire", "earth", "air", "water"] as const).map((el) => (
            <div key={el} className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  backgroundColor: ELEMENT_STYLES[el].haloColor,
                  opacity: 0.6,
                  boxShadow: `0 0 10px ${ELEMENT_STYLES[el].haloGlow}`,
                }}
              />
              <span className="text-[8px] text-white/30 capitalize">{el}</span>
            </div>
          ))}
        </div>
      )}

      {vignetteId === "pointer" && (
        <div className="relative w-full h-20">
          <LyraGuide
            state="attentive"
            size={50}
            breathing
            pointingTarget={{ x: 0.8, y: 0.7 }}
          />
        </div>
      )}

      {vignetteId === "lyre" && (
        <div className="flex flex-col items-center gap-2">
          <LyraGuide state="speaking" size={80} breathing />
          <span className="text-[9px] text-white/30">Strings vibrate when speaking</span>
        </div>
      )}

      {vignetteId === "traveler" && (
        <div className="relative w-full h-16">
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-amber-400"
            animate={{
              left: ["10%", "80%"],
              top: ["70%", "30%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-400/30"
              animate={{
                left: [`${10 + i * 9}%`, `${80 - i * 2}%`],
                top: [`${70 - i * 3}%`, `${30 + i * 3}%`],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.08,
              }}
            />
          ))}
        </div>
      )}

      {vignetteId === "ghostStars" && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            {[0.06, 0.08, 1].map((opacity, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full bg-amber-400"
                style={{ opacity }}
                whileTap={
                  opacity < 0.5
                    ? {
                        opacity: 1,
                        scale: [1, 1.5, 1],
                        boxShadow: "0 0 20px rgba(201,169,78,0.5)",
                      }
                    : {}
                }
              />
            ))}
          </div>
          <span className="text-[9px] text-white/30">Tap ghost stars to ignite them</span>
        </div>
      )}

      {/* Fallback for unimplemented vignettes */}
      {!["sigil", "voice", "breath", "elements", "pointer", "lyre", "traveler", "ghostStars"].includes(vignetteId) && (
        <p className="text-xs text-white/30 italic">Interactive demo</p>
      )}
    </div>
  );
}

// ── Constellation SVG Preview ────────────────────────────────────────

function ConstellationPreview({ constellation }: { constellation: ThemeConstellation }) {
  const xs = constellation.stars.map((s) => s.x);
  const ys = constellation.stars.map((s) => s.y);
  const padding = 0.08;
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const size = 180;
  const scale = size / Math.max(rangeX, rangeY);
  const offsetX = (size - rangeX * scale) / 2;
  const offsetY = (size - rangeY * scale) / 2;

  const mapX = (x: number) => (x - minX) * scale + offsetX;
  const mapY = (y: number) => (y - minY) * scale + offsetY;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-36">
      {constellation.lines.map(([from, to], i) => {
        const s1 = constellation.stars[from];
        const s2 = constellation.stars[to];
        return (
          <line
            key={i}
            x1={mapX(s1.x)}
            y1={mapY(s1.y)}
            x2={mapX(s2.x)}
            y2={mapY(s2.y)}
            stroke={constellation.themeColor}
            strokeWidth={2}
            strokeOpacity={0.5}
          />
        );
      })}
      {constellation.stars.map((star, i) => (
        <circle
          key={i}
          cx={mapX(star.x)}
          cy={mapY(star.y)}
          r={6}
          fill={constellation.themeColor}
          fillOpacity={0.8}
        />
      ))}
    </svg>
  );
}

// ── Constellation Drawer Content ─────────────────────────────────────

function ConstellationDrawerContent({
  constellationId,
  anchors,
  onAnchorTap,
}: {
  constellationId: string;
  anchors: AnchorStar[];
  onAnchorTap: (anchor: AnchorStar) => void;
}) {
  const constellation = THEME_CONSTELLATIONS.find((c) => c.id === constellationId);
  if (!constellation) return null;

  const relatedAnchors = anchors.filter((a) => a.theme === constellationId);

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Enlarged constellation preview */}
      <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
        <ConstellationPreview constellation={constellation} />
      </div>

      {/* Related anchor stars */}
      {relatedAnchors.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/30">
            Stars in this constellation
          </p>
          {relatedAnchors.map((anchor) => (
            <button
              key={anchor.id}
              onClick={() => onAnchorTap(anchor)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-left touch-manipulation hover:bg-white/8 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: constellation.themeColor, opacity: 0.8 }}
              />
              <div>
                <p className="text-sm text-amber-200/90 font-serif">{anchor.name}</p>
                <p className="text-[10px] text-white/30 capitalize">{anchor.theme}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {relatedAnchors.length === 0 && (
        <p className="text-xs text-white/40 text-center py-2">
          No anchor stars in this constellation yet.
        </p>
      )}
    </div>
  );
}

// ── All Anchors Drawer Content ───────────────────────────────────────

function AllAnchorsDrawerContent({
  anchors,
  onAnchorTap,
}: {
  anchors: AnchorStar[];
  onAnchorTap: (anchor: AnchorStar) => void;
}) {
  // Group anchors by theme
  const grouped = anchors.reduce<Record<string, AnchorStar[]>>((acc, anchor) => {
    if (!acc[anchor.theme]) acc[anchor.theme] = [];
    acc[anchor.theme].push(anchor);
    return acc;
  }, {});

  const themes = Object.keys(grouped);

  return (
    <div className="px-4 pb-4 space-y-4 overflow-y-auto max-h-[40vh]">
      {themes.map((theme) => {
        const constellation = THEME_CONSTELLATIONS.find((c) => c.id === theme);
        return (
          <div key={theme} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: constellation?.themeColor ?? "#c9a94e" }}
              />
              <p className="text-xs font-serif text-amber-200/70 capitalize">
                {constellation?.name ?? theme}
              </p>
            </div>
            {grouped[theme].map((anchor) => (
              <button
                key={anchor.id}
                onClick={() => onAnchorTap(anchor)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-left touch-manipulation hover:bg-white/8 transition-colors"
              >
                <span className="text-amber-400 text-sm">&#x2605;</span>
                <div>
                  <p className="text-sm text-amber-200/90 font-serif">{anchor.name}</p>
                  <p className="text-[10px] text-white/30 capitalize">{anchor.theme}</p>
                </div>
              </button>
            ))}
          </div>
        );
      })}

      {anchors.length === 0 && (
        <p className="text-xs text-white/40 text-center py-4">
          No anchor stars yet. Complete the Star Birth phase to create anchors.
        </p>
      )}
    </div>
  );
}
