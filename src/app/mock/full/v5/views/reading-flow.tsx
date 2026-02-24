"use client";

import {
  useReducer,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllCards,
  shuffleArray,
  MOCK_READING_INTERPRETATION,
} from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams, AppAction, ReadingPhase } from "../../_shared/types";
import { useCardReveal } from "../../../../../hooks/use-card-reveal";
import { InkFlipCard } from "../ink-card";
import { InkTextReveal, InkStreamReveal } from "../ink-text-reveal";
import { inkGlass } from "../ink-theme";
import { INK } from "../ink-theme";

// ─── Local State ──────────────────────────────────────────────────────────────

interface ReadingState {
  phase: ReadingPhase;
  spreadCount: 1 | 3 | 5;
  showResonance: boolean;
}

type ReadingAction =
  | { type: "SELECT_SPREAD"; count: 1 | 3 | 5 }
  | { type: "START_DRAWING" }
  | { type: "START_REVEALING" }
  | { type: "SHOW_RESONANCE" }
  | { type: "START_INTERPRETING" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case "SELECT_SPREAD":
      return { ...state, spreadCount: action.count };
    case "START_DRAWING":
      return { ...state, phase: "drawing" };
    case "START_REVEALING":
      return { ...state, phase: "revealing" };
    case "SHOW_RESONANCE":
      return { ...state, showResonance: true };
    case "START_INTERPRETING":
      return { ...state, phase: "interpreting", showResonance: false };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { phase: "spread", spreadCount: 3, showResonance: false };
    default:
      return state;
  }
}

// ─── Spring config ────────────────────────────────────────────────────────────

const zoneSpring = { type: "spring" as const, stiffness: 280, damping: 30 };

// ─── Spread options ───────────────────────────────────────────────────────────

const SPREADS: { count: 1 | 3 | 5; name: string; description: string }[] = [
  { count: 1, name: "Single Card", description: "A focused answer" },
  { count: 3, name: "Three Card", description: "Past, Present, Future" },
  { count: 5, name: "Five Card", description: "The full picture" },
];

// ─── Responsive card sizing ───────────────────────────────────────────────────

function useViewport() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { width: w, isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
}

// ─── Connection Lines (Resonance) ─────────────────────────────────────────────

function ResonanceLines({ cardCount }: { cardCount: number }) {
  if (cardCount < 2) return null;

  const lines = Array.from({ length: cardCount - 1 }, (_, i) => i);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="relative flex items-center" style={{ gap: 0 }}>
        {lines.map((i) => (
          <motion.div
            key={i}
            className="h-px"
            style={{
              width: "min(100px, 20vw)",
              background: `linear-gradient(to right, ${INK.cyan}4d, ${INK.violet}4d, ${INK.gold}4d)`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 1],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ReadingFlowProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  dispatch: React.Dispatch<AppAction>;
}

export default function ReadingFlowView({ navigate, dispatch: appDispatch }: ReadingFlowProps) {
  const [state, dispatch] = useReducer(readingReducer, {
    phase: "spread",
    spreadCount: 3,
    showResonance: false,
  });

  const { width: vw, isMobile } = useViewport();

  // Selected cards — memoized on spread count, regenerated on reset
  const [resetKey, setResetKey] = useState(0);
  const selectedCards = useMemo(
    () => shuffleArray(getAllCards()).slice(0, state.spreadCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.spreadCount, resetKey]
  );

  // Streaming text state
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordIndexRef = useRef(0);

  // Card reveal hook
  const { cardStates, startReveal, reset: resetReveal } = useCardReveal({
    cardCount: state.spreadCount,
    revealDuration: 1800,
    delayBetween: 1200,
    onAllRevealed: () => {
      // Begin Ink Resonance sequence
      setTimeout(() => {
        dispatch({ type: "SHOW_RESONANCE" });
      }, 500);
      setTimeout(() => {
        dispatch({ type: "START_INTERPRETING" });
      }, 3000);
    },
  });

  // Phase effects
  useEffect(() => {
    if (state.phase === "drawing") {
      appDispatch({ type: "SET_HIDE_NAV", hidden: true });
    }
  }, [state.phase, appDispatch]);

  // Streaming interpretation text
  useEffect(() => {
    if (state.phase !== "interpreting") return;

    const words = MOCK_READING_INTERPRETATION.split(/(\s+)/);
    wordIndexRef.current = 0;
    setStreamedText("");
    setIsStreaming(true);

    streamRef.current = setInterval(() => {
      const batchSize = 3;
      const nextIndex = Math.min(wordIndexRef.current + batchSize, words.length);
      const chunk = words.slice(0, nextIndex).join("");
      wordIndexRef.current = nextIndex;
      setStreamedText(chunk);

      if (nextIndex >= words.length) {
        if (streamRef.current) clearInterval(streamRef.current);
        setIsStreaming(false);
        setTimeout(() => dispatch({ type: "COMPLETE" }), 800);
      }
    }, 80);

    return () => {
      if (streamRef.current) clearInterval(streamRef.current);
    };
  }, [state.phase]);

  // Handlers
  const handleSpreadSelect = useCallback(
    (count: 1 | 3 | 5) => {
      dispatch({ type: "SELECT_SPREAD", count });
      setTimeout(() => dispatch({ type: "START_DRAWING" }), 500);
    },
    []
  );

  const handleBeginReveal = useCallback(() => {
    dispatch({ type: "START_REVEALING" });
    startReveal();
  }, [startReveal]);

  const handleNewReading = useCallback(() => {
    dispatch({ type: "RESET" });
    resetReveal();
    setStreamedText("");
    setIsStreaming(false);
    wordIndexRef.current = 0;
    setResetKey((k) => k + 1);
    appDispatch({ type: "SET_HIDE_NAV", hidden: false });
  }, [resetReveal, appDispatch]);

  const handleReturnHome = useCallback(() => {
    appDispatch({ type: "SET_HIDE_NAV", hidden: false });
    navigate("dashboard");
  }, [navigate, appDispatch]);

  // Card sizing
  const cardSizeFull = useMemo(() => {
    if (state.spreadCount === 1) return isMobile ? 140 : 180;
    if (state.spreadCount === 3) return isMobile ? 90 : 140;
    return isMobile ? 70 : 120;
  }, [state.spreadCount, isMobile]);

  const cardSizeSmall = isMobile ? 56 : 72;

  // Phase booleans
  const isSpread = state.phase === "spread";
  const isDrawing = state.phase === "drawing";
  const isRevealing = state.phase === "revealing";
  const isInterpreting = state.phase === "interpreting";
  const isComplete = state.phase === "complete";
  const isCardPhase = isDrawing || isRevealing;
  const isTextPhase = isInterpreting || isComplete;
  const showActionBar = isDrawing || isComplete;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden relative">

      {/* ─── ZONE 1: Spread Selection ──────────────────────────────────── */}
      <motion.div
        layout
        animate={{
          flex: isSpread ? "1 1 0%" : "0 0 0px",
          opacity: isSpread ? 1 : 0,
        }}
        transition={zoneSpring}
        className="overflow-hidden min-h-0"
      >
        <div className="h-full flex flex-col items-center justify-center px-4 sm:px-8">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            <InkTextReveal
              text="Choose Your Spread"
              as="h2"
              className="text-2xl sm:text-4xl font-bold tracking-tight"
              delay={0.15}
              charDelay={0.04}
              glowColor={INK.cyanGlowSoft}
              animate={isSpread}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isSpread ? 0.5 : 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-3 text-sm sm:text-base"
              style={{ color: INK.textSecondary }}
            >
              Let the ink arrange itself
            </motion.p>
          </div>

          {/* Spread options */}
          <div className="flex gap-3 sm:gap-5">
            {SPREADS.map((spread, idx) => (
              <motion.button
                key={spread.count}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isSpread ? 1 : 0,
                  y: isSpread ? 0 : 20,
                  scale: state.spreadCount === spread.count && !isSpread ? 1.05 : 1,
                }}
                transition={{
                  ...zoneSpring,
                  delay: 0.3 + idx * 0.1,
                }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSpreadSelect(spread.count)}
                className={`${inkGlass} relative flex flex-col items-center justify-center px-5 sm:px-8 py-6 sm:py-8 cursor-pointer group`}
                style={{
                  minWidth: isMobile ? 100 : 140,
                }}
              >
                {/* Selection glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow:
                      state.spreadCount === spread.count
                        ? `0 0 24px ${INK.cyanGlow}, inset 0 0 12px ${INK.cyanGlowSoft}`
                        : "0 0 0px transparent",
                    borderColor:
                      state.spreadCount === spread.count
                        ? INK.cyan + "33"
                        : "transparent",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ border: "1px solid transparent", borderRadius: "1rem" }}
                />

                {/* Count number */}
                <span
                  className="text-4xl sm:text-5xl font-black mb-2"
                  style={{
                    color: INK.cyan,
                    textShadow: `0 0 20px ${INK.cyanGlow}`,
                  }}
                >
                  {spread.count}
                </span>

                {/* Name */}
                <span
                  className="text-sm sm:text-base font-medium tracking-wide"
                  style={{ color: INK.textPrimary }}
                >
                  {spread.name}
                </span>

                {/* Description */}
                <span
                  className="text-[10px] sm:text-xs mt-1"
                  style={{ color: INK.textMuted }}
                >
                  {spread.description}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── ZONE 2: Card Zone ─────────────────────────────────────────── */}
      <motion.div
        layout
        animate={{
          flex: isCardPhase
            ? "1 1 0%"
            : isTextPhase
            ? "0 0 auto"
            : "0 0 0px",
          opacity: isSpread ? 0 : 1,
        }}
        transition={zoneSpring}
        className="overflow-hidden min-h-0 flex flex-col"
      >
        {/* Status text */}
        <div className="shrink-0 text-center py-2 sm:py-3">
          <AnimatePresence mode="wait">
            {isDrawing && (
              <motion.div
                key="drawing-status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <InkTextReveal
                  text="The ink gathers..."
                  as="p"
                  className="text-sm sm:text-base"
                  delay={0.1}
                  glowColor={INK.violetGlowSoft}
                  animate={isDrawing}
                />
              </motion.div>
            )}
            {isRevealing && (
              <motion.p
                key="revealing-status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-sm sm:text-base"
                style={{
                  color: INK.cyan,
                  textShadow: `0 0 12px ${INK.cyanGlowSoft}`,
                }}
              >
                Revealing card {cardStates.filter((s) => s !== "hidden").length} of{" "}
                {state.spreadCount}...
              </motion.p>
            )}
            {isTextPhase && (
              <motion.p
                key="reading-status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-xs sm:text-sm"
                style={{ color: INK.textMuted }}
              >
                Your cards
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Cards */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          {/* Resonance connection lines */}
          <AnimatePresence>
            {state.showResonance && (
              <ResonanceLines cardCount={state.spreadCount} />
            )}
          </AnimatePresence>

          {/* Card row */}
          <motion.div
            layout
            className="flex items-center justify-center relative z-10"
            animate={{
              gap: isTextPhase ? (isMobile ? 6 : 10) : isMobile ? 10 : 20,
            }}
            transition={zoneSpring}
          >
            {selectedCards.map((card, i) => {
              const isFlipped =
                !isDrawing &&
                (cardStates[i] === "revealing" || cardStates[i] === "revealed");
              const isCurrentlyRevealing = cardStates[i] === "revealing";
              const isRevealed = cardStates[i] === "revealed";

              // Card size: full during card phase, small during text phase
              const cardW = isTextPhase ? cardSizeSmall : cardSizeFull;
              const cardH = Math.round(cardW * 1.5);

              // Determine which InkFlipCard size preset to use
              const sizePreset = isTextPhase ? "sm" : isMobile ? "md" : "lg";

              return (
                <motion.div
                  key={card.id}
                  layout
                  className="relative"
                  animate={{
                    scale: isCurrentlyRevealing ? 1.08 : 1,
                    y: isDrawing
                      ? [0, -3, 0, 2, 0]
                      : 0,
                    rotate: isDrawing
                      ? [0, -1, 0, 1, 0]
                      : 0,
                  }}
                  transition={
                    isDrawing
                      ? {
                          y: {
                            duration: 2 + i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          rotate: {
                            duration: 2.5 + i * 0.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          layout: zoneSpring,
                        }
                      : {
                          ...zoneSpring,
                          layout: zoneSpring,
                        }
                  }
                >
                  {/* Resonance golden glow pulse */}
                  <AnimatePresence>
                    {state.showResonance && isRevealed && (
                      <motion.div
                        className="absolute inset-0 -m-2 rounded-xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 0.5, 0],
                          boxShadow: [
                            `0 0 0px ${INK.goldGlow}`,
                            `0 0 30px ${INK.gold}88`,
                            `0 0 0px ${INK.goldGlow}`,
                          ],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Revealing cyan glow */}
                  {isCurrentlyRevealing && (
                    <motion.div
                      className="absolute inset-0 -m-3 rounded-xl pointer-events-none"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        boxShadow: [
                          `0 0 15px ${INK.cyanGlow}`,
                          `0 0 35px ${INK.cyan}66`,
                          `0 0 15px ${INK.cyanGlow}`,
                        ],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <InkFlipCard
                    card={card}
                    isFlipped={isFlipped}
                    size={sizePreset}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* ─── ZONE 3: Interpretation Text ───────────────────────────────── */}
      <motion.div
        layout
        animate={{
          flex: isTextPhase ? "1 1 0%" : "0 0 0px",
          opacity: isTextPhase ? 1 : 0,
        }}
        transition={{
          ...zoneSpring,
          delay: isTextPhase ? 0.15 : 0,
        }}
        className="overflow-hidden min-h-0"
      >
        <div className="h-full overflow-y-auto px-4 sm:px-6 pb-4">
          <div
            className={`${inkGlass} p-4 sm:p-6 h-full overflow-y-auto`}
            style={{
              background: `linear-gradient(180deg, rgba(0,229,255,0.02) 0%, rgba(2,4,8,0.6) 100%)`,
            }}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: INK.cyan,
                  boxShadow: `0 0 8px ${INK.cyanGlow}`,
                }}
              />
              <span
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: INK.cyan }}
              >
                Interpretation
              </span>
            </div>

            {/* Streaming text */}
            <div
              className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: INK.textPrimary + "cc" }}
            >
              {isInterpreting && (
                <InkStreamReveal
                  text={streamedText}
                  isStreaming={isStreaming}
                  glowColor={INK.cyanGlowSoft}
                />
              )}
              {isComplete && (
                <InkStreamReveal
                  text={MOCK_READING_INTERPRETATION}
                  isStreaming={false}
                  glowColor={INK.cyanGlowSoft}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── ZONE 4: Action Bar ────────────────────────────────────────── */}
      <motion.div
        layout
        animate={{
          height: isDrawing || isComplete ? "auto" : 0,
          opacity: isDrawing || isComplete ? 1 : 0,
        }}
        transition={zoneSpring}
        className="shrink-0 overflow-hidden"
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
          <AnimatePresence mode="wait">
            {isDrawing && (
              <motion.button
                key="begin-reveal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={zoneSpring}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBeginReveal}
                className="w-full py-3.5 sm:py-4 rounded-xl font-medium text-sm sm:text-base tracking-wide cursor-pointer"
                style={{
                  background: "transparent",
                  color: INK.cyan,
                  border: `1px solid ${INK.cyan}44`,
                  boxShadow: `0 0 20px ${INK.cyanGlowSoft}, inset 0 0 12px ${INK.cyanGlowSoft}`,
                }}
              >
                Begin Reveal
              </motion.button>
            )}
            {isComplete && (
              <motion.div
                key="complete-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ ...zoneSpring, delay: 0.2 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNewReading}
                  className="flex-1 py-3.5 sm:py-4 rounded-xl font-medium text-sm sm:text-base tracking-wide cursor-pointer"
                  style={{
                    background: "transparent",
                    color: INK.violet,
                    border: `1px solid ${INK.violet}44`,
                    boxShadow: `0 0 16px ${INK.violetGlowSoft}`,
                  }}
                >
                  New Reading
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReturnHome}
                  className="flex-1 py-3.5 sm:py-4 rounded-xl font-medium text-sm sm:text-base tracking-wide cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${INK.gold}22, ${INK.gold}11)`,
                    color: INK.gold,
                    border: `1px solid ${INK.gold}33`,
                    boxShadow: `0 0 16px ${INK.goldGlowSoft}`,
                  }}
                >
                  Return Home
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
