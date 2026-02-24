"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BookOpen, Compass, Hash } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { getCardById, getDeckById } from "../../_shared/mock-data-v1";
import { DREAM, SPRING } from "../dream-theme";

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: SPRING } };

export function CardDetailView({ viewParams }: NavProps) {
  const card = getCardById(viewParams.cardId || "");
  const deck = getDeckById(viewParams.deckId || "");

  if (!card) {
    return (
      <div className="h-full flex items-center justify-center sm:pl-[72px]">
        <p className="text-[#8b87a0]">Card not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-14">
        {/* Card image */}
        <motion.div
          layoutId={`card-${card.id}`}
          className="relative aspect-[3/4] max-w-[280px] mx-auto rounded-xl overflow-hidden mb-6"
        >
          <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="280px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e]/60 to-transparent" />
        </motion.div>

        {/* Details */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeUp} className="text-center">
            <h1 className={`text-2xl text-[#e8e6f0] ${DREAM.heading} font-serif`}>{card.title}</h1>
            {deck && (
              <p className="text-xs text-[#8b87a0] mt-1">from {deck.name}</p>
            )}
          </motion.div>

          {/* Meaning */}
          <motion.div variants={fadeUp} className={`${DREAM.glass} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-[#d4a843]" />
              <span className={`text-xs text-[#d4a843] uppercase tracking-widest`}>Meaning</span>
            </div>
            <p className="text-sm text-[#e8e6f0] leading-relaxed">{card.meaning}</p>
          </motion.div>

          {/* Guidance */}
          <motion.div variants={fadeUp} className={`${DREAM.glass} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Compass size={14} className="text-[#c4ceff]" />
              <span className={`text-xs text-[#c4ceff] uppercase tracking-widest`}>Guidance</span>
            </div>
            <p className="text-sm text-[#e8e6f0]/80 leading-relaxed italic font-serif">{card.guidance}</p>
          </motion.div>

          {/* Card number */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 text-[#8b87a0]">
            <Hash size={12} />
            <span className="text-xs">Card {card.cardNumber}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
