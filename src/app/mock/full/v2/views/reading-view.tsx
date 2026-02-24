"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ViewId, ViewParams, ReadingPhase } from "../../_shared/types";
import { getAllCards, shuffleArray, MOCK_READING_INTERPRETATION } from "../../_shared/mock-data-v1";
import type { MockFullCard } from "../../_shared/types";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const SPREAD_OPTIONS = [
  { count: 1, label: "Single Card", desc: "Quick insight" },
  { count: 3, label: "Three Card", desc: "Past, Present, Future" },
  { count: 5, label: "Five Card", desc: "Deep exploration" },
];

const PHASE_LABELS: Record<ReadingPhase, string> = {
  spread: "Choose Your Spread",
  drawing: "Drawing Your Cards...",
  revealing: "Revealing Your Cards",
  interpreting: "Reading the Cards",
  complete: "Your Reading",
};

export function ReadingView({ goBack, currentView }: ViewProps) {
  const [phase, setPhase] = useState<ReadingPhase>("spread");
  const [spreadCount, setSpreadCount] = useState(3);
  const [drawnCards, setDrawnCards] = useState<MockFullCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [streamedText, setStreamedText] = useState("");
  const [showFlipped, setShowFlipped] = useState<Set<number>>(new Set());
  const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Reset when view becomes active
  useEffect(() => {
    if (currentView === "reading") {
      setPhase("spread");
      setDrawnCards([]);
      setRevealedCount(0);
      setStreamedText("");
      setShowFlipped(new Set());
    }
  }, [currentView]);

  const startDrawing = useCallback(
    (count: number) => {
      setSpreadCount(count);
      const cards = shuffleArray(getAllCards()).slice(0, count);
      setDrawnCards(cards);
      setPhase("drawing");

      // After a brief delay, start revealing
      setTimeout(() => {
        setPhase("revealing");
      }, 1500);
    },
    [],
  );

  // Sequential card reveal
  useEffect(() => {
    if (phase !== "revealing" || drawnCards.length === 0) return;

    let currentReveal = 0;
    const revealInterval = setInterval(() => {
      currentReveal++;
      setShowFlipped((prev) => new Set([...prev, currentReveal - 1]));
      setRevealedCount(currentReveal);

      if (currentReveal >= drawnCards.length) {
        clearInterval(revealInterval);
        setTimeout(() => setPhase("interpreting"), 1200);
      }
    }, 1800);

    return () => clearInterval(revealInterval);
  }, [phase, drawnCards.length]);

  // Text streaming
  useEffect(() => {
    if (phase !== "interpreting") return;

    let charIndex = 0;
    streamRef.current = setInterval(() => {
      charIndex++;
      setStreamedText(MOCK_READING_INTERPRETATION.slice(0, charIndex));

      if (charIndex >= MOCK_READING_INTERPRETATION.length) {
        clearInterval(streamRef.current);
        setTimeout(() => setPhase("complete"), 600);
      }
    }, 15);

    return () => {
      if (streamRef.current) clearInterval(streamRef.current);
    };
  }, [phase]);

  const isCardPhase = phase === "drawing" || phase === "revealing";
  const showText = phase === "interpreting" || phase === "complete";

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Status zone — always mounted */}
      <motion.div
        className="shrink-0 p-4 flex items-center justify-between"
        layout
      >
        <motion.div
          className="flex items-center gap-2"
          layout
        >
          <Sparkles size={14} className="text-[#c9a94e]/60" />
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm text-white/50"
            >
              {PHASE_LABELS[phase]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.button
          onClick={goBack}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <X size={14} />
        </motion.button>
      </motion.div>

      {/* Selection zone — collapses after spread is chosen */}
      <motion.div
        className="overflow-hidden"
        layout
        animate={{
          flex: phase === "spread" ? 1 : 0,
          opacity: phase === "spread" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex flex-col items-center justify-center p-4 gap-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-white">Select a Spread</h2>
            <p className="text-xs text-white/30">How deep do you want to go?</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            {SPREAD_OPTIONS.map((opt) => (
              <motion.button
                key={opt.count}
                onClick={() => startDrawing(opt.count)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left hover:border-[#c9a94e]/30 transition-colors group"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {opt.label}
                    </p>
                    <p className="text-xs text-white/30">{opt.desc}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: opt.count }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-5 rounded-sm bg-white/10 border border-white/10"
                      />
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Card zone — grows during draw/reveal, shrinks during interpret */}
      <motion.div
        className="min-h-0 overflow-hidden"
        layout
        animate={{
          flex: isCardPhase ? 1 : showText ? "none" : 0,
          opacity: phase !== "spread" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex items-center justify-center p-4">
          <div className={`flex gap-3 ${showText ? "scale-75 origin-top" : ""}`}>
            {drawnCards.map((card, i) => {
              const isFlipped = showFlipped.has(i);
              return (
                <motion.div
                  key={card.id}
                  className="relative"
                  style={{ perspective: 1000 }}
                  initial={{ y: 60, opacity: 0, rotateZ: (i - Math.floor(drawnCards.length / 2)) * 5 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    rotateZ: showText ? 0 : (i - Math.floor(drawnCards.length / 2)) * 5,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: i * 0.15,
                  }}
                >
                  <motion.div
                    className="relative w-20 sm:w-28 aspect-[3/4.5]"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Card back */}
                    <div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1a0a30] to-[#0d0520] border border-[#c9a94e]/20 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="w-8 h-8 rounded-full border border-[#c9a94e]/30 flex items-center justify-center">
                        <Sparkles size={12} className="text-[#c9a94e]/40" />
                      </div>
                    </div>

                    {/* Card front */}
                    <div
                      className="absolute inset-0 rounded-xl overflow-hidden"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {isFlipped && (
                        <>
                          {/* Golden glow */}
                          <motion.div
                            className="absolute inset-0 rounded-xl z-20 pointer-events-none"
                            initial={{ boxShadow: "0 0 40px rgba(201,169,78,0.6)" }}
                            animate={{ boxShadow: "0 0 10px rgba(201,169,78,0.15)" }}
                            transition={{ duration: 2 }}
                          />
                          <Image
                            src={card.imageUrl}
                            alt={card.title}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] sm:text-[10px] text-white/90 font-medium z-10">
                            {card.title}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Text zone — grows from h-0 during interpreting */}
      <motion.div
        className="min-h-0 overflow-hidden"
        layout
        animate={{
          flex: showText ? 1 : 0,
          opacity: showText ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full overflow-y-auto p-4 sm:px-8">
          <div className="max-w-lg mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {streamedText}
                {phase === "interpreting" && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-[#c9a94e] ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </p>
            </div>

            {/* Done button */}
            <AnimatePresence>
              {phase === "complete" && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={goBack}
                  className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white/80 hover:bg-white/8 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Complete Reading
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
