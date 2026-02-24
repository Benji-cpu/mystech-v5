"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Calendar } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { getDeckById } from "../../_shared/mock-data-v1";
import { DREAM, SPRING } from "../dream-theme";

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: SPRING } };

export function DeckDetailView({ navigate, viewParams }: NavProps) {
  const deck = getDeckById(viewParams.deckId || "");
  if (!deck) {
    return (
      <div className="h-full flex items-center justify-center sm:pl-[72px]">
        <p className="text-[#8b87a0]">Deck not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-14">
        {/* Hero */}
        <motion.div
          layoutId={`deck-${deck.id}`}
          className="relative aspect-[2/1] rounded-xl overflow-hidden mb-4"
        >
          <Image src={deck.coverUrl} alt={deck.name} fill className="object-cover" sizes="512px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e]/90 via-[#0a0b1e]/30 to-transparent" />
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.h1 variants={fadeUp} className={`text-2xl text-[#e8e6f0] ${DREAM.heading} font-serif`}>
            {deck.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm text-[#8b87a0] mt-1">
            {deck.description}
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-[#d4a843] bg-[#d4a843]/10 px-2 py-0.5 rounded-full">
              {deck.artStyleId}
            </span>
            <span className="text-[10px] text-[#8b87a0] flex items-center gap-1">
              <Calendar size={10} /> {deck.createdAt}
            </span>
          </motion.div>

          {/* Start Reading button */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("reading")}
            className={`mt-4 w-full ${DREAM.goldGradient} rounded-xl py-3 flex items-center justify-center gap-2 ${DREAM.goldGlow}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={16} className="text-[#0a0b1e]" />
            <span className={`text-sm font-semibold text-[#0a0b1e] ${DREAM.heading} font-serif`}>Start Reading</span>
          </motion.button>

          {/* Card grid heading */}
          <motion.h2 variants={fadeUp} className={`text-sm text-[#c4ceff] mt-6 mb-3 ${DREAM.heading} font-serif`}>
            Cards ({deck.cards.length})
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-2"
        >
          {deck.cards.map((card) => (
            <motion.button
              key={card.id}
              variants={fadeUp}
              onClick={() => navigate("card-detail", { cardId: card.id, deckId: deck.id })}
              className="relative aspect-[3/4] rounded-lg overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div layoutId={`card-${card.id}`} className="absolute inset-0">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 160px"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="absolute bottom-1 left-1 right-1 text-[9px] text-white/80 text-center opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {card.title}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
