"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookOpen, X } from "lucide-react";
import { toast } from "sonner";

import { useImmersive } from "@/components/immersive/immersive-provider";
import { useSequentialReveal } from "@/hooks/use-sequential-reveal";
import { useReadingPresentation } from "@/hooks/use-reading-presentation";
import { useResponsiveCardSize, getRevealTiming } from "@/hooks/use-responsive-card-size";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { getCardNarration, GUIDED_READING_CLOSE, GUIDED_READING_ENTER_CTA } from "@/components/guide/lyra-constants";
import { LyraSigil } from "@/components/guide/lyra-sigil";

import { DeckSelector } from "./deck-selector";
import { SpreadSelector } from "./spread-selector";
import { IntentionInput } from "./intention-input";
import { ChronicleContextPanel } from "./chronicle-context-panel";
import { CeremonySpreadLayout } from "./ceremony-spread-layouts";
import { CardByCardInterpretation } from "./card-by-card-interpretation";
import { ReadingFlipCard } from "./reading-flip-card";
import { AstrologyBar } from "./astrology-bar";
import { AstroNudgeBanner } from "@/components/shared/astro-nudge-banner";
import { JourneyContextBanner } from "./journey-context-banner";
import type { AstrologyProfile } from "@/types";

import {
  readingFlowReducer,
  initialReadingFlowState,
  isSetupPhase,
  isCardPhase,
  isPresentingPhase,
} from "./reading-flow-state";

import { SPRINGS, MOOD_MAP } from "./reading-flow-theme";

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

// ── Setup accordion ───────────────────────────────────────────────────

type SetupSection = "decks" | "spreads" | "intention" | null;

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
    router.push("/dashboard?initiated=true");
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
    activeCardIndex,
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
    ? { single: 1, three_card: 3, five_card: 5, celtic_cross: 10, daily: 1 }[selectedSpread]
    : 0;

  // Celtic Cross gets an expanded active card alongside the spread
  const isCelticCross = selectedSpread === "celtic_cross";
  const isCelticPresenting = isCelticCross && isPresenting;

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

  // ── Sequential accordion state ──────────────────────────────────────

  const initialActiveSection = useMemo((): SetupSection => {
    const saved = loadDefaults();
    if (decks.length === 1) {
      // Single deck auto-selected — skip to spreads or collapse all
      if (saved?.spreadType) return null;
      return "spreads";
    }
    if (!saved || saved.deckIds.length === 0) return "decks";
    const validDeckIds = saved.deckIds.filter((id) =>
      decks.some((d) => d.id === id)
    );
    if (validDeckIds.length === 0) return "decks";
    if (!saved.spreadType) return "spreads";
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount — decks is stable from SSR

  const [activeSection, setActiveSection] = useState<SetupSection>(
    initialActiveSection
  );

  // Visibility: sections after the active one are hidden until prereqs met
  const isSectionVisible = useCallback(
    (section: SetupSection): boolean => {
      if (section === "decks") return true;
      if (section === "spreads") return selectedDeckIds.length > 0;
      if (section === "intention")
        return selectedDeckIds.length > 0 && !!selectedSpread;
      return false;
    },
    [selectedDeckIds, selectedSpread]
  );

  // Auto-advance: spreads → intention only (deck auto-advance removed per Fix 1)
  const prevSpread = useRef(selectedSpread);
  const spreadAutoAdvanceFired = useRef(
    initialActiveSection === "intention" || initialActiveSection === null
  );

  useEffect(() => {
    const wasNull = prevSpread.current === null;
    prevSpread.current = selectedSpread;
    if (
      wasNull &&
      selectedSpread !== null &&
      activeSection === "spreads" &&
      !spreadAutoAdvanceFired.current
    ) {
      spreadAutoAdvanceFired.current = true;
      const timer = setTimeout(() => setActiveSection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSpread, activeSection]);

  // Manual toggle handler
  const handleSectionToggle = useCallback((section: SetupSection) => {
    setActiveSection((prev) => (prev === section ? null : section));
    if (section === "spreads") spreadAutoAdvanceFired.current = false;
  }, []);

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

  // ── Responsive card sizing ─────────────────────────────────────────────

  const actualCardCount = drawnCards.length || cardCount;
  const fullSize = useResponsiveCardSize(actualCardCount, false);
  const compactSize = useResponsiveCardSize(actualCardCount, true);
  const currentSize = isPresenting ? compactSize : fullSize;

  // ── Card zone height — computed from actual card dimensions ───────────
  const cardZoneStyle = useMemo((): CSSProperties | undefined => {
    if (!isPresenting || isCelticPresenting) return undefined;
    const { cardHeight, gap, isMobile } = compactSize;
    const padding = 48; // 24px breathing room top + bottom

    if (isMobile) {
      if (selectedSpread === "five_card") {
        // Mobile 5-card uses 3-row cross layout
        return { flex: "none", height: cardHeight * 3 + gap * 2 + padding };
      }
      // single or three_card — single horizontal row
      return { flex: "none", height: cardHeight + padding };
    }
    return undefined;
  }, [isPresenting, isCelticPresenting, compactSize, selectedSpread]);

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

  type ChronicleCardPreview = { id: string; title: string };
  type ChronicleMessage = { role: "user" | "assistant"; content: string };
  const [todayChronicleCard, setTodayChronicleCard] = useState<ChronicleCardPreview | null>(null);
  const [chronicleConversation, setChronicleConversation] = useState<ChronicleMessage[] | null>(null);
  const [chronicleNotes, setChronicleNotes] = useState("");
  const chronicleFetched = useRef(false);

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

  // ── API: Create reading ────────────────────────────────────────────────

  const createReadingTriggered = useRef(false);
  useEffect(() => {
    if (phase !== "creating" || createReadingTriggered.current) return;
    if (selectedDeckIds.length === 0 || !selectedSpread) return;
    createReadingTriggered.current = true;
    devLog("creating", "API call started");

    fetch("/api/readings", {
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

  // ── Manual advance handler ───────────────────────────────────────────

  const handleAdvanceCard = useCallback(() => {
    tts.stop();
    const isLastCard = presentingCardIndex >= drawnCards.length - 1;
    if (isLastCard) {
      dispatch({ type: "COMPLETE" });
    } else {
      dispatch({ type: "ADVANCE_CARD" });
    }
  }, [tts, presentingCardIndex, drawnCards.length]);

  // ── Speak section text when complete ──────────────────────────────────

  useEffect(() => {
    if (!voicePrefs.enabled || phase !== "presenting") return;
    if (lastSpokenSection.current >= presentingCardIndex) return;
    if (!isCurrentSectionComplete) return;
    const section = presentation.object?.cardSections?.[presentingCardIndex];
    if (!section?.text) return;
    lastSpokenSection.current = presentingCardIndex;
    tts.speak(section.text);
  }, [phase, presentingCardIndex, isCurrentSectionComplete, voicePrefs.enabled, presentation.object, tts]);

  // ── Status text (only during drawing phase) ──────────────────────────

  const statusText = useMemo(() => {
    if (phase === "creating") return `Drawing ${selectedSpread?.replace("_", " ")}...`;
    if (phase === "drawing") return isSettled ? "Lyra contemplates your spread..." : "The cards are settling...";
    return null;
  }, [phase, selectedSpread, isSettled]);

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

  useEffect(() => {
    if (phase !== "presenting") return;
    const timer = setTimeout(() => {
      // If we have partial data, force-complete; otherwise reset
      if (presentation.object?.cardSections?.length) {
        dispatch({ type: "COMPLETE" });
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
  }, [phase, presentation.object]);

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

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 h-[100dvh] flex flex-col overflow-hidden">
      {/* ── ZONE 0: GUIDED LOADING — only visible in guided mode before reading begins ── */}
      <motion.div
        layout
        animate={{
          opacity: guided && isInSetup ? 1 : 0,
          flex: guided && isInSetup ? 1 : 0,
        }}
        transition={SPRINGS.zone}
        className="min-h-0 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm text-white/50 italic font-serif"
          >
            Let us begin...
          </motion.div>
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
        </div>
      </motion.div>

      {/* ── ZONE 1: SETUP ZONE — collapses after begin; hidden in guided mode ── */}
      <motion.div
        layout
        animate={{
          height: isInSetup && !guided ? "auto" : 0,
          opacity: isInSetup && !guided ? 1 : 0,
        }}
        transition={SPRINGS.zone}
        className="overflow-hidden shrink-0"
      >
        <div className="px-4 sm:px-6 pt-24 pb-6 max-w-3xl mx-auto w-full overflow-y-auto max-h-[85dvh]">
          {/* Astrology nudge — hidden once profile exists */}
          {!astroProfile && <AstroNudgeBanner className="mb-4" />}

          {/* Chronicle card chip — auto-include today's forged card */}
          <AnimatePresence>
            {todayChronicleCard && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="mb-4"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl",
                    "bg-white/5 backdrop-blur-xl border",
                    chronicleCardId
                      ? "border-[#c9a94e]/50 shadow-[0_0_12px_rgba(201,169,78,0.12)]"
                      : "border-white/10 opacity-60"
                  )}
                >
                  <BookOpen className="w-4 h-4 text-[#c9a94e] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-white/50 leading-none block mb-0.5">
                      Today&apos;s Chronicle Card
                    </span>
                    <span className="text-sm text-white/90 font-medium truncate block">
                      &ldquo;{todayChronicleCard.title}&rdquo;
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (chronicleCardId) {
                        dispatch({ type: "SET_CHRONICLE_CARD", chronicleCardId: null });
                      } else {
                        dispatch({ type: "SET_CHRONICLE_CARD", chronicleCardId: todayChronicleCard.id });
                      }
                    }}
                    aria-label={chronicleCardId ? "Remove Chronicle card from reading" : "Re-add Chronicle card to reading"}
                    className="shrink-0 p-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deck selector */}
          {decks.length > 1 ? (
            <DeckSelector
              decks={decks}
              selectedDeckIds={selectedDeckIds}
              onToggle={(deckId) => dispatch({ type: "TOGGLE_DECK", deckId })}
              collapsible
              expanded={activeSection === "decks"}
              onToggleExpanded={() => handleSectionToggle("decks")}
              className="mb-4"
            />
          ) : (
            <DeckSelector
              decks={decks}
              selectedDeckIds={selectedDeckIds}
              onToggle={(deckId) => dispatch({ type: "TOGGLE_DECK", deckId })}
              compact
              className="mb-4"
            />
          )}

          {/* Spread selector — visible once decks selected */}
          {isSectionVisible("spreads") && (
            <SpreadSelector
              selectedSpread={selectedSpread}
              onSelect={(spread) =>
                dispatch({ type: "SELECT_SPREAD", spread })
              }
              deckCardCount={totalCardCount}
              userPlan={userPlan}
              userRole={userRole}
              collapsible
              expanded={activeSection === "spreads"}
              onToggleExpanded={() => handleSectionToggle("spreads")}
              className="mb-4"
            />
          )}

          {/* Path context banner — visible once spread selected, non-dismissable */}
          {isSectionVisible("intention") && pathPosition && (state.journeyPathId || pathPacingBlocked) && (
            <JourneyContextBanner
              circleName={pathPosition.circleName}
              circleNumber={pathPosition.circleNumber}
              pathName={pathPosition.pathName}
              retreatName={pathPosition.retreatName}
              waypointName={pathPosition.waypointName}
              suggestedIntention={pathPosition.suggestedIntention}
              pacingBlocked={pathPacingBlocked}
              nextAvailableAt={pathPosition.nextAvailableAt ?? undefined}
              className="mb-4"
            />
          )}

          {/* Question input — chronicle context panel for handoffs, editable for normal readings */}
          {isSectionVisible("intention") && (
            isChronicleHandoff && question ? (
              <ChronicleContextPanel
                conversation={chronicleConversation ?? []}
                question={question}
                notes={chronicleNotes}
                onNotesChange={setChronicleNotes}
                className="mb-6"
              />
            ) : (
              !(pathPosition && state.journeyPathId && state.journeySuggestedIntention) && (
                <IntentionInput
                  question={question}
                  onChange={(q) => dispatch({ type: "SET_QUESTION", question: q })}
                  collapsible
                  expanded={activeSection === "intention"}
                  onToggleExpanded={() => handleSectionToggle("intention")}
                  className="mb-6"
                />
              )
            )
          )}

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive text-center mb-4"
            >
              {error}
            </motion.p>
          )}

          {/* Begin Reading button */}
          <div className="flex justify-center pb-20">
            <motion.button
              whileHover={canBegin ? { scale: 1.05 } : {}}
              whileTap={canBegin ? { scale: 0.95 } : {}}
              onClick={handleBeginReading}
              disabled={!canBegin}
              className={cn(
                "px-8 py-3 rounded-xl font-medium text-sm",
                "transition-all duration-300",
                canBegin
                  ? "bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118] shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              Begin Reading
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── ZONE 2: CARD ZONE — always mounted, grows after setup ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden flex flex-col"
        animate={{
          flex: showCards
            ? isPresenting
              ? isCelticPresenting
                ? "0 0 55%"
                : selectedSpread === "five_card" ? "0 0 36%" : "0 0 30%"
              : "1 1 0%"
            : "0 0 0px",
          opacity: showCards ? 1 : 0,
        }}
        transition={SPRINGS.zone}
        style={cardZoneStyle}
      >
        {/* Status text — only during drawing phase */}
        {statusText && !isPresenting && (
          <div className="shrink-0 text-center py-2 px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center justify-center gap-2"
              >
                {isSettled && phase === "drawing" && (
                  <LyraSigil size="sm" state="speaking" />
                )}
                <p className="text-[#c9a94e] text-sm sm:text-base">
                  {renderBoldMarkdown(statusText)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Card spread — stays in layout through all card phases */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-2">
          {showCards && (
            <div className={cn(
              "w-full h-full",
              isCelticPresenting ? "max-w-5xl flex flex-row items-center gap-2 sm:gap-4" : "max-w-4xl"
            )}>
              <div className={isCelticPresenting ? "flex-1 min-h-0 min-w-0" : "w-full h-full"}>
                <CeremonySpreadLayout
                  spreadType={selectedSpread!}
                  cards={
                    drawnCards.length > 0
                      ? drawnCards
                      : Array.from({ length: cardCount }).map((_, i) => ({
                          card: {
                            id: `placeholder-${i}`,
                            deckId: "",
                            cardNumber: i,
                            title: "",
                            meaning: "",
                            guidance: "",
                            imageUrl: null,
                            imagePrompt: null,
                            imageStatus: "pending" as const,
                            cardType: "general" as const,
                            originContext: null,
                            createdAt: new Date(),
                          },
                          positionName:
                            drawnCards[i]?.positionName ?? `Position ${i + 1}`,
                        }))
                  }
                  cardStates={
                    phase === "creating"
                      ? Array(cardCount).fill("hidden")
                      : reveal.cardStates
                  }
                  cardWidth={currentSize.cardWidth}
                  cardHeight={currentSize.cardHeight}
                  gap={currentSize.gap}
                  isMobile={currentSize.isMobile}
                  activeCardIndex={activeCardIndex}
                  showLabels={!isPresenting}
                />
              </div>

              {/* Celtic Cross — expanded active card alongside spread */}
              {isCelticPresenting && activeCardIndex !== null && drawnCards[activeCardIndex] && (
                <div className="shrink-0 flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCardIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <ReadingFlipCard
                        card={drawnCards[activeCardIndex].card}
                        positionName={drawnCards[activeCardIndex].positionName}
                        revealState={reveal.cardStates[activeCardIndex] ?? "hidden"}
                        cardWidth={currentSize.isMobile ? 120 : fullSize.isMobile ? 160 : 180}
                        cardHeight={currentSize.isMobile ? 180 : fullSize.isMobile ? 240 : 270}
                        isActive
                        showLabel
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── ASTROLOGY ZONE — thin strip, only when user has astro profile ── */}
      {astroProfile && (
        <motion.div
          layout
          className="shrink-0 overflow-hidden"
          animate={{
            height: isPresenting ? "auto" : 0,
            opacity: isPresenting ? 1 : 0,
          }}
          transition={SPRINGS.zone}
        >
          <AstrologyBar
            sunSign={astroProfile.sunSign}
            moonSign={astroProfile.moonSign}
            risingSign={astroProfile.risingSign}
            moonPhase={currentMoonPhase ?? undefined}
            activePlacement={activeAstroPlacement}
          />
        </motion.div>
      )}

      {/* ── ZONE 3: TEXT ZONE — grows during presenting ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: isPresenting ? "1 1 0%" : "0 0 0px",
          opacity: isPresenting ? 1 : 0,
        }}
        transition={{
          ...SPRINGS.zone,
          delay: isPresenting ? 0.2 : 0,
        }}
      >
        <div className="h-full overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-t-2xl mx-2 sm:mx-4 p-4 sm:p-6">
          {isPresenting && (
            <CardByCardInterpretation
              object={presentation.object}
              isStreaming={presentation.isStreaming}
              presentingCardIndex={presentingCardIndex}
              drawnCards={drawnCards}
              error={presentation.error}
              onRetry={handleReset}
              isCurrentSectionComplete={isCurrentSectionComplete}
              onAdvance={handleAdvanceCard}
              readingId={readingId}
              isLastCard={presentingCardIndex >= drawnCards.length - 1}
              journeyPathId={state.journeyPathId ?? undefined}
              guided={guided}
              onInitiationComplete={handleInitiationComplete}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────

function renderBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white/90 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
