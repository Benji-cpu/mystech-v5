"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles, RotateCcw, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { ReadingInterpretationSchema } from "@/lib/ai/prompts/reading-interpretation";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────

type QuickDrawCard = {
  id: string;
  title: string;
  meaning: string;
  imageUrl: string | null;
};

type QuickDrawState = {
  phase: "idle" | "drawing" | "revealing" | "interpreting" | "complete" | "error";
  card: QuickDrawCard | null;
  readingId: string | null;
  deckTitle: string | null;
  errorMessage: string | null;
  noDeck: boolean;
};

type QuickDrawAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; card: QuickDrawCard; readingId: string; deckTitle: string }
  | { type: "FETCH_ERROR"; message: string; noDeck?: boolean }
  | { type: "REVEAL" }
  | { type: "INTERPRET" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function reducer(state: QuickDrawState, action: QuickDrawAction): QuickDrawState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, phase: "drawing", errorMessage: null, noDeck: false };
    case "FETCH_SUCCESS":
      return {
        ...state,
        phase: "drawing",
        card: action.card,
        readingId: action.readingId,
        deckTitle: action.deckTitle,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        phase: "error",
        errorMessage: action.message,
        noDeck: action.noDeck ?? false,
      };
    case "REVEAL":
      return { ...state, phase: "revealing" };
    case "INTERPRET":
      return { ...state, phase: "interpreting" };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const initialState: QuickDrawState = {
  phase: "idle",
  card: null,
  readingId: null,
  deckTitle: null,
  errorMessage: null,
  noDeck: false,
};

// ── Helpers ────────────────────────────────────────────────────────

function renderBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white/90">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ── Component ──────────────────────────────────────────────────────

export function QuickDraw() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchedRef = useRef(false);
  const streamStartedRef = useRef(false);

  const { object, submit, isLoading: isStreaming, error: streamError } = useObject({
    api: "/api/ai/reading",
    schema: ReadingInterpretationSchema,
  });

  // ── Fetch card on mount ──────────────────────────────────────────

  const fetchCard = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const res = await fetch("/api/readings/quick", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        const noDeck = json.error?.includes("No completed deck");
        dispatch({ type: "FETCH_ERROR", message: json.error ?? "Something went wrong", noDeck });
        return;
      }

      const { reading, card, deck } = json.data;
      dispatch({
        type: "FETCH_SUCCESS",
        card: {
          id: card.card.id,
          title: card.card.title,
          meaning: card.card.meaning,
          imageUrl: card.card.imageUrl,
        },
        readingId: reading.id,
        deckTitle: deck.title,
      });
    } catch {
      dispatch({ type: "FETCH_ERROR", message: "Network error. Please try again." });
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCard();
    }
  }, [fetchCard]);

  // ── Phase transitions ────────────────────────────────────────────

  // drawing -> revealing (brief delay to let the card-back appear)
  useEffect(() => {
    if (state.phase === "drawing" && state.card) {
      const timer = setTimeout(() => dispatch({ type: "REVEAL" }), 600);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.card]);

  // revealing -> interpreting (after flip animation completes)
  useEffect(() => {
    if (state.phase === "revealing") {
      const timer = setTimeout(() => dispatch({ type: "INTERPRET" }), 900);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Start streaming when interpreting
  useEffect(() => {
    if (state.phase === "interpreting" && state.readingId && !streamStartedRef.current) {
      streamStartedRef.current = true;
      submit({ readingId: state.readingId });
    }
  }, [state.phase, state.readingId, submit]);

  // Streaming complete -> complete phase
  useEffect(() => {
    if (state.phase === "interpreting" && !isStreaming && streamStartedRef.current && object?.cardSections?.length) {
      dispatch({ type: "COMPLETE" });
    }
  }, [state.phase, isStreaming, object]);

  // ── Draw again ───────────────────────────────────────────────────

  const handleDrawAgain = useCallback(() => {
    fetchedRef.current = false;
    streamStartedRef.current = false;
    dispatch({ type: "RESET" });
    // Small delay so state resets before re-fetching
    setTimeout(() => {
      fetchedRef.current = true;
      fetchCard();
    }, 100);
  }, [fetchCard]);

  // ── Derive interpretation text ───────────────────────────────────

  const interpretationText = (() => {
    if (!object?.cardSections) return "";
    const sections = object.cardSections.filter((s) => s?.text).map((s) => s!.text);
    const parts = [...sections];
    if (object.synthesis) parts.push(object.synthesis);
    if (object.reflectiveQuestion) parts.push(object.reflectiveQuestion);
    return parts.join("\n\n");
  })();

  // ── Card dimensions (responsive) ────────────────────────────────

  const cardWidth = typeof window !== "undefined" ? Math.min(220, window.innerWidth * 0.55) : 200;
  const cardHeight = cardWidth * 1.5;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      {/* Error state */}
      {state.phase === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <AlertCircle className="w-10 h-10 text-white/40 mx-auto mb-4" />
            <p className="text-sm text-white/70 mb-4">{state.errorMessage}</p>
            {state.noDeck ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/decks/new">Create a Deck</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleDrawAgain}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Loading/drawing state (before card arrives) */}
      {state.phase === "drawing" && !state.card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-[#c9a94e] animate-spin" />
          <p className="text-sm text-white/50">Drawing from your deck...</p>
        </motion.div>
      )}

      {/* Card area — persistent from drawing through complete */}
      {state.card && state.phase !== "error" && (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Deck title */}
          <AnimatePresence>
            {(state.phase === "complete" || state.phase === "interpreting") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-white/40 mb-3 uppercase tracking-wider"
              >
                {state.deckTitle}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Card flip */}
          <div
            className="relative mx-auto"
            style={{
              perspective: 1000,
              width: cardWidth,
              height: cardHeight,
            }}
          >
            <motion.div
              animate={{
                rotateY: state.phase === "drawing" ? 0 : 180,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              style={{
                transformStyle: "preserve-3d",
                width: cardWidth,
                height: cardHeight,
                position: "relative",
              }}
            >
              {/* Front face (card image — visible when flipped) */}
              <div
                className="absolute inset-0 rounded-xl overflow-hidden border border-white/10"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {state.card.imageUrl ? (
                  <img
                    src={state.card.imageUrl}
                    alt={state.card.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#1a0530] via-[#12022a] to-[#0a0118] flex flex-col items-center justify-center gap-3 p-3">
                    <svg viewBox="0 0 48 48" className="w-1/3 max-w-[48px] opacity-60" fill="none" stroke="#c9a94e" strokeWidth="1">
                      <circle cx="24" cy="24" r="18" />
                      <polygon points="24,8 38,32 10,32" />
                      <circle cx="24" cy="24" r="6" />
                    </svg>
                    <span className="text-white/70 text-xs font-medium text-center px-2 leading-snug">
                      {state.card.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Back face (mystical pattern) */}
              <div
                className="absolute inset-0 rounded-xl overflow-hidden border border-white/20 bg-gradient-to-b from-[#1a0530] to-[#0a0118]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4">
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[#c9a94e]/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-3 rounded-full border border-[#c9a94e]/15"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-1/3 h-1/3 rotate-45 border border-[#c9a94e]/25"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gold glow burst during reveal */}
            {state.phase === "revealing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.5] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 -m-4 rounded-2xl bg-[#ffd700]/30 blur-xl pointer-events-none"
              />
            )}
          </div>

          {/* Card title */}
          <AnimatePresence>
            {state.phase !== "drawing" && (
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-lg font-semibold text-white/90 text-center"
              >
                {state.card.title}
              </motion.h2>
            )}
          </AnimatePresence>

          {/* Interpretation area */}
          <AnimatePresence>
            {(state.phase === "interpreting" || state.phase === "complete") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 w-full px-2"
              >
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    {isStreaming ? (
                      <LyraSigil size="sm" state="speaking" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#c9a94e]" />
                    )}
                    <span className="text-xs font-medium tracking-wider uppercase text-[#c9a94e]">
                      {isStreaming ? "Lyra speaks..." : "Insight"}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                    {interpretationText ? (
                      renderBoldMarkdown(interpretationText)
                    ) : (
                      <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                    )}
                    {isStreaming && interpretationText && (
                      <span className="inline-block w-1.5 h-4 bg-[#c9a94e]/70 animate-pulse ml-0.5 align-text-bottom" />
                    )}
                  </div>
                  {streamError && (
                    <p className="text-xs text-destructive mt-2">
                      Could not generate interpretation. Try a full reading instead.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <AnimatePresence>
            {state.phase === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-col sm:flex-row gap-3 w-full px-2"
              >
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5"
                  onClick={handleDrawAgain}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Draw Again
                </Button>
                <Button
                  asChild
                  className="flex-1 bg-[#c9a94e] hover:bg-[#b8993f] text-black"
                >
                  <Link href="/readings/new">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Full Reading
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
