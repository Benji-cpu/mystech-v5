"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { LyraGuide } from "../v3/lyra-v3-guide";
import { LyraNarration } from "../v3/lyra-v3-narration";

import {
  lyraV4Reducer,
  initialV4State,
  getZoneProportions,
} from "./lyra-v4-state";
import type { LyraV4Phase } from "./lyra-v4-state";

import {
  MOCK_CONVERSATION,
  MOCK_INTERPRETATION,
  V4_NARRATION,
  ANCHOR_THEME_COLORS,
  getZodiacById,
  ELEMENT_STYLES,
  type Anchor,
  type ZodiacConstellation as ZodiacConstellationData,
} from "./lyra-v4-data";

import { SPRINGS } from "./lyra-v4-theme";
import { ZodiacPicker } from "./zodiac-picker";
import { ZodiacConstellation } from "./zodiac-constellation";
import { ConversationChat } from "./conversation-chat";
import { ReadingCards } from "./reading-cards";

// ── Phase labels ──────────────────────────────────────────────────────────

const PHASE_LABELS: Record<LyraV4Phase, string> = {
  birth_sky: "Birth Sky",
  gathering: "Star Gathering",
  reading: "The Reading",
  complete: "Journey Complete",
};

// ── Inner shell that can access useMockImmersive ─────────────────────────

function LyraV4ShellInner() {
  const { setMoodPreset } = useMockImmersive();
  const [state, dispatch] = useReducer(lyraV4Reducer, initialV4State);

  const phase = state.phase;
  const zones = getZoneProportions(phase, state.subPhase);

  // ── Mood sync ─────────────────────────────────────────────────────────

  useEffect(() => {
    const moodMap: Record<LyraV4Phase, string> = {
      birth_sky: "default",
      gathering: "midnight",
      reading: "card-reveal",
      complete: "golden",
    };
    setMoodPreset(moodMap[phase]);
  }, [phase, setMoodPreset]);

  // ── Conversation auto-play state ──────────────────────────────────────

  const [chatVisibleCount, setChatVisibleCount] = useState(0);
  const [chatTypingIndex, setChatTypingIndex] = useState(-1);
  const [highlightedAnchorId, setHighlightedAnchorId] = useState<string | null>(null);
  const completedMessagesRef = useRef(new Set<number>());
  const conversationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Reading state ─────────────────────────────────────────────────────

  const [currentNarration, setCurrentNarration] = useState("");
  const interpretIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Phase: birth_sky — zodiac selection ──────────────────────────────

  const handleZodiacSelect = useCallback((sign: ZodiacConstellationData) => {
    dispatch({ type: "SELECT_ZODIAC", zodiacId: sign.id, element: sign.element });
    dispatch({ type: "SET_LYRA_STATE", state: "speaking" });

    // Brief "selected" → then show greeting
    const t1 = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "greeting" });
      dispatch({ type: "SET_NARRATION", text: sign.lyraGreeting });
    }, 300);

    // After greeting, show "ready"
    const t2 = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
      dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
      dispatch({ type: "SET_NARRATION", text: V4_NARRATION.birth_sky.ready });
    }, 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Phase: gathering — conversation auto-play ─────────────────────────

  useEffect(() => {
    if (phase !== "gathering") return;
    if (state.subPhase !== "intro") return;

    // Reset conversation state
    setChatVisibleCount(0);
    setChatTypingIndex(-1);
    completedMessagesRef.current.clear();
    dispatch({ type: "SET_NARRATION", text: "" });

    // Start conversation after a brief moment
    const t = setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "conversing" });
      setChatVisibleCount(1);
      setChatTypingIndex(0);
    }, 500);

    return () => clearTimeout(t);
  }, [phase, state.subPhase]);

  const handleChatMessageComplete = useCallback((index: number) => {
    if (completedMessagesRef.current.has(index)) return;
    completedMessagesRef.current.add(index);

    const completedLine = MOCK_CONVERSATION[index];

    // Birth anchor if this message triggers one
    if (completedLine?.anchor) {
      const anchor: Anchor = {
        id: `anchor-${completedLine.anchor.ghostStarIndex}`,
        name: completedLine.anchor.name,
        theme: completedLine.anchor.theme,
        ghostStarIndex: completedLine.anchor.ghostStarIndex,
        color: ANCHOR_THEME_COLORS[completedLine.anchor.theme] ?? "#c9a94e",
      };
      dispatch({ type: "BIRTH_ANCHOR", anchor });
      dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
      setHighlightedAnchorId(anchor.id);

      setTimeout(() => {
        dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
        setHighlightedAnchorId(null);
      }, 1200);
    }

    const nextIndex = index + 1;

    if (nextIndex < MOCK_CONVERSATION.length) {
      // Delay before next message
      const delay = MOCK_CONVERSATION[nextIndex].speaker === "user" ? 600 : 500;
      conversationTimerRef.current = setTimeout(() => {
        setChatVisibleCount(nextIndex + 1);
        setChatTypingIndex(nextIndex);
      }, delay);
    } else {
      // All messages complete — trigger convergence
      setTimeout(() => {
        dispatch({ type: "TRIGGER_CONVERGENCE" });
        dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
        dispatch({ type: "SET_NARRATION", text: V4_NARRATION.gathering.convergence });
      }, 800);

      setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
        dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
      }, 3500);
    }
  }, []);

  // User messages complete instantly
  useEffect(() => {
    if (chatTypingIndex === -1) return;
    const msg = MOCK_CONVERSATION[chatTypingIndex];
    if (msg?.speaker === "user") {
      const t = setTimeout(() => handleChatMessageComplete(chatTypingIndex), 700);
      return () => clearTimeout(t);
    }
  }, [chatTypingIndex, handleChatMessageComplete]);

  // Cleanup conversation timer
  useEffect(() => {
    return () => {
      if (conversationTimerRef.current) clearTimeout(conversationTimerRef.current);
    };
  }, []);

  // ── Phase: reading — sequential card reveal + streaming interpretation ──

  const startReading = useCallback(() => {
    dispatch({ type: "SET_SUB_PHASE", subPhase: "drawing" });
    setCurrentNarration(V4_NARRATION.reading.drawing);

    const positions = ["past", "present", "future"] as const;
    let delay = 1200;

    positions.forEach((pos, i) => {
      setTimeout(() => {
        dispatch({ type: "REVEAL_CARD", index: i });
        dispatch({ type: "SET_LYRA_STATE", state: "speaking" });
        setCurrentNarration(V4_NARRATION.reading.positions[pos]);
        dispatch({ type: "SET_SUB_PHASE", subPhase: "revealing" });
      }, delay);
      delay += 2800;
    });

    // After all cards revealed — move to interpretation
    const interpretDelay = delay + 600;
    setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "interpreting" });
      setCurrentNarration(V4_NARRATION.reading.afterReveal);
      dispatch({ type: "SET_LYRA_STATE", state: "attentive" });

      // Stream the interpretation text character by character
      setTimeout(() => {
        setCurrentNarration("");
        let charIndex = 0;
        const totalChars = MOCK_INTERPRETATION.length;

        interpretIntervalRef.current = setInterval(() => {
          charIndex += 3; // advance 3 chars at a time for speed
          dispatch({ type: "SET_INTERPRETATION_PROGRESS", progress: Math.min(charIndex, totalChars) });

          if (charIndex >= totalChars) {
            if (interpretIntervalRef.current) clearInterval(interpretIntervalRef.current);
            // Mark reading complete after a moment
            setTimeout(() => {
              dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
              dispatch({ type: "SET_NARRATION", text: V4_NARRATION.reading.complete });
            }, 1500);
          }
        }, 15);
      }, 2000);
    }, interpretDelay);
  }, []);

  // Cleanup interpretation interval
  useEffect(() => {
    return () => {
      if (interpretIntervalRef.current) clearInterval(interpretIntervalRef.current);
    };
  }, []);

  // ── Advance phase handler ─────────────────────────────────────────────

  const advancePhase = useCallback(() => {
    dispatch({ type: "ADVANCE_PHASE" });
    dispatch({ type: "SET_NARRATION", text: "" });
    setCurrentNarration("");
    // Reset reading-specific state for re-entry
    if (state.phase === "gathering") {
      completedMessagesRef.current.clear();
      setChatVisibleCount(0);
      setChatTypingIndex(-1);
    }
  }, [state.phase]);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET" });
    setCurrentNarration("");
    setChatVisibleCount(0);
    setChatTypingIndex(-1);
    setHighlightedAnchorId(null);
    completedMessagesRef.current.clear();
    if (interpretIntervalRef.current) clearInterval(interpretIntervalRef.current);
  }, []);

  // ── Computed values ───────────────────────────────────────────────────

  const selectedSign = state.selectedZodiac ? getZodiacById(state.selectedZodiac) : null;
  const elementStyle = state.zodiacElement ? ELEMENT_STYLES[state.zodiacElement] : null;

  // Action button visibility
  const showActionBtn = (
    (phase === "birth_sky" && state.subPhase === "ready") ||
    (phase === "gathering" && (state.subPhase === "convergence" || state.subPhase === "complete")) ||
    (phase === "reading" && state.subPhase === "setup") ||
    (phase === "reading" && state.subPhase === "complete") ||
    phase === "complete"
  );

  const actionLabel = (() => {
    if (phase === "birth_sky") return "Begin the Gathering";
    if (phase === "gathering") return "Continue to Reading";
    if (phase === "reading" && state.subPhase === "setup") return "Draw the Cards";
    if (phase === "reading" && state.subPhase === "complete") return "Complete Journey";
    if (phase === "complete") return "Begin Again";
    return "Continue";
  })();

  const handleAction = () => {
    if (phase === "complete") {
      resetAll();
      return;
    }
    if (phase === "reading" && state.subPhase === "setup") {
      startReading();
      return;
    }
    advancePhase();
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden relative">
      {/* Phase label strip */}
      <div className="shrink-0 px-4 pt-3 pb-1 flex items-center gap-3">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={SPRINGS.snappy}
          className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex-1"
        >
          {PHASE_LABELS[phase]}
        </motion.p>

        {/* Lyra sigil — always visible */}
        <div className="shrink-0">
          <LyraGuide
            state={state.lyraState}
            size={28}
            breathing
          />
        </div>
      </div>

      {/* ── Constellation Zone ── */}
      <motion.div
        layout
        className="relative min-h-0 overflow-hidden flex items-center justify-center px-4"
        animate={{
          flex: zones.constellation,
          opacity: zones.constellation > 0.05 ? 1 : 0,
        }}
        transition={SPRINGS.zone}
      >
        <AnimatePresence mode="wait">
          {selectedSign ? (
            <motion.div
              key={`constellation-${selectedSign.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={SPRINGS.gentle}
              className="w-full h-full flex items-center justify-center"
            >
              <ZodiacConstellation
                zodiacId={selectedSign.id}
                anchors={state.anchors}
                compact={phase === "gathering" || phase === "reading"}
                className={cn(
                  "w-full h-full max-h-full",
                  phase === "gathering" || phase === "reading"
                    ? "max-w-[120px]"
                    : "max-w-[280px]"
                )}
              />
            </motion.div>
          ) : (
            // Placeholder before zodiac selected
            <motion.div
              key="no-zodiac"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border border-dashed border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Element indicator */}
        {elementStyle && phase !== "birth_sky" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2"
          >
            <span
              className="text-[9px] uppercase tracking-widest"
              style={{ color: elementStyle.haloColor + "80" }}
            >
              {elementStyle.label}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Content Zone ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: zones.content,
          opacity: zones.content > 0 ? 1 : 0,
        }}
        transition={SPRINGS.zone}
      >
        {/* birth_sky: Zodiac picker or post-selection narration */}
        <div
          className={cn(
            "h-full transition-opacity duration-300",
            phase === "birth_sky" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
          )}
        >
          {/* Picking subphase: show grid */}
          <div
            className={cn(
              "h-full overflow-y-auto px-4 py-2 transition-opacity duration-200",
              state.subPhase === "picking" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <p className="text-xs text-white/40 text-center mb-4 font-serif italic">
              {V4_NARRATION.birth_sky.picking}
            </p>
            <ZodiacPicker
              onSelect={handleZodiacSelect}
              selectedId={state.selectedZodiac}
              className="pb-4"
            />
          </div>

          {/* Post-selection: greeting narration */}
          <div
            className={cn(
              "h-full flex flex-col items-center justify-center px-6 gap-4 transition-opacity duration-300",
              (state.subPhase === "selected" || state.subPhase === "greeting" || state.subPhase === "ready")
                ? "opacity-100"
                : "opacity-0 pointer-events-none absolute inset-0"
            )}
          >
            {selectedSign && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRINGS.gentle}
                className="text-center space-y-2"
              >
                <p className="text-3xl">{selectedSign.symbol}</p>
                <p className="text-base font-serif text-amber-200/80">{selectedSign.name}</p>
                <p className="text-xs text-white/30">{selectedSign.dateRange}</p>
              </motion.div>
            )}

            {state.narrationText && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRINGS.gentle, delay: 0.2 }}
                className="max-w-sm text-center"
              >
                <LyraNarration
                  text={state.narrationText}
                  speed={18}
                  isLyra
                  onComplete={() => {
                    if (state.subPhase === "greeting") {
                      dispatch({ type: "SET_LYRA_STATE", state: "attentive" });
                    }
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* gathering: Conversation chat */}
        <div
          className={cn(
            "h-full px-4 transition-opacity duration-300",
            phase === "gathering" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
          )}
        >
          <ConversationChat
            messages={MOCK_CONVERSATION}
            visibleCount={chatVisibleCount}
            typingIndex={chatTypingIndex}
            anchors={state.anchors}
            highlightedAnchorId={highlightedAnchorId}
            onMessageComplete={handleChatMessageComplete}
            onAnchorTap={(id) => setHighlightedAnchorId(prev => prev === id ? null : id)}
            className="h-full"
          />
        </div>

        {/* reading: Card spread + interpretation */}
        <div
          className={cn(
            "h-full px-4 transition-opacity duration-300",
            phase === "reading" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
          )}
        >
          {phase === "reading" && state.subPhase === "setup" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRINGS.gentle}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <LyraGuide state="attentive" size={64} breathing />
              <p className="text-sm font-serif text-amber-200/70 italic text-center max-w-xs">
                {V4_NARRATION.reading.setup}
              </p>
            </motion.div>
          )}

          {phase === "reading" && state.subPhase !== "setup" && (
            <ReadingCards
              revealedCards={state.revealedCards}
              interpretationProgress={state.interpretationProgress}
              subPhase={state.subPhase}
              narrationText={currentNarration}
              onNarrationComplete={() => setCurrentNarration("")}
              className="h-full"
            />
          )}
        </div>

        {/* complete: Summary */}
        <div
          className={cn(
            "h-full px-4 transition-opacity duration-300",
            phase === "complete" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.gentle}
            className="h-full flex flex-col items-center justify-center gap-6 text-center"
          >
            {/* Star burst */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRINGS.burst}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-3xl text-amber-300">&#x2726;</span>
              </div>
              {/* Radiating particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/50"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: Math.cos((i / 6) * Math.PI * 2) * 40,
                    y: Math.sin((i / 6) * Math.PI * 2) * 40,
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ...SPRINGS.gentle,
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    marginTop: -3,
                    marginLeft: -3,
                  }}
                />
              ))}
            </motion.div>

            <div className="space-y-3 max-w-xs">
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRINGS.gentle, delay: 0.2 }}
                className="text-xl font-serif text-amber-200/90"
              >
                Journey Complete
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ ...SPRINGS.gentle, delay: 0.4 }}
                className="text-sm text-white/50 leading-relaxed italic font-serif"
              >
                {V4_NARRATION.complete.summary}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ ...SPRINGS.gentle, delay: 0.6 }}
                className="text-xs text-white/35 leading-relaxed"
              >
                {V4_NARRATION.complete.cta}
              </motion.p>
            </div>

            {/* Anchor constellation summary */}
            {state.anchors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRINGS.gentle, delay: 0.6 }}
                className="flex flex-wrap gap-2 justify-center max-w-xs"
              >
                {state.anchors.map((anchor, i) => (
                  <motion.span
                    key={anchor.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRINGS.snappy, delay: 0.7 + i * 0.08 }}
                    className="text-[10px] px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: (ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e") + "15",
                      borderColor: (ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e") + "40",
                      color: (ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e") + "cc",
                    }}
                  >
                    {anchor.name}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Action Zone ── */}
      <motion.div
        layout
        className="shrink-0 flex items-center justify-center px-4 py-3"
        animate={{
          flex: zones.action,
          opacity: zones.action > 0 ? 1 : 0,
        }}
        transition={SPRINGS.zone}
      >
        <AnimatePresence mode="wait">
          {showActionBtn && (
            <motion.button
              key={`action-${phase}-${state.subPhase}`}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={SPRINGS.snappy}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAction}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-medium touch-manipulation",
                "bg-amber-500/10 border border-amber-500/25 text-amber-200/90",
                "hover:bg-amber-500/15 transition-colors"
              )}
            >
              {actionLabel}
            </motion.button>
          )}

          {/* Loading indicator while conversation is in progress */}
          {phase === "gathering" && state.subPhase === "conversing" && (
            <motion.div
              key="gathering-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/20"
                  animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Progress during reading reveal */}
          {phase === "reading" && (state.subPhase === "drawing" || state.subPhase === "revealing") && (
            <motion.div
              key="reading-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: state.revealedCards.includes(i)
                      ? "#c9a94e"
                      : "rgba(255,255,255,0.1)",
                  }}
                  animate={
                    state.revealedCards.includes(i)
                      ? { scale: [1, 1.3, 1] }
                      : { opacity: [0.3, 0.7, 0.3] }
                  }
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Exported shell with provider wrapper ─────────────────────────────────

export function LyraV4Shell() {
  return (
    <MockImmersiveShell>
      <LyraV4ShellInner />
    </MockImmersiveShell>
  );
}
