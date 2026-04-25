"use client";

import { useReducer, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { StylePickerGrid } from "@/components/art-styles/style-picker-grid";
import { ChronicleInterests } from "./chronicle-interests";
import type { ArtStyle, ChronicleInterests as ChronicleInterestsType } from "@/types";

// ── Spring config ─────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// ── State machine ─────────────────────────────────────────────────────────────

type SetupPhase = "welcome" | "art_style" | "interests" | "confirm";

interface SetupState {
  phase: SetupPhase;
  artStyleId: string | null;
  interests: ChronicleInterestsType;
  isCreating: boolean;
  error: string | null;
}

type SetupAction =
  | { type: "SELECT_ART_STYLE"; styleId: string }
  | { type: "SET_INTERESTS"; interests: ChronicleInterestsType }
  | { type: "NEXT" }
  | { type: "BEGIN_CREATING" }
  | { type: "CREATION_ERROR"; error: string };

const PHASE_ORDER: SetupPhase[] = ["welcome", "art_style", "interests", "confirm"];

const initialState: SetupState = {
  phase: "welcome",
  artStyleId: null,
  interests: { spiritual: [], lifeDomains: [] },
  isCreating: false,
  error: null,
};

function reducer(state: SetupState, action: SetupAction): SetupState {
  switch (action.type) {
    case "SELECT_ART_STYLE":
      return { ...state, artStyleId: action.styleId };

    case "SET_INTERESTS":
      return { ...state, interests: action.interests };

    case "NEXT": {
      const currentIndex = PHASE_ORDER.indexOf(state.phase);
      if (currentIndex < 0 || currentIndex >= PHASE_ORDER.length - 1) return state;
      return { ...state, phase: PHASE_ORDER[currentIndex + 1] };
    }

    case "BEGIN_CREATING":
      return { ...state, isCreating: true, error: null };

    case "CREATION_ERROR":
      return { ...state, isCreating: false, error: action.error };

    default:
      return state;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ChronicleSetupFlowProps {
  presetStyles: ArtStyle[];
  className?: string;
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_DOTS: SetupPhase[] = ["welcome", "art_style", "interests", "confirm"];

function StepIndicator({ phase }: { phase: SetupPhase }) {
  const activeIndex = STEP_DOTS.indexOf(phase);
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEP_DOTS.map((p, i) => (
        <motion.div
          key={p}
          animate={{
            width: i === activeIndex ? 20 : 6,
            height: 6,
            backgroundColor:
              i === activeIndex
                ? "var(--accent-gold)"
                : i < activeIndex
                  ? "rgba(168, 134, 63, 0.45)"
                  : "var(--line)",
          }}
          transition={SPRING}
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

// ── Lyra speech bubble ────────────────────────────────────────────────────────

function LyraSpeech({ children, size = "sm" }: { children: React.ReactNode; size?: "sm" | "lg" }) {
  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      <motion.div
        animate={size === "lg" ? { scale: [1, 1.05, 1] } : undefined}
        transition={size === "lg" ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <LyraSigil size={size === "lg" ? "xl" : "md"} state="speaking" />
      </motion.div>
      <div
        className="max-w-sm rounded-2xl border px-4 py-3 hair"
        style={{ background: "var(--paper-card)" }}
      >
        <p
          className="whisper text-base leading-relaxed text-center"
          style={{ color: "var(--ink-soft)" }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

// ── Welcome step ─────────────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <motion.div
      key="welcome"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center py-8"
    >
      <LyraSpeech size="lg">
        Welcome, seeker. I&apos;m Lyra — your companion in reflection. Each day, we&apos;ll speak
        briefly about what&apos;s alive in your life. From your words, I&apos;ll weave a personal oracle
        card and offer a reading that connects it to your journey. Over time, your Chronicle becomes
        a living map of your story.
      </LyraSpeech>
    </motion.div>
  );
}

// ── Art style step ────────────────────────────────────────────────────────────

interface ArtStyleStepProps {
  presetStyles: ArtStyle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function ArtStyleStep({ presetStyles, selectedId, onSelect }: ArtStyleStepProps) {
  return (
    <motion.div
      key="art_style"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col gap-2"
    >
      <LyraSpeech>
        Every card I forge carries a visual essence. Choose the style that resonates — this
        aesthetic will breathe life into every card born from our conversations.
      </LyraSpeech>
      <StylePickerGrid
        presets={presetStyles}
        selectedStyleId={selectedId}
        onSelect={onSelect}
      />
    </motion.div>
  );
}

// ── Interests step ────────────────────────────────────────────────────────────

interface InterestsStepProps {
  selected: ChronicleInterestsType;
  onChange: (interests: ChronicleInterestsType) => void;
}

function InterestsStep({ selected, onChange }: InterestsStepProps) {
  return (
    <motion.div
      key="interests"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col gap-2"
    >
      <LyraSpeech>
        Tell me what draws your attention in life. These threads will weave through our daily
        practice — I&apos;ll listen for them in your words.
      </LyraSpeech>
      <ChronicleInterests selected={selected} onChange={onChange} />
    </motion.div>
  );
}

// ── Confirm step ──────────────────────────────────────────────────────────────

function ConfirmStep() {
  return (
    <motion.div
      key="confirm"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center gap-6 py-4"
    >
      <LyraSpeech size="lg">
        I&apos;m ready to begin our daily practice together. Your first Chronicle awaits — let&apos;s
        see what today holds.
      </LyraSpeech>

      <p
        className="whisper max-w-xs text-center text-sm"
        style={{ color: "var(--ink-mute)" }}
      >
        Your Chronicle deck will grow with you, one card per day.
      </p>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChronicleSetupFlow({
  presetStyles,
  className,
}: ChronicleSetupFlowProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll content area back to top on phase change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.phase]);

  const hasSelectedAnything =
    state.interests.spiritual.length > 0 || state.interests.lifeDomains.length > 0;

  const canContinue =
    state.phase === "welcome"
      ? true
      : state.phase === "art_style"
        ? state.artStyleId !== null
        : state.phase === "interests"
          ? hasSelectedAnything
          : true;

  async function handleComplete() {
    if (!state.artStyleId) return;

    dispatch({ type: "BEGIN_CREATING" });

    try {
      const response = await fetch("/api/chronicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artStyleId: state.artStyleId,
          interests: state.interests,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        dispatch({
          type: "CREATION_ERROR",
          error: body.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      router.push("/chronicle/today");
    } catch {
      dispatch({
        type: "CREATION_ERROR",
        error: "Could not connect to the server. Please try again.",
      });
    }
  }

  const isOnLast = state.phase === "confirm";

  // CTA label per phase
  const ctaLabel =
    state.phase === "welcome"
      ? "Begin Your Chronicle"
      : isOnLast
        ? state.isCreating
          ? "Creating your Chronicle\u2026"
          : "Begin Your First Chronicle"
        : "Continue";

  return (
    <div
      className={cn(
        "daylight flex h-[100dvh] flex-col overflow-hidden pb-20",
        className
      )}
      style={{ background: "var(--paper)" }}
    >
      {/* ── Top bar: step indicator ───────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-[env(safe-area-inset-top,0px)]">
        <StepIndicator phase={state.phase} />
      </div>

      {/* ── Content zone: scrollable ──────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="px-4 pb-4 pt-2">
            <AnimatePresence mode="wait">
              {state.phase === "welcome" && <WelcomeStep />}

              {state.phase === "art_style" && (
                <ArtStyleStep
                  presetStyles={presetStyles}
                  selectedId={state.artStyleId}
                  onSelect={(id) => dispatch({ type: "SELECT_ART_STYLE", styleId: id })}
                />
              )}

              {state.phase === "interests" && (
                <InterestsStep
                  selected={state.interests}
                  onChange={(interests) => dispatch({ type: "SET_INTERESTS", interests })}
                />
              )}

              {state.phase === "confirm" && <ConfirmStep />}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* ── Bottom action zone ────────────────────────────────────────────── */}
      <div
        className="shrink-0 space-y-2 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
        style={{ borderTopColor: "var(--line-soft)" }}
      >
        {/* Error message */}
        <AnimatePresence>
          {state.error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={SPRING}
              className="text-center text-xs"
              style={{ color: "#b83a2b" }}
            >
              {state.error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Primary CTA — ink pill in editorial palette */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            className="h-12 w-full text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
            disabled={!canContinue || state.isCreating}
            onClick={isOnLast ? handleComplete : () => dispatch({ type: "NEXT" })}
          >
            {ctaLabel}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
