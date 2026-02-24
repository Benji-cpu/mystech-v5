"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getDeckById, getStyleById } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

export function DeckDetailView({ navigate, viewParams }: ViewProps) {
  const deck = getDeckById(viewParams.deckId ?? "");
  const style = deck ? getStyleById(deck.artStyleId) : undefined;

  if (!deck) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        Deck not found
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Hero section */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10 sm:pt-6">
          {/* Cover image with layoutId for morphing */}
          <motion.div
            layoutId={`deck-${deck.id}`}
            className="w-full sm:w-48 aspect-[3/4] sm:aspect-auto sm:h-64 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shrink-0"
          >
            <Image
              src={deck.coverUrl}
              alt={deck.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </motion.div>

          {/* Deck info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
            className="space-y-3 flex-1 min-w-0"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{deck.name}</h1>
            <p className="text-sm text-white/50 leading-relaxed">{deck.description}</p>

            <div className="flex flex-wrap gap-2">
              {style && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  {style.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                {deck.cardCount} cards
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                <Calendar size={10} />
                {deck.createdAt}
              </span>
            </div>

            {/* Start reading button */}
            <motion.button
              onClick={() => navigate("reading")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c9a94e]/10 border border-[#c9a94e]/30 text-sm text-[#c9a94e] hover:bg-[#c9a94e]/20 hover:border-[#c9a94e]/50 transition-colors mt-2"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles size={14} />
              Start Reading
            </motion.button>
          </motion.div>
        </div>

        {/* Card grid */}
        <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="show">
          <motion.h2 variants={fadeUp} className="text-sm font-medium text-white/50 uppercase tracking-wider">
            Cards ({deck.cardCount})
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {deck.cards.map((card) => (
              <motion.button
                key={card.id}
                variants={fadeUp}
                onClick={() => navigate("card-detail", { cardId: card.id, deckId: deck.id })}
                className="group text-left"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  layoutId={`card-${card.id}`}
                  className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative"
                  whileHover={{
                    borderColor: "rgba(201,169,78,0.3)",
                    boxShadow: "0 0 20px rgba(201,169,78,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-xs font-medium text-white/90 truncate">{card.title}</p>
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
