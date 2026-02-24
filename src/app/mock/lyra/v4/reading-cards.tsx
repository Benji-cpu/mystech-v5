"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOCK_READING_CARDS, MOCK_INTERPRETATION } from "./lyra-v4-data";
import { LyraNarration } from "../v3/lyra-v3-narration";
import { SPRINGS } from "./lyra-v4-theme";

interface ReadingCardsProps {
  revealedCards: number[];
  interpretationProgress: number;
  subPhase: string;
  narrationText: string;
  onNarrationComplete?: () => void;
  className?: string;
}

export function ReadingCards({
  revealedCards,
  interpretationProgress,
  subPhase,
  narrationText,
  onNarrationComplete,
  className,
}: ReadingCardsProps) {
  const isInterpreting = subPhase === "interpreting" || subPhase === "complete";
  const displayedInterpretation = MOCK_INTERPRETATION.slice(0, interpretationProgress);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Narration area */}
      <AnimatePresence>
        {narrationText && (
          <motion.div
            key={narrationText}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRINGS.gentle}
            className="shrink-0 px-2 py-2"
          >
            <LyraNarration
              text={narrationText}
              speed={15}
              onComplete={onNarrationComplete}
              isLyra
              className="text-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      <div
        className={cn(
          "flex items-center justify-center gap-3 sm:gap-4 py-4",
          isInterpreting ? "shrink-0" : "flex-1"
        )}
      >
        {MOCK_READING_CARDS.map((card, i) => {
          const isRevealed = revealedCards.includes(i);
          const cardW = isInterpreting ? 60 : 100;
          const cardH = isInterpreting ? 90 : 150;

          return (
            <motion.div
              key={card.id}
              layout
              transition={SPRINGS.flip}
              style={{ perspective: 800, width: cardW, height: cardH }}
            >
              <motion.div
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={SPRINGS.flip}
                style={{
                  transformStyle: "preserve-3d",
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Front face (visible when flipped / revealed) */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-xl border border-[#c9a94e]/40",
                      "bg-gradient-to-b from-[#1a0530] to-[#0a0118]",
                      "flex flex-col items-center justify-center gap-1 p-2"
                    )}
                  >
                    <span className="text-[#c9a94e] text-[10px] font-medium text-center leading-tight">
                      {card.title}
                    </span>
                    <span className="text-white/30 text-[8px]">{card.position}</span>
                  </div>
                </div>

                {/* Back face (card back, default) */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-full h-full rounded-xl border border-[#c9a94e]/30 bg-gradient-to-b from-[#180428] to-[#0d0020] flex items-center justify-center">
                    <div className="w-8 h-8 border border-[#c9a94e]/20 rotate-45" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Interpretation text zone — expands when interpreting */}
      <AnimatePresence>
        {isInterpreting && (
          <motion.div
            key="interpretation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", flex: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRINGS.zone}
            className="min-h-0 overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mx-2 mb-2"
          >
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
              {displayedInterpretation}
              {interpretationProgress < MOCK_INTERPRETATION.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-[#c9a94e] ml-0.5 align-text-bottom"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
