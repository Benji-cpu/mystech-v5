"use client";

import { motion } from "framer-motion";
import { getCardById } from "@/app/mock/full/_shared/mock-data-v1";

interface CardDetailFloorProps {
  cardId: string;
  onBack: () => void;
}

export function CardDetailFloor({ cardId, onBack }: CardDetailFloorProps) {
  const card = getCardById(cardId);

  if (!card) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40">Card not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="text-sm text-white/40 hover:text-white/70 transition-colors mb-4 flex items-center gap-1"
        >
          <span>&larr;</span> Back to deck
        </motion.button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Card Image */}
          <div className="flex justify-center lg:justify-start shrink-0">
            <motion.div
              layoutId={`card-image-${card.id}`}
              className="relative"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-[200px] h-[300px] sm:w-[240px] sm:h-[360px] rounded-xl overflow-hidden border border-[#c9a94e]/40 shadow-xl shadow-purple-900/30"
              >
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                {/* Corner ornaments */}
                <div className="absolute inset-[3px] rounded-[9px] border border-[#c9a94e]/20 pointer-events-none" />
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#c9a94e]/60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#c9a94e]/60" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#c9a94e]/60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#c9a94e]/60" />
              </motion.div>

              {/* Ambient glow */}
              <div className="absolute -inset-4 bg-[#c9a94e]/5 rounded-3xl blur-2xl -z-10" />
            </motion.div>
          </div>

          {/* Card Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 space-y-5"
          >
            <div>
              <p className="text-[#c9a94e] text-xs font-medium tracking-wider uppercase mb-1">
                Card {card.cardNumber}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white/90">{card.title}</h1>
            </div>

            {/* Meaning */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-xs text-[#c9a94e]/70 font-medium tracking-wider uppercase mb-2">
                Meaning
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">{card.meaning}</p>
            </div>

            {/* Guidance */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-xs text-[#c9a94e]/70 font-medium tracking-wider uppercase mb-2">
                Guidance
              </h3>
              <p className="text-white/70 text-sm leading-relaxed italic">
                &ldquo;{card.guidance}&rdquo;
              </p>
            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-xs text-white/40 font-medium tracking-wider uppercase mb-2">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {card.meaning.split(", ").map((keyword) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}
