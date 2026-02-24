"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { V2State, V2Action } from "../lyra-v2-state";
import {
  MOCK_READING_INTERPRETATION,
  getAllCards,
  shuffleArray,
} from "@/app/mock/full/_shared/mock-data-v1";

interface ReadingPhaseProps {
  state: V2State;
  dispatch: React.Dispatch<V2Action>;
}

const POSITIONS = ["Past", "Present", "Future"] as const;
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

// Render interpretation text with **bold** → gold strong treatment
function InterpretationText({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <p
      className="font-serif text-sm leading-relaxed"
      style={{ color: "#e8e6f0" }}
    >
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong
              key={i}
              className="font-bold"
              style={{ color: "#c9a94e" }}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
      {isStreaming && (
        <span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle animate-pulse"
          style={{ backgroundColor: "#c9a94e" }}
        />
      )}
    </p>
  );
}

export function ReadingPhase({ state, dispatch }: ReadingPhaseProps) {
  const { revealedCards, interpretationStarted, interpretationComplete } = state;
  const [streamedText, setStreamedText] = useState("");
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable card selection across renders
  const readingCards = useMemo(() => {
    const all = getAllCards();
    const shuffled = shuffleArray(all);
    return shuffled.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allCardsRevealed = revealedCards.length >= 3;
  const isStreaming = interpretationStarted && !interpretationComplete;

  // Auto-start interpretation once all cards are revealed
  useEffect(() => {
    if (!allCardsRevealed || interpretationStarted) return;

    const timer = setTimeout(() => {
      dispatch({ type: "START_INTERPRETATION" });
    }, 800);

    return () => clearTimeout(timer);
  }, [allCardsRevealed, interpretationStarted, dispatch]);

  // Stream interpretation text character by character
  useEffect(() => {
    if (!interpretationStarted || interpretationComplete) return;

    const text = MOCK_READING_INTERPRETATION;
    let cursor = 0;
    setStreamedText("");

    streamIntervalRef.current = setInterval(() => {
      if (cursor < text.length) {
        const chunk = text.slice(cursor, cursor + 2);
        setStreamedText((prev) => prev + chunk);
        cursor += 2;
      } else {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        dispatch({ type: "COMPLETE_INTERPRETATION" });
      }
    }, 30);

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    };
  }, [interpretationStarted, interpretationComplete, dispatch]);

  const handleCardTap = (index: number) => {
    if (revealedCards.includes(index)) return;
    dispatch({ type: "REVEAL_CARD", index });
  };

  const showPanel = interpretationStarted;

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ pointerEvents: "none" }}
    >
      {/* Top — phase label */}
      <motion.div
        className="pt-12 flex flex-col items-center gap-2 px-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#c9a94e] text-sm select-none" aria-hidden>
            &#10022;
          </span>
          <p
            className="text-[10px] tracking-[0.25em] uppercase font-medium"
            style={{ color: "rgba(201,169,78,0.7)" }}
          >
            Star Reading
          </p>
          <span className="text-[#c9a94e] text-sm select-none" aria-hidden>
            &#10022;
          </span>
        </div>
      </motion.div>

      {/* Middle — card position labels floated over the 3D scene */}
      <div className="relative flex-1 pointer-events-none">
        {/* Position labels — "Past", "Present", "Future" */}
        {/* These float at fixed offsets and appear as cards are revealed */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-6 sm:gap-10">
            {POSITIONS.map((label, i) => {
              const isRevealed = revealedCards.includes(i);
              return (
                <AnimatePresence key={label}>
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ ...SPRING, delay: 0.3 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className="text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: "#c9a94e",
                          background: "rgba(201,169,78,0.1)",
                          border: "1px solid rgba(201,169,78,0.25)",
                        }}
                      >
                        {label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>

        {/* Instruction text — shown before all cards revealed */}
        <AnimatePresence>
          {!allCardsRevealed && (
            <motion.div
              className="absolute bottom-8 inset-x-0 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
            >
              <p
                className="font-serif text-sm italic text-center"
                style={{ color: "rgba(139,135,160,0.8)" }}
              >
                Tap each card to reveal your reading
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card tap zone — floating above the panel but within the middle zone */}
      {/* This is a thin transparent hit area for the 3 card buttons */}
      <div
        className="absolute left-0 right-0 flex items-end justify-center gap-4 sm:gap-6 px-4"
        style={{
          bottom: showPanel ? "calc(40vh + 8px)" : "96px",
          transition: "bottom 0.5s cubic-bezier(0.25,1,0.5,1)",
          pointerEvents: "auto",
        }}
      >
        {readingCards.map((card, i) => {
          const isRevealed = revealedCards.includes(i);
          const canTap = !isRevealed && !interpretationStarted;

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardTap(i)}
              disabled={!canTap}
              className="rounded-xl overflow-hidden border relative"
              style={{
                width: "clamp(64px, 16vw, 96px)",
                aspectRatio: "2/3",
                borderColor: isRevealed
                  ? "rgba(201,169,78,0.5)"
                  : "rgba(255,255,255,0.1)",
                cursor: canTap ? "pointer" : "default",
                flexShrink: 0,
              }}
              layout
              animate={{
                scale: isRevealed ? 1 : canTap ? 1 : 0.96,
                opacity: 1,
              }}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ ...SPRING_GENTLE, delay: 0.15 * i }}
              whileHover={canTap ? { scale: 1.06, y: -4 } : undefined}
              whileTap={canTap ? { scale: 0.94 } : undefined}
            >
              {/* Card back */}
              {!isRevealed && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #120a24, #050010)",
                  }}
                >
                  {/* Back pattern */}
                  <div
                    className="w-3/4 h-3/4 rounded-lg border flex items-center justify-center"
                    style={{
                      borderColor: "rgba(201,169,78,0.3)",
                      background: "rgba(201,169,78,0.04)",
                    }}
                  >
                    <span
                      className="text-xl select-none"
                      style={{ color: "rgba(201,169,78,0.4)" }}
                    >
                      &#10022;
                    </span>
                  </div>

                  {/* Tap pulse ring */}
                  {canTap && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2"
                      style={{ borderColor: "rgba(201,169,78,0.25)" }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    />
                  )}
                </div>
              )}

              {/* Card face */}
              {isRevealed && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ ...SPRING, delay: 0.1 }}
                >
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center p-2"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(201,169,78,0.1), #120a24)",
                      }}
                    >
                      <span
                        className="font-serif text-[10px] text-center leading-tight"
                        style={{ color: "#c9a94e" }}
                      >
                        {card.title}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay + card title */}
                  <div
                    className="absolute bottom-0 inset-x-0 py-1.5 px-1 text-center"
                    style={{
                      background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                    }}
                  >
                    <span
                      className="text-[8px] font-serif block leading-tight"
                      style={{ color: "#c9a94e" }}
                    >
                      {card.title}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Interpretation panel — slides up from bottom */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="absolute left-0 right-0 bottom-0"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ ...SPRING_GENTLE, delay: 0.2 }}
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="mx-3 mb-3 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10, 1, 24, 0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
                maxHeight: "40vh",
              }}
            >
              {/* Panel header */}
              <div
                className="px-5 pt-4 pb-2 border-b flex items-center gap-2"
                style={{ borderColor: "rgba(201,169,78,0.15)" }}
              >
                <span style={{ color: "#c9a94e", fontSize: "12px" }}>&#10022;</span>
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-medium"
                  style={{ color: "rgba(201,169,78,0.8)" }}
                >
                  Your Reading
                </p>
                {interpretationComplete && (
                  <motion.span
                    className="ml-auto text-[10px]"
                    style={{ color: "rgba(139,135,160,0.6)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Complete
                  </motion.span>
                )}
              </div>

              {/* Scrollable interpretation text */}
              <div
                className="overflow-y-auto px-5 py-4"
                style={{ maxHeight: "calc(40vh - 48px)" }}
              >
                <InterpretationText
                  text={streamedText}
                  isStreaming={isStreaming}
                />

                {/* Completion note */}
                {interpretationComplete && (
                  <motion.p
                    className="text-xs font-serif mt-4 text-center"
                    style={{ color: "rgba(139,135,160,0.6)" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: 0.4 }}
                  >
                    The stars have spoken. Your reading is complete.
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
