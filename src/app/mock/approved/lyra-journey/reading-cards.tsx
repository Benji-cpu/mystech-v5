"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOCK_READING_CARDS, MOCK_INTERPRETATION } from "./lyra-v4-data";
import { LyraNarration } from "@/app/mock/lyra/v3/lyra-v3-narration";
import { SPRINGS } from "./lyra-v4-theme";
import type { CardFlipState } from "./lyra-v4-state";

interface ReadingCardsProps {
  cardFlipStates: CardFlipState[];
  interpretationVisible: boolean;
  compact?: boolean;
  narrationText: string;
  className?: string;
}

export function ReadingCards({
  cardFlipStates,
  interpretationVisible,
  compact = false,
  narrationText,
  className,
}: ReadingCardsProps) {
  const allRevealed = cardFlipStates.every((s) => s === "revealed");

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Card spread */}
      <motion.div
        layout
        className={cn(
          "flex items-center justify-center gap-3 px-4",
          compact || (allRevealed && interpretationVisible)
            ? "shrink-0 py-2"
            : "flex-1"
        )}
        animate={{
          flex: compact || (allRevealed && interpretationVisible) ? "none" : 1,
        }}
        transition={SPRINGS.zone}
      >
        {MOCK_READING_CARDS.map((card, i) => {
          const flipState = cardFlipStates[i];
          const isSmall = compact || (allRevealed && interpretationVisible);
          const cardWidth = isSmall ? "min(20vw, 80px)" : "min(28vw, 120px)";

          return (
            <motion.div
              key={card.id}
              layout
              className="relative"
              style={{
                width: cardWidth,
                aspectRatio: "2/3",
                perspective: "600px",
              }}
              transition={SPRINGS.zone}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{
                  rotateY: flipState !== "hidden" ? 0 : 180,
                }}
                transition={SPRINGS.flip}
              >
                {/* Front face */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg overflow-hidden",
                    "bg-gradient-to-b from-amber-900/30 to-purple-900/30",
                    "border border-amber-500/20 backdrop-blur",
                    "flex flex-col items-center justify-center p-2"
                  )}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-amber-300/50 mb-1">
                    {card.position}
                  </p>
                  <p
                    className={cn(
                      "font-serif text-amber-200/90 text-center",
                      isSmall ? "text-[10px]" : "text-xs"
                    )}
                  >
                    {card.title}
                  </p>
                  {!isSmall && (
                    <p className="text-[8px] text-white/30 mt-1 text-center leading-snug line-clamp-3">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* Back face */}
                <div
                  className="absolute inset-0 rounded-lg bg-gradient-to-b from-purple-900/60 to-[#0a0118] border border-white/10 flex items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="w-8 h-8 opacity-20">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle
                        cx={50}
                        cy={50}
                        r={20}
                        stroke="rgba(201,169,78,0.3)"
                        strokeWidth={1}
                      />
                      <circle cx={50} cy={50} r={3} fill="rgba(201,169,78,0.3)" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Position label beneath card */}
              {!isSmall && (
                <p className="text-[9px] text-white/30 text-center mt-1.5">
                  {card.position}
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Narration text (pre-interpretation) */}
      {narrationText && !interpretationVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRINGS.gentle}
          className="shrink-0 px-4 py-2"
        >
          <LyraNarration text={narrationText} speed={22} />
        </motion.div>
      )}

      {/* Interpretation text (scrollable) */}
      {interpretationVisible && (
        <motion.div
          layout
          initial={{ opacity: 0, flex: 0 }}
          animate={{ opacity: 1, flex: 1 }}
          transition={SPRINGS.zone}
          className="min-h-0 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        >
          <LyraNarration text={MOCK_INTERPRETATION} speed={8} />
        </motion.div>
      )}
    </div>
  );
}
