"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LyraSigil, type SigilStateProp } from "./lyra-sigil";
import {
  INITIATION_INTRO,
  INITIATION_QUESTION_PROMPT,
  INITIATION_GENERATING_MESSAGES,
  INITIATION_STAGE_MESSAGES,
  GUIDED_READING_ENTER_CTA,
} from "./lyra-constants";
import { useInitiationGeneration, type GenerationStage } from "@/hooks/use-initiation-generation";
import { useImageGenerationProgress } from "@/hooks/use-image-generation-progress";

// ── Types ────────────────────────────────────────────────────────────────

// The one question comes first. A voice-consent prompt and three typed-out
// welcome screens used to stand in front of it: four taps and ~17 seconds of
// narration before a newcomer could say anything.
type Phase = "question" | "generating" | "reveal";

interface InitiationState {
  phase: Phase;
  deckId: string | null;
  deckTitle: string | null;
}

type InitiationAction =
  | { type: "START_GENERATING" }
  | { type: "REVEAL"; deckId: string; deckTitle: string }
  | { type: "RETRY_GENERATION" };

function initiationReducer(state: InitiationState, action: InitiationAction): InitiationState {
  switch (action.type) {
    case "START_GENERATING":
      if (state.phase === "generating") return state; // guard against double-submit
      return { ...state, phase: "generating" };
    case "REVEAL":
      return { ...state, phase: "reveal", deckId: action.deckId, deckTitle: action.deckTitle };
    case "RETRY_GENERATION":
      return { ...state, phase: "question" };
    default:
      return state;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────

function QuestionPhase({
  onSubmit,
  initialValue = "",
}: {
  onSubmit: (input: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="space-y-3 text-center"
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {INITIATION_INTRO}
        </p>
        <p className="text-base italic font-serif leading-relaxed" style={{ color: "var(--ink)" }}>
          {INITIATION_QUESTION_PROMPT}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Take your time..."
          rows={5}
          className={cn(
            "w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed",
            "bg-white/5 border border-white/10 text-white/90 placeholder:text-white/25",
            "focus:outline-none focus:border-gold/40 focus:ring-0",
            "transition-colors duration-200"
          )}
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: value.trim().length >= 10 ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
        onClick={() => value.trim().length >= 10 && onSubmit(value.trim())}
        className={cn(
          "w-full py-3 rounded-xl font-medium text-sm transition-all",
          "bg-[var(--ink)] text-[var(--paper)]",
          "shadow-lg shadow-gold/20",
          value.trim().length >= 10 ? "cursor-pointer hover:shadow-xl hover:shadow-gold/30" : "cursor-not-allowed opacity-40"
        )}
      >
        Shape my deck
      </motion.button>
    </div>
  );
}

function GeneratingPhase({
  error,
  onRetry,
  stage,
}: {
  error: string | null;
  onRetry?: () => void;
  stage: GenerationStage | null;
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Get stage-specific messages or fall back to generic ones
  const messages = (stage && INITIATION_STAGE_MESSAGES[stage]) || INITIATION_GENERATING_MESSAGES;

  // Reset message index when stage changes
  useEffect(() => {
    setMessageIndex(0);
  }, [stage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
            className="h-1.5 w-1.5 rounded-full bg-gold"
          />
        ))}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-destructive">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 rounded-xl bg-gold/20 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/30 transition-colors cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.p
            key={`${stage}-${messageIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-white/60 italic font-serif"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}

// Never hold the first reading hostage to a slow or failed painter.
const ART_WAIT_CAP_MS = 45_000; // a 3-card batch usually lands in 15-20s

function RevealPhase({
  deckId,
  deckTitle,
  onBeginReading,
}: {
  deckId: string;
  deckTitle: string;
  onBeginReading: () => void;
}) {
  // The reading opens once the art is on the cards. Opening it straight away
  // meant every first reading was dealt as blank placeholders and the art
  // arrived after it was over.
  const { status, isComplete } = useImageGenerationProgress(deckId);
  const [capped, setCapped] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCapped(true), ART_WAIT_CAP_MS);
    return () => clearTimeout(t);
  }, []);
  const ready = isComplete || capped;
  const painted = status ? status.completed : 0;
  const total = status?.total ?? 3;

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl px-6 py-5"
      >
        <p className="text-xs text-gold/70 uppercase tracking-widest mb-1.5">Your first deck</p>
        <p className="text-lg font-medium" style={{ color: "var(--ink)" }}>{deckTitle}</p>
      </motion.div>

      <p className="text-sm italic font-serif" style={{ color: "var(--ink-soft)" }} aria-live="polite">
        {ready
          ? "Your cards are painted."
          : `Painting your cards\u2026 ${painted} of ${total}`}
      </p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={onBeginReading}
        disabled={!ready}
        className={cn(
          "w-full py-3 rounded-xl font-medium text-sm transition-all",
          "bg-[var(--ink)] text-[var(--paper)]",
          "shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30",
          !ready && "pointer-events-none"
        )}
      >
        {GUIDED_READING_ENTER_CTA.replace("your sanctuary", "your first reading")}
      </motion.button>
    </div>
  );
}

// ── Phase sigil states ────────────────────────────────────────────────────

const LYRA_SIGIL_STATES: Record<Phase, SigilStateProp> = {
  question: "attentive",
  generating: "thinking",
  reveal: "attentive",
};

// ── Main shell ────────────────────────────────────────────────────────────

interface InitiationShellProps {
  initialPhase?: "welcome" | "reveal";
  existingDeckId?: string;
  existingDeckTitle?: string;
}

export function InitiationShell({
  initialPhase = "welcome",
  existingDeckId,
  existingDeckTitle,
}: InitiationShellProps) {
  const router = useRouter();
  const { generate, isGenerating, error, stage } = useInitiationGeneration();

  const [state, dispatch] = useReducer(initiationReducer, {
    phase: initialPhase === "reveal" && existingDeckId ? "reveal" : "question",
    deckId: existingDeckId ?? null,
    deckTitle: existingDeckTitle ?? null,
  });

  const userInputRef = useRef<string>("");
  const submittingRef = useRef(false);

  const handleSkip = useCallback(async () => {
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/today");
  }, [router]);

  const handleQuestionSubmit = useCallback(async (input: string) => {
    if (submittingRef.current) return; // double-submit guard
    submittingRef.current = true;
    userInputRef.current = input;
    dispatch({ type: "START_GENERATING" });

    try {
      const result = await generate(input);
      if (result) {
        dispatch({ type: "REVEAL", deckId: result.deckId, deckTitle: result.deckTitle });
      }
      // Error is shown in generating phase via the error prop
    } finally {
      submittingRef.current = false;
    }
  }, [generate]);

  const handleRetry = useCallback(() => {
    submittingRef.current = false;
    dispatch({ type: "RETRY_GENERATION" });
  }, []);

  const handleBeginReading = useCallback(() => {
    if (!state.deckId) return;
    router.push(`/readings/new?guided=true&deckId=${state.deckId}`);
  }, [state.deckId, router]);

  const [skipConfirming, setSkipConfirming] = useState(false);

  // Reset skip confirmation on phase change
  useEffect(() => {
    setSkipConfirming(false);
  }, [state.phase]);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-transparent pb-20">
      {/* ── Lyra zone — always mounted ── */}
      <div className="shrink-0 flex flex-col items-center pt-16 pb-6 px-4">
        <LyraSigil size="lg" state={LYRA_SIGIL_STATES[state.phase]} showLabel />
      </div>

      {/* ── Content zone — flex-1, phase-controlled ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex justify-center"
          >
            {state.phase === "question" && (
              <QuestionPhase onSubmit={handleQuestionSubmit} initialValue={userInputRef.current} />
            )}

            {state.phase === "generating" && (
              <GeneratingPhase error={isGenerating ? null : (error ?? null)} onRetry={handleRetry} stage={stage} />
            )}

            {state.phase === "reveal" && state.deckId && state.deckTitle && (
              <RevealPhase
                deckId={state.deckId}
                deckTitle={state.deckTitle}
                onBeginReading={handleBeginReading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Action zone — skip always visible ── */}
      <div className="shrink-0 flex justify-center pb-8 pt-4 px-4 min-h-[48px]">
        {state.phase !== "reveal" && (
          <AnimatePresence mode="wait">
            {!skipConfirming ? (
              <motion.button
                key="skip-initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSkipConfirming(true)}
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Skip the initiation
              </motion.button>
            ) : (
              <motion.div
                key="skip-confirm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-white/40">Skip the initiation?</span>
                <button
                  onClick={handleSkip}
                  className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
                >
                  Yes, skip
                </button>
                <button
                  onClick={() => setSkipConfirming(false)}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
