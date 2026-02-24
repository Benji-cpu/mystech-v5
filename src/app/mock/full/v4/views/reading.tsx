"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import {
  getAllCards,
  shuffleArray,
  MOCK_READING_INTERPRETATION,
} from "../../_shared/mock-data-v1";
import type { MockFullCard } from "../../_shared/types";
import { GildedFlipCard } from "../gilded-card";
import { GildedQuill } from "../gilded-quill";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

type ReadingPhase =
  | "spread_select"
  | "dealing"
  | "revealing"
  | "interpreting"
  | "complete";

type SpreadType = 1 | 3 | 5;

interface SpreadOption {
  count: SpreadType;
  name: string;
  description: string;
  labels: string[];
}

const SPREAD_OPTIONS: SpreadOption[] = [
  {
    count: 1,
    name: "Single Card",
    description: "A focused answer to a single question",
    labels: ["Your Card"],
  },
  {
    count: 3,
    name: "Three Card Spread",
    description: "Past, Present, and Future",
    labels: ["Past", "Present", "Future"],
  },
  {
    count: 5,
    name: "Five Card Spread",
    description: "A deeper exploration of your path",
    labels: ["Past", "Challenge", "Present", "Guidance", "Outcome"],
  },
];

// ─── State Machine ──────────────────────────────────────────────────────────

interface ReadingState {
  phase: ReadingPhase;
  spread: SpreadType;
  cards: MockFullCard[];
  revealedIndices: number[];
}

type ReadingAction =
  | { type: "SELECT_SPREAD"; spread: SpreadType; cards: MockFullCard[] }
  | { type: "DEAL_COMPLETE" }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "ALL_REVEALED" }
  | { type: "INTERPRETATION_DONE" }
  | { type: "RESET" };

const initialState: ReadingState = {
  phase: "spread_select",
  spread: 3,
  cards: [],
  revealedIndices: [],
};

function readingReducer(
  state: ReadingState,
  action: ReadingAction,
): ReadingState {
  switch (action.type) {
    case "SELECT_SPREAD":
      return {
        ...state,
        phase: "dealing",
        spread: action.spread,
        cards: action.cards,
        revealedIndices: [],
      };
    case "DEAL_COMPLETE":
      return { ...state, phase: "revealing" };
    case "REVEAL_CARD": {
      if (state.revealedIndices.includes(action.index)) return state;
      const newRevealed = [...state.revealedIndices, action.index];
      // Check if all cards are now revealed
      if (newRevealed.length >= state.spread) {
        return { ...state, revealedIndices: newRevealed, phase: "revealing" };
      }
      return { ...state, revealedIndices: newRevealed };
    }
    case "ALL_REVEALED":
      return { ...state, phase: "interpreting" };
    case "INTERPRETATION_DONE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Spring config ──────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// ─── Card size from viewport ────────────────────────────────────────────────

function useCardSize(
  spread: SpreadType,
  isCompact: boolean,
): { size: "sm" | "md" | "lg"; isMobile: boolean } {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 640;

  if (isCompact) {
    return { size: "sm", isMobile };
  }

  if (spread === 1) {
    return { size: isMobile ? "md" : "lg", isMobile };
  }

  if (spread <= 3) {
    return { size: isMobile ? "sm" : "md", isMobile };
  }

  // 5 cards
  return { size: isMobile ? "sm" : "md", isMobile };
}

// ─── Spread label SVG icon ──────────────────────────────────────────────────

function SpreadIcon({ count }: { count: SpreadType }) {
  const w = 48;
  const h = 32;
  const cardW = 7;
  const cardH = 11;

  const positions: { x: number; y: number }[] = [];
  if (count === 1) {
    positions.push({ x: w / 2, y: h / 2 });
  } else if (count === 3) {
    positions.push({ x: 12, y: h / 2 }, { x: w / 2, y: h / 2 }, { x: 36, y: h / 2 });
  } else {
    positions.push(
      { x: 6, y: h / 2 },
      { x: 15, y: h / 2 },
      { x: w / 2, y: h / 2 },
      { x: 33, y: h / 2 },
      { x: 42, y: h / 2 },
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {positions.map((p, i) => (
        <rect
          key={i}
          x={p.x - cardW / 2}
          y={p.y - cardH / 2}
          width={cardW}
          height={cardH}
          rx={1.5}
          fill="rgba(201, 169, 78, 0.15)"
          stroke="rgba(201, 169, 78, 0.5)"
          strokeWidth={0.8}
        />
      ))}
    </svg>
  );
}

// ─── Reading View Component ─────────────────────────────────────────────────

export function ReadingView({
  navigate,
  goBack,
  currentView,
  viewParams,
}: ViewProps) {
  const [state, dispatch] = useReducer(readingReducer, initialState);
  const { phase, spread, cards, revealedIndices } = state;

  // Card sizing
  const isCompact = phase === "interpreting" || phase === "complete";
  const { size: cardSize, isMobile } = useCardSize(spread, isCompact);

  // Timer refs for cleanup
  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allRevealedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (allRevealedTimerRef.current) clearTimeout(allRevealedTimerRef.current);
      if (autoRevealTimerRef.current) clearTimeout(autoRevealTimerRef.current);
    };
  }, []);

  // ── Handle spread selection ─────────────────────────────────────────────

  const handleSpreadSelect = useCallback(
    (option: SpreadOption) => {
      const pool = shuffleArray(getAllCards());
      const drawn = pool.slice(0, option.count);
      dispatch({ type: "SELECT_SPREAD", spread: option.count, cards: drawn });
    },
    [],
  );

  // ── Auto-transition: dealing -> revealing ───────────────────────────────

  useEffect(() => {
    if (phase !== "dealing") return;

    // Wait for all cards to finish dealing animation
    const dealDuration = spread * 150 + 500;
    dealTimerRef.current = setTimeout(() => {
      dispatch({ type: "DEAL_COMPLETE" });
    }, dealDuration);

    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, [phase, spread]);

  // ── Auto-reveal timer (3s per card) ─────────────────────────────────────

  useEffect(() => {
    if (phase !== "revealing") return;

    // Find the next unrevealed index
    const nextIndex = Array.from({ length: spread }, (_, i) => i).find(
      (i) => !revealedIndices.includes(i),
    );

    if (nextIndex === undefined) {
      // All cards revealed, wait 500ms then transition
      allRevealedTimerRef.current = setTimeout(() => {
        dispatch({ type: "ALL_REVEALED" });
      }, 500);
      return () => {
        if (allRevealedTimerRef.current) clearTimeout(allRevealedTimerRef.current);
      };
    }

    // Auto-reveal after 3 seconds if user hasn't tapped
    autoRevealTimerRef.current = setTimeout(() => {
      dispatch({ type: "REVEAL_CARD", index: nextIndex });
    }, 3000);

    return () => {
      if (autoRevealTimerRef.current) clearTimeout(autoRevealTimerRef.current);
    };
  }, [phase, revealedIndices, spread]);

  // ── Handle card tap reveal ──────────────────────────────────────────────

  const handleRevealCard = useCallback(
    (index: number) => {
      if (phase !== "revealing") return;
      if (revealedIndices.includes(index)) return;
      dispatch({ type: "REVEAL_CARD", index });
    },
    [phase, revealedIndices],
  );

  // ── Interpretation complete ─────────────────────────────────────────────

  const handleInterpretationComplete = useCallback(() => {
    dispatch({ type: "INTERPRETATION_DONE" });
  }, []);

  // ── Reset ───────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // ── Derive spread labels ────────────────────────────────────────────────

  const spreadLabels =
    SPREAD_OPTIONS.find((o) => o.count === spread)?.labels ?? [];

  // ── Phase booleans ──────────────────────────────────────────────────────

  const isSpreadSelect = phase === "spread_select";
  const isDealing = phase === "dealing";
  const isRevealing = phase === "revealing";
  const isInterpreting = phase === "interpreting";
  const isComplete = phase === "complete";
  const hasCards = phase !== "spread_select";
  const isTextPhase = isInterpreting || isComplete;

  return (
    <div className="h-full flex flex-col overflow-hidden sm:pl-[72px]">
      {/* ─── ZONE 1: Spread Selection ────────────────────────────────────── */}
      <motion.div
        layout
        animate={{
          flex: isSpreadSelect ? "1 1 0%" : "0 0 0px",
          opacity: isSpreadSelect ? 1 : 0,
        }}
        transition={SPRING}
        className="overflow-hidden"
      >
        <div className="h-full flex flex-col items-center justify-center px-4 sm:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isSpreadSelect ? 1 : 0, y: isSpreadSelect ? 0 : 20 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="text-center mb-6 sm:mb-10"
          >
            <h1
              className="text-3xl sm:text-5xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-manuscript), serif",
                color: "#c9a94e",
              }}
            >
              Consult the Oracle
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{ color: "#b8a88a" }}
            >
              Choose a spread to begin your reading
            </p>
          </motion.div>

          {/* Spread options */}
          <div className="w-full max-w-lg space-y-3 sm:space-y-4">
            {SPREAD_OPTIONS.map((option, idx) => (
              <motion.button
                key={option.count}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: isSpreadSelect ? 1 : 0,
                  y: isSpreadSelect ? 0 : 16,
                }}
                transition={{ ...SPRING, delay: 0.2 + idx * 0.08 }}
                whileHover={isSpreadSelect ? { scale: 1.02 } : undefined}
                whileTap={isSpreadSelect ? { scale: 0.98 } : undefined}
                onClick={() => handleSpreadSelect(option)}
                disabled={!isSpreadSelect}
                className="w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl text-left transition-colors"
                style={{
                  background: "rgba(26, 21, 16, 0.7)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(61, 48, 32, 0.5)",
                }}
              >
                {/* Icon */}
                <div className="shrink-0">
                  <SpreadIcon count={option.count} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3
                      className="text-base sm:text-lg font-semibold"
                      style={{
                        fontFamily: "var(--font-manuscript), serif",
                        color: "#f0e6d2",
                      }}
                    >
                      {option.name}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "rgba(201, 169, 78, 0.15)",
                        color: "#c9a94e",
                        border: "1px solid rgba(201, 169, 78, 0.3)",
                      }}
                    >
                      {option.count} {option.count === 1 ? "card" : "cards"}
                    </span>
                  </div>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "#b8a88a" }}
                  >
                    {option.description}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className="shrink-0"
                  style={{ color: "rgba(201, 169, 78, 0.4)" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── ZONE 2: Card Zone ───────────────────────────────────────────── */}
      <motion.div
        layout
        animate={{
          flex: isSpreadSelect
            ? "0 0 0px"
            : isTextPhase
              ? "0 0 auto"
              : "1 1 0%",
          opacity: hasCards ? 1 : 0,
        }}
        transition={SPRING}
        className="overflow-hidden"
      >
        {/* Status text during dealing/revealing */}
        <AnimatePresence mode="wait">
          {(isDealing || isRevealing) && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={SPRING}
              className="text-center py-2 sm:py-3"
            >
              <p
                className="text-sm sm:text-base"
                style={{
                  fontFamily: "var(--font-manuscript), serif",
                  color: "#c9a94e",
                }}
              >
                {isDealing
                  ? "The cards are being drawn..."
                  : `Tap to reveal your cards (${revealedIndices.length}/${spread})`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card display */}
        <div
          className={`flex items-center justify-center ${
            isTextPhase ? "py-3 sm:py-4" : "flex-1 min-h-0 h-full"
          }`}
        >
          <div
            className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap"
          >
            {cards.map((card, index) => {
              const isRevealed = revealedIndices.includes(index);
              const label = spreadLabels[index] ?? "";

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={
                    phase === "dealing" || (!isSpreadSelect && !isTextPhase)
                      ? {
                          y: 100,
                          opacity: 0,
                          scale: 0.8,
                          rotateZ: (Math.random() - 0.5) * 20,
                        }
                      : undefined
                  }
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateZ: 0,
                  }}
                  transition={{
                    ...SPRING,
                    delay: isDealing ? index * 0.15 : 0,
                  }}
                  className="flex flex-col items-center"
                >
                  <GildedFlipCard
                    imageUrl={card.imageUrl}
                    title={card.title}
                    isFlipped={isRevealed}
                    size={isTextPhase ? "sm" : cardSize}
                    glowDelay={index * 0.3}
                    onFlip={
                      isRevealing && !isRevealed
                        ? () => handleRevealCard(index)
                        : undefined
                    }
                  />

                  {/* Position label */}
                  <motion.p
                    animate={{
                      opacity: isRevealed ? 1 : 0,
                      y: isRevealed ? 0 : 8,
                    }}
                    transition={{ ...SPRING, delay: 0.2 }}
                    className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium tracking-wider uppercase"
                    style={{
                      fontFamily: "var(--font-manuscript), serif",
                      color: "#c9a94e",
                    }}
                  >
                    {label}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── ZONE 3: Text / Interpretation Zone ──────────────────────────── */}
      <motion.div
        layout
        animate={{
          flex: isTextPhase ? "1 1 0%" : "0 0 0px",
          opacity: isTextPhase ? 1 : 0,
        }}
        transition={{
          ...SPRING,
          delay: isTextPhase ? 0.2 : 0,
        }}
        className="overflow-hidden min-h-0"
      >
        <div
          className="h-full overflow-y-auto rounded-xl p-4 sm:p-6 mx-3 sm:mx-6 mb-3 sm:mb-6"
          style={{
            background: "rgba(26, 21, 16, 0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(61, 48, 32, 0.5)",
          }}
        >
          {/* Header ornament */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-6 h-[1px]"
              style={{ background: "rgba(201, 169, 78, 0.3)" }}
            />
            <span
              className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-manuscript), serif",
                color: "#c9a94e",
              }}
            >
              Your Reading
            </span>
            <div
              className="flex-1 h-[1px]"
              style={{ background: "rgba(201, 169, 78, 0.3)" }}
            />
          </div>

          {/* Quill text */}
          <GildedQuill
            text={MOCK_READING_INTERPRETATION}
            isPlaying={isInterpreting}
            onComplete={handleInterpretationComplete}
          />

          {/* "Begin Another Reading" button */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ ...SPRING, delay: 0.3 }}
                className="text-center mt-6 sm:mt-8 pb-2"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleReset}
                  className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-shadow"
                  style={{
                    fontFamily: "var(--font-manuscript), serif",
                    background:
                      "linear-gradient(135deg, #8b7340, #c9a94e, #8b7340)",
                    color: "#0f0b08",
                    boxShadow:
                      "0 0 16px 2px rgba(201, 169, 78, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  Begin Another Reading
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
