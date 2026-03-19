"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LyraHeader } from "./lyra-header";
import { LyraNarration } from "./lyra-narration";
import {
  INITIATION_WELCOME_STEPS,
  INITIATION_QUESTION_PROMPT,
  INITIATION_GENERATING_MESSAGES,
  INITIATION_STAGE_MESSAGES,
  buildArtStyleRevealMessage,
  GUIDED_READING_ENTER_CTA,
} from "./lyra-constants";
import { useInitiationGeneration, type GenerationStage } from "@/hooks/use-initiation-generation";
import { PRESET_ART_STYLE_NAMES, type PresetArtStyleName } from "@/lib/ai/prompts/onboarding";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";

// ── Types ────────────────────────────────────────────────────────────────

type Phase = "voice_consent" | "welcome" | "question" | "generating" | "reveal";

interface InitiationState {
  phase: Phase;
  welcomeStep: number;
  selectedArtStyleName: PresetArtStyleName | null;
  selectedArtStyleId: string | null;
  deckId: string | null;
  deckTitle: string | null;
  showStylePicker: boolean;
  voiceEnabled: boolean;
}

type InitiationAction =
  | { type: "ENABLE_VOICE" }
  | { type: "SKIP_VOICE" }
  | { type: "NEXT_WELCOME_STEP" }
  | { type: "GO_TO_QUESTION" }
  | { type: "START_GENERATING" }
  | { type: "REVEAL"; artStyleName: PresetArtStyleName; artStyleId: string; deckId: string; deckTitle: string }
  | { type: "TOGGLE_STYLE_PICKER" }
  | { type: "SELECT_STYLE"; styleName: PresetArtStyleName }
  | { type: "RETRY_GENERATION" };

function initiationReducer(state: InitiationState, action: InitiationAction): InitiationState {
  switch (action.type) {
    case "ENABLE_VOICE":
      return { ...state, phase: "welcome", voiceEnabled: true };
    case "SKIP_VOICE":
      return { ...state, phase: "welcome", voiceEnabled: false };
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
      if (state.phase === "generating") return state; // guard against double-submit
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
    case "RETRY_GENERATION":
      return { ...state, phase: "question" };
    default:
      return state;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────

function VoiceConsentPhase({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [narrationDone, setNarrationDone] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 text-center max-w-sm mx-auto">
      <LyraNarration
        text="Before we begin — would you like me to guide you with my voice?"
        speed={30}
        onComplete={() => setNarrationDone(true)}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: narrationDone ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-3"
      >
        <button
          onClick={onAccept}
          className="px-6 py-2.5 rounded-xl bg-[#c9a94e]/20 border border-[#c9a94e]/30 text-[#c9a94e] text-sm font-medium hover:bg-[#c9a94e]/30 transition-colors cursor-pointer"
        >
          Yes, please
        </button>
        <button
          onClick={onDecline}
          className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 transition-colors cursor-pointer"
        >
          Not now
        </button>
      </motion.div>
    </div>
  );
}

function WelcomePhase({
  step,
  onNext,
  voiceEnabled = false,
  voiceIdle = true,
}: {
  step: number;
  onNext: () => void;
  voiceEnabled?: boolean;
  voiceIdle?: boolean;
}) {
  const [narrationDone, setNarrationDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const isLastStep = step === INITIATION_WELCOME_STEPS.length - 1;

  // Reset narrationDone when step changes
  useEffect(() => {
    setNarrationDone(false);
    setTimedOut(false);
  }, [step]);

  // Safety timeout: force-show button if TTS stays busy >5s after narration completes
  useEffect(() => {
    if (!narrationDone || !voiceEnabled || voiceIdle) return;
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [narrationDone, voiceEnabled, voiceIdle]);

  const showButton = narrationDone && (!voiceEnabled || voiceIdle || timedOut);

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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
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
        animate={{ opacity: showButton ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        onClick={onNext}
        disabled={!showButton}
        className={cn(
          "px-8 py-3 rounded-xl font-medium text-sm transition-all",
          showButton
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
            className="h-1.5 w-1.5 rounded-full bg-[#c9a94e]"
          />
        ))}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-destructive">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 rounded-xl bg-[#c9a94e]/20 border border-[#c9a94e]/30 text-[#c9a94e] text-sm font-medium hover:bg-[#c9a94e]/30 transition-colors cursor-pointer"
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

function RevealPhase({
  artStyleName,
  deckTitle,
  showStylePicker,
  onTogglePicker,
  onSelectStyle,
  onBeginReading,
  voiceEnabled = false,
  voiceIdle = true,
}: {
  artStyleName: PresetArtStyleName;
  deckTitle: string;
  showStylePicker: boolean;
  onTogglePicker: () => void;
  onSelectStyle: (name: PresetArtStyleName) => void;
  onBeginReading: () => void;
  voiceEnabled?: boolean;
  voiceIdle?: boolean;
}) {
  const [narrationDone, setNarrationDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const revealMessage = buildArtStyleRevealMessage(artStyleName);

  // Safety timeout: force-show button if TTS stays busy >5s after narration completes
  useEffect(() => {
    if (!narrationDone || !voiceEnabled || voiceIdle) return;
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [narrationDone, voiceEnabled, voiceIdle]);

  const showButton = narrationDone && (!voiceEnabled || voiceIdle || timedOut);

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
        animate={{ opacity: showButton ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={onBeginReading}
        disabled={!showButton}
        className={cn(
          "w-full py-3 rounded-xl font-medium text-sm transition-all",
          "bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118]",
          "shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30",
          !showButton && "opacity-0"
        )}
      >
        {GUIDED_READING_ENTER_CTA.replace("your sanctuary", "your first reading")}
      </motion.button>
    </div>
  );
}

// ── Phase sigil states ────────────────────────────────────────────────────

const LYRA_SIGIL_STATES: Record<Phase, "dormant" | "attentive" | "speaking"> = {
  voice_consent: "speaking",
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
  const { generate, isGenerating, error, stage } = useInitiationGeneration();
  const tts = useTextToSpeech();
  const { update: updateVoicePrefs } = useVoicePreferences();

  // If resuming at reveal, skip voice_consent. Otherwise start there.
  const startPhase: Phase = initialPhase === "reveal" ? "reveal" : "voice_consent";

  const [state, dispatch] = useReducer(initiationReducer, {
    phase: startPhase,
    welcomeStep: 0,
    selectedArtStyleName: existingArtStyleName ?? null,
    selectedArtStyleId: null,
    deckId: existingDeckId ?? null,
    deckTitle: existingDeckTitle ?? null,
    showStylePicker: false,
    voiceEnabled: false,
  });

  const userInputRef = useRef<string>("");
  const submittingRef = useRef(false);

  // Auto-speak welcome messages when voice is enabled
  useEffect(() => {
    if (!state.voiceEnabled) return;
    if (state.phase !== "welcome") return;
    const text = INITIATION_WELCOME_STEPS[state.welcomeStep].text;
    tts.speak(text);
    return () => { tts.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.welcomeStep, state.voiceEnabled]);

  // Stop TTS when leaving welcome phase
  useEffect(() => {
    if (state.phase !== "welcome") tts.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // Speak reveal message when phase becomes reveal
  useEffect(() => {
    if (!state.voiceEnabled || state.phase !== "reveal" || !state.selectedArtStyleName) return;
    const msg = buildArtStyleRevealMessage(state.selectedArtStyleName);
    tts.speak(msg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.voiceEnabled]);

  const handleVoiceAccept = useCallback(async () => {
    dispatch({ type: "ENABLE_VOICE" });
    await updateVoicePrefs({ enabled: true });
  }, [updateVoicePrefs]);

  const handleVoiceDecline = useCallback(() => {
    dispatch({ type: "SKIP_VOICE" });
  }, []);

  const handleSkip = useCallback(async () => {
    tts.stop();
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/dashboard");
  }, [router, tts]);

  const handleQuestionSubmit = useCallback(async (input: string) => {
    if (submittingRef.current) return; // double-submit guard
    submittingRef.current = true;
    userInputRef.current = input;
    dispatch({ type: "START_GENERATING" });

    try {
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
    tts.stop();
    router.push(`/readings/new?guided=true&deckId=${state.deckId}`);
  }, [state.deckId, router, tts]);

  const handleSelectStyle = useCallback((styleName: PresetArtStyleName) => {
    dispatch({ type: "SELECT_STYLE", styleName });

    // Persist to DB and re-trigger image generation
    if (state.deckId) {
      fetch("/api/onboarding/change-art-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: state.deckId, artStyleName: styleName }),
      })
        .then((res) => {
          if (res.ok) {
            // Fire-and-forget image regeneration
            fetch("/api/ai/generate-images-batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ deckId: state.deckId }),
            });
          }
        })
        .catch(() => {
          // Silent catch — local state still updated
        });
    }
  }, [state.deckId]);

  const voiceIdle = tts.state === "idle";
  const [skipConfirming, setSkipConfirming] = useState(false);

  // Reset skip confirmation on phase change
  useEffect(() => {
    setSkipConfirming(false);
  }, [state.phase]);

  const displayArtStyleName = state.selectedArtStyleName;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-transparent">
      {/* ── Lyra zone — always mounted ── */}
      <div className="shrink-0 flex flex-col items-center pt-16 pb-6 px-4">
        <LyraHeader state={LYRA_SIGIL_STATES[state.phase]} size="lg" />
      </div>

      {/* ── Content zone — flex-1, phase-controlled ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex items-center justify-center">
        {/* Voice consent phase */}
        {state.phase === "voice_consent" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <VoiceConsentPhase onAccept={handleVoiceAccept} onDecline={handleVoiceDecline} />
          </motion.div>
        )}

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
            voiceEnabled={state.voiceEnabled}
            voiceIdle={voiceIdle}
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
            <QuestionPhase onSubmit={handleQuestionSubmit} initialValue={userInputRef.current} />
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
            <GeneratingPhase error={isGenerating ? null : (error ?? null)} onRetry={handleRetry} stage={stage} />
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
              voiceEnabled={state.voiceEnabled}
              voiceIdle={voiceIdle}
            />
          </motion.div>
        )}
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
