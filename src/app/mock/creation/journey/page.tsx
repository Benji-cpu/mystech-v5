"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import {
  MOCK_CONVERSATION,
  MOCK_THEMES,
  MOCK_CARDS,
  type MockCard,
} from "@/components/mock/mock-data";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { Button } from "@/components/ui/button";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const TYPING_DELAY_MS = 20; // ms per character for assistant messages
const MESSAGE_PAUSE_MS = 1500; // pause between messages

// ─── TYPES ──────────────────────────────────────────────────────────────────

type Phase =
  | "idle"
  | "conversation"
  | "ready"
  | "compression"
  | "forging"
  | "revealing"
  | "complete";

interface ThemeOrb {
  id: string;
  label: string;
  color: string;
}

interface State {
  phase: Phase;
  messageIndex: number;
  typedChars: number;
  visibleThemes: ThemeOrb[];
  spawnedCount: number;
}

type Action =
  | { type: "START" }
  | { type: "TYPE_CHAR" }
  | { type: "MESSAGE_COMPLETE" }
  | { type: "NEXT_MESSAGE" }
  | { type: "ADD_THEMES"; themes: ThemeOrb[] }
  | { type: "CONVERSATION_DONE" }
  | { type: "FORGE" }
  | { type: "START_FORGING" }
  | { type: "SPAWN_CARD" }
  | { type: "START_REVEALING" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, phase: "conversation", messageIndex: 0, typedChars: 0 };
    case "TYPE_CHAR":
      return { ...state, typedChars: state.typedChars + 1 };
    case "NEXT_MESSAGE":
      return {
        ...state,
        messageIndex: state.messageIndex + 1,
        typedChars: 0,
      };
    case "ADD_THEMES":
      return {
        ...state,
        visibleThemes: [...state.visibleThemes, ...action.themes],
      };
    case "CONVERSATION_DONE":
      return { ...state, phase: "ready" };
    case "FORGE":
      return { ...state, phase: "compression" };
    case "START_FORGING":
      return { ...state, phase: "forging", spawnedCount: 0 };
    case "SPAWN_CARD":
      return { ...state, spawnedCount: state.spawnedCount + 1 };
    case "START_REVEALING":
      return { ...state, phase: "revealing" };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return {
        phase: "idle",
        messageIndex: 0,
        typedChars: 0,
        visibleThemes: [],
        spawnedCount: 0,
      };
    default:
      return state;
  }
}

const initialState: State = {
  phase: "idle",
  messageIndex: 0,
  typedChars: 0,
  visibleThemes: [],
  spawnedCount: 0,
};

// ─── RESPONSIVE CARD SIZE HOOK ──────────────────────────────────────────────

function useResponsiveCardSize() {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  // 6-card grid: 2-col mobile, 3-col desktop
  const cols = isMobile ? 2 : 3;
  const gap = isMobile ? 8 : 12;
  const availableWidth = Math.min(viewportWidth - 48, 600); // px with padding
  const cardWidth = Math.floor((availableWidth - gap * (cols - 1)) / cols);
  const clampedWidth = Math.min(cardWidth, isMobile ? 140 : isTablet ? 160 : 180);
  const cardHeight = Math.round(clampedWidth * 1.5);

  return { cardWidth: clampedWidth, cardHeight, gap, isMobile };
}

// ─── FLIP CARD COMPONENT ────────────────────────────────────────────────────

interface FlipCardProps {
  card: MockCard;
  flipped: boolean;
  cardWidth: number;
  cardHeight: number;
  isActive?: boolean;
}

function FlipCard({ card, flipped, cardWidth, cardHeight, isActive }: FlipCardProps) {
  return (
    <div className="relative" style={{ perspective: 800, width: cardWidth, height: cardHeight }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: cardWidth,
          height: cardHeight,
        }}
      >
        {/* Front face (visible when flipped) */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <MockCardFront card={card} width={cardWidth} height={cardHeight} />
        </div>
        {/* Back face (visible when not flipped) */}
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <MockCardBack width={cardWidth} height={cardHeight} />
        </div>
      </motion.div>

      {/* Golden glow during active reveal */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.5] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 -m-4 rounded-2xl bg-[#ffd700]/30 blur-xl pointer-events-none"
        />
      )}
    </div>
  );
}

// ─── THEME PILL ─────────────────────────────────────────────────────────────

interface ThemePillProps {
  theme: ThemeOrb;
  index: number;
  isPulsing: boolean;
}

function ThemePill({ theme, index, isPulsing }: ThemePillProps) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isPulsing ? [1, 1.1, 1] : 1,
        opacity: 1,
      }}
      transition={
        isPulsing
          ? { scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }, opacity: { type: "spring", stiffness: 400, damping: 20, delay: index * 0.08 } }
          : { type: "spring", stiffness: 400, damping: 20, delay: index * 0.08 }
      }
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/90 border border-white/10"
      style={{
        backgroundColor: `${theme.color}20`,
        boxShadow: `0 0 12px ${theme.color}30, 0 0 4px ${theme.color}15`,
        borderColor: `${theme.color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: theme.color }}
      />
      {theme.label}
    </motion.span>
  );
}

// ─── MAIN CONTENT (PERSISTENT SHELL) ────────────────────────────────────────

function JourneyConversationContent() {
  const { setMoodPreset, setMood } = useMockImmersive();
  const [state, dispatch] = useReducer(reducer, initialState);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const forgingCards = MOCK_CARDS.slice(0, 6);
  const { cardWidth, cardHeight, gap, isMobile } = useResponsiveCardSize();

  const { cardStates, startReveal, reset: resetReveal } = useCardReveal({
    cardCount: 6,
    revealDuration: 1200,
    delayBetween: 600,
    onAllRevealed: () => dispatch({ type: "COMPLETE" }),
  });

  // Derived state
  const currentMessage = MOCK_CONVERSATION[state.messageIndex];
  const isLastMessage = state.messageIndex >= MOCK_CONVERSATION.length - 1;
  const isTypingDone = currentMessage
    ? state.typedChars >= currentMessage.content.length
    : true;
  const displayedMessages = MOCK_CONVERSATION.slice(0, state.messageIndex + 1);
  const readinessGlow = state.visibleThemes.length >= 6;

  // Zone visibility
  const showChat =
    state.phase === "conversation" ||
    state.phase === "ready" ||
    state.phase === "compression";
  const showCards =
    state.phase === "forging" ||
    state.phase === "revealing" ||
    state.phase === "complete";
  const showThemes =
    state.visibleThemes.length > 0 &&
    (state.phase === "conversation" ||
      state.phase === "ready" ||
      state.phase === "compression");

  // ─── Phase-based mood shifts ────────────────────────────────────────────
  useEffect(() => {
    switch (state.phase) {
      case "idle":
        setMoodPreset("default");
        break;
      case "conversation":
        if (state.visibleThemes.length === 0) {
          setMoodPreset("default");
        } else if (state.visibleThemes.length < 4) {
          setMood({ primaryHue: 280, sparkleColor: "#c9a94e" });
        } else if (state.visibleThemes.length < 6) {
          setMood({ primaryHue: 260, sparkleColor: "#7c9aff" });
        } else {
          setMood({ primaryHue: 45, sparkleColor: "#ffd700" });
        }
        break;
      case "ready":
        setMood({ primaryHue: 45, sparkleColor: "#ffd700" });
        break;
      case "compression":
        setMood({ primaryHue: 30, sparkleColor: "#ff8c00" });
        break;
      case "forging":
      case "revealing":
        setMood({ primaryHue: 50, sparkleColor: "#ffd700" });
        break;
      case "complete":
        setMoodPreset("completion");
        break;
    }
  }, [state.phase, state.visibleThemes.length, setMood, setMoodPreset]);

  // ─── Character-by-character typing ──────────────────────────────────────
  useEffect(() => {
    if (state.phase !== "conversation") return;
    if (!currentMessage) return;
    if (state.typedChars >= currentMessage.content.length) return;

    // User messages appear instantly
    if (currentMessage.role === "user") {
      const remaining = currentMessage.content.length - state.typedChars;
      for (let i = 0; i < remaining; i++) {
        dispatch({ type: "TYPE_CHAR" });
      }
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: "TYPE_CHAR" });
    }, TYPING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.phase, state.typedChars, currentMessage]);

  // ─── After message finishes typing → extract themes → advance ──────────
  useEffect(() => {
    if (state.phase !== "conversation") return;
    if (!currentMessage) return;
    if (state.typedChars < currentMessage.content.length) return;

    // Extract themes from assistant messages
    if (currentMessage.role === "assistant" && currentMessage.themes) {
      const newThemes: ThemeOrb[] = currentMessage.themes
        .map((themeId) => MOCK_THEMES.find((t) => t.id === themeId))
        .filter(Boolean)
        .map((t) => ({ id: t!.id, label: t!.label, color: t!.color }));

      if (newThemes.length > 0) {
        const themeTimer = setTimeout(() => {
          dispatch({ type: "ADD_THEMES", themes: newThemes });
        }, 300);
        return () => clearTimeout(themeTimer);
      }
    }

    // Advance to next message or mark conversation done
    if (isLastMessage) {
      const doneTimer = setTimeout(() => {
        dispatch({ type: "CONVERSATION_DONE" });
      }, MESSAGE_PAUSE_MS);
      return () => clearTimeout(doneTimer);
    }

    const nextTimer = setTimeout(() => {
      dispatch({ type: "NEXT_MESSAGE" });
    }, MESSAGE_PAUSE_MS);
    return () => clearTimeout(nextTimer);
  }, [state.phase, state.typedChars, currentMessage, isLastMessage]);

  // ─── Auto-scroll chat ──────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messageIndex, state.typedChars]);

  // ─── Compression → Forging auto-transition ────────────────────────────
  useEffect(() => {
    if (state.phase === "compression") {
      const timer = setTimeout(() => dispatch({ type: "START_FORGING" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // ─── Forging: spawn cards then start revealing ────────────────────────
  useEffect(() => {
    if (state.phase !== "forging") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 6; i++) {
      timers.push(
        setTimeout(() => dispatch({ type: "SPAWN_CARD" }), i * 400)
      );
    }
    // After all spawned, start revealing
    timers.push(
      setTimeout(() => {
        dispatch({ type: "START_REVEALING" });
        startReveal();
      }, 6 * 400 + 500)
    );
    return () => timers.forEach(clearTimeout);
  }, [state.phase, startReveal]);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleStart = useCallback(() => dispatch({ type: "START" }), []);
  const handleForge = useCallback(() => dispatch({ type: "FORGE" }), []);
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    resetReveal();
    setMoodPreset("default");
  }, [resetReveal, setMoodPreset]);

  // ─── Phase label helper ───────────────────────────────────────────────
  const phaseLabel: Record<Phase, string> = {
    idle: "Journey Conversation",
    conversation: "Journey Conversation",
    ready: "Journey Conversation",
    compression: "Gathering Themes...",
    forging: "Forging Your Cards...",
    revealing: "Revealing Your Deck...",
    complete: "Your Deck Has Been Forged",
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* ─── STATUS ZONE (shrink-0) ──────────────────────────────────────── */}
      <div className="shrink-0 px-3 sm:px-6 pt-3 sm:pt-6">
        {/* Back link — visible only in idle */}
        <motion.div
          animate={{
            opacity: state.phase === "idle" ? 1 : 0,
            height: state.phase === "idle" ? "auto" : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <Link
            href="/mock/creation"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Creation
          </Link>
        </motion.div>

        <motion.h1
          className="text-xl sm:text-2xl font-bold text-white/90 mb-2 sm:mb-4"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phaseLabel[state.phase]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {phaseLabel[state.phase]}
            </motion.span>
          </AnimatePresence>
        </motion.h1>
      </div>

      {/* ─── PRIMARY ZONE (flex: varies) ─────────────────────────────────── */}
      <motion.div
        animate={{
          flex: showChat || showCards || state.phase === "idle" ? "1 1 0%" : "0 0 0px",
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-0 overflow-hidden px-3 sm:px-6 flex flex-col"
      >
        {/* ── Idle CTA ── */}
        <motion.div
          animate={{
            opacity: state.phase === "idle" ? 1 : 0,
            flex: state.phase === "idle" ? "1 1 0%" : "0 0 0px",
            pointerEvents: state.phase === "idle" ? "auto" as const : "none" as const,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#c9a94e]" />
            </div>
            <p className="text-white/60 text-sm sm:text-base max-w-sm mx-auto mb-8">
              Begin a guided conversation to explore the themes and stories that will shape your oracle deck.
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Journey
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Chat zone ── */}
        <motion.div
          animate={{
            flex: showChat ? "1 1 0%" : "0 0 0px",
            opacity: showChat ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="min-h-0 overflow-hidden flex flex-col"
        >
          <div className="flex-1 min-h-0 max-w-lg mx-auto w-full flex flex-col">
            {/* Chat container with glass morphism */}
            <div
              className="flex-1 min-h-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden flex flex-col relative"
              style={{
                boxShadow: readinessGlow
                  ? "0 0 60px rgba(201,169,78,0.3), 0 0 20px rgba(255,255,255,0.1)"
                  : undefined,
              }}
            >
              {/* Messages scroll area */}
              <motion.div
                animate={{ opacity: state.phase === "compression" ? 0.2 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4"
              >
                <div className="space-y-3">
                  {displayedMessages.map((msg, idx) => {
                    const isCurrentMessage = idx === state.messageIndex;
                    const displayContent = isCurrentMessage
                      ? msg.content.slice(0, state.typedChars)
                      : msg.content;

                    return (
                      <motion.div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <div
                          className={`rounded-2xl px-3 py-2 max-w-[85%] text-sm ${
                            msg.role === "user"
                              ? "bg-primary/20 text-white/90"
                              : "bg-white/5 text-white/80"
                          }`}
                        >
                          {displayContent}
                          {isCurrentMessage &&
                            state.typedChars < msg.content.length &&
                            msg.role === "assistant" && (
                              <span className="inline-block w-0.5 h-4 bg-white/60 ml-0.5 animate-pulse" />
                            )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </motion.div>

              {/* Compression glow overlay */}
              <motion.div
                animate={{ opacity: state.phase === "compression" ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="w-32 h-32 rounded-full bg-[#ffd700]/20 blur-3xl" />
                <motion.div
                  animate={
                    state.phase === "compression"
                      ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-16 h-16 rounded-full bg-[#ffd700]/40 blur-xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Card zone ── */}
        <motion.div
          animate={{
            flex: showCards ? "1 1 0%" : "0 0 0px",
            opacity: showCards ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="min-h-0 overflow-hidden flex flex-col items-center justify-center"
        >
          {/* Card grid — 2-col mobile, 3-col desktop */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3"
            style={{ gap }}
          >
            {forgingCards.map((card, idx) => {
              const isSpawned = idx < state.spawnedCount || state.phase !== "forging";
              const isFlipped =
                cardStates[idx] === "revealing" || cardStates[idx] === "revealed";
              const isActive = cardStates[idx] === "revealing";

              return (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isSpawned ? 1 : 0,
                    opacity: isSpawned ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <FlipCard
                    card={card}
                    flipped={isFlipped}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    isActive={isActive}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* ─── THEME ZONE (flex: varies) ───────────────────────────────────── */}
      <motion.div
        animate={{
          height: showThemes ? "auto" : 0,
          opacity: showThemes ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="shrink-0 overflow-hidden px-3 sm:px-6"
      >
        <div
          className="max-w-lg mx-auto py-2 sm:py-3 relative"
          style={{
            boxShadow:
              readinessGlow && state.phase !== "compression"
                ? "0 0 40px rgba(201,169,78,0.15)"
                : undefined,
          }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {state.visibleThemes.map((theme, idx) => (
              <ThemePill
                key={theme.id}
                theme={theme}
                index={idx}
                isPulsing={state.phase === "compression"}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── CONTROL ZONE (shrink-0) ─────────────────────────────────────── */}
      <div className="shrink-0 py-3 sm:py-6 px-3 sm:px-6">
        <div className="relative h-12 flex items-center justify-center">
          {/* Journey unfolding status (during conversation) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-white/60 text-sm gap-2"
            animate={{
              opacity: state.phase === "conversation" ? 1 : 0,
              pointerEvents: state.phase === "conversation" ? "auto" as const : "none" as const,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Journey unfolding...
          </motion.div>

          {/* Forge button (when conversation is done) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: state.phase === "ready" ? 1 : 0,
              scale: state.phase === "ready" ? 1 : 0.9,
              pointerEvents: state.phase === "ready" ? "auto" as const : "none" as const,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              animate={
                readinessGlow
                  ? {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 40px rgba(201,169,78,0.5), 0 0 80px rgba(201,169,78,0.2)",
                        "0 0 60px rgba(201,169,78,0.7), 0 0 100px rgba(201,169,78,0.3)",
                        "0 0 40px rgba(201,169,78,0.5), 0 0 80px rgba(201,169,78,0.2)",
                      ],
                    }
                  : {}
              }
              transition={
                readinessGlow
                  ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  : {}
              }
              className="rounded-lg"
            >
              <Button
                onClick={handleForge}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ready to Forge Deck
              </Button>
            </motion.div>
          </motion.div>

          {/* Compression status */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: state.phase === "compression" ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <p className="text-[#ffd700] text-sm">Gathering themes...</p>
          </motion.div>

          {/* Forging/revealing status */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: state.phase === "forging" || state.phase === "revealing" ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse mr-2" />
            <p className="text-[#ffd700] text-sm">
              {state.phase === "forging" ? "Forging cards..." : "Revealing..."}
            </p>
          </motion.div>

          {/* Complete actions */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-3"
            animate={{
              opacity: state.phase === "complete" ? 1 : 0,
              y: state.phase === "complete" ? 0 : 12,
              pointerEvents: state.phase === "complete" ? "auto" as const : "none" as const,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: state.phase === "complete" ? 0.5 : 0,
            }}
          >
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
            <Button className="bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118]">
              View Deck
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────

export default function JourneyConversationPage() {
  return (
    <MockImmersiveShell>
      <JourneyConversationContent />
    </MockImmersiveShell>
  );
}
