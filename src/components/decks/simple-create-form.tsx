"use client";

import { useReducer, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StylePickerGrid } from "@/components/art-styles/style-picker-grid";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useDeckGeneration } from "@/hooks/use-deck-generation";
import { GoldButton } from "@/components/ui/gold-button";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { AlertCircle, Wand2 } from "lucide-react";
import Link from "next/link";
import {
  LYRA_SIMPLE_CREATE,
  LYRA_QUICK_CREATE_PROMPTS,
  LYRA_FORGING_MESSAGES,
  LYRA_OBSTACLE_REVEAL,
} from "@/components/guide/lyra-constants";
import { LyraForging } from "@/components/guide/lyra-forging";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ArtStyle } from "@/types";

// ── Spring config ─────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// ── Constants ─────────────────────────────────────────────────────────────────

// Spiritual numbers: trinity, chakras, zodiac, major arcana
const CARD_COUNT_PRESETS = [3, 7, 12, 22];

// ── State machine ─────────────────────────────────────────────────────────────

type Phase = "card_count" | "art_style" | "vision" | "forging" | "reveal";

interface WizardState {
  phase: Phase;
  cardCount: number;
  isCustomCount: boolean;
  customCountInput: string;
  artStyleId: string;
  generatedTitle: string | null;
  generatedDeckId: string | null;
  obstacleCount: number;
}

type WizardAction =
  | { type: "SET_CARD_COUNT"; count: number }
  | { type: "ENABLE_CUSTOM_COUNT" }
  | { type: "SET_CUSTOM_INPUT"; value: string }
  | { type: "DISABLE_CUSTOM_COUNT" }
  | { type: "SET_ART_STYLE"; styleId: string }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "START_FORGING" }
  | { type: "FORGE_COMPLETE"; title: string; deckId: string; obstacleCount: number }
  | { type: "FORGE_ERROR" };

const PHASE_ORDER: Phase[] = ["card_count", "art_style", "vision"];

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_CARD_COUNT":
      return {
        ...state,
        cardCount: action.count,
        isCustomCount: false,
        customCountInput: "",
      };

    case "ENABLE_CUSTOM_COUNT":
      return { ...state, isCustomCount: true };

    case "SET_CUSTOM_INPUT": {
      const num = parseInt(action.value, 10);
      return {
        ...state,
        customCountInput: action.value,
        ...((!isNaN(num) && num >= 1 && num <= 30) ? { cardCount: num } : {}),
      };
    }

    case "DISABLE_CUSTOM_COUNT":
      return {
        ...state,
        isCustomCount: false,
        customCountInput: "",
        ...(!state.customCountInput || parseInt(state.customCountInput, 10) < 1
          ? { cardCount: 3 }
          : {}),
      };

    case "SET_ART_STYLE":
      return { ...state, artStyleId: action.styleId };

    case "NEXT": {
      const i = PHASE_ORDER.indexOf(state.phase);
      if (i < 0 || i >= PHASE_ORDER.length - 1) return state;
      return { ...state, phase: PHASE_ORDER[i + 1] };
    }

    case "BACK": {
      const i = PHASE_ORDER.indexOf(state.phase);
      if (i <= 0) return state;
      return { ...state, phase: PHASE_ORDER[i - 1] };
    }

    case "START_FORGING":
      return { ...state, phase: "forging" };

    case "FORGE_COMPLETE":
      return {
        ...state,
        phase: "reveal",
        generatedTitle: action.title,
        generatedDeckId: action.deckId,
        obstacleCount: action.obstacleCount,
      };

    case "FORGE_ERROR":
      return { ...state, phase: "vision" };

    default:
      return state;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface SimpleCreateFormProps {
  presets: ArtStyle[];
  customStyles: ArtStyle[];
  atLimit: boolean;
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ phase }: { phase: Phase }) {
  const isForging = phase === "forging" || phase === "reveal";
  const activeIndex = isForging ? PHASE_ORDER.length : PHASE_ORDER.indexOf(phase);
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {PHASE_ORDER.map((p, i) => (
        <motion.div
          key={p}
          animate={{
            width: isForging ? 6 : i === activeIndex ? 20 : 6,
            height: 6,
            backgroundColor: isForging
              ? "rgba(201, 169, 78, 1)"
              : i === activeIndex
                ? "rgba(201, 169, 78, 1)"
                : i < activeIndex
                  ? "rgba(201, 169, 78, 0.4)"
                  : "rgba(255, 255, 255, 0.15)",
            opacity: isForging && !prefersReducedMotion ? [1, 0.5, 1] : 1,
          }}
          transition={
            isForging && !prefersReducedMotion
              ? { opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" }, ...SPRING }
              : SPRING
          }
          className="rounded-full"
        />
      ))}
    </div>
  );
}

// ── Content variants ──────────────────────────────────────────────────────────

const contentVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: SPRING },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
};

// ── Step: Card Count ──────────────────────────────────────────────────────────

function CardCountStep({
  cardCount,
  isCustomCount,
  customCountInput,
  dispatch,
  disabled,
}: {
  cardCount: number;
  isCustomCount: boolean;
  customCountInput: string;
  dispatch: React.Dispatch<WizardAction>;
  disabled: boolean;
}) {
  return (
    <motion.div
      key="card_count"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <SectionHeader>How many cards?</SectionHeader>
      <div className="flex flex-wrap gap-2">
        {CARD_COUNT_PRESETS.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => dispatch({ type: "SET_CARD_COUNT", count })}
            disabled={disabled}
            className={cn(
              "rounded-xl px-5 py-3 text-sm font-medium transition-colors border min-w-[48px]",
              !isCustomCount && cardCount === count
                ? "bg-gold/20 border-gold text-gold"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
            )}
          >
            {count}
          </button>
        ))}
        {isCustomCount ? (
          <input
            type="number"
            min={1}
            max={30}
            value={customCountInput}
            onChange={(e) =>
              dispatch({ type: "SET_CUSTOM_INPUT", value: e.target.value })
            }
            onBlur={() => dispatch({ type: "DISABLE_CUSTOM_COUNT" })}
            disabled={disabled}
            className="w-20 rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white/90 focus:border-gold focus:outline-none"
            autoFocus
            placeholder="1-30"
          />
        ) : (
          <button
            type="button"
            onClick={() => dispatch({ type: "ENABLE_CUSTOM_COUNT" })}
            disabled={disabled}
            className="rounded-xl px-5 py-3 text-sm font-medium transition-colors border bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
          >
            Custom
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Step: Art Style ───────────────────────────────────────────────────────────

function ArtStyleStep({
  presets,
  customStyles,
  artStyleId,
  onSelect,
}: {
  presets: ArtStyle[];
  customStyles: ArtStyle[];
  artStyleId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      key="art_style"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <SectionHeader>Choose an art style</SectionHeader>
      <StylePickerGrid
        presets={presets}
        customStyles={customStyles}
        selectedStyleId={artStyleId}
        onSelect={onSelect}
      />
    </motion.div>
  );
}

// ── Step: Vision ──────────────────────────────────────────────────────────────

function VisionStep({
  vision,
  setVision,
  disabled,
  visionVoice,
}: {
  vision: string;
  setVision: (v: string) => void;
  disabled: boolean;
  visionVoice: ReturnType<typeof useVoiceInput>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const shouldRotate = !isFocused && vision.length === 0;
  useEffect(() => {
    if (!shouldRotate) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(
        (prev) => (prev + 1) % LYRA_QUICK_CREATE_PROMPTS.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [shouldRotate]);

  return (
    <motion.div
      key="vision"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <SectionHeader>Describe your vision</SectionHeader>
      <p className="text-white/40 text-sm">
        {LYRA_SIMPLE_CREATE.visionHelper}
      </p>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          rows={5}
          maxLength={1000}
          className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-14 text-white/90 placeholder-transparent focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
        />
        {/* Rotating placeholder overlay */}
        {vision.length === 0 && (
          <div
            className="pointer-events-none absolute inset-0 flex items-start px-4 py-3 pr-14"
            onClick={() => textareaRef.current?.focus()}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={placeholderIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-white/30 text-sm"
              >
                {LYRA_QUICK_CREATE_PROMPTS[placeholderIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <div className="absolute right-2 bottom-2">
          <MicrophoneButton
            onTranscript={visionVoice.handleTranscript}
            onListeningChange={visionVoice.handleListeningChange}
          />
        </div>
      </div>

    </motion.div>
  );
}

// ── View: Forging ────────────────────────────────────────────────────────────

function ForgingView() {
  return (
    <motion.div
      key="forging"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="py-8"
    >
      <LyraForging messages={LYRA_FORGING_MESSAGES} />
    </motion.div>
  );
}

// ── View: Reveal ─────────────────────────────────────────────────────────────

function RevealView({ title, obstacleCount, deckId }: { title: string; obstacleCount: number; deckId?: string }) {
  return (
    <motion.div
      key="reveal"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center py-12 gap-6"
    >
      {/* Golden flash ring */}
      <motion.div
        className="h-20 w-20 rounded-full border-2 border-gold"
        initial={{
          boxShadow: "0 0 60px rgba(201, 169, 78, 0.6)",
          borderColor: "rgba(201, 169, 78, 0.8)",
        }}
        animate={{
          boxShadow: "0 0 20px rgba(201, 169, 78, 0.15)",
          borderColor: "rgba(201, 169, 78, 0.3)",
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Title reveal */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...SPRING }}
        className="text-xl font-semibold text-gold text-center px-4"
      >
        {title}
      </motion.h2>

      {/* Obstacle reveal whisper */}
      {obstacleCount > 0 && obstacleCount <= 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-white/40 text-sm italic text-center px-6 max-w-sm"
        >
          {LYRA_OBSTACLE_REVEAL[obstacleCount - 1]}
        </motion.p>
      )}

      {/* Refine hint */}
      {deckId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Link
            href={`/decks/${deckId}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <Wand2 className="h-3 w-3" />
            Refine your cards in Studio
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SimpleCreateForm({
  presets,
  customStyles,
  atLimit,
}: SimpleCreateFormProps) {
  const router = useRouter();
  const [vision, setVision] = useState("");

  const [state, dispatch] = useReducer(reducer, {
    phase: "card_count",
    cardCount: 3,
    isCustomCount: false,
    customCountInput: "",
    artStyleId: presets[0]?.id ?? "",
    generatedTitle: null,
    generatedDeckId: null,
    obstacleCount: 0,
  });

  const { generate, error } = useDeckGeneration();

  const visionVoice = useVoiceInput({
    value: vision,
    onChange: setVision,
    maxLength: 1000,
  });

  const isLastStep = state.phase === "vision";
  const isForging = state.phase === "forging" || state.phase === "reveal";
  const canContinue =
    state.phase === "card_count"
      ? state.cardCount >= 1 && state.cardCount <= 30
      : state.phase === "art_style"
        ? !!state.artStyleId
        : vision.trim().length > 0;

  const canSubmit = !atLimit && canContinue && isLastStep;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    dispatch({ type: "START_FORGING" });

    const result = await generate({
      vision: vision.trim(),
      cardCount: state.cardCount,
      artStyleId: state.artStyleId,
    });

    if (result) {
      dispatch({ type: "FORGE_COMPLETE", title: result.title, deckId: result.deckId, obstacleCount: result.obstacleCount });
    } else {
      dispatch({ type: "FORGE_ERROR" });
    }
  }, [canSubmit, generate, vision, state.cardCount, state.artStyleId]);

  // Auto-navigate after reveal (3.5s delay to let user see refine hint)
  const autoNavCancelledRef = useRef(false);
  useEffect(() => {
    if (state.phase !== "reveal" || !state.generatedDeckId) return;
    autoNavCancelledRef.current = false;
    const timeout = setTimeout(() => {
      if (!autoNavCancelledRef.current) {
        router.push(`/decks/${state.generatedDeckId}`);
      }
    }, 3500);
    return () => clearTimeout(timeout);
  }, [state.phase, state.generatedDeckId, router]);

  return (
    <div className="flex flex-col gap-6">
      {atLimit && !isForging && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          You&apos;ve reached the free tier limit of 2 decks. Upgrade to Pro
          for unlimited decks.
        </div>
      )}

      {/* Step indicator */}
      <StepIndicator phase={state.phase} />

      {/* Step content */}
      <div>
        <AnimatePresence mode="wait">
          {state.phase === "card_count" && (
            <CardCountStep
              cardCount={state.cardCount}
              isCustomCount={state.isCustomCount}
              customCountInput={state.customCountInput}
              dispatch={dispatch}
              disabled={false}
            />
          )}

          {state.phase === "art_style" && (
            <ArtStyleStep
              presets={presets}
              customStyles={customStyles}
              artStyleId={state.artStyleId}
              onSelect={(id) => dispatch({ type: "SET_ART_STYLE", styleId: id })}
            />
          )}

          {state.phase === "vision" && (
            <VisionStep
              vision={vision}
              setVision={setVision}
              disabled={false}
              visionVoice={visionVoice}
            />
          )}

          {state.phase === "forging" && <ForgingView />}

          {state.phase === "reveal" && state.generatedTitle && (
            <RevealView title={state.generatedTitle} obstacleCount={state.obstacleCount} deckId={state.generatedDeckId ?? undefined} />
          )}
        </AnimatePresence>
      </div>

      {/* Credit preview (visible on last step) */}
      {isLastStep && (
        <div className="text-white/40 text-sm">
          {LYRA_SIMPLE_CREATE.creditPreview(state.cardCount)}
        </div>
      )}

      {/* Error */}
      {error && !isForging && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Navigation + submit — hidden during forging/reveal */}
      {!isForging && (
        <div className="flex gap-3">
          {state.phase !== "card_count" && (
            <GoldButton
              className="px-4 py-3 bg-white/5 !bg-none border border-white/10 text-white/60 !shadow-none hover:text-white/80"
              onClick={() => dispatch({ type: "BACK" })}
            >
              Back
            </GoldButton>
          )}

          <GoldButton
            className="flex-1"
            disabled={isLastStep ? !canSubmit : !canContinue}
            onClick={isLastStep ? handleSubmit : () => dispatch({ type: "NEXT" })}
          >
            {isLastStep
              ? LYRA_SIMPLE_CREATE.submitButton
              : "Continue"}
          </GoldButton>
        </div>
      )}
    </div>
  );
}
