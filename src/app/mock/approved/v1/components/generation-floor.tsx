"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { MOCK_DECKS } from "@/app/mock/full/_shared/mock-data-v1";
import type { ViewId, ViewParams } from "@/app/mock/full/_shared/types";

interface GenerationFloorProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

const TOTAL_CARDS = 10;
const CARD_INTERVAL = 800; // ms between card materializations

export function GenerationFloor({ onNavigate }: GenerationFloorProps) {
  const [progress, setProgress] = useState(0);
  const [materialized, setMaterialized] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use Soul's Garden deck for images
  const deck = MOCK_DECKS[0];

  useEffect(() => {
    setProgress(0);
    setMaterialized([]);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_CARDS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Auto-navigate after a brief pause
          setTimeout(() => {
            onNavigate("deck-detail", { deckId: deck.id });
          }, 1200);
        }
        return next;
      });
      setMaterialized((prev) => [...prev, prev.length]);
    }, CARD_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Status text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <p className="text-[#c9a94e] text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
            Forging Your Deck
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white/90">
            {progress >= TOTAL_CARDS
              ? "Your deck is ready"
              : `Materializing card ${Math.min(progress + 1, TOTAL_CARDS)} of ${TOTAL_CARDS}...`}
          </h2>
        </motion.div>

        {/* Card grid - skeletons that fill in */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-sm mx-auto">
          {Array.from({ length: TOTAL_CARDS }).map((_, idx) => {
            const isMaterialized = materialized.includes(idx);
            const cardImage = deck.cards[idx % deck.cards.length]?.imageUrl;

            return (
              <motion.div
                key={idx}
                className="aspect-[2/3] rounded-lg overflow-hidden relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Skeleton shimmer */}
                <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: isMaterialized ? 0 : Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a94e]/10 to-transparent skew-x-12 w-1/2"
                  />
                </div>

                {/* Materialized card image */}
                <motion.div
                  animate={{
                    opacity: isMaterialized ? 1 : 0,
                    filter: isMaterialized ? "blur(0px)" : "blur(10px)",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={cardImage}
                    alt={`Card ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 border border-[#c9a94e]/30 rounded-lg" />
                </motion.div>

                {/* Gold flash on materialization */}
                {isMaterialized && (
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-[#c9a94e]/30 rounded-lg"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(progress / TOTAL_CARDS) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full bg-gradient-to-r from-[#c9a94e] to-[#daa520] rounded-full"
            />
          </div>
          <p className="text-xs text-white/30 mt-2">{Math.round((progress / TOTAL_CARDS) * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
