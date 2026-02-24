"use client";

import { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LYRA, SPRING, SPRING_GENTLE, TIMING } from "../lyra-journey-theme";
import { ContentMaterializer } from "../content-materializer";
import type { JourneyAction, RevelationSubPhase } from "../lyra-journey-state";
import type { ParticleHandle } from "../lyra-particles";
import { getAllCards, shuffleArray, MOCK_READING_INTERPRETATION } from "../../_shared/mock-data-v1";

const POSITIONS = ["Past", "Present", "Future"];

interface RevelationPhaseProps {
  subPhase: RevelationSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  particleRef: React.RefObject<ParticleHandle | null>;
  isActive: boolean;
  revealedCards: number[];
  interpretationProgress: number;
  userName: string;
}

export function RevelationPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  revealedCards,
  interpretationProgress,
  userName,
}: RevelationPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [streamedText, setStreamedText] = useState("");

  const readingCards = useMemo(() => {
    const all = getAllCards();
    const shuffled = shuffleArray(all);
    return shuffled.slice(0, 3);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Auto-advance sub-phases
  useEffect(() => {
    if (!isActive) return;
    clearTimers();

    if (subPhase === "forming_circle") {
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "dealing" });
      }, 1500);
      timersRef.current.push(t);
    } else if (subPhase === "dealing") {
      // Cards dealt, advance to revealing after animation
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "revealing" });
      }, 1200);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers]);

  // Stream interpretation text
  useEffect(() => {
    if (subPhase !== "interpreting" || !isActive) return;

    const text = MOCK_READING_INTERPRETATION;
    let i = 0;
    setStreamedText("");

    const interval = setInterval(() => {
      if (i < text.length) {
        // Stream 2-3 chars at a time for speed
        const chunk = text.slice(i, i + 2);
        setStreamedText((prev) => prev + chunk);
        i += 2;
        dispatch({
          type: "SET_INTERPRETATION_PROGRESS",
          progress: Math.min(i / text.length, 1),
        });
      } else {
        clearInterval(interval);
        const t = setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
        }, 1500);
        timersRef.current.push(t);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [subPhase, isActive, dispatch]);

  const handleCardTap = useCallback(
    (index: number) => {
      if (subPhase !== "revealing") return;
      if (revealedCards.includes(index)) return;

      dispatch({ type: "REVEAL_CARD", index });

      // If all 3 revealed, advance to interpreting
      const newRevealed = [...revealedCards, index];
      if (newRevealed.length >= 3) {
        const t = setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "interpreting" });
        }, TIMING.cardRevealDelay);
        timersRef.current.push(t);
      }
    },
    [subPhase, revealedCards, dispatch]
  );

  const handleComplete = useCallback(() => {
    dispatch({ type: "START_BREATH_PAUSE" });
    setTimeout(() => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    }, TIMING.breathPause + 200);
  }, [dispatch]);

  const showCards = subPhase !== "forming_circle";
  const isInterpreting = subPhase === "interpreting" || subPhase === "complete";
  const isComplete = subPhase === "complete";

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Status text */}
      <motion.div
        className="text-center py-2 shrink-0 px-4"
        layout
      >
        <motion.p
          key={subPhase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-sm sm:text-base"
          style={{ color: LYRA.textDim }}
        >
          {subPhase === "forming_circle" && "The sacred circle forms..."}
          {subPhase === "dealing" && "Your cards are being drawn from the deck..."}
          {subPhase === "revealing" && "Tap each card to reveal its message"}
          {subPhase === "interpreting" && "Lyra reads the threads of meaning..."}
          {subPhase === "complete" && "Your reading is complete"}
        </motion.p>
      </motion.div>

      {/* Card zone — shrinks during interpretation */}
      <motion.div
        className="flex items-center justify-center gap-3 sm:gap-5 px-4 min-h-0 shrink-0"
        layout
        animate={{
          flex: isInterpreting ? "0 0 auto" : "1 1 0%",
          paddingTop: isInterpreting ? 8 : 16,
          paddingBottom: isInterpreting ? 8 : 16,
        }}
        transition={SPRING}
      >
        {readingCards.map((card, i) => {
          const isRevealed = revealedCards.includes(i);
          const canTap = subPhase === "revealing" && !isRevealed;
          const isSmall = isInterpreting;

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardTap(i)}
              disabled={!canTap}
              className="rounded-xl overflow-hidden border relative"
              style={{
                width: isSmall ? "clamp(48px, 10vw, 64px)" : "clamp(80px, 22vw, 140px)",
                aspectRatio: "2/3",
                borderColor: isRevealed
                  ? LYRA.borderGold
                  : "rgba(255, 255, 255, 0.08)",
              }}
              layout
              animate={{
                scale: showCards ? 1 : 0.5,
                opacity: showCards ? 1 : 0,
                rotateY: isRevealed ? 0 : 180,
              }}
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{
                ...SPRING_GENTLE,
                delay: subPhase === "dealing" ? i * 0.2 : 0,
                rotateY: { type: "spring", stiffness: 260, damping: 30 },
              }}
              whileHover={canTap ? { scale: 1.05 } : undefined}
              whileTap={canTap ? { scale: 0.95 } : undefined}
            >
              {/* Card back */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${LYRA.surface}, ${LYRA.bg})`,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div
                  className="w-3/4 h-3/4 rounded-lg border flex items-center justify-center"
                  style={{
                    borderColor: LYRA.borderGold,
                    background: "rgba(201, 169, 78, 0.05)",
                  }}
                >
                  <span className="text-2xl" style={{ color: LYRA.goldDim }}>
                    &#10022;
                  </span>
                </div>
              </motion.div>

              {/* Card face */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden" }}
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
                      background: `linear-gradient(135deg, rgba(201,169,78,0.1), ${LYRA.surface})`,
                    }}
                  >
                    <span
                      className="font-serif text-[10px] sm:text-xs text-center leading-tight"
                      style={{ color: LYRA.gold }}
                    >
                      {card.title}
                    </span>
                  </div>
                )}
                {/* Position label */}
                {isRevealed && !isSmall && (
                  <motion.div
                    className="absolute bottom-0 inset-x-0 py-1.5 px-2 text-center"
                    style={{
                      background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span
                      className="text-[10px] sm:text-xs uppercase tracking-widest font-medium block"
                      style={{ color: LYRA.gold }}
                    >
                      {POSITIONS[i]}
                    </span>
                    <span
                      className="text-[9px] sm:text-[11px] font-serif block mt-0.5 truncate"
                      style={{ color: LYRA.text }}
                    >
                      {card.title}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Tap indicator */}
              {canTap && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: LYRA.goldGlow }}
                  >
                    <span style={{ color: LYRA.gold }}>&#9758;</span>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Interpretation zone — grows from 0 */}
      <motion.div
        className="min-h-0 px-4 pb-4 overflow-hidden"
        layout
        animate={{
          flex: isInterpreting ? "1 1 0%" : "0 0 0px",
          opacity: isInterpreting ? 1 : 0,
        }}
        transition={SPRING}
      >
        <div className="h-full overflow-y-auto max-w-lg mx-auto">
          <div className="py-3">
            <InterpretationText text={streamedText} isStreaming={subPhase === "interpreting"} />

            {isComplete && (
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.3 }}
              >
                <motion.button
                  onClick={handleComplete}
                  className="px-8 py-3 rounded-full border min-h-[44px] min-w-[44px]"
                  style={{
                    borderColor: LYRA.borderGold,
                    color: LYRA.gold,
                    background: "rgba(201, 169, 78, 0.05)",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-sm tracking-widest uppercase font-serif">
                    Complete Reading
                  </span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Interpretation text renderer ────────────────────────────────────

function InterpretationText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  // Parse **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <p className="font-serif text-sm sm:text-base leading-relaxed" style={{ color: LYRA.text }}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold" style={{ color: LYRA.gold }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
      {isStreaming && (
        <span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle animate-pulse"
          style={{ backgroundColor: LYRA.gold }}
        />
      )}
    </p>
  );
}
