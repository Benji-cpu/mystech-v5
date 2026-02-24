"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";

import {
  lyraV4Reducer,
  initialV4State,
  getZoneProportions,
} from "./lyra-v4-state";
import type { LyraV4Phase } from "./lyra-v4-state";

import {
  getZodiacById,
  MOCK_CONVERSATION,
  ANCHOR_THEME_COLORS,
  V4_NARRATION,
} from "./lyra-v4-data";
import type { ZodiacElement, Anchor } from "./lyra-v4-data";

import { LyraNarration } from "@/components/guide/lyra-narration";
import { ZodiacPicker } from "./zodiac-picker";
import { ZodiacConstellation } from "./zodiac-constellation";
import { ConversationChat } from "./conversation-chat";
import { ReadingCards } from "./reading-cards";
import { SPRINGS } from "./lyra-v4-theme";

// ── Phase labels ────────────────────────────────────────────────────────

const PHASE_LABELS: Record<LyraV4Phase, string> = {
  birth_sky: "Birth Sky",
  gathering: "The Gathering",
  reading: "The Reading",
  complete: "Complete",
};

// ── Shell Component ─────────────────────────────────────────────────────

export function LyraV4Shell() {
  const [state, dispatch] = useReducer(lyraV4Reducer, initialV4State);
  const { setMoodPreset } = useMockImmersive();

  const { phase, subPhase } = state;
  const zones = getZoneProportions(phase, subPhase);
  const selectedSign = state.selectedZodiac
    ? getZodiacById(state.selectedZodiac)
    : null;

  // ── Mood shifts per phase ──────────────────────────────────────────────

  useEffect(() => {
    const moodMap: Record<LyraV4Phase, string> = {
      birth_sky: "default",
      gathering: "default",
      reading: "card-draw",
      complete: "golden",
    };
    setMoodPreset(moodMap[phase]);
  }, [phase, setMoodPreset]);

  // ── Phase 1: Birth Sky — narration on entry ────────────────────────────

  useEffect(() => {
    if (phase !== "birth_sky") return;
    if (subPhase === "picking") {
      dispatch({
        type: "SET_NARRATION",
        text: V4_NARRATION.birth_sky.picking,
      });
    }
  }, [phase, subPhase]);

  // ── Phase 1: Zodiac selection handler ──────────────────────────────────

  const handleZodiacSelect = useCallback(
    (zodiacId: string, element: ZodiacElement) => {
      dispatch({ type: "SELECT_ZODIAC", zodiacId, element });

      const sign = getZodiacById(zodiacId);
      if (sign) {
        dispatch({ type: "SET_NARRATION", text: sign.lyraGreeting });
      }

      // Auto-transition through greeting → ready
      setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "greeting" });
        dispatch({
          type: "SET_NARRATION",
          text: V4_NARRATION.birth_sky.greeting,
        });
      }, 2000);

      setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "ready" });
        dispatch({
          type: "SET_NARRATION",
          text: V4_NARRATION.birth_sky.ready,
        });
      }, 3500);
    },
    []
  );

  // ── Phase 2: Gathering — auto-playing conversation ─────────────────────

  const conversationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const completedMessagesRef = useRef(new Set<number>());
  const [chatVisibleCount, setChatVisibleCount] = useState(0);
  const [chatTypingIndex, setChatTypingIndex] = useState(-1);

  // Start conversation on entering gathering phase
  useEffect(() => {
    if (phase !== "gathering") return;
    if (subPhase !== "conversing") return;

    dispatch({
      type: "SET_NARRATION",
      text: V4_NARRATION.gathering.intro,
    });

    // Start with first message after brief delay
    const t = setTimeout(() => {
      setChatVisibleCount(1);
      setChatTypingIndex(0);
    }, 800);
    return () => clearTimeout(t);
  }, [phase, subPhase]);

  const handleChatMessageComplete = useCallback(
    (index: number) => {
      if (completedMessagesRef.current.has(index)) return;
      completedMessagesRef.current.add(index);

      const nextIndex = index + 1;
      const completedLine = MOCK_CONVERSATION[index];

      // Extract anchor if present
      if (completedLine?.anchor) {
        const color =
          ANCHOR_THEME_COLORS[completedLine.anchor.theme] ?? "#c9a94e";
        const anchor: Anchor = {
          id: `anchor-${completedLine.anchor.ghostStarIndex}`,
          name: completedLine.anchor.name,
          theme: completedLine.anchor.theme,
          ghostStarIndex: completedLine.anchor.ghostStarIndex,
          color,
        };
        dispatch({ type: "ADD_ANCHOR", anchor });

        // Narration feedback based on anchor count
        const anchorCount =
          state.anchors.length + 1; // +1 because state hasn't updated yet
        if (anchorCount === 1) {
          dispatch({
            type: "SET_NARRATION",
            text: V4_NARRATION.gathering.firstAnchor,
          });
        } else if (anchorCount === 3) {
          dispatch({
            type: "SET_NARRATION",
            text: V4_NARRATION.gathering.midway,
          });
        }
      }

      // Advance to next message
      if (nextIndex < MOCK_CONVERSATION.length) {
        const delay =
          MOCK_CONVERSATION[nextIndex].speaker === "user" ? 600 : 400;
        conversationTimerRef.current = setTimeout(() => {
          setChatVisibleCount(nextIndex + 1);
          setChatTypingIndex(nextIndex);
        }, delay);
      } else {
        // Conversation complete → convergence
        setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "convergence" });
          dispatch({
            type: "SET_NARRATION",
            text: V4_NARRATION.gathering.convergence,
          });
        }, 1000);

        setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
          dispatch({
            type: "SET_NARRATION",
            text: V4_NARRATION.gathering.complete,
          });
        }, 4000);
      }
    },
    [state.anchors.length]
  );

  // Auto-complete user messages instantly
  useEffect(() => {
    if (chatTypingIndex === -1) return;
    const msg = MOCK_CONVERSATION[chatTypingIndex];
    if (msg?.speaker === "user") {
      const t = setTimeout(
        () => handleChatMessageComplete(chatTypingIndex),
        600
      );
      return () => clearTimeout(t);
    }
  }, [chatTypingIndex, handleChatMessageComplete]);

  // Cleanup conversation timer
  useEffect(() => {
    return () => {
      if (conversationTimerRef.current)
        clearTimeout(conversationTimerRef.current);
    };
  }, []);

  // ── Phase 3: Reading — card sequence ───────────────────────────────────

  const startReading = useCallback(() => {
    dispatch({ type: "SET_SUB_PHASE", subPhase: "drawing" });
    dispatch({
      type: "SET_NARRATION",
      text: V4_NARRATION.reading.drawing,
    });

    const positions = ["past", "present", "future"] as const;
    let delay = 1000;

    positions.forEach((pos, i) => {
      setTimeout(() => {
        dispatch({ type: "FLIP_CARD", index: i, state: "revealing" });
        dispatch({
          type: "SET_NARRATION",
          text: V4_NARRATION.reading.positions[pos],
        });

        setTimeout(() => {
          dispatch({ type: "FLIP_CARD", index: i, state: "revealed" });
        }, 600);
      }, delay);
      delay += 2500;
    });

    // All cards revealed → interpreting
    setTimeout(() => {
      dispatch({ type: "SET_SUB_PHASE", subPhase: "interpreting" });
      dispatch({
        type: "SET_NARRATION",
        text: V4_NARRATION.reading.afterReveal,
      });

      // Brief pause then show interpretation
      setTimeout(() => {
        dispatch({ type: "SHOW_INTERPRETATION" });
      }, 1500);
    }, delay + 500);
  }, []);

  // ── Phase navigation ──────────────────────────────────────────────────

  const advancePhase = useCallback(() => {
    dispatch({ type: "ADVANCE_PHASE" });
    completedMessagesRef.current.clear();
    setChatVisibleCount(0);
    setChatTypingIndex(-1);
  }, []);

  // ── Anchor tap handler ─────────────────────────────────────────────────

  const handleAnchorTap = useCallback(
    (anchorId: string) => {
      dispatch({
        type: "HIGHLIGHT_ANCHOR",
        id: state.highlightedAnchorId === anchorId ? null : anchorId,
      });
    },
    [state.highlightedAnchorId]
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* ── Constellation Zone (always mounted) ── */}
      <motion.div
        layout
        className="relative min-h-0 overflow-hidden flex items-center justify-center"
        animate={{
          flex: zones.constellation,
          opacity: zones.constellation > 0 ? 1 : 0,
        }}
        transition={SPRINGS.zone}
      >
        {/* Phase label */}
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.3, y: 0 }}
          className="absolute top-2 left-0 right-0 text-center text-[9px] uppercase tracking-[0.2em] text-white/30 z-10"
        >
          {PHASE_LABELS[phase]}
        </motion.p>

        {/* Zodiac constellation display */}
        {selectedSign && (
          <ZodiacConstellation
            sign={selectedSign}
            anchors={state.anchors}
            highlightedAnchorId={state.highlightedAnchorId}
            compact={phase === "gathering" || phase === "complete"}
            className={cn(
              "w-full h-full p-4",
              phase === "gathering" || phase === "complete"
                ? "max-w-[min(50vw,200px)] max-h-[min(50vw,200px)]"
                : "max-w-[min(85vw,400px)] max-h-[min(85vw,400px)]"
            )}
          />
        )}

        {/* Pre-selection placeholder: faint star field */}
        {!selectedSign && phase === "birth_sky" && (
          <div className="w-24 h-24 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl text-amber-300/20"
            >
              &#x2726;
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* ── Content Zone (always mounted) ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden"
        animate={{
          flex: zones.content,
          opacity: zones.content > 0 ? 1 : 0,
        }}
        transition={SPRINGS.zone}
      >
        {/* Birth Sky — Picker */}
        <div
          className={cn(
            "transition-opacity duration-300",
            phase === "birth_sky" && subPhase === "picking"
              ? "h-full opacity-100 overflow-y-auto"
              : "h-0 opacity-0 pointer-events-none overflow-hidden"
          )}
        >
          <ZodiacPicker
            onSelect={handleZodiacSelect}
            selectedId={state.selectedZodiac}
            className="pb-4"
          />
        </div>

        {/* Birth Sky — Post-selection (greeting + narration) */}
        <div
          className={cn(
            "flex flex-col items-center justify-center px-4 transition-opacity duration-300",
            phase === "birth_sky" &&
              subPhase !== "picking"
              ? "h-full opacity-100"
              : "h-0 opacity-0 pointer-events-none overflow-hidden"
          )}
        >
          {selectedSign && (
            <div className="text-center space-y-3 max-w-sm">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-serif text-amber-200/80"
              >
                {selectedSign.symbol} {selectedSign.name}
              </motion.p>
              {state.narrationText && (
                <LyraNarration text={state.narrationText} speed={20} />
              )}
            </div>
          )}
        </div>

        {/* Gathering — Conversation + Anchors */}
        <div
          className={cn(
            "transition-opacity duration-300",
            phase === "gathering"
              ? "h-full opacity-100"
              : "h-0 opacity-0 pointer-events-none overflow-hidden"
          )}
        >
          <ConversationChat
            messages={MOCK_CONVERSATION}
            visibleCount={chatVisibleCount}
            typingIndex={chatTypingIndex}
            onMessageComplete={handleChatMessageComplete}
            anchors={state.anchors}
            readinessPercent={state.readinessPercent}
            highlightedAnchorId={state.highlightedAnchorId}
            onAnchorTap={handleAnchorTap}
            convergenceFooter={
              subPhase === "convergence" || subPhase === "complete" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRINGS.gentle}
                  className="flex justify-center py-2"
                >
                  <div className="max-w-[90%] rounded-xl px-4 py-3 bg-gradient-to-r from-amber-900/10 to-purple-900/10 border border-amber-500/10 text-center">
                    <LyraNarration text={state.narrationText} speed={22} />
                  </div>
                </motion.div>
              ) : undefined
            }
          />
        </div>

        {/* Reading — Card spread + interpretation */}
        <div
          className={cn(
            "transition-opacity duration-300",
            phase === "reading"
              ? "h-full opacity-100"
              : "h-0 opacity-0 pointer-events-none overflow-hidden"
          )}
        >
          <ReadingCards
            cardFlipStates={state.cardFlipStates}
            interpretationVisible={state.interpretationVisible}
            narrationText={state.narrationText}
          />
        </div>

        {/* Complete — Summary */}
        <div
          className={cn(
            "flex flex-col items-center justify-center px-6 transition-opacity duration-300",
            phase === "complete"
              ? "h-full opacity-100"
              : "h-0 opacity-0 pointer-events-none overflow-hidden"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.gentle}
            className="text-center space-y-4 max-w-sm"
          >
            <p className="text-base font-serif text-amber-200/80 leading-relaxed">
              {V4_NARRATION.complete.summary}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {state.anchors.map((anchor) => (
                <span
                  key={anchor.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-white/5 border border-white/8"
                  style={{
                    color: ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        ANCHOR_THEME_COLORS[anchor.theme] ?? "#c9a94e",
                    }}
                  />
                  {anchor.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/30">
              {V4_NARRATION.complete.cta}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Action Zone (always mounted) ── */}
      <motion.div
        layout
        className="min-h-0 flex items-center justify-center px-4 py-2"
        animate={{
          flex: zones.action,
          opacity: zones.action > 0 ? 1 : 0,
        }}
        transition={SPRINGS.zone}
      >
        {/* Birth Sky — Begin (after zodiac selected) */}
        {phase === "birth_sky" && subPhase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.snappy}
          >
            <Button
              onClick={advancePhase}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20 min-h-[44px] px-6"
            >
              Begin the Journey
            </Button>
          </motion.div>
        )}

        {/* Gathering — See Reading (after convergence) */}
        {phase === "gathering" && subPhase === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.snappy}
          >
            <Button
              onClick={advancePhase}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20 min-h-[44px] px-6"
            >
              See Your Reading
            </Button>
          </motion.div>
        )}

        {/* Reading — Draw Cards */}
        {phase === "reading" && subPhase === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.snappy}
          >
            <Button
              onClick={startReading}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20 min-h-[44px] px-6"
            >
              Draw Cards
            </Button>
          </motion.div>
        )}

        {/* Reading — Complete */}
        {phase === "reading" && subPhase === "interpreting" && state.interpretationVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRINGS.snappy, delay: 2 }}
          >
            <Button
              onClick={advancePhase}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20 min-h-[44px] px-6"
            >
              Complete Journey
            </Button>
          </motion.div>
        )}

        {/* Complete — Restart */}
        {phase === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.snappy}
          >
            <Button
              onClick={() => {
                dispatch({
                  type: "GO_TO_PHASE",
                  phase: "birth_sky",
                  subPhase: "picking",
                });
                dispatch({ type: "RESET_CARDS" });
                completedMessagesRef.current.clear();
                setChatVisibleCount(0);
                setChatTypingIndex(-1);
              }}
              variant="ghost"
              className="text-white/40 hover:text-white/60 min-h-[44px]"
            >
              Start Over
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
