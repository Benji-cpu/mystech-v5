"use client";

import { motion } from "framer-motion";
import type { Card } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface ReadingFlipCardProps {
  card: Card;
  positionName: string;
  revealState: RevealState;
  cardWidth: number;
  cardHeight: number;
  isActive?: boolean;
  showLabel?: boolean;
}

export function ReadingFlipCard({
  card,
  positionName,
  revealState,
  cardWidth,
  cardHeight,
  isActive,
  showLabel = true,
}: ReadingFlipCardProps) {
  const flipped = revealState === "revealing" || revealState === "revealed";
  const isRevealing = revealState === "revealing";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ perspective: 800, width: cardWidth, height: cardHeight }}
      >
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
          {/* Front face (card image — visible when flipped) */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border border-white/10"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#1a0530] via-[#12022a] to-[#0a0118] flex flex-col items-center justify-center gap-3 p-3">
                {/* Static gold geometric symbol */}
                <svg viewBox="0 0 48 48" className="w-1/3 max-w-[48px] opacity-60" fill="none" stroke="#c9a94e" strokeWidth="1">
                  <circle cx="24" cy="24" r="18" />
                  <polygon points="24,8 38,32 10,32" />
                  <circle cx="24" cy="24" r="6" />
                </svg>
                <span className="text-white/70 text-xs font-medium text-center px-2 leading-snug">
                  {card.title}
                </span>
              </div>
            )}
          </div>

          {/* Back face (mystical pattern — visible when face-down) */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border border-border/30 bg-gradient-to-b from-[#1a0530] to-[#0a0118]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4">
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#c9a94e]/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border border-[#c9a94e]/15"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-1/3 h-1/3 rotate-45 border border-[#c9a94e]/25"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#c9a94e]/40 shadow-[0_0_12px_rgba(201,169,78,0.3)]"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Golden glow burst during reveal */}
        {isRevealing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.5] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 -m-4 rounded-2xl bg-[#ffd700]/30 blur-xl pointer-events-none"
          />
        )}

        {/* Active highlight glow (during interpretation) */}
        {isActive && !isRevealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -m-2 rounded-2xl pointer-events-none"
            style={{
              boxShadow: "0 0 20px rgba(201,169,78,0.5), 0 0 40px rgba(201,169,78,0.2)",
            }}
          />
        )}
      </div>

      {/* Position label */}
      {showLabel && (
        <p className="mt-1.5 text-center text-[10px] text-white/50 uppercase tracking-wider">
          {positionName}
        </p>
      )}
    </div>
  );
}
