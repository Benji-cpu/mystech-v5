"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LyraNarration } from "@/components/guide/lyra-narration";
import { useImmersive } from "@/components/immersive/immersive-provider";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { getCardNarration } from "@/components/guide/lyra-constants";

import { DeckSelector } from "./deck-selector";
import { SpreadSelector } from "./spread-selector";
import { IntentionInput } from "./intention-input";
import { SpreadLayout } from "./spread-layout";
import { ReadingInterpretation } from "./reading-interpretation";
import { CompactCardStrip } from "./compact-card-strip";

import {
  readingFlowReducer,
  initialReadingFlowState,
  getZoneProportions,
  isSetupPhase,
  isCardPhase as isCardPhaseCheck,
} from "./reading-flow-state";

import { SPRINGS, READING_NARRATION, MOOD_MAP } from "./reading-flow-theme";

import type { Deck, PlanType, Card } from "@/types";

// ── Props ──────────────────────────────────────────────────────────────

interface ReadingFlowProps {
  decks: Deck[];
  userPlan?: PlanType;
  /** @deprecated Use userPlan instead */
  userRole?: string;
}

// ── Step dots for setup phases ─────────────────────────────────────────

const SETUP_LABELS = ["Deck", "Spread", "Intention"] as const;
const SETUP_PHASES = ["deck", "spread", "intention"] as const;

// ── Component ──────────────────────────────────────────────────────────

export function ReadingFlow({ decks, userPlan, userRole }: ReadingFlowProps) {
  const [state, dispatch] = useReducer(
    readingFlowReducer,
    initialReadingFlowState
  );
  const { setMoodPreset } = useImmersive();
  const router = useRouter();

  const { phase, selectedDeckId, selectedSpread, question, readingId, drawnCards, error } = state;
  const zones = getZoneProportions(phase);
  const selectedDeck = decks.find((d) => d.id === selectedDeckId) ?? null;
  const setupIndex = SETUP_PHASES.indexOf(phase as typeof SETUP_PHASES[number]);
  const isInterpreting = phase === "interpreting" || phase === "complete";
  const cardPhase = isCardPhaseCheck(phase);

  // ── Mood shifts ────────────────────────────────────────────────────────

  useEffect(() => {
    setMoodPreset(MOOD_MAP[phase]);
  }, [phase, setMoodPreset]);

  // ── Narration text per phase ───────────────────────────────────────────

  useEffect(() => {
    dispatch({ type: "SET_NARRATION", text: READING_NARRATION[phase] });
  }, [phase]);

  // ── Card reveal hook ───────────────────────────────────────────────────

  const onAllRevealed = useCallback(() => {
    // Pause 1 second then transition to interpreting
    setTimeout(() => {
      dispatch({ type: "CARDS_REVEALED" });
    }, 1000);
  }, []);

  const { cardStates, isRevealing, allRevealed, startReveal, reset: resetReveal } = useCardReveal({
    cardCount: drawnCards.length || 1,
    revealDuration: 2000,
    delayBetween: 1500,
    onAllRevealed,
  });

  // ── Voice narration ────────────────────────────────────────────────────

  const { preferences: voicePrefs } = useVoicePreferences();
  const tts = useTextToSpeech({
    voiceId: voicePrefs.voiceId ?? undefined,
    speed: voicePrefs.speed,
    enabled: voicePrefs.enabled,
  });

  // Pre-fetch card narration audio
  const preFetchTriggered = useRef(false);
  const preFetchedAudioRef = useRef<string[]>([]);

  useEffect(() => {
    if (phase !== "drawing" || !voicePrefs.enabled || preFetchTriggered.current || drawnCards.length === 0) return;
    preFetchTriggered.current = true;

    const narrations = drawnCards.map(({ card, positionName }) =>
      getCardNarration(positionName, card.title)
    );

    fetch("/api/voice/tts-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: narrations,
        voiceId: voicePrefs.voiceId,
        speed: voicePrefs.speed,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.audio) {
          preFetchedAudioRef.current = data.audio;
        }
      })
      .catch(() => {/* Pre-fetch failed silently */});
  }, [phase, voicePrefs.enabled, voicePrefs.voiceId, voicePrefs.speed, drawnCards]);

  // Play card narration on reveal
  const lastPlayedRef = useRef(-1);
  useEffect(() => {
    if (!voicePrefs.enabled || preFetchedAudioRef.current.length === 0) return;

    const revealingIdx = cardStates.findIndex((s) => s === "revealing");
    if (revealingIdx >= 0 && revealingIdx > lastPlayedRef.current) {
      lastPlayedRef.current = revealingIdx;
      if (drawnCards[revealingIdx]) {
        const narration = getCardNarration(
          drawnCards[revealingIdx].positionName,
          drawnCards[revealingIdx].card.title
        );
        tts.speak(narration);
      }
    }
  }, [cardStates, voicePrefs.enabled, drawnCards, tts]);

  // Update narration during card reveal
  const revealingIndex = cardStates.findIndex((s) => s === "revealing");
  const cardNarration = useMemo(() => {
    if (revealingIndex >= 0 && drawnCards[revealingIndex]) {
      const { card, positionName } = drawnCards[revealingIndex];
      return getCardNarration(positionName, card.title);
    }
    return null;
  }, [revealingIndex, drawnCards]);

  useEffect(() => {
    if (cardNarration && phase === "drawing") {
      dispatch({ type: "SET_NARRATION", text: cardNarration });
    }
  }, [cardNarration, phase]);

  // ── API: Create reading ────────────────────────────────────────────────

  const createReadingTriggered = useRef(false);
  useEffect(() => {
    if (phase !== "creating" || createReadingTriggered.current) return;
    if (!selectedDeckId || !selectedSpread) return;
    createReadingTriggered.current = true;

    fetch("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deckId: selectedDeckId,
        spreadType: selectedSpread,
        question: question.trim() || undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          dispatch({
            type: "CREATION_ERROR",
            error: data.error || "Failed to create reading",
          });
          toast.error(data.error || "Failed to create reading");
          return;
        }

        dispatch({
          type: "CREATION_SUCCESS",
          readingId: data.data.reading.id,
          cards: data.data.cards.map(
            (rc: { card: Card; positionName: string }) => ({
              card: rc.card,
              positionName: rc.positionName,
            })
          ),
        });
      })
      .catch(() => {
        dispatch({
          type: "CREATION_ERROR",
          error: "Something went wrong. Please try again.",
        });
        toast.error("Something went wrong. Please try again.");
      });
  }, [phase, selectedDeckId, selectedSpread, question]);

  // ── Start card reveal when entering drawing phase ──────────────────────

  const revealStarted = useRef(false);
  useEffect(() => {
    if (phase === "drawing" && drawnCards.length > 0 && !revealStarted.current) {
      revealStarted.current = true;
      // Reset re-initializes cardStates with correct length, then start reveal
      resetReveal();
      setTimeout(() => startReveal(), 400);
    }
  }, [phase, drawnCards.length, startReveal, resetReveal]);

  // ── Action handlers ────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    createReadingTriggered.current = false;
    dispatch({ type: "START_CREATING" });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-20 bg-[#0a0118]/80 backdrop-blur-sm">
      <div className="h-[100dvh] flex flex-col overflow-hidden">
        {/* ── HEADER ZONE — always mounted ── */}
        <motion.div
          layout
          className="min-h-0 flex flex-col items-center justify-center px-4 pt-2"
          animate={{
            flex: zones.header,
            opacity: zones.header > 0 ? 1 : 0,
          }}
          transition={SPRINGS.zone}
        >
          <LyraSigil
            size={phase === "creating" ? "lg" : "md"}
            state={
              isRevealing || phase === "creating"
                ? "speaking"
                : isSetupPhase(phase)
                  ? "attentive"
                  : "dormant"
            }
          />

          {/* Narration */}
          <div className="mt-2 max-w-sm text-center">
            <LyraNarration
              text={state.narrationText}
              speed={18}
              className="text-center"
            />
          </div>

          {/* Step dots — visible during setup phases */}
          <div
            className={cn(
              "flex items-center gap-2 mt-2 transition-opacity duration-300",
              isSetupPhase(phase) ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
            )}
          >
            {SETUP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i < setupIndex
                      ? "bg-primary"
                      : i === setupIndex
                        ? "bg-primary/70 ring-2 ring-primary/30"
                        : "bg-white/15"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider hidden sm:inline",
                    i <= setupIndex ? "text-white/60" : "text-white/25"
                  )}
                >
                  {label}
                </span>
                {i < SETUP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "w-6 h-px",
                      i < setupIndex ? "bg-primary/50" : "bg-white/10"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CONTENT ZONE — always mounted ── */}
        <motion.div
          layout
          className="min-h-0 overflow-hidden"
          animate={{ flex: zones.content }}
          transition={SPRINGS.zone}
        >
          {/* Deck selector — always in DOM */}
          <div
            className={cn(
              "transition-opacity duration-300",
              phase === "deck"
                ? "h-full opacity-100 overflow-y-auto px-4"
                : "h-0 opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            <DeckSelector
              decks={decks}
              selectedDeckId={selectedDeckId}
              onSelect={(deckId) => dispatch({ type: "SELECT_DECK", deckId })}
            />
          </div>

          {/* Spread selector — always in DOM */}
          <div
            className={cn(
              "transition-opacity duration-300",
              phase === "spread"
                ? "h-full opacity-100 overflow-y-auto px-4"
                : "h-0 opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            {selectedDeck && (
              <SpreadSelector
                selectedSpread={selectedSpread}
                onSelect={(spread) =>
                  dispatch({ type: "SELECT_SPREAD", spread })
                }
                deckCardCount={selectedDeck.cardCount}
                userPlan={userPlan}
                userRole={userRole}
              />
            )}
          </div>

          {/* Intention input — always in DOM */}
          <div
            className={cn(
              "transition-opacity duration-300",
              phase === "intention"
                ? "h-full opacity-100 overflow-y-auto px-4"
                : "h-0 opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            <IntentionInput
              question={question}
              onChange={(q) => dispatch({ type: "SET_QUESTION", question: q })}
            />
          </div>

          {/* Creating state — loading */}
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 transition-opacity duration-300",
              phase === "creating"
                ? "h-full opacity-100"
                : "h-0 opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-2 border-primary/20 border-t-primary/60 rounded-full"
            />
          </div>

          {/* Card phases (drawing / interpreting / complete) — always in DOM */}
          <div
            className={cn(
              "flex flex-col transition-opacity duration-300",
              cardPhase
                ? "h-full opacity-100"
                : "h-0 opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            {/* Card spread — full during drawing, shrinks during interpreting */}
            <motion.div
              layout
              className="min-h-0 flex items-center justify-center overflow-hidden"
              animate={{
                flex: phase === "drawing" ? 1 : 0,
                opacity: phase === "drawing" ? 1 : 0,
              }}
              transition={SPRINGS.zone}
            >
              {selectedSpread && drawnCards.length > 0 && (
                <div className="py-2">
                  <SpreadLayout
                    spreadType={selectedSpread}
                    cards={drawnCards}
                    cardStates={cardStates}
                  />
                </div>
              )}
            </motion.div>

            {/* Compact card strip — appears during interpreting */}
            <motion.div
              layout
              className="shrink-0 overflow-hidden"
              animate={{
                height: isInterpreting ? "auto" : 0,
                opacity: isInterpreting ? 1 : 0,
              }}
              transition={SPRINGS.zone}
            >
              {drawnCards.length > 0 && (
                <CompactCardStrip cards={drawnCards} className="justify-center" />
              )}
            </motion.div>

            {/* Interpretation — grows from nothing */}
            <motion.div
              layout
              className="min-h-0 overflow-y-auto px-4"
              animate={{
                flex: isInterpreting ? 1 : 0,
                opacity: isInterpreting ? 1 : 0,
              }}
              transition={SPRINGS.zone}
            >
              {readingId && isInterpreting && (
                <div className="max-w-xl mx-auto pb-4">
                  <ReadingInterpretation
                    readingId={readingId}
                    existingInterpretation={null}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ── ACTION ZONE — always mounted ── */}
        <motion.div
          layout
          className="min-h-0 flex items-center justify-center px-4 py-2"
          animate={{
            flex: zones.action,
            opacity: zones.action > 0 ? 1 : 0,
          }}
          transition={SPRINGS.zone}
        >
          {/* Setup phases — Back / Next */}
          {isSetupPhase(phase) && (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (setupIndex === 0) {
                    router.back();
                  } else {
                    dispatch({ type: "GO_BACK" });
                  }
                }}
                className="gap-2 min-h-[44px] text-white/60 hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {phase === "intention" ? (
                <Button
                  onClick={() => dispatch({ type: "START_CREATING" })}
                  className="gap-2 min-h-[44px] bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
                >
                  <LyraSigil size="sm" state="attentive" />
                  Draw the Cards
                </Button>
              ) : (
                /* deck and spread phases auto-advance on select, but show a subtle hint */
                <div className="text-xs text-white/30">
                  {phase === "deck" ? "Tap a deck to continue" : "Tap a spread to continue"}
                </div>
              )}
            </div>
          )}

          {/* Creating — show error retry */}
          {phase === "creating" && error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRINGS.snappy}
            >
              <Button
                onClick={handleRetry}
                className="gap-2 min-h-[44px] bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            </motion.div>
          )}

          {/* Complete — view reading */}
          {phase === "complete" && readingId && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRINGS.snappy, delay: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <Button
                onClick={() => router.push(`/readings/${readingId}`)}
                className="gap-2 min-h-[44px] bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20"
              >
                View Full Reading
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  createReadingTriggered.current = false;
                  revealStarted.current = false;
                  preFetchTriggered.current = false;
                  lastPlayedRef.current = -1;
                  dispatch({ type: "RESET" });
                }}
                className="text-white/40 hover:text-white/60 min-h-[44px] text-sm"
              >
                Start a New Reading
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
