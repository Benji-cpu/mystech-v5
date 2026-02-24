"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const GENERATE_CARDS = MOCK_DECKS[2].cards.slice(0, 6); // Use 6 cards from Cosmic Threads

export function GenerationView({ navigate, currentView }: ViewProps) {
  const [materializedCount, setMaterializedCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Start materialization when view becomes active
  useEffect(() => {
    if (currentView !== "generation") return;

    setMaterializedCount(0);
    setComplete(false);

    const delay = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setMaterializedCount((prev) => {
          if (prev >= GENERATE_CARDS.length) {
            clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }, 600);

    return () => {
      clearTimeout(delay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentView]);

  // Mark complete
  useEffect(() => {
    if (materializedCount >= GENERATE_CARDS.length && materializedCount > 0) {
      const t = setTimeout(() => setComplete(true), 800);
      return () => clearTimeout(t);
    }
  }, [materializedCount]);

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-4 sm:pl-[72px]">
      {/* Progress text */}
      <motion.div
        className="text-center mb-8 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Sparkles className="mx-auto text-[#c9a94e]/60 mb-3" size={24} />
        <AnimatePresence mode="wait">
          {!complete ? (
            <motion.p
              key="progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-white/50"
            >
              Materializing card {Math.min(materializedCount + 1, GENERATE_CARDS.length)} of{" "}
              {GENERATE_CARDS.length}...
            </motion.p>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#c9a94e]/70"
            >
              Your deck has been forged
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Card materialization grid */}
      <div className="flex flex-wrap justify-center gap-3 max-w-lg">
        {GENERATE_CARDS.map((card, i) => {
          const isMaterialized = i < materializedCount;
          return (
            <motion.div
              key={card.id}
              className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden"
              initial={{ scale: 0, opacity: 0 }}
              animate={
                isMaterialized
                  ? {
                      scale: 1,
                      opacity: 1,
                    }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              {/* Golden glow burst */}
              {isMaterialized && (
                <motion.div
                  className="absolute inset-0 rounded-xl z-10"
                  initial={{
                    boxShadow: "0 0 60px rgba(201,169,78,0.8), inset 0 0 30px rgba(201,169,78,0.4)",
                  }}
                  animate={{
                    boxShadow: "0 0 15px rgba(201,169,78,0.2), inset 0 0 5px rgba(201,169,78,0.1)",
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              )}

              <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl">
                {isMaterialized && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      className="object-cover rounded-xl"
                      sizes="96px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
                    <p className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] text-white/80 font-medium">
                      {card.title}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Complete button */}
      <AnimatePresence>
        {complete && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => navigate("deck-detail", { deckId: MOCK_DECKS[2].id })}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c9a94e]/10 border border-[#c9a94e]/30 text-sm text-[#c9a94e] hover:bg-[#c9a94e]/20 transition-colors"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            View Your Deck
            <ArrowRight size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
