"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LyraSigil } from "./lyra-sigil";
import { LyraNarration } from "./lyra-narration";
import {
  INITIATION_WELCOME_STEPS,
  INITIATION_QUESTION_PROMPT,
  INITIATION_GENERATING_MESSAGES,
  buildArtStyleRevealMessage,
  GUIDED_READING_ENTER_CTA,
} from "./lyra-constants";
import { useInitiationGeneration } from "@/hooks/use-initiation-generation";
import { PRESET_ART_STYLE_NAMES, type PresetArtStyleName } from "@/lib/ai/prompts/onboarding";

// ── Types ────────────────────────────────────────────────────────────────

type Phase = "welcome" | "question" | "generating" | "reveal";

interface InitiationState {
  phase: Phase;
  welcomeStep: number;
  selectedArtStyleName: PresetArtStyleName | null;
  selectedArtStyleId: string | null;
  deckId: string | null;
  deckTitle: string | null;
  showStylePicker: boolean;
}

type InitiationAction =
  | { type: "NEXT_WELCOME_STEP" }
  | { type: "GO_TO_QUESTION" }
  | { type: "START_GENERATING" }
  | { type: "REVEAL"; artStyleName: PresetArtStyleName; artStyleId: string; deckId: string; deckTitle: string }
  | { type: "TOGGLE_STYLE_PICKER" }
  | { type: "SELECT_STYLE"; styleName: PresetArtStyleName };

function initiationReducer(state: InitiationState, action: InitiationAction): InitiationState {
  switch (action.type) {
    case "NEXT_WELCOME_STEP": {
      const nextStep = state.welcomeStep + 1;
      if (nextStep >= INITIATION_WELCOME_STEPS.length) {
        return { ...state, phase: "question" };
      }
      return { ...state, welcomeStep: nextStep };
    }
    case "GO_TO_QUESTION":
      return { ...state, phase: "question" };
    case "START_GENERATING":
      return { ...state, phase: "generating" };
    case "REVEAL":
      return {
        ...state,
        phase: "reveal",
        deckId: action.deckId,
        deckTitle: action.deckTitle,
        showStylePicker: false,
        selectedArtStyleName: action.artStyleName,
        selectedArtStyleId: action.artStyleId,
      };
    case "TOGGLE_STYLE_PICKER":
      return { ...state, showStylePicker: !state.showStylePicker };
    case "SELECT_STYLE":
      return {
        ...state,
        selectedArtStyleName: action.styleName,
        showStylePicker: false,
      };
    default:
      return state;
  }
}

const initialState: InitiationState = {
  phase: "welcome",
  welcomeStep: 0,
  selectedArtStyleName: null,
  selectedArtStyleId: null,
  deckId: null,
  deckTitle: null,
  showStylePicker: false,
};

// ── Sub-components ────────────────────────────────────────────────────────

function WelcomePhase({
  step,
  onNext,
}: {
  step: number;
  onNext: () => void;
}) {
  const [narrationDone, setNarrationDone] = useState(false);
  const isLastStep = step === INITIATION_WELCOME_STEPS.length - 1;

  // Reset narrationDone when step changes
  useEffect(() => {
    setNarrationDone(false);
  }, [step]);

  return (
    <div className="flex flex-col items-center gap-8 text-center max-w-sm mx-auto">
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {INITIATION_WELCOME_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === step ? "w-4 bg-[#c9a94e]" : i < step ? "w-2 bg-[#c9a94e]/40" : "w-2 bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <LyraNarration
            text={INITIATION_WELCOME_STEPS[step].text}
            speed={30}
            onComplete={() => setNarrationDone(true)}
          />
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: narrationDone ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        onClick={onNext}
        disabled={!narrationDone}
        className={cn(
          "px-8 py-3 rounded-xl font-medium text-sm transition-all",
          narrationDone
            ? "bg-white/10 hover:bg-white/15 text-white/80 border border-white/10 cursor-pointer"
            : "cursor-default"
        )}
      >
        {isLastStep ? "I'm ready" : "Continue"}
      </motion.button>
    </div>
  );
}

function QuestionPhase({
  onSubmit,
}: {
  onSubmit: (input: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="text-sm text-white/60 italic font-serif text-center leading-relaxed"
      >
        {INITIATION_QUESTION_PROMPT}
      </motion.p>

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
            "focus:outline-none focus:border-[#c9a94e]/40 focus:ring-0",
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
          "bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118]",
          "shadow-lg shadow-[#c9a94e]/20",
          value.trim().length >= 10 ? "cursor-pointer hover:shadow-xl hover:shadow-[#c9a94e]/30" : "cursor-not-allowed opacity-40"
        )}
      >
        Shape my deck
      </motion.button>
    </div>
  );
}

function GeneratingPhase({ error }: { error: string | null }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % INITIATION_GENERATING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
            className="h-1.5 w-1.5 rounded-full bg-[#c9a94e]"
          />
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-white/60 italic font-serif"
          >
            {INITIATION_GENERATING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}

function RevealPhase({
  artStyleName,
  deckTitle,
  showStylePicker,
  onTogglePicker,
  onSelectStyle,
  onBeginReading,
}: {
  artStyleName: PresetArtStyleName;
  deckTitle: string;
  showStylePicker: boolean;
  onTogglePicker: () => void;
  onSelectStyle: (name: PresetArtStyleName) => void;
  onBeginReading: () => void;
}) {
  const [narrationDone, setNarrationDone] = useState(false);
  const revealMessage = buildArtStyleRevealMessage(artStyleName);

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto">
      {/* Deck title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5"
      >
        <p className="text-xs text-[#c9a94e]/70 uppercase tracking-widest mb-1.5">Your first deck</p>
        <p className="text-lg font-medium text-white/90">{deckTitle}</p>
      </motion.div>

      {/* Art style reveal */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="space-y-1"
      >
        <LyraNarration
          text={revealMessage}
          speed={35}
          onComplete={() => setNarrationDone(true)}
        />

        <button
          onClick={onTogglePicker}
          className="text-xs text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
        >
          change this
        </button>
      </motion.div>

      {/* Style picker */}
      <AnimatePresence>
        {showStylePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
              {PRESET_ART_STYLE_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => onSelectStyle(name)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    name === artStyleName
                      ? "bg-[#c9a94e]/20 text-[#c9a94e]"
                      : "text-white/60 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Begin reading CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: narrationDone ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={onBeginReading}
        className={cn(
          "w-full py-3 rounded-xl font-medium text-sm transition-all",
          "bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118]",
          "shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30"
        )}
      >
        {GUIDED_READING_ENTER_CTA.replace("your sanctuary", "your first reading")}
      </motion.button>
    </div>
  );
}

// ── Phase labels ──────────────────────────────────────────────────────────

const PHASE_LABELS: Record<Phase, string> = {
  welcome: "The Initiation",
  question: "The Question",
  generating: "Shaping your cards...",
  reveal: "Your deck is ready",
};

const LYRA_SIGIL_STATES: Record<Phase, "dormant" | "attentive" | "speaking"> = {
  welcome: "speaking",
  question: "attentive",
  generating: "speaking",
  reveal: "speaking",
};

// ── Main shell ────────────────────────────────────────────────────────────

interface InitiationShellProps {
  initialPhase?: Phase;
  existingDeckId?: string;
  existingDeckTitle?: string;
  existingArtStyleName?: PresetArtStyleName;
}

export function InitiationShell({
  initialPhase = "welcome",
  existingDeckId,
  existingDeckTitle,
  existingArtStyleName,
}: InitiationShellProps) {
  const router = useRouter();
  const { generate, isGenerating, error } = useInitiationGeneration();

  const [state, dispatch] = useReducer(initiationReducer, {
    ...initialState,
    phase: initialPhase,
    deckId: existingDeckId ?? null,
    deckTitle: existingDeckTitle ?? null,
    selectedArtStyleName: existingArtStyleName ?? null,
  });

  const userInputRef = useRef<string>("");

  const handleSkip = useCallback(async () => {
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/dashboard");
  }, [router]);

  const handleQuestionSubmit = useCallback(async (input: string) => {
    userInputRef.current = input;
    dispatch({ type: "START_GENERATING" });

    const result = await generate(input);
    if (result) {
      dispatch({
        type: "REVEAL",
        artStyleName: result.selectedArtStyleName,
        artStyleId: result.selectedArtStyleId,
        deckId: result.deckId,
        deckTitle: result.deckTitle,
      });
    }
    // Error is shown in generating phase via the error prop
  }, [generate]);

  const handleBeginReading = useCallback(() => {
    if (!state.deckId) return;
    router.push(`/readings/new?guided=true&deckId=${state.deckId}`);
  }, [state.deckId, router]);

  const handleSelectStyle = useCallback((styleName: PresetArtStyleName) => {
    dispatch({ type: "SELECT_STYLE", styleName });
  }, []);

  const displayArtStyleName = state.selectedArtStyleName;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-transparent">
      {/* ── Lyra zone — always mounted ── */}
      <div className="shrink-0 flex flex-col items-center pt-16 pb-6 px-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4"
        >
          <LyraSigil size="xl" state={LYRA_SIGIL_STATES[state.phase]} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={state.phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-xs text-white/40 uppercase tracking-widest"
          >
            {PHASE_LABELS[state.phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Content zone — flex-1, phase-controlled ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex items-center justify-center">
        {/* Welcome phase */}
        <motion.div
          className="w-full"
          animate={{
            opacity: state.phase === "welcome" ? 1 : 0,
            pointerEvents: state.phase === "welcome" ? "auto" : "none",
          }}
          style={{ display: state.phase === "welcome" ? "flex" : "none", justifyContent: "center" }}
        >
          <WelcomePhase
            step={state.welcomeStep}
            onNext={() => dispatch({ type: "NEXT_WELCOME_STEP" })}
          />
        </motion.div>

        {/* Question phase */}
        {state.phase === "question" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <QuestionPhase onSubmit={handleQuestionSubmit} />
          </motion.div>
        )}

        {/* Generating phase */}
        {state.phase === "generating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <GeneratingPhase error={isGenerating ? null : (error ?? null)} />
          </motion.div>
        )}

        {/* Reveal phase */}
        {state.phase === "reveal" && displayArtStyleName && state.deckTitle && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <RevealPhase
              artStyleName={displayArtStyleName}
              deckTitle={state.deckTitle}
              showStylePicker={state.showStylePicker}
              onTogglePicker={() => dispatch({ type: "TOGGLE_STYLE_PICKER" })}
              onSelectStyle={handleSelectStyle}
              onBeginReading={handleBeginReading}
            />
          </motion.div>
        )}
      </div>

      {/* ── Action zone — skip always visible ── */}
      <div className="shrink-0 flex justify-center pb-8 pt-4 px-4">
        {state.phase !== "reveal" && (
          <button
            onClick={handleSkip}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Skip the initiation
          </button>
        )}
      </div>
    </div>
  );
}
