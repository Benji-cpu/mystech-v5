"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { DREAM, SPRING } from "../dream-theme";

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: SPRING } };

export function DecksView({ navigate }: NavProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className={`text-2xl text-[#e8e6f0] mb-6 ${DREAM.heading} font-serif`}
        >
          My Decks
        </motion.h1>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3"
        >
          {MOCK_DECKS.map((deck) => (
            <motion.button
              key={deck.id}
              variants={fadeUp}
              onClick={() => navigate("deck-detail", { deckId: deck.id })}
              className={`${DREAM.glass} rounded-xl overflow-hidden text-left group`}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                layoutId={`deck-${deck.id}`}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={deck.coverUrl}
                  alt={deck.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e]/80 via-transparent to-transparent" />
              </motion.div>
              <div className="p-3">
                <p className={`text-sm text-[#e8e6f0] truncate ${DREAM.heading} font-serif`}>{deck.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#8b87a0]">{deck.cardCount} cards</span>
                  <span className="text-[10px] text-[#d4a843]/60 bg-[#d4a843]/10 px-1.5 py-0.5 rounded-full">
                    {deck.artStyleId}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Create New */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("create-deck")}
            className="border-2 border-dashed border-[#2a2b5a]/60 rounded-xl flex flex-col items-center justify-center gap-2 min-h-[200px] hover:border-[#d4a843]/40 hover:bg-[#d4a843]/5 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={24} className="text-[#8b87a0]" />
            <span className="text-xs text-[#8b87a0]">Create New Deck</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
