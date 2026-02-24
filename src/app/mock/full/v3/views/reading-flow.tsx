"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { lunar } from "../lunar-theme";
import { LunarFlipCard } from "../lunar-card";
import {
  getAllCards,
  shuffleArray,
  MOCK_READING_INTERPRETATION,
} from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams, ReadingPhase, MoodId } from "../../_shared/types";

// ─── Spread definitions ──────────────────────────────────────────────────────

interface SpreadOption {
  id: string;
  name: string;
  count: number;
  labels: string[];
}

const SPREADS: SpreadOption[] = [
  { id: "single", name: "Single Card", count: 1, labels: ["Guidance"] },
  {
    id: "three",
    name: "Three Card",
    count: 3,
    labels: ["Past", "Present", "Future"],
  },
  {
    id: "five",
    name: "Five Card",
    count: 5,
    labels: ["Past", "Challenge", "Present", "Advice", "Outcome"],
  },
];

// ─── Reading state ──────────────────────────────────────────────────────────

interface ReadingState {
  phase: ReadingPhase;
  selectedSpread: SpreadOption | null;
  drawnCards: { id: string; imageUrl: string; title: string }[];
  flippedCards: Set<number>;
  currentRevealIndex: number;
  displayedText: string;
  textComplete: boolean;
}

type ReadingAction =
  | { type: "SELECT_SPREAD"; spread: SpreadOption }
  | { type: "START_DRAWING" }
  | { type: "START_REVEALING" }
  | { type: "FLIP_CARD"; index: number }
  | { type: "START_INTERPRETING" }
  | { type: "UPDATE_TEXT"; text: string }
  | { type: "TEXT_COMPLETE" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

const initialReadingState: ReadingState = {
  phase: "spread",
  selectedSpread: null,
  drawnCards: [],
  flippedCards: new Set(),
  currentRevealIndex: 0,
  displayedText: "",
  textComplete: false,
};

function readingReducer(
  state: ReadingState,
  action: ReadingAction
): ReadingState {
  switch (action.type) {
    case "SELECT_SPREAD": {
      const all = getAllCards();
      const shuffled = shuffleArray(all);
      const drawn = shuffled.slice(0, action.spread.count).map((c) => ({
        id: c.id,
        imageUrl: c.imageUrl,
        title: c.title,
      }));
      return {
        ...state,
        selectedSpread: action.spread,
        drawnCards: drawn,
      };
    }
    case "START_DRAWING":
      return { ...state, phase: "drawing" };
    case "START_REVEALING":
      return { ...state, phase: "revealing", currentRevealIndex: 0 };
    case "FLIP_CARD": {
      const next = new Set(state.flippedCards);
      next.add(action.index);
      return {
        ...state,
        flippedCards: next,
        currentRevealIndex: Math.max(
          state.currentRevealIndex,
          action.index + 1
        ),
      };
    }
    case "START_INTERPRETING":
      return { ...state, phase: "interpreting" };
    case "UPDATE_TEXT":
      return { ...state, displayedText: action.text };
    case "TEXT_COMPLETE":
      return { ...state, textComplete: true };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { ...initialReadingState };
    default:
      return state;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface LunarReadingFlowProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onSetMood: (mood: MoodId) => void;
  onSetHideNav: (hidden: boolean) => void;
}

export function LunarReadingFlow({
  onNavigate,
  onSetMood,
  onSetHideNav,
}: LunarReadingFlowProps) {
  const [state, dispatch] = useReducer(readingReducer, initialReadingState);
  const textIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textIndexRef = useRef(0);

  // ── Mood & nav management ──
  useEffect(() => {
    onSetMood("reading");
    onSetHideNav(true);
    return () => {
      onSetHideNav(false);
      onSetMood("default");
    };
  }, [onSetMood, onSetHideNav]);

  // ── Handle spread selection → drawing transition ──
  const handleSelectSpread = useCallback((spread: SpreadOption) => {
    dispatch({ type: "SELECT_SPREAD", spread });
    // Small delay, then start drawing
    setTimeout(() => dispatch({ type: "START_DRAWING" }), 400);
  }, []);

  // ── Drawing → Revealing auto-advance ──
  useEffect(() => {
    if (state.phase !== "drawing") return;
    const timer = setTimeout(
      () => dispatch({ type: "START_REVEALING" }),
      1200
    );
    return () => clearTimeout(timer);
  }, [state.phase]);

  // ── Auto-reveal cards with delay ──
  useEffect(() => {
    if (state.phase !== "revealing") return;
    if (!state.selectedSpread) return;
    const count = state.selectedSpread.count;

    // Auto-flip cards one by one
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < count) {
        dispatch({ type: "FLIP_CARD", index: idx });
        idx++;
      } else {
        clearInterval(interval);
        // All revealed → start interpreting after a short pause
        setTimeout(() => dispatch({ type: "START_INTERPRETING" }), 800);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [state.phase, state.selectedSpread]);

  // ── Text streaming ──
  useEffect(() => {
    if (state.phase !== "interpreting") return;
    if (state.textComplete) return;

    textIndexRef.current = 0;
    const fullText = MOCK_READING_INTERPRETATION;

    textIntervalRef.current = setInterval(() => {
      textIndexRef.current += 1;
      if (textIndexRef.current >= fullText.length) {
        dispatch({ type: "UPDATE_TEXT", text: fullText });
        dispatch({ type: "TEXT_COMPLETE" });
        dispatch({ type: "COMPLETE" });
        if (textIntervalRef.current) clearInterval(textIntervalRef.current);
      } else {
        dispatch({
          type: "UPDATE_TEXT",
          text: fullText.slice(0, textIndexRef.current),
        });
      }
    }, 15);

    return () => {
      if (textIntervalRef.current) clearInterval(textIntervalRef.current);
    };
  }, [state.phase, state.textComplete]);

  // ── Handle manual flip (if user taps before auto) ──
  const handleFlipCard = useCallback(
    (index: number) => {
      if (state.phase !== "revealing") return;
      if (state.flippedCards.has(index)) return;
      dispatch({ type: "FLIP_CARD", index });
    },
    [state.phase, state.flippedCards]
  );

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // ── Phase label ──
  const phaseLabels: Record<ReadingPhase, string> = {
    spread: "What guidance do you seek?",
    drawing: "The tides are turning...",
    revealing: "The moon reveals your cards",
    interpreting: "Your Reading",
    complete: "Your Reading",
  };

  const isCardPhase =
    state.phase === "drawing" ||
    state.phase === "revealing";
  const showText =
    state.phase === "interpreting" || state.phase === "complete";
  const showCards =
    state.phase !== "spread";

  return (
    <div
      className="h-[100dvh] flex flex-col overflow-hidden"
      style={{ color: lunar.foam }}
    >
      {/* ── Status Zone ── always mounted ─────────────────────────────────── */}
      <motion.div
        className="shrink-0 text-center px-4 pt-6 pb-2"
        layout
        animate={{
          paddingTop: state.phase === "spread" ? 48 : 16,
          paddingBottom: state.phase === "spread" ? 16 : 8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.h2
          key={state.phase}
          className="font-serif text-xl md:text-2xl"
          style={{ color: lunar.pearl }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {phaseLabels[state.phase]}
        </motion.h2>
        {state.phase === "spread" && (
          <motion.p
            className="text-sm mt-2"
            style={{ color: lunar.muted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Choose a spread to begin your reading
          </motion.p>
        )}
        {state.phase === "drawing" && (
          <motion.p
            className="text-sm mt-1"
            style={{ color: lunar.muted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {state.selectedSpread?.count} cards are being drawn...
          </motion.p>
        )}
      </motion.div>

      {/* ── Zone 1: Selection Zone ── always mounted ──────────────────────── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: state.phase === "spread" ? 1 : 0,
          opacity: state.phase === "spread" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
          {SPREADS.map((spread) => (
            <motion.button
              key={spread.id}
              className="w-full max-w-xs rounded-2xl p-5 text-left"
              style={{
                background: `${lunar.surface}99`,
                border: `1px solid ${lunar.border}66`,
                backdropFilter: "blur(12px)",
              }}
              whileHover={{
                scale: 1.02,
                borderColor: `${lunar.glow}60`,
                boxShadow: `0 0 20px 2px ${lunar.glow}20`,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => handleSelectSpread(spread)}
            >
              <div
                className="font-serif text-lg"
                style={{ color: lunar.foam }}
              >
                {spread.name}
              </div>
              <div
                className="text-sm mt-1"
                style={{ color: lunar.muted }}
              >
                {spread.count} card{spread.count > 1 ? "s" : ""}
              </div>
              {/* Layout preview dots */}
              <div className="flex gap-2 mt-3">
                {spread.labels.map((label, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        border: `1.5px solid ${lunar.glow}80`,
                        backgroundColor: `${lunar.glow}15`,
                      }}
                    />
                    <span
                      className="text-[9px]"
                      style={{ color: lunar.muted }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Zone 2: Card Zone ── always mounted ──────────────────────────── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: isCardPhase ? 1 : showCards ? "none" : 0,
          opacity: showCards ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div
          className={`h-full flex items-center justify-center gap-3 px-4 ${
            showText ? "py-2" : "py-4"
          }`}
        >
          {state.drawnCards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
                delay: index * 0.15,
              }}
            >
              <LunarFlipCard
                imageUrl={card.imageUrl}
                title={card.title}
                isFlipped={state.flippedCards.has(index)}
                size={showText ? "sm" : state.drawnCards.length > 3 ? "sm" : "md"}
                glowDelay={index * 0.4}
                onFlip={() => handleFlipCard(index)}
              />
              {/* Position label */}
              {state.selectedSpread && state.flippedCards.has(index) && (
                <motion.span
                  className="text-xs mt-2 font-serif"
                  style={{ color: lunar.silver }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {state.selectedSpread.labels[index]}
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Zone 3: Text Zone ── always mounted ──────────────────────────── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: showText ? 1 : 0,
          opacity: showText ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full overflow-y-auto px-4 pb-8">
          <div
            className="max-w-lg mx-auto rounded-2xl p-5 mt-2"
            style={{
              background: `${lunar.surface}99`,
              border: `1px solid ${lunar.border}66`,
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Streaming text with markdown-like bold */}
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: lunar.pearl }}
              dangerouslySetInnerHTML={{
                __html: state.displayedText
                  .replace(
                    /\*\*(.*?)\*\*/g,
                    `<strong style="color:${lunar.glow}">$1</strong>`
                  ),
              }}
            />

            {/* Blinking cursor during streaming */}
            {!state.textComplete && state.displayedText.length > 0 && (
              <motion.span
                className="inline-block w-[2px] h-4 ml-0.5 align-text-bottom"
                style={{ backgroundColor: lunar.glow }}
                animate={{ opacity: [1, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Completion buttons */}
            {state.phase === "complete" && (
              <motion.div
                className="flex flex-col gap-3 mt-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  delay: 0.3,
                }}
              >
                <button
                  className="w-full py-3 rounded-xl font-medium text-sm transition-colors"
                  style={{
                    background: `${lunar.glow}20`,
                    border: `1px solid ${lunar.glow}40`,
                    color: lunar.glow,
                  }}
                  onClick={handleReset}
                >
                  Begin Another Reading
                </button>
                <button
                  className="w-full py-3 rounded-xl font-medium text-sm transition-colors"
                  style={{
                    background: lunar.surface2,
                    border: `1px solid ${lunar.border}`,
                    color: lunar.pearl,
                  }}
                  onClick={() => onNavigate("dashboard")}
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
