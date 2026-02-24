"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_DECKS, MOCK_READING_INTERPRETATION, shuffleArray } from "@/app/mock/full/_shared/mock-data-v1";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { GlassPanel } from "./shared/glass-panel";
import { GoldButton } from "./shared/gold-button";
import type { ReadingPhase } from "@/app/mock/full/_shared/types";
import type { MockFullCard } from "@/app/mock/full/_shared/types";
// ---- State Machine ----

interface ReadingState {
  phase: ReadingPhase;
  selectedDeckId: string | null;
  drawnCards: MockFullCard[];
}

type ReadingAction =
  | { type: "SELECT_DECK_AND_DRAW"; deckId: string; cards: MockFullCard[] }
  | { type: "START_REVEALING" }
  | { type: "START_INTERPRETING" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case "SELECT_DECK_AND_DRAW":
      return { ...state, selectedDeckId: action.deckId, drawnCards: action.cards, phase: "drawing" };
    case "START_REVEALING":
      return { ...state, phase: "revealing" };
    case "START_INTERPRETING":
      return { ...state, phase: "interpreting" };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { phase: "spread", selectedDeckId: null, drawnCards: [] };
    default:
      return state;
  }
}

// ---- Responsive card sizing ----

function useReadingCardSize(cardCount: number, isCompact: boolean) {
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = vw < 640;

  let cardWidth: number;
  if (isCompact) {
    cardWidth = isMobile ? 56 : 80;
  } else {
    cardWidth = isMobile ? 90 : 140;
  }

  const cardHeight = Math.round(cardWidth * 1.5);
  const gap = isMobile ? 6 : 12;

  return { cardWidth, cardHeight, gap, isMobile };
}

// ---- Reading Floor ----

interface ReadingFloorProps {
  onSetHideNav: (hidden: boolean) => void;
}

export function ReadingFloor({ onSetHideNav }: ReadingFloorProps) {
  const { setMoodPreset } = useMockImmersive();
  const [state, dispatch] = useReducer(readingReducer, {
    phase: "spread",
    selectedDeckId: null,
    drawnCards: [],
  });

  // Interpretation streaming
  const [displayedText, setDisplayedText] = useState("");
  const charIndexRef = useRef(0);

  const cardCount = state.drawnCards.length || 3;
  const isSpreadPhase = state.phase === "spread";
  const isInterpretPhase = state.phase === "interpreting" || state.phase === "complete";
  const isActiveReading = state.phase === "drawing" || state.phase === "revealing" || state.phase === "interpreting";

  const fullSize = useReadingCardSize(cardCount, false);
  const compactSize = useReadingCardSize(cardCount, true);

  // Card reveal hook
  const { cardStates, startReveal, reset: resetReveal } = useCardReveal({
    cardCount,
    revealDuration: 1500,
    delayBetween: 1000,
    onAllRevealed: () => {
      setTimeout(() => dispatch({ type: "START_INTERPRETING" }), 600);
    },
  });

  // Hide nav during active reading
  useEffect(() => {
    onSetHideNav(isActiveReading);
    return () => onSetHideNav(false);
  }, [isActiveReading, onSetHideNav]);

  // Mood shifts per phase
  useEffect(() => {
    switch (state.phase) {
      case "spread":
        setMoodPreset("reading-setup");
        break;
      case "drawing":
        setMoodPreset("card-draw");
        break;
      case "revealing":
        setMoodPreset("card-reveal");
        break;
      case "interpreting":
        setMoodPreset("default");
        break;
      case "complete":
        setMoodPreset("completion");
        break;
    }
  }, [state.phase, setMoodPreset]);

  // Auto-transition: drawing -> revealing
  useEffect(() => {
    if (state.phase === "drawing") {
      const timer = setTimeout(() => {
        dispatch({ type: "START_REVEALING" });
        startReveal();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.phase, startReveal]);

  // Interpretation streaming
  useEffect(() => {
    if (state.phase === "interpreting") {
      charIndexRef.current = 0;
      setDisplayedText("");

      const interval = setInterval(() => {
        if (charIndexRef.current < MOCK_READING_INTERPRETATION.length) {
          setDisplayedText(MOCK_READING_INTERPRETATION.slice(0, charIndexRef.current + 1));
          charIndexRef.current++;
        } else {
          clearInterval(interval);
          setTimeout(() => dispatch({ type: "COMPLETE" }), 1000);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [state.phase]);

  const handleDrawCards = useCallback((deckId: string) => {
    const deck = MOCK_DECKS.find((d) => d.id === deckId);
    if (!deck) return;
    const shuffled = shuffleArray(deck.cards);
    const drawn = shuffled.slice(0, 3);
    dispatch({ type: "SELECT_DECK_AND_DRAW", deckId, cards: drawn });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    resetReveal();
    setDisplayedText("");
    charIndexRef.current = 0;
  }, [resetReveal]);

  return (
    <div className="h-full flex flex-col overflow-hidden px-3 sm:px-6 py-4">
      {/* ---- ZONE 1: Selection ---- */}
      <motion.div
        layout
        animate={{
          height: isSpreadPhase ? "auto" : 0,
          opacity: isSpreadPhase ? 1 : 0,
          marginBottom: isSpreadPhase ? 16 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="overflow-hidden shrink-0"
      >
        <div className="max-w-lg mx-auto w-full">
          <div className="text-center mb-5">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#c9a94e] text-xs font-medium tracking-wider uppercase mb-2"
            >
              3-Card Spread
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-2xl font-bold text-white/90"
            >
              Choose Your Deck
            </motion.h2>
          </div>

          <div className="space-y-2">
            {MOCK_DECKS.map((deck, idx) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08, type: "spring", stiffness: 300, damping: 30 }}
              >
                <GlassPanel
                  onClick={() => handleDrawCards(deck.id)}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:border-[#c9a94e]/30 transition-colors cursor-pointer group"
                >
                  <img
                    src={deck.coverUrl}
                    alt={deck.name}
                    className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-[#c9a94e] transition-colors">
                      {deck.name}
                    </h3>
                    <p className="text-xs text-white/40 truncate">{deck.cardCount} cards</p>
                  </div>
                  <span className="text-white/20 group-hover:text-[#c9a94e]/60 transition-colors text-sm">&rarr;</span>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ---- ZONE 2: Cards ---- */}
      <motion.div
        layout
        animate={{
          flex: isInterpretPhase ? "0 0 auto" : isSpreadPhase ? "0 0 0px" : "1 1 0%",
          opacity: isSpreadPhase ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="overflow-hidden flex flex-col items-center justify-center"
      >
        {/* Phase status text */}
        {!isSpreadPhase && !isInterpretPhase && (
          <div className="shrink-0 text-center py-2">
            <AnimatePresence mode="wait">
              {state.phase === "drawing" && (
                <motion.p
                  key="drawing"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="text-[#c9a94e] text-sm sm:text-base"
                >
                  Drawing your cards...
                </motion.p>
              )}
              {state.phase === "revealing" && (
                <motion.p
                  key="revealing"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="text-[#c9a94e] text-sm sm:text-base"
                >
                  Revealing your spread...
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Card spread */}
        {!isSpreadPhase && (
          <div
            className="flex items-center justify-center flex-wrap"
            style={{ gap: isInterpretPhase ? compactSize.gap : fullSize.gap }}
          >
            {state.drawnCards.map((card, idx) => {
              const isRevealed = cardStates[idx] === "revealing" || cardStates[idx] === "revealed";
              const isRevealing = cardStates[idx] === "revealing";
              const cw = isInterpretPhase ? compactSize.cardWidth : fullSize.cardWidth;
              const ch = isInterpretPhase ? compactSize.cardHeight : fullSize.cardHeight;

              return (
                <motion.div
                  key={card.id}
                  layout
                  animate={{
                    scale: isRevealing ? 1.08 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative"
                >
                  {/* Card back - fades out */}
                  <motion.div
                    animate={{
                      opacity: isRevealed ? 0 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <MockCardBack width={cw} height={ch} />
                  </motion.div>

                  {/* Card front - fades in from blur */}
                  <motion.div
                    animate={{
                      opacity: isRevealed ? 1 : 0,
                      filter: isRevealed ? "blur(0px)" : "blur(20px)",
                    }}
                    transition={{ duration: isRevealed ? 1.2 : 0, ease: "easeOut" }}
                  >
                    <MockCardFront
                      card={{ id: card.id, title: card.title, meaning: card.meaning, imageUrl: card.imageUrl }}
                      width={cw}
                      height={ch}
                    />
                  </motion.div>

                  {/* Gold glow pulse during reveal */}
                  {isRevealing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.3, 1.5] }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 -m-3 rounded-2xl bg-[#ffd700]/25 blur-xl pointer-events-none"
                    />
                  )}

                  {/* Position label */}
                  {isInterpretPhase && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-xs text-white/30 mt-1"
                    >
                      {["Past", "Present", "Future"][idx]}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ---- ZONE 3: Interpretation Text ---- */}
      <motion.div
        layout
        animate={{
          flex: isInterpretPhase ? "1 1 0%" : "0 0 0px",
          opacity: isInterpretPhase ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: isInterpretPhase ? 0.2 : 0 }}
        className="overflow-hidden min-h-0"
      >
        <div className="h-full overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mt-3">
          <div className="flex items-center gap-2 text-[#c9a94e] mb-4">
            <span className="text-sm">{"\u2728"}</span>
            <span className="text-xs font-medium tracking-wider uppercase">Your Reading</span>
          </div>

          <div className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">
            {state.phase === "interpreting" && displayedText}
            {state.phase === "complete" && MOCK_READING_INTERPRETATION}
            {state.phase === "interpreting" && displayedText.length < MOCK_READING_INTERPRETATION.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-4 bg-[#c9a94e] ml-1"
              />
            )}
          </div>

          {/* Restart button */}
          <AnimatePresence>
            {state.phase === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-6"
              >
                <GoldButton onClick={handleReset} className="text-sm px-6">
                  New Reading
                </GoldButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
