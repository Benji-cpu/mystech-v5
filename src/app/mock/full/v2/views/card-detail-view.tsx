"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getCardById, getDeckById } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

export function CardDetailView({ viewParams }: ViewProps) {
  const card = getCardById(viewParams.cardId ?? "");
  const deck = getDeckById(viewParams.deckId ?? "");

  if (!card) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        Card not found
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <div className="max-w-3xl mx-auto p-4 sm:p-8 pt-14 sm:pt-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Card artwork with layoutId morphing */}
          <motion.div
            layoutId={`card-${card.id}`}
            className="w-full sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 relative shrink-0"
            style={{
              boxShadow: "0 0 40px rgba(201,169,78,0.2), 0 0 80px rgba(201,169,78,0.1)",
              border: "2px solid rgba(201,169,78,0.3)",
            }}
          >
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          </motion.div>

          {/* Card text content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
            className="flex-1 space-y-4 min-w-0"
          >
            {deck && (
              <p className="text-xs text-[#c9a94e]/50 uppercase tracking-wider">
                {deck.name} &middot; Card {card.cardNumber}
              </p>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-white">{card.title}</h1>

            {/* Meaning */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-medium text-[#c9a94e]/70 uppercase tracking-wider">Meaning</h3>
              <p className="text-sm text-white/70 leading-relaxed">{card.meaning}</p>
            </div>

            {/* Guidance */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-medium text-[#c9a94e]/70 uppercase tracking-wider">Guidance</h3>
              <p className="text-sm text-white/60 leading-relaxed italic">{card.guidance}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
