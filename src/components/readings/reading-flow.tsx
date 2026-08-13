"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookOpen, Wand2, X } from "lucide-react";
import { toast } from "sonner";

import { useImmersive } from "@/components/immersive/immersive-provider";
import { useSequentialReveal } from "@/hooks/use-sequential-reveal";
import { useReadingPresentation } from "@/hooks/use-reading-presentation";
import { getRevealTiming } from "@/hooks/use-responsive-card-size";
import { useViewportHeight } from "@/hooks/use-element-size";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { getCardNarration, GUIDED_READING_CLOSE, GUIDED_READING_ENTER_CTA } from "@/components/guide/lyra-constants";
import { LyraSigil } from "@/components/guide/lyra-sigil";

import { DeckSelector } from "./deck-selector";
import { SpreadSelector } from "./spread-selector";
import { IntentionInput } from "./intention-input";
import { ChronicleContextPanel } from "./chronicle-context-panel";
import { AstrologyBar } from "./astrology-bar";
import { AstroNudgeBanner } from "@/components/shared/astro-nudge-banner";
import { JourneyContextBanner } from "./journey-context-banner";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { fetchWithUpgrade } from "@/lib/api/fetch-with-upgrade";
import { ReadingCompleteShare } from "./reading-complete-share";
import { ObstacleProposal } from "./obstacle-proposal";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import type { AstrologyProfile, CardImageStatus, CardType } from "@/types";

import { ReadingStage } from "./reading-stage";
import { ReadingHeader } from "./reading-header";
import { ReadingCardStage } from "./reading-card-stage";
import { ReadingColumn } from "./reading-column";
import { ReadingSetup } from "./reading-setup";
import { ReadingActionBar } from "./reading-action-bar";
import { mobileStageHeight } from "./reading-card-geometry";

import {
  readingFlowReducer,
  initialReadingFlowState,
  isSetupPhase,
  isCardPhase,
  isPresentingPhase,
} from "./reading-flow-state";

import { MOOD_MAP } from "./reading-flow-theme";

import type { Deck, PlanType, SpreadType, Card } from "@/types";

// ── Dev-only timing telemetry ─────────────────────────────────────────

const isDev = process.env.NODE_ENV === "development";
const flowStart = isDev ? performance.now() : 0;

function devLog(milestone: string, detail?: string) {
  if (!isDev) return;
  const elapsed = Math.round(performance.now() - flowStart);
  console.log(`[reading-flow] +${elapsed}ms ${milestone}${detail ? ` — ${detail}` : ""}`);
}

// ── localStorage key ──────────────────────────────────────────────────

const DEFAULTS_KEY = "mystech_reading_defaults";

/**
 * Key the reading's step is stored under inside the browser's history state.
 * Namespaced because the App Router keeps its own routing data in the same
 * object.
 */
const HISTORY_STEP_KEY = "mystechReadingStep";

type ReadingDefaults = {
  deckIds: string[];
  spreadType: SpreadType | null;
};

function loadDefaults(): ReadingDefaults | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReadingDefaults;
  } catch {
    return null;
  }
}

function saveDefaults(defaults: ReadingDefaults) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
  } catch {
    // localStorage might be full or disabled
  }
}

// ── Props ──────────────────────────────────────────────────────────────

interface ReadingFlowProps {
  decks: Deck[];
  userPlan?: PlanType;
  /** @deprecated Use userPlan instead */
  userRole?: string;
  /** When true, setup zone is bypassed and reading begins automatically */
  guided?: boolean;
  /** Pre-selected deck ID for guided mode */
  guidedDeckId?: string;
  /** Called after the user clicks "Enter your sanctuary" in guided mode */
  onInitiationComplete?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────

export function ReadingFlow({ decks, userPlan, userRole, guided, guidedDeckId, onInitiationComplete }: ReadingFlowProps) {
  const router = useRouter();
  const [isChronicleHandoff] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('source') === 'chronicle';
  });
  const [state, dispatch] = useReducer(
    readingFlowReducer,
    initialReadingFlowState
  );
  const { setMoodPreset } = useImmersive();

  // Default guided completion handler — marks initiation complete + navigates to dashboard
  const handleInitiationComplete = useCallback(async () => {
    if (onInitiationComplete) {
      onInitiationComplete();
      return;
    }
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/today?initiated=true");
  }, [onInitiationComplete, router]);
  const defaultsRestored = useRef(false);

  const {
    phase,
    selectedDeckIds,
    selectedSpread,
    question,
    readingId,
    drawnCards,
    error,
    presentingCardIndex,
    chronicleCardId,
  } = state;

  const selectedDecks = useMemo(
    () => decks.filter((d) => selectedDeckIds.includes(d.id)),
    [decks, selectedDeckIds]
  );
  const totalCardCount = useMemo(
    () => selectedDecks.reduce((sum, d) => sum + d.cardCount, 0),
    [selectedDecks]
  );

  const isInSetup = isSetupPhase(phase);
  const showCards = isCardPhase(phase);
  const isPresenting = isPresentingPhase(phase);
  const cardCount = selectedSpread
    ? { single: 1, three_card: 3, five_card: 5, celtic_cross: 10, daily: 1, quick: 1 }[selectedSpread]
    : 0;

  // The close: cards return to their arrangement while Lyra draws the reading
  // together. `complete` is a step the user reads, not a dead end.
  const isClosing = phase === "complete";

  // ── Guided mode: auto-select deck + spread and begin after brief delay ──

  const guidedAutoStarted = useRef(false);
  useEffect(() => {
    if (!guided || guidedAutoStarted.current) return;
    guidedAutoStarted.current = true;

    const deckToUse = guidedDeckId
      ? decks.find((d) => d.id === guidedDeckId)
      : decks[0];

    if (!deckToUse) return;

    dispatch({ type: "SELECT_DECK", deckId: deckToUse.id });
    dispatch({ type: "SELECT_SPREAD", spread: "three_card" });

    // Brief Lyra "attentive" moment before beginning
    const timer = setTimeout(() => {
      dispatch({ type: "BEGIN_READING" });
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guided, guidedDeckId, decks.length]);

  // ── Restore defaults from localStorage (or Chronicle handoff) ────────

  useEffect(() => {
    if (guided) return; // Guided mode handles its own setup above
    if (defaultsRestored.current) return;
    defaultsRestored.current = true;

    // Check for Chronicle handoff via sessionStorage
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('source') === 'chronicle') {
      try {
        const raw = sessionStorage.getItem('mystech_reading_handoff');
        if (raw) {
          const handoff = JSON.parse(raw) as {
            source: string;
            chronicleCardId?: string;
            question?: string;
            deckId?: string;
          };
          sessionStorage.removeItem('mystech_reading_handoff');

          if (handoff.deckId) dispatch({ type: "SELECT_DECK", deckId: handoff.deckId });
          dispatch({ type: "SELECT_SPREAD", spread: "three_card" });
          if (handoff.question) dispatch({ type: "SET_QUESTION", question: handoff.question });
          if (handoff.chronicleCardId) dispatch({ type: "SET_CHRONICLE_CARD", chronicleCardId: handoff.chronicleCardId });

          // Direct handoff: skip the setup zone entirely. The user already
          // chose deck + intention in the chronicle — making them re-confirm
          // here was the "two systems working together" friction Benji
          // flagged. To switch deck they re-enter via the chronicle.
          if (handoff.deckId && handoff.question) {
            dispatch({ type: "BEGIN_READING" });
          }

          return; // Skip localStorage defaults
        }
      } catch { /* sessionStorage unavailable */ }
    }

    const saved = loadDefaults();
    if (!saved) {
      // Auto-select single deck
      if (decks.length === 1) {
        dispatch({ type: "SELECT_DECK", deckId: decks[0].id });
      }
      return;
    }

    // Filter to only valid deck IDs the user still has
    const validDeckIds = saved.deckIds.filter((id) =>
      decks.some((d) => d.id === id)
    );

    dispatch({
      type: "RESTORE_DEFAULTS",
      deckIds: validDeckIds.length > 0 ? validDeckIds : decks.length === 1 ? [decks[0].id] : [],
      spread: saved.spreadType,
    });
  }, [decks]);

  // ── Save defaults after successful reading creation ───────────────────

  useEffect(() => {
    if (phase === "drawing" && selectedDeckIds.length > 0 && selectedSpread) {
      saveDefaults({ deckIds: selectedDeckIds, spreadType: selectedSpread });
    }
  }, [phase, selectedDeckIds, selectedSpread]);

  // ── Mood shifts ────────────────────────────────────────────────────────

  useEffect(() => {
    setMoodPreset(MOOD_MAP[phase]);
  }, [phase, setMoodPreset]);

  // ── Card stage sizing ──────────────────────────────────────────────────

  const actualCardCount = drawnCards.length || cardCount;

  // On mobile the card stage is a band above the reading; on desktop it is a
  // full-height column and this value is ignored. Derived from the live
  // viewport so the focus card is always whole — the old implementation
  // summed guessed constants and cropped the spread whenever they overshot.
  const viewportHeight = useViewportHeight();
  const stageHeight = useMemo(() => {
    if (viewportHeight <= 0 || !selectedSpread) return undefined;
    const mode =
      phase === "presenting" ? "focus" : phase === "complete" ? "closing" : "spread";
    return mobileStageHeight(viewportHeight, selectedSpread, mode);
  }, [viewportHeight, selectedSpread, phase]);

  // ── Sequential reveal hook ────────────────────────────────────────────

  const { revealDuration } = getRevealTiming(actualCardCount);

  const reveal = useSequentialReveal({
    cardCount: actualCardCount,
    revealDuration,
  });

  // ── AI presentation hook (lifted to shell) ────────────────────────────

  const presentation = useReadingPresentation();

  // ── Astrology profile ────────────────────────────────────────────────

  const [astroProfile, setAstroProfile] = useState<AstrologyProfile | null>(null);
  const astroFetched = useRef(false);

  useEffect(() => {
    if (astroFetched.current) return;
    astroFetched.current = true;
    fetch("/api/astrology/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setAstroProfile(data.data);
      })
      .catch(() => {});
  }, []);

  // ── Chronicle card ────────────────────────────────────────────────────

  type ChronicleCardPreview = {
    id: string;
    title: string;
    meaning: string;
    guidance: string;
    imageUrl: string | null;
    imageStatus: string;
    cardType: string;
  };
  type ChronicleMessage = { role: "user" | "assistant"; content: string };
  const [todayChronicleCard, setTodayChronicleCard] = useState<ChronicleCardPreview | null>(null);
  const [chronicleConversation, setChronicleConversation] = useState<ChronicleMessage[] | null>(null);
  const [chronicleNotes, setChronicleNotes] = useState("");
  const chronicleFetched = useRef(false);
  const { openCard: openChronicleCard, modalProps: chronicleModalProps } = useCardDetailModal();
  const { openCard: openCeremonyCard, modalProps: ceremonyModalProps } = useCardDetailModal();

  useEffect(() => {
    if (chronicleFetched.current) return;
    chronicleFetched.current = true;
    fetch("/api/chronicle/today")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.todayCard) {
          const card = data.data.todayCard as ChronicleCardPreview;
          setTodayChronicleCard(card);
          dispatch({ type: "SET_CHRONICLE_CARD", chronicleCardId: card.id });
        }
        if (data.success && data.data?.entry?.conversation?.length) {
          setChronicleConversation(data.data.entry.conversation as ChronicleMessage[]);
        }
      })
      .catch(() => {});
  }, []);

  // ── Path position (Path + Retreat + Waypoint) ──────────────────────

  type PathPositionPreview = {
    pathId: string;
    pathName: string;
    retreatId: string;
    retreatName: string;
    waypointId: string;
    waypointName: string;
    suggestedIntention: string;
    nextAvailableAt?: string | null;
    circleName?: string | null;
    circleNumber?: number | null;
  };
  const [pathPosition, setPathPosition] =
    useState<PathPositionPreview | null>(null);
  const [pathPacingBlocked, setPathPacingBlocked] = useState(false);
  const pathFetched = useRef(false);

  useEffect(() => {
    if (pathFetched.current) return;

    // Don't fetch path context for chronicle handoff readings — the chronicle
    // already recorded today's waypoint reading, and setting journeyWaypointId
    // would trigger canAdvanceWaypoint() to block same-day follow-on readings.
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('source') === 'chronicle') {
      pathFetched.current = true;
      return;
    }

    pathFetched.current = true;
    fetch("/api/paths/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.position) {
          const pos = data.data.position as PathPositionPreview;
          setPathPosition(pos);

          // Check if waypoint is pacing-blocked (nextAvailableAt in the future)
          const nextAt = pos.nextAvailableAt ? new Date(pos.nextAvailableAt) : null;
          const isPacingBlocked = !!nextAt && new Date() < nextAt;

          if (isPacingBlocked) {
            // Don't attach path context — let user do a casual reading
            setPathPacingBlocked(true);
          } else {
            dispatch({
              type: "SET_JOURNEY_CONTEXT",
              pathId: pos.pathId,
              retreatId: pos.retreatId,
              waypointId: pos.waypointId,
              suggestedIntention: pos.suggestedIntention,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Derive active astro placement from streaming object
  const activeAstroPlacement = useMemo(() => {
    if (!astroProfile || !isPresenting) return null;
    const sections = presentation.object?.cardSections;
    if (!sections || presentingCardIndex < 0) return null;
    const section = sections[presentingCardIndex];
    return section?.astroResonance?.relevantPlacement ?? null;
  }, [astroProfile, isPresenting, presentation.object, presentingCardIndex]);

  // Get current celestial context from the streaming object
  const currentMoonPhase = presentation.object?.astroContext?.celestialNote;

  // ── Voice narration ────────────────────────────────────────────────────

  const { preferences: voicePrefs } = useVoicePreferences();
  const tts = useTextToSpeech({
    voiceId: voicePrefs.voiceId ?? undefined,
    speed: voicePrefs.speed,
    enabled: voicePrefs.enabled,
  });

  // Surface audio errors to the user
  useEffect(() => {
    if (tts.audioError) {
      toast.error("Audio playback interrupted. You can continue reading without voice.");
      tts.clearError();
    }
  }, [tts.audioError, tts.clearError]);

  // Pre-fetch card narration audio
  const preFetchTriggered = useRef(false);

  useEffect(() => {
    if (
      phase !== "drawing" ||
      !voicePrefs.enabled ||
      preFetchTriggered.current ||
      drawnCards.length === 0
    )
      return;
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
    }).catch(() => {});
  }, [phase, voicePrefs.enabled, voicePrefs.voiceId, voicePrefs.speed, drawnCards]);

  // Play card narration when a card is revealed
  const lastPlayedRef = useRef(-1);
  useEffect(() => {
    if (!voicePrefs.enabled) return;

    const revealingIdx = reveal.cardStates.findIndex((s) => s === "revealing");
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
  }, [reveal.cardStates, voicePrefs.enabled, drawnCards, tts]);

  // (section TTS effect is defined below, after isCurrentSectionComplete)
  const lastSpokenSection = useRef(-1);
  const [textZoneVisible, setTextZoneVisible] = useState(false);

  // ── Auto-advance after audio ─────────────────────────────────────────
  const prevTtsState = useRef(tts.state);
  const audioSpokenForCard = useRef(-1);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── API: Create reading ────────────────────────────────────────────────

  const createReadingTriggered = useRef(false);
  useEffect(() => {
    if (phase !== "creating" || createReadingTriggered.current) return;
    if (selectedDeckIds.length === 0 || !selectedSpread) return;
    createReadingTriggered.current = true;
    devLog("creating", "API call started");

    fetchWithUpgrade("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deckIds: selectedDeckIds,
        spreadType: selectedSpread,
        question: (() => {
          const base = question.trim();
          const extra = chronicleNotes.trim();
          if (!base) return undefined;
          return extra ? `${base}\n\nAdditional context: ${extra}` : base;
        })(),
        chronicleCardId: chronicleCardId ?? undefined,
        journeyPathId: state.journeyPathId ?? undefined,
        journeyRetreatId: state.journeyRetreatId ?? undefined,
        journeyWaypointId: state.journeyWaypointId ?? undefined,
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

        devLog("created", `Reading ${data.data.reading.id} with ${data.data.cards.length} cards`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selectedDeckIds, selectedSpread, question, chronicleCardId, state.journeyPathId]);

  // ── Orchestration: drawing → presenting ────────────────────────────────

  // Split into three concerns:
  // 1. Start streaming immediately for performance
  // 2. Settle timer — after 1.2s cards have settled visually
  // 3. Gate presenting — only when settled (text zone has its own loading state)

  const streamStarted = useRef(false);
  const presentingStarted = useRef(false);
  const [isSettled, setIsSettled] = useState(false);

  // Stable ref for startStreaming to avoid re-triggering the effect
  const startStreamingRef = useRef(presentation.startStreaming);
  startStreamingRef.current = presentation.startStreaming;

  // 1. Start streaming immediately when drawing begins
  useEffect(() => {
    if (phase === "drawing" && drawnCards.length > 0 && readingId && !streamStarted.current) {
      streamStarted.current = true;
      devLog("streaming", "AI interpretation stream started");
      startStreamingRef.current(readingId);
    }
  }, [phase, drawnCards.length, readingId]);

  // 2. Settle timer — cards settled visually after 1.2s
  useEffect(() => {
    if (phase !== "drawing" || drawnCards.length === 0) return;
    const timer = setTimeout(() => {
      devLog("settled", "Cards visually settled after 1.2s");
      setIsSettled(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, drawnCards.length]);

  // 3. Gate presenting on isSettled only — text zone has its own loading state
  useEffect(() => {
    if (phase !== "drawing" || presentingStarted.current) return;
    if (!isSettled) return;

    presentingStarted.current = true;
    devLog("presenting", "Layout transition: drawing → presenting");
    dispatch({ type: "START_PRESENTING" });
  }, [phase, isSettled]);

  // ── Orchestration: reveal cards as sections become ready ──────────────

  // Track whether we've triggered a reveal for the current presentingCardIndex
  const lastRevealTriggered = useRef(-1);
  // Stable ref to avoid effect re-triggering from object identity changes
  const revealAtRef = useRef(reveal.revealAt);
  revealAtRef.current = reveal.revealAt;

  useEffect(() => {
    if (phase !== "presenting") return;
    if (lastRevealTriggered.current >= presentingCardIndex) return;

    // Flip the card immediately when it becomes the active presenting card
    lastRevealTriggered.current = presentingCardIndex;
    revealAtRef.current(presentingCardIndex);
  }, [phase, presentingCardIndex]);

  // ── Orchestration: advance to next card when section is complete ──────

  // A section is "complete" when the next section has started filling,
  // or synthesis has started, or streaming has ended
  const isCurrentSectionComplete = useMemo(() => {
    if (!isPresentingPhase(phase)) return false;
    const totalCards = drawnCards.length;
    const isLastCard = presentingCardIndex >= totalCards - 1;

    if (isLastCard) {
      // Last card: complete when synthesis starts or streaming ends
      return presentation.hasSynthesis || !presentation.isStreaming;
    }
    // Not last: complete when next section starts, OR streaming ended early (partial data)
    return presentation.isSectionReady(presentingCardIndex + 1) || !presentation.isStreaming;
  }, [phase, presentingCardIndex, drawnCards.length, presentation]);

  // ── Browser history: back/forward walks the cards ────────────────────
  //
  // The whole reading lives at one URL, so without this the Back button
  // ejects the reader to /story part-way through and the reading they were
  // in the middle of is simply gone. Each step pushes an entry, so Back
  // walks the spread in reverse and only leaves once it reaches the first
  // card.
  //
  // The step rides *inside* the existing history state rather than replacing
  // it — Next's App Router keeps its own routing data there — and the URL
  // never changes, so the router has nothing to re-resolve.

  const pushHistoryStep = useCallback((step: number) => {
    if (typeof window === "undefined") return;
    window.history.pushState(
      { ...window.history.state, [HISTORY_STEP_KEY]: step },
      ""
    );
  }, []);

  // Stamp the entry the reading begins on, so popping back to it lands on
  // card one instead of falling through to an entry we don't recognise.
  const historyAnchored = useRef(false);
  useEffect(() => {
    if (phase !== "presenting" || historyAnchored.current) return;
    if (typeof window === "undefined") return;
    historyAnchored.current = true;
    window.history.replaceState(
      { ...window.history.state, [HISTORY_STEP_KEY]: 0 },
      ""
    );
  }, [phase]);

  useEffect(() => {
    if (!isPresenting) return;

    const onPopState = (event: PopStateEvent) => {
      const step = (event.state as Record<string, unknown> | null)?.[
        HISTORY_STEP_KEY
      ];
      // No step on this entry means we've popped clear of the reading —
      // let the browser leave.
      if (typeof step !== "number") return;

      tts.stop();
      if (step >= drawnCards.length) {
        dispatch({ type: "COMPLETE" });
      } else {
        dispatch({ type: "SET_CARD", index: step });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isPresenting, drawnCards.length, tts]);

  // ── Manual advance handler ───────────────────────────────────────────

  const handleAdvanceCard = useCallback(() => {
    // Cancel any pending auto-advance
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvanceCountdown(false);
    tts.stop();
    const isLastCard = presentingCardIndex >= drawnCards.length - 1;
    if (isLastCard) {
      dispatch({ type: "COMPLETE" });
      pushHistoryStep(drawnCards.length);
    } else {
      dispatch({ type: "ADVANCE_CARD" });
      pushHistoryStep(presentingCardIndex + 1);
    }
  }, [tts, presentingCardIndex, drawnCards.length, pushHistoryStep]);

  // ── Speak section text when complete ──────────────────────────────────

  useEffect(() => {
    if (!voicePrefs.enabled || phase !== "presenting") return;
    if (lastSpokenSection.current >= presentingCardIndex) return;
    if (!isCurrentSectionComplete || !textZoneVisible) return;
    const section = presentation.object?.cardSections?.[presentingCardIndex];
    if (!section?.text) return;
    lastSpokenSection.current = presentingCardIndex;
    audioSpokenForCard.current = presentingCardIndex;
    tts.speak(section.text);
  }, [phase, presentingCardIndex, isCurrentSectionComplete, textZoneVisible, voicePrefs.enabled, presentation.object, tts]);

  // Auto-advance detection: playing → idle transition
  useEffect(() => {
    const prev = prevTtsState.current;
    prevTtsState.current = tts.state;

    if (
      prev === "playing" &&
      tts.state === "idle" &&
      voicePrefs.enabled &&
      isPresentingPhase(phase) &&
      audioSpokenForCard.current === presentingCardIndex &&
      isCurrentSectionComplete &&
      presentingCardIndex < drawnCards.length - 1
    ) {
      setAutoAdvanceCountdown(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setAutoAdvanceCountdown(false);
        dispatch({ type: "ADVANCE_CARD" });
      }, 1500);
    }
  }, [tts.state, voicePrefs.enabled, phase, presentingCardIndex, drawnCards.length, isCurrentSectionComplete]);

  // Cleanup auto-advance timer when leaving presenting phase or on unmount
  useEffect(() => {
    if (!isPresentingPhase(phase)) {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      setAutoAdvanceCountdown(false);
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Gate narration on the reading actually being on screen. The zones no
  // longer animate their own height, so this is driven off the phase with a
  // beat for the column to settle rather than an animation callback.
  useEffect(() => {
    if (!isPresenting) {
      setTextZoneVisible(false);
      return;
    }
    const timer = setTimeout(() => setTextZoneVisible(true), 350);
    return () => clearTimeout(timer);
  }, [isPresenting]);

  // ── Status text (drawing phases only) ────────────────────────────────

  const statusText = useMemo(() => {
    if (phase === "creating") return "Dealing your cards…";
    if (phase === "drawing")
      return isSettled ? "Lyra contemplates your spread…" : "The cards are settling…";
    return null;
  }, [phase, isSettled]);

  // ── Safety timeouts: prevent permanently stuck states ────────────────

  useEffect(() => {
    if (phase !== "drawing") return;
    const timer = setTimeout(() => {
      toast.error("Reading timed out. Please try again.");
      createReadingTriggered.current = false;
      streamStarted.current = false;
      presentingStarted.current = false;
      setIsSettled(false);
      dispatch({ type: "CREATION_ERROR", error: "Reading timed out. Please try again." });
    }, 30_000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Guards against a stalled *stream*, not against a slow reader. It is armed
  // only while tokens are still expected: once streaming ends there is nothing
  // left to be stuck on, and the user sets the pace from there.
  //
  // Previously this ran whenever `phase === "presenting"`, so spending more
  // than 60s on a card force-completed the reading and skipped every card the
  // reader hadn't reached yet.
  useEffect(() => {
    if (phase !== "presenting") return;
    if (!presentation.isStreaming) return;

    const timer = setTimeout(() => {
      // Partial data is still a reading — show what arrived rather than
      // throwing it away.
      if (presentation.object?.cardSections?.length) {
        stopRef.current();
      } else {
        toast.error("Interpretation timed out. Please try again.");
        createReadingTriggered.current = false;
        streamStarted.current = false;
        presentingStarted.current = false;
        dispatch({ type: "CREATION_ERROR", error: "Interpretation timed out. Please try again." });
      }
    }, Math.max(60_000, drawnCards.length * 20_000));
    return () => clearTimeout(timer);
  }, [phase, presentation.object, presentation.isStreaming, drawnCards.length]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleBeginReading = useCallback(() => {
    if (selectedDeckIds.length === 0 || !selectedSpread) return;
    dispatch({ type: "BEGIN_READING" });
  }, [selectedDeckIds, selectedSpread]);

  const handleReset = useCallback(() => {
    createReadingTriggered.current = false;
    preFetchTriggered.current = false;
    streamStarted.current = false;
    presentingStarted.current = false;
    setIsSettled(false);
    lastPlayedRef.current = -1;
    lastRevealTriggered.current = -1;
    lastSpokenSection.current = -1;
    reveal.reset();
    dispatch({ type: "RESET" });
  }, [reveal]);

  // Stable ref for stop — used internally by safety timeout
  const stopRef = useRef(presentation.stop);
  stopRef.current = presentation.stop;

  const canBegin = selectedDeckIds.length > 0 && !!selectedSpread;


  // ── Derived view state ────────────────────────────────────────────────

  const stageMode: "spread" | "focus" =
    phase === "presenting" ? "focus" : "spread";
  const isLastCard = presentingCardIndex >= drawnCards.length - 1;

  /** Face-down placeholders hold the arrangement while the API deals. */
  const stageCards = useMemo(() => {
    if (drawnCards.length > 0) return drawnCards;
    return Array.from({ length: cardCount }).map((_, i) => ({
      card: {
        id: `placeholder-${i}`,
        deckId: "",
        cardNumber: i,
        title: "",
        meaning: "",
        guidance: "",
        imageUrl: null,
        imageBlurData: null,
        imagePrompt: null,
        imageStatus: "pending" as const,
        cardType: "general" as const,
        originContext: null,
        createdAt: new Date(),
      },
      positionName: `Position ${i + 1}`,
    }));
  }, [drawnCards, cardCount]);

  const stageCardStates = useMemo(() => {
    if (phase === "creating") {
      return Array(cardCount).fill("hidden") as (
        | "hidden"
        | "revealing"
        | "revealed"
      )[];
    }
    // The close shows the whole spread open, including any card the reader
    // skipped past. A face-down card in the "whole picture" reads as an error.
    if (isClosing) {
      return Array(Math.max(cardCount, drawnCards.length)).fill("revealed") as (
        | "hidden"
        | "revealing"
        | "revealed"
      )[];
    }
    return reveal.cardStates;
  }, [phase, isClosing, cardCount, drawnCards.length, reveal.cardStates]);

  /** Rail taps may only land on cards Lyra has already spoken to. */
  const handleSelectCard = useCallback(
    (index: number) => {
      if (index === presentingCardIndex) return;
      if (index > presentingCardIndex) return;
      tts.stop();
      dispatch({ type: "GO_TO_CARD", index });
      // A rail tap is a step like any other, so Back returns to the card the
      // reader jumped away from.
      pushHistoryStep(index);
    },
    [presentingCardIndex, tts, pushHistoryStep]
  );

  // ── Header ────────────────────────────────────────────────────────────

  const trimmedQuestion = question.trim();

  const header = (
    <>
      <ReadingHeader
        backTarget="/story"
        backLabel="Story"
        title={isInSetup ? "New reading" : "Your reading"}
        subtitle={
          isInSetup
            ? "Consult the cards"
            : trimmedQuestion
              ? `“${trimmedQuestion}”`
              : null
        }
        progress={
          phase === "presenting" && drawnCards.length > 1
            ? { current: presentingCardIndex + 1, total: drawnCards.length }
            : null
        }
      />
      {astroProfile && isPresenting && (
        <div className="border-b" style={{ borderColor: "var(--line)" }}>
          <AstrologyBar
            sunSign={astroProfile.sunSign}
            moonSign={astroProfile.moonSign}
            risingSign={astroProfile.risingSign}
            moonPhase={currentMoonPhase ?? undefined}
            activePlacement={activeAstroPlacement}
          />
        </div>
      )}
    </>
  );

  // ── Setup banners ─────────────────────────────────────────────────────

  const setupBanners = (
    <>
      {!astroProfile && <AstroNudgeBanner />}

      <AnimatePresence>
        {todayChronicleCard && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-2.5",
              !chronicleCardId && "opacity-60"
            )}
            style={{
              borderColor: chronicleCardId ? "var(--accent-gold)" : "var(--line)",
              background: "var(--paper-card)",
            }}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() =>
                openChronicleCard({
                  id: todayChronicleCard.id,
                  title: todayChronicleCard.title,
                  meaning: todayChronicleCard.meaning,
                  guidance: todayChronicleCard.guidance,
                  imageUrl: todayChronicleCard.imageUrl,
                  imagePrompt: null,
                  imageStatus: todayChronicleCard.imageStatus as CardImageStatus,
                  cardType: todayChronicleCard.cardType as CardType,
                  originContext: null,
                })
              }
              aria-label="Preview Chronicle card"
            >
              <BookOpen
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--accent-gold)" }}
              />
              <span className="min-w-0 flex-1">
                <span
                  className="block text-[11px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--ink-mute)" }}
                >
                  Today&apos;s chronicle card
                </span>
                <span
                  className="block truncate text-sm font-medium"
                  style={{ color: "var(--ink)" }}
                >
                  {todayChronicleCard.title}
                </span>
              </span>
            </button>
            <button
              onClick={() =>
                dispatch({
                  type: "SET_CHRONICLE_CARD",
                  chronicleCardId: chronicleCardId ? null : todayChronicleCard.id,
                })
              }
              aria-label={
                chronicleCardId
                  ? "Remove Chronicle card from reading"
                  : "Re-add Chronicle card to reading"
              }
              className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-mute)" }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {pathPosition && (state.journeyPathId || pathPacingBlocked) && (
        <JourneyContextBanner
          circleName={pathPosition.circleName}
          circleNumber={pathPosition.circleNumber}
          pathName={pathPosition.pathName}
          retreatName={pathPosition.retreatName}
          waypointName={pathPosition.waypointName}
          suggestedIntention={pathPosition.suggestedIntention}
          pacingBlocked={pathPacingBlocked}
          nextAvailableAt={pathPosition.nextAvailableAt ?? undefined}
        />
      )}
    </>
  );

  // ── Secondary column ──────────────────────────────────────────────────

  const selectedSpreadLabel = selectedSpread
    ? SPREAD_LABELS[selectedSpread] ?? null
    : null;

  // ── Closed-row summaries ──────────────────────────────────────────────
  //
  // Each setup row has to carry its own answer while shut, or the reader has
  // to open all three to see what they are about to draw.

  const deckSummary =
    selectedDecks.length > 0 ? (
      <span className="flex min-w-0 items-center justify-end gap-2">
        <span className="flex shrink-0 -space-x-1.5">
          {selectedDecks.slice(0, 3).map((deck) => (
            <span
              key={deck.id}
              className="relative h-6 w-[18px] overflow-hidden rounded-[3px] border"
              style={{
                borderColor: "var(--line)",
                background: "var(--paper-card)",
              }}
            >
              {deck.coverImageUrl ? (
                <Image
                  src={deck.coverImageUrl}
                  alt=""
                  fill
                  sizes="18px"
                  className="object-cover"
                />
              ) : null}
            </span>
          ))}
        </span>
        <span className="truncate">
          {selectedDecks.length === 1
            ? selectedDecks[0].title
            : `${selectedDecks.length} decks`}
        </span>
      </span>
    ) : null;

  const spreadSummary = selectedSpread ? (
    <span className="flex items-center justify-end gap-2">
      <span className="truncate">{selectedSpreadLabel}</span>
      <span className="flex shrink-0 gap-[2px]" aria-hidden>
        {Array.from({ length: cardCount }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-[6px] rounded-[1px]"
            style={{ background: "var(--accent-gold)", opacity: 0.45 }}
          />
        ))}
      </span>
    </span>
  ) : null;

  const intentionSummary = trimmedQuestion ? (
    <span className="truncate italic">“{trimmedQuestion}”</span>
  ) : null;

  let secondary: React.ReactNode;

  if (isInSetup && !guided) {
    secondary = (
      <ReadingSetup
        banners={setupBanners}
        deckSummary={deckSummary}
        deckAnswered={selectedDeckIds.length > 0}
        deckStep={
          <DeckSelector
            decks={decks}
            selectedDeckIds={selectedDeckIds}
            onToggle={(deckId) => dispatch({ type: "TOGGLE_DECK", deckId })}
            hideLabel
          />
        }
        spreadSummary={spreadSummary}
        spreadEnabled={selectedDeckIds.length > 0}
        spreadAnswered={!!selectedSpread}
        spreadStep={
          <SpreadSelector
            selectedSpread={selectedSpread}
            onSelect={(spread) => dispatch({ type: "SELECT_SPREAD", spread })}
            deckCardCount={totalCardCount}
            userPlan={userPlan}
            userRole={userRole}
            hideLabel
          />
        }
        intentionEnabled={selectedDeckIds.length > 0 && !!selectedSpread}
        intentionSummary={intentionSummary}
        intentionStep={
          isChronicleHandoff && question ? (
            <ChronicleContextPanel
              conversation={chronicleConversation ?? []}
              question={question}
              onQuestionChange={(q) =>
                dispatch({ type: "SET_QUESTION", question: q })
              }
              onSubmit={canBegin ? handleBeginReading : undefined}
              notes={chronicleNotes}
              onNotesChange={setChronicleNotes}
            />
          ) : pathPosition &&
            state.journeyPathId &&
            state.journeySuggestedIntention ? (
            <p className="whisper text-sm" style={{ color: "var(--ink-mute)" }}>
              Your path has already set this reading&apos;s intention.
            </p>
          ) : (
            <IntentionInput
              question={question}
              onChange={(q) => dispatch({ type: "SET_QUESTION", question: q })}
              onSubmit={handleBeginReading}
              submitDisabledReason={
                canBegin ? null : "Choose a deck and a spread first."
              }
              hideLabel
            />
          )
        }
        error={error}
      />
    );
  } else if (!isPresenting) {
    // Creating / drawing / guided prelude — a held breath, not a blank panel.
    secondary = (
      <div className="mx-auto flex w-full max-w-[62ch] flex-col items-center gap-4 px-4 py-10 text-center">
        <LyraSigil size="sm" state={isSettled ? "speaking" : "attentive"} />
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText ?? "guided"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="whisper text-sm"
            style={{ color: "var(--ink-mute)" }}
          >
            {statusText ?? "Let us begin…"}
          </motion.p>
        </AnimatePresence>

        {/* Chronicle handoff bypasses setup — this is the way back out. */}
        {chronicleCardId && (phase === "creating" || phase === "drawing") && (
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("mystech_reading_handoff");
              window.location.assign("/readings/new");
            }}
            className="text-xs underline-offset-2 transition-opacity hover:underline hover:opacity-80"
            style={{ color: "var(--ink-faint)" }}
          >
            From your chronicle · Switch deck
          </button>
        )}
      </div>
    );
  } else {
    secondary = (
      <ReadingColumn
        object={presentation.object}
        isStreaming={presentation.isStreaming}
        presentingCardIndex={presentingCardIndex}
        error={presentation.error}
        onRetry={handleReset}
        isCurrentSectionComplete={isCurrentSectionComplete}
        isClosing={isClosing}
        closingSlot={
          isClosing ? (
            <div className="space-y-8">
              {guided ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <LyraSigil size="sm" state="attentive" />
                  <p
                    className="whisper max-w-xs text-sm leading-relaxed"
                    style={{ color: "var(--ink-mute)" }}
                  >
                    {GUIDED_READING_CLOSE}
                  </p>
                </div>
              ) : (
                readingId && (
                  <>
                    {state.journeyPathId && (
                      <ObstacleProposal readingId={readingId} />
                    )}
                    <ReadingCompleteShare
                      readingId={readingId}
                      spreadType={selectedSpread ?? undefined}
                    />
                    <Link
                      href={`/readings/${readingId}`}
                      className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                      style={{ color: "var(--ink-mute)" }}
                    >
                      <Wand2 className="h-3 w-3" />
                      Polish cards
                    </Link>
                  </>
                )
              )}
            </div>
          ) : null
        }
      />
    );
  }

  // ── Action bar ────────────────────────────────────────────────────────

  let action: React.ReactNode = null;

  if (isInSetup && !guided) {
    action = (
      <ReadingActionBar
        hint={
          canBegin
            ? [
                selectedSpreadLabel?.toLowerCase(),
                selectedDecks.length === 1
                  ? `from ${selectedDecks[0].title}`
                  : `from ${selectedDecks.length} decks`,
              ]
                .filter(Boolean)
                .join(" ")
            : "Choose a deck and a spread to begin."
        }
        label="Begin reading"
        onClick={handleBeginReading}
        disabled={!canBegin}
        // Matches the setup column's measure so the button lands under it.
        className="max-w-2xl"
      />
    );
  } else if (phase === "presenting") {
    action = (
      <ReadingActionBar
        hint={
          drawnCards.length > 1
            ? `${presentingCardIndex + 1} of ${drawnCards.length}`
            : undefined
        }
        label={isLastCard ? "The whole picture" : "Next card"}
        onClick={handleAdvanceCard}
        disabled={!isCurrentSectionComplete}
        countdown={autoAdvanceCountdown}
      />
    );
  } else if (isClosing) {
    action = guided ? (
      <ReadingActionBar
        label={GUIDED_READING_ENTER_CTA}
        onClick={handleInitiationComplete}
      />
    ) : readingId ? (
      <ReadingActionBar
        hint="Your reading is saved."
        label="View complete reading"
        onClick={() => router.push(`/readings/${readingId}`)}
        showChevron={false}
      />
    ) : null;
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <>
      <ReadingStage
        variant={showCards ? "split" : "single"}
        mobilePrimaryHeight={stageHeight}
        header={header}
        primary={
          selectedSpread ? (
            <ReadingCardStage
              spreadType={selectedSpread}
              cards={stageCards}
              cardStates={stageCardStates}
              mode={stageMode}
              activeIndex={Math.max(0, Math.min(presentingCardIndex, stageCards.length - 1))}
              onSelect={handleSelectCard}
              onOpenCard={openCeremonyCard}
            />
          ) : null
        }
        secondary={secondary}
        action={action}
      />

      <CardDetailModal {...chronicleModalProps} />
      <CardDetailModal {...ceremonyModalProps} />
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

const SPREAD_LABELS: Partial<Record<SpreadType, string>> = {
  single: "One card",
  three_card: "Three cards",
  five_card: "Five-card cross",
  celtic_cross: "Celtic cross",
};
