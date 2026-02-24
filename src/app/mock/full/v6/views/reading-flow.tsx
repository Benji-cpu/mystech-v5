"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { ViewId, ViewParams, MockFullCard } from "../../_shared/types";
import {
  MOCK_DECKS,
  MOCK_READING_INTERPRETATION,
  shuffleArray,
} from "../../_shared/mock-data-v1";
import { T, glassStyle, SPRING } from "../marionette-theme";

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onSetMood: (mood: "default" | "reading" | "creating" | "viewing" | "warm") => void;
  onSetHideNav: (hidden: boolean) => void;
}

// ─── Reading State Machine ──────────────────────────────────────────────────

type ReadingPhase = "spread" | "drawing" | "revealing" | "interpreting" | "complete";

interface ReadingState {
  phase: ReadingPhase;
  spreadSize: number | null;
  drawnCards: MockFullCard[];
  revealedIndices: Set<number>;
  interpretationText: string;
  isStreamingDone: boolean;
}

type ReadingAction =
  | { type: "SELECT_SPREAD"; size: number }
  | { type: "BEGIN_READING" }
  | { type: "START_REVEALING" }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "START_INTERPRETING" }
  | { type: "STREAM_CHAR"; text: string }
  | { type: "STREAM_DONE" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

const initialReadingState: ReadingState = {
  phase: "spread",
  spreadSize: null,
  drawnCards: [],
  revealedIndices: new Set(),
  interpretationText: "",
  isStreamingDone: false,
};

function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case "SELECT_SPREAD":
      return { ...state, spreadSize: action.size };
    case "BEGIN_READING": {
      const allCards = MOCK_DECKS.flatMap((d) => d.cards);
      const shuffled = shuffleArray(allCards);
      const drawn = shuffled.slice(0, state.spreadSize ?? 1);
      return {
        ...state,
        phase: "drawing",
        drawnCards: drawn,
        revealedIndices: new Set(),
        interpretationText: "",
        isStreamingDone: false,
      };
    }
    case "START_REVEALING":
      return { ...state, phase: "revealing" };
    case "REVEAL_CARD": {
      const newSet = new Set(state.revealedIndices);
      newSet.add(action.index);
      return { ...state, revealedIndices: newSet };
    }
    case "START_INTERPRETING":
      return { ...state, phase: "interpreting" };
    case "STREAM_CHAR":
      return { ...state, interpretationText: action.text };
    case "STREAM_DONE":
      return { ...state, isStreamingDone: true };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { ...initialReadingState };
    default:
      return state;
  }
}

// ─── Spread Config ──────────────────────────────────────────────────────────

interface SpreadOption {
  size: number;
  label: string;
  icon: React.ReactNode;
  positions: string[];
}

const SPREAD_OPTIONS: SpreadOption[] = [
  {
    size: 1,
    label: "Single Card",
    icon: (
      <svg width="28" height="38" viewBox="0 0 28 38" fill="none">
        <rect x="1" y="1" width="26" height="36" rx="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    positions: ["Your Card"],
  },
  {
    size: 3,
    label: "Three Card",
    icon: (
      <svg width="50" height="38" viewBox="0 0 50 38" fill="none">
        <rect x="1" y="1" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="18" y="1" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="35" y="1" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    positions: ["Past", "Present", "Future"],
  },
  {
    size: 5,
    label: "Five Card",
    icon: (
      <svg width="70" height="38" viewBox="0 0 70 38" fill="none">
        <rect x="1" y="4" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1" />
        <rect x="15" y="4" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1" />
        <rect x="29" y="4" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1" />
        <rect x="43" y="4" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1" />
        <rect x="57" y="4" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    positions: ["Foundation", "Challenge", "Outcome", "Past", "Future"],
  },
];

// ─── Card Sizing ────────────────────────────────────────────────────────────

function getCardSize(
  spreadSize: number,
  isDesktop: boolean,
  isThumbnail: boolean
): { width: number; height: number } {
  if (isThumbnail) {
    return isDesktop ? { width: 54, height: 81 } : { width: 42, height: 63 };
  }
  switch (spreadSize) {
    case 1:
      return isDesktop ? { width: 160, height: 240 } : { width: 130, height: 195 };
    case 3:
      return isDesktop ? { width: 110, height: 165 } : { width: 82, height: 123 };
    case 5:
      return isDesktop ? { width: 84, height: 126 } : { width: 64, height: 96 };
    default:
      return isDesktop ? { width: 110, height: 165 } : { width: 82, height: 123 };
  }
}

// ─── Reading Card Component ─────────────────────────────────────────────────

function ReadingCard({
  card,
  index,
  isRevealed,
  onReveal,
  size,
  positionLabel,
  isThumbnail,
}: {
  card: MockFullCard;
  index: number;
  isRevealed: boolean;
  onReveal: () => void;
  size: { width: number; height: number };
  positionLabel: string;
  isThumbnail: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative select-none"
        style={{
          perspective: "800px",
          width: size.width,
          height: size.height,
          cursor: !isRevealed && !isThumbnail ? "pointer" : "default",
        }}
        onClick={!isRevealed && !isThumbnail ? onReveal : undefined}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {/* Front face (card image) */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageUrl}
              alt={card.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 px-1 pb-1 pt-3"
              style={{
                background: `linear-gradient(to bottom, transparent, ${T.bg}dd)`,
              }}
            >
              {!isThumbnail && (
                <span
                  className="text-center block leading-tight"
                  style={{
                    color: T.text,
                    fontSize: size.width > 100 ? "0.65rem" : "0.5rem",
                    textShadow: `0 1px 4px rgba(10,1,24,0.9)`,
                  }}
                >
                  {card.title}
                </span>
              )}
            </div>
            <div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ border: `1px solid ${T.gold}40` }}
            />
          </div>

          {/* Back face (card back) */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: `linear-gradient(160deg, ${T.surface} 0%, ${T.bg} 100%)`,
              border: `1px solid ${T.gold}30`,
            }}
          >
            {/* Back sigil */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="rounded-full"
                style={{
                  width: Math.min(size.width * 0.3, 20),
                  height: Math.min(size.width * 0.3, 20),
                  backgroundColor: T.gold,
                  boxShadow: `0 0 8px 2px ${T.gold}66`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Position label */}
      {!isThumbnail && (
        <span
          className="text-center leading-tight"
          style={{
            fontSize: "0.6rem",
            color: T.textMuted,
            letterSpacing: "0.05em",
          }}
        >
          {positionLabel}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function MarionetteReadingFlow({ onNavigate, onSetMood, onSetHideNav }: Props) {
  const [state, dispatch] = useReducer(readingReducer, initialReadingState);
  const streamIndexRef = useRef(0);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDesktopRef = useRef(false);

  // Check viewport once
  useEffect(() => {
    isDesktopRef.current = window.innerWidth >= 768;
  }, []);

  const isDesktop = isDesktopRef.current;

  // ── Phase helpers ─────────────────────────────────────────────────────
  const showSelection = state.phase === "spread";
  const showCards =
    state.phase === "drawing" ||
    state.phase === "revealing" ||
    state.phase === "interpreting" ||
    state.phase === "complete";
  const cardZoneShrunk =
    state.phase === "interpreting" || state.phase === "complete";
  const showText =
    state.phase === "interpreting" || state.phase === "complete";

  // ── Get spread info ──────────────────────────────────────────────────
  const currentSpread = useMemo(
    () => SPREAD_OPTIONS.find((s) => s.size === state.spreadSize) ?? SPREAD_OPTIONS[0],
    [state.spreadSize]
  );

  // ── Card sizing ──────────────────────────────────────────────────────
  const cardSize = useMemo(
    () => getCardSize(state.spreadSize ?? 1, isDesktop, false),
    [state.spreadSize, isDesktop]
  );
  const thumbSize = useMemo(
    () => getCardSize(state.spreadSize ?? 1, isDesktop, true),
    [state.spreadSize, isDesktop]
  );

  // ── Begin reading ─────────────────────────────────────────────────────
  const handleBeginReading = useCallback(() => {
    if (!state.spreadSize) return;
    onSetMood("reading");
    onSetHideNav(true);
    dispatch({ type: "BEGIN_READING" });
  }, [state.spreadSize, onSetMood, onSetHideNav]);

  // ── drawing -> revealing auto-advance ────────────────────────────────
  useEffect(() => {
    if (state.phase === "drawing") {
      const timer = setTimeout(() => {
        dispatch({ type: "START_REVEALING" });
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // ── Reveal cards one-by-one ──────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== "revealing") return;

    const totalCards = state.drawnCards.length;
    let currentIndex = 0;

    function revealNext() {
      if (currentIndex < totalCards) {
        dispatch({ type: "REVEAL_CARD", index: currentIndex });
        currentIndex++;
        revealTimerRef.current = setTimeout(revealNext, 1500);
      } else {
        // All revealed, wait 1s then start interpreting
        revealTimerRef.current = setTimeout(() => {
          dispatch({ type: "START_INTERPRETING" });
        }, 1000);
      }
    }

    revealTimerRef.current = setTimeout(revealNext, 500);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [state.phase, state.drawnCards.length]);

  // ── Stream interpretation text ───────────────────────────────────────
  useEffect(() => {
    if (state.phase !== "interpreting") return;
    if (state.isStreamingDone) return;

    streamIndexRef.current = 0;

    streamTimerRef.current = setInterval(() => {
      streamIndexRef.current++;
      const nextText = MOCK_READING_INTERPRETATION.slice(
        0,
        streamIndexRef.current
      );
      dispatch({ type: "STREAM_CHAR", text: nextText });

      if (streamIndexRef.current >= MOCK_READING_INTERPRETATION.length) {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        dispatch({ type: "STREAM_DONE" });
        setTimeout(() => dispatch({ type: "COMPLETE" }), 600);
      }
    }, 15);

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [state.phase, state.isStreamingDone]);

  // ── Exit handler ─────────────────────────────────────────────────────
  const handleExit = useCallback(() => {
    onSetHideNav(false);
    onSetMood("default");
    dispatch({ type: "RESET" });
  }, [onSetHideNav, onSetMood]);

  const handleNewReading = useCallback(() => {
    onSetHideNav(false);
    onSetMood("default");
    dispatch({ type: "RESET" });
  }, [onSetHideNav, onSetMood]);

  const handleDashboard = useCallback(() => {
    onSetHideNav(false);
    onSetMood("default");
    onNavigate("dashboard");
  }, [onSetHideNav, onSetMood, onNavigate]);

  // ── Status text ──────────────────────────────────────────────────────
  function getStatusText(): string {
    switch (state.phase) {
      case "spread":
        return "Choose Your Spread";
      case "drawing":
        return "Drawing your cards...";
      case "revealing": {
        const revealed = state.revealedIndices.size;
        const total = state.drawnCards.length;
        return `Revealing ${revealed}/${total}...`;
      }
      case "interpreting":
        return "Interpreting the threads...";
      case "complete":
        return "Reading Complete";
      default:
        return "";
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ═══ Status Zone ═══════════════════════════════════════════════ */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between">
        <motion.p
          key={state.phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--font-playfair), serif",
            color: state.phase === "complete" ? T.goldBright : T.text,
          }}
        >
          {getStatusText()}
        </motion.p>

        {/* Exit button — only during flow */}
        {state.phase !== "spread" && (
          <button
            onClick={handleExit}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${T.border}`,
              color: T.textMuted,
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ═══ Selection Zone ════════════════════════════════════════════ */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: showSelection ? 1 : 0,
          opacity: showSelection ? 1 : 0,
        }}
        transition={SPRING}
        style={{ pointerEvents: showSelection ? "auto" : "none" }}
      >
        <div className="h-full flex flex-col items-center justify-center px-4 gap-6">
          {/* Spread options */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {SPREAD_OPTIONS.map((option) => {
              const isSelected = state.spreadSize === option.size;
              return (
                <motion.button
                  key={option.size}
                  onClick={() => dispatch({ type: "SELECT_SPREAD", size: option.size })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                  style={{
                    ...(isSelected
                      ? {
                          background: "rgba(201,169,78,0.10)",
                          border: `1px solid ${T.gold}`,
                          boxShadow: `0 0 16px rgba(201,169,78,0.15)`,
                        }
                      : {
                          ...glassStyle(),
                        }),
                  }}
                >
                  <span
                    style={{
                      color: isSelected ? T.gold : T.textMuted,
                      flexShrink: 0,
                    }}
                  >
                    {option.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <span
                      className="text-sm font-medium block"
                      style={{
                        color: isSelected ? T.gold : T.text,
                        fontFamily: "var(--font-playfair), serif",
                      }}
                    >
                      {option.label}
                    </span>
                    <span className="text-xs" style={{ color: T.textMuted }}>
                      {option.positions.join(" / ")}
                    </span>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${T.gold}, ${T.goldBright})`,
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={T.bg} strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Begin Reading button */}
          <motion.button
            onClick={handleBeginReading}
            disabled={!state.spreadSize}
            whileHover={state.spreadSize ? { scale: 1.04 } : {}}
            whileTap={state.spreadSize ? { scale: 0.97 } : {}}
            className="px-10 py-3 rounded-xl font-semibold text-sm transition-opacity"
            style={{
              background: state.spreadSize
                ? `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`
                : "rgba(255,255,255,0.05)",
              color: state.spreadSize ? T.bg : T.textMuted,
              fontFamily: "var(--font-playfair), serif",
              opacity: state.spreadSize ? 1 : 0.5,
              boxShadow: state.spreadSize
                ? `0 4px 20px rgba(201,169,78,0.3)`
                : "none",
              cursor: state.spreadSize ? "pointer" : "not-allowed",
            }}
          >
            Begin Reading
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ Card Zone ═════════════════════════════════════════════════ */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: cardZoneShrunk ? "0 0 auto" : showCards ? 1 : 0,
          opacity: showCards ? 1 : 0,
        }}
        transition={SPRING}
        style={{ pointerEvents: showCards ? "auto" : "none" }}
      >
        <div
          className={`h-full flex items-center justify-center ${
            cardZoneShrunk ? "py-3" : "py-4"
          }`}
        >
          <div className="flex gap-3 md:gap-4 justify-center items-end flex-wrap">
            {state.drawnCards.map((card, i) => {
              const isRevealed = state.revealedIndices.has(i);
              const currentSize = cardZoneShrunk ? thumbSize : cardSize;
              const posLabel =
                currentSpread.positions[i] ?? `Card ${i + 1}`;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: i * 0.15,
                  }}
                >
                  <ReadingCard
                    card={card}
                    index={i}
                    isRevealed={isRevealed}
                    onReveal={() => {
                      if (state.phase === "revealing") {
                        dispatch({ type: "REVEAL_CARD", index: i });
                      }
                    }}
                    size={currentSize}
                    positionLabel={posLabel}
                    isThumbnail={cardZoneShrunk}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ═══ Text Zone (Interpretation) ════════════════════════════════ */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: showText ? 1 : 0,
          opacity: showText ? 1 : 0,
        }}
        transition={SPRING}
        style={{ pointerEvents: showText ? "auto" : "none" }}
      >
        <div className="h-full flex flex-col overflow-hidden px-4 md:px-8">
          {/* Scrollable interpretation text */}
          <div className="flex-1 min-h-0 overflow-y-auto py-3">
            <div className="max-w-2xl mx-auto">
              <div
                className="rounded-2xl p-4 md:p-5"
                style={glassStyle()}
              >
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: T.text }}
                >
                  {state.interpretationText}
                  {/* Blinking gold cursor during streaming */}
                  {state.phase === "interpreting" && !state.isStreamingDone && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 0.5,
                      }}
                      style={{
                        color: T.gold,
                        fontWeight: 700,
                        marginLeft: 1,
                      }}
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Completion buttons */}
          {state.phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.3 }}
              className="shrink-0 flex gap-3 justify-center py-4"
            >
              <motion.button
                onClick={handleNewReading}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
                  color: T.bg,
                  fontFamily: "var(--font-playfair), serif",
                  boxShadow: `0 4px 16px rgba(201,169,78,0.3)`,
                }}
              >
                New Reading
              </motion.button>
              <motion.button
                onClick={handleDashboard}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  ...glassStyle(),
                  color: T.text,
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                Dashboard
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
