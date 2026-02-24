"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, Home, Eye } from "lucide-react";
import type { ViewId, ViewParams, MoodId, ReadingPhase } from "../../_shared/types";
import { getAllCards, shuffleArray, MOCK_READING_INTERPRETATION } from "../../_shared/mock-data-v1";
import type { MockFullCard } from "../../_shared/types";
import { DREAM, SPRING, SPRING_GENTLE } from "../dream-theme";
import { DreamCardBack, DreamMorphCard, DreamThumbnail } from "../dream-card";

// ─── Spread configs ──────────────────────────────────────────────────────────

const SPREADS = [
  { id: "single", name: "Single Card", count: 1, description: "A single message from the dream realm", positions: ["Focus"] },
  { id: "three", name: "Past / Present / Future", count: 3, description: "See the threads of time woven together", positions: ["Past", "Present", "Future"] },
  { id: "cross", name: "The Cross", count: 5, description: "A deeper reading across five dimensions", positions: ["Present", "Challenge", "Foundation", "Near Future", "Outcome"] },
] as const;

type SpreadId = typeof SPREADS[number]["id"];

// ─── Reading State ───────────────────────────────────────────────────────────

interface ReadingState {
  phase: ReadingPhase;
  spreadId: SpreadId | null;
  drawnCards: MockFullCard[];
  revealedCount: number;
  streamedText: string;
  isStreaming: boolean;
  activeThumbIndex: number;
}

type ReadingAction =
  | { type: "SELECT_SPREAD"; spreadId: SpreadId }
  | { type: "BEGIN_DRAWING" }
  | { type: "CARDS_DEALT" }
  | { type: "REVEAL_NEXT" }
  | { type: "ALL_REVEALED" }
  | { type: "STREAM_CHAR"; char: string }
  | { type: "STREAM_DONE" }
  | { type: "SET_ACTIVE_THUMB"; index: number }
  | { type: "RESET" };

const readingInitial: ReadingState = {
  phase: "spread",
  spreadId: null,
  drawnCards: [],
  revealedCount: 0,
  streamedText: "",
  isStreaming: false,
  activeThumbIndex: 0,
};

function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case "SELECT_SPREAD":
      return { ...state, spreadId: action.spreadId };
    case "BEGIN_DRAWING": {
      const spread = SPREADS.find((s) => s.id === state.spreadId);
      if (!spread) return state;
      const pool = shuffleArray(getAllCards());
      const drawn = pool.slice(0, spread.count);
      return { ...state, phase: "drawing", drawnCards: drawn };
    }
    case "CARDS_DEALT":
      return { ...state, phase: "revealing" };
    case "REVEAL_NEXT":
      return { ...state, revealedCount: state.revealedCount + 1 };
    case "ALL_REVEALED":
      return { ...state, phase: "interpreting", isStreaming: true };
    case "STREAM_CHAR":
      return { ...state, streamedText: state.streamedText + action.char };
    case "STREAM_DONE":
      return { ...state, phase: "complete", isStreaming: false };
    case "SET_ACTIVE_THUMB":
      return { ...state, activeThumbIndex: action.index };
    case "RESET":
      return readingInitial;
    default:
      return state;
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReadingView({ navigate, setMood, setHideNav, currentView }: NavProps) {
  const [state, dispatch] = useReducer(readingReducer, readingInitial);
  const isActive = currentView === "reading";
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charIndexRef = useRef(0);

  const spread = useMemo(() => SPREADS.find((s) => s.id === state.spreadId), [state.spreadId]);
  const isCardPhase = state.phase === "drawing" || state.phase === "revealing";
  const showText = state.phase === "interpreting" || state.phase === "complete";
  const showSelection = state.phase === "spread";

  // Communicate mood/nav to shell
  useEffect(() => {
    if (!isActive) return;
    if (state.phase === "spread") {
      setMood("default");
      setHideNav(false);
    } else {
      setMood("reading");
      setHideNav(true);
    }
  }, [isActive, state.phase, setMood, setHideNav]);

  // Auto-advance from drawing -> revealing
  useEffect(() => {
    if (state.phase !== "drawing" || !isActive) return;
    const timer = setTimeout(() => dispatch({ type: "CARDS_DEALT" }), 1600);
    return () => clearTimeout(timer);
  }, [state.phase, isActive]);

  // Sequential card reveal — auto-advance when all revealed
  useEffect(() => {
    if (state.phase !== "revealing" || !isActive) return;
    if (state.revealedCount >= state.drawnCards.length) {
      const timer = setTimeout(() => dispatch({ type: "ALL_REVEALED" }), 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.revealedCount, state.drawnCards.length, isActive]);

  // Handle card tap to reveal next
  const handleRevealCard = useCallback(() => {
    if (state.phase === "revealing" && state.revealedCount < state.drawnCards.length) {
      dispatch({ type: "REVEAL_NEXT" });
    }
  }, [state.phase, state.revealedCount, state.drawnCards.length]);

  // Text streaming
  useEffect(() => {
    if (state.phase !== "interpreting" || !state.isStreaming || !isActive) return;
    charIndexRef.current = 0;

    streamRef.current = setInterval(() => {
      if (charIndexRef.current < MOCK_READING_INTERPRETATION.length) {
        dispatch({ type: "STREAM_CHAR", char: MOCK_READING_INTERPRETATION[charIndexRef.current] });
        charIndexRef.current++;
      } else {
        if (streamRef.current) clearInterval(streamRef.current);
        dispatch({ type: "STREAM_DONE" });
      }
    }, 15);

    return () => {
      if (streamRef.current) clearInterval(streamRef.current);
    };
  }, [state.phase, state.isStreaming, isActive]);

  // Reset when navigating away
  useEffect(() => {
    if (!isActive && state.phase !== "spread") {
      dispatch({ type: "RESET" });
      if (streamRef.current) clearInterval(streamRef.current);
    }
  }, [isActive, state.phase]);

  // Format streamed text — bold segments marked with **
  const formattedText = state.streamedText.split(/(\*\*.*?\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[#d4a843] font-serif">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">

      {/* ─── Status Zone (always mounted, collapses during selection) ─── */}
      <motion.div
        className="shrink-0 text-center pt-6 pb-2 px-4 overflow-hidden"
        layout
        animate={{
          opacity: showSelection ? 0 : 1,
          height: showSelection ? 0 : "auto",
        }}
        transition={SPRING}
      >
        <motion.p
          key={state.phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm text-[#c4ceff] ${DREAM.heading}`}
        >
          {state.phase === "drawing" && "Drawing your cards..."}
          {state.phase === "revealing" && `Tap to reveal (${state.revealedCount}/${state.drawnCards.length})`}
          {state.phase === "interpreting" && "Reading the dream threads..."}
          {state.phase === "complete" && "Your reading is complete"}
        </motion.p>
        {spread && (
          <p className="text-[10px] text-[#8b87a0] mt-0.5">{spread.name}</p>
        )}
      </motion.div>

      {/* ─── Selection Zone (always mounted, grows when active) ─── */}
      <motion.div
        className="min-h-0 overflow-y-auto px-4"
        layout
        animate={{
          flex: showSelection ? 1 : 0,
          opacity: showSelection ? 1 : 0,
        }}
        transition={SPRING}
        style={{ pointerEvents: showSelection ? "auto" : "none" }}
      >
        <div className="max-w-lg mx-auto pt-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: showSelection ? 1 : 0, y: showSelection ? 0 : 12 }}
            transition={SPRING}
            className={`text-2xl text-[#e8e6f0] mb-2 ${DREAM.heading}`}
          >
            Begin a Reading
          </motion.h1>
          <p className="text-sm text-[#8b87a0] mb-6">Choose your spread to consult the cards</p>

          <div className="space-y-3">
            {SPREADS.map((s) => (
              <motion.button
                key={s.id}
                onClick={() => dispatch({ type: "SELECT_SPREAD", spreadId: s.id })}
                className={`w-full ${DREAM.glass} ${DREAM.glassHover} rounded-xl p-4 text-left transition-all ${
                  state.spreadId === s.id
                    ? "border-[#d4a843]/60 shadow-[0_0_15px_rgba(212,168,67,0.2)]"
                    : ""
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm text-[#e8e6f0] ${DREAM.heading}`}>{s.name}</p>
                    <p className="text-xs text-[#8b87a0] mt-0.5">{s.description}</p>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    {Array.from({ length: s.count }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-6 rounded-sm border ${
                          state.spreadId === s.id
                            ? "bg-[#d4a843]/30 border-[#d4a843]/50"
                            : "bg-[#2a2b5a]/40 border-[#2a2b5a]/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Begin button */}
          <motion.button
            onClick={() => dispatch({ type: "BEGIN_DRAWING" })}
            disabled={!state.spreadId}
            className={`w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
              state.spreadId
                ? `${DREAM.goldGradient} text-[#0a0b1e] ${DREAM.goldGlow}`
                : "bg-[#2a2b5a]/40 text-[#8b87a0]/40 cursor-not-allowed"
            }`}
            whileHover={state.spreadId ? { scale: 1.02 } : undefined}
            whileTap={state.spreadId ? { scale: 0.98 } : undefined}
          >
            <Sparkles size={16} />
            <span className={DREAM.heading}>Begin Reading</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ─── Card Zone (always mounted, resizes between full spread and thumbnail strip) ─── */}
      <motion.div
        className="min-h-0 flex items-center justify-center px-4"
        layout
        animate={{
          flex: isCardPhase ? 1 : showText ? "0 0 auto" : 0,
          opacity: showSelection ? 0 : 1,
          paddingTop: showText ? 8 : 0,
          paddingBottom: showText ? 4 : 0,
        }}
        transition={SPRING}
      >
        {showText ? (
          /* Compact thumbnail strip during interpretation */
          <div className="flex gap-2 justify-center">
            {state.drawnCards.map((card, i) => (
              <DreamThumbnail
                key={card.id}
                imageUrl={card.imageUrl}
                title={card.title}
                isActive={state.activeThumbIndex === i}
                onClick={() => dispatch({ type: "SET_ACTIVE_THUMB", index: i })}
              />
            ))}
          </div>
        ) : (
          /* Full card spread during drawing/revealing */
          <div
            className={`flex items-center justify-center ${
              state.drawnCards.length <= 3 ? "gap-3" : "gap-1.5 flex-wrap max-w-[320px]"
            }`}
          >
            {state.drawnCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  ...SPRING_GENTLE,
                  delay: 0.2 + i * 0.2,
                }}
                className={
                  state.drawnCards.length === 1
                    ? "w-[180px] h-[270px]"
                    : state.drawnCards.length === 3
                    ? "w-[100px] h-[150px]"
                    : "w-[80px] h-[120px]"
                }
              >
                <DreamMorphCard
                  imageUrl={card.imageUrl}
                  title={card.title}
                  revealed={i < state.revealedCount}
                  onReveal={handleRevealCard}
                  className="w-full h-full"
                  delay={0}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Text Zone (always mounted, grows from 0 during interpretation) ─── */}
      <motion.div
        className="min-h-0 overflow-y-auto px-4 pb-6"
        layout
        animate={{
          flex: showText ? 1 : 0,
          opacity: showText ? 1 : 0,
        }}
        transition={SPRING}
        style={{ pointerEvents: showText ? "auto" : "none" }}
      >
        <div className="max-w-lg mx-auto pt-2">
          {/* Interpretation panel */}
          <div className={`${DREAM.glass} rounded-xl p-4 mb-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Eye size={14} className="text-[#d4a843]" />
              <span className={`text-xs text-[#d4a843] ${DREAM.label}`}>Interpretation</span>
            </div>
            <p className="text-sm text-[#e8e6f0]/90 leading-relaxed whitespace-pre-line">
              {formattedText}
              {state.isStreaming && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-[#d4a843] ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </p>
          </div>

          {/* Complete actions — fade in when streaming finishes */}
          <motion.div
            animate={{
              opacity: state.phase === "complete" ? 1 : 0,
              y: state.phase === "complete" ? 0 : 16,
            }}
            transition={SPRING}
            className="flex gap-3"
            style={{ pointerEvents: state.phase === "complete" ? "auto" : "none" }}
          >
            <motion.button
              onClick={() => dispatch({ type: "RESET" })}
              className={`flex-1 ${DREAM.glass} ${DREAM.glassHover} rounded-xl py-3 flex items-center justify-center gap-2 transition-colors`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={14} className="text-[#c4ceff]" />
              <span className="text-sm text-[#c4ceff]">New Reading</span>
            </motion.button>
            <motion.button
              onClick={() => navigate("dashboard")}
              className={`flex-1 ${DREAM.goldGradient} ${DREAM.goldGlow} rounded-xl py-3 flex items-center justify-center gap-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={14} className="text-[#0a0b1e]" />
              <span className={`text-sm font-semibold text-[#0a0b1e] ${DREAM.heading}`}>Return Home</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}
