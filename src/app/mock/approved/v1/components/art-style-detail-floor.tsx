"use client";

import { motion } from "framer-motion";
import { getStyleById } from "@/app/mock/full/_shared/mock-data-v1";
import { GoldButton } from "./shared/gold-button";
import type { ViewId } from "@/app/mock/full/_shared/types";

interface ArtStyleDetailFloorProps {
  styleId: string;
  onNavigate: (view: ViewId) => void;
  onBack: () => void;
}

export function ArtStyleDetailFloor({ styleId, onNavigate, onBack }: ArtStyleDetailFloorProps) {
  const style = getStyleById(styleId);

  if (!style) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40">Style not found</p>
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
          <span>&larr;</span> Back to styles
        </motion.button>

        {/* Hero gradient */}
        <motion.div
          layoutId={`style-card-${style.id}`}
          className={`w-full h-32 sm:h-48 rounded-2xl bg-gradient-to-br ${style.gradient} relative overflow-hidden mb-6`}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-end p-4 sm:p-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{style.name}</h1>
              <p className="text-white/70 text-sm mt-1 max-w-md drop-shadow">{style.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Sample cards - horizontal scroll */}
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Sample Cards
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {style.sampleImages.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1, type: "spring", stiffness: 300, damping: 30 }}
                className="shrink-0"
              >
                <motion.div
                  whileHover={{ scale: 1.04, y: -3 }}
                  className="w-[140px] h-[210px] sm:w-[160px] sm:h-[240px] rounded-xl overflow-hidden border border-[#c9a94e]/20 shadow-lg shadow-purple-900/20"
                >
                  <img
                    src={img}
                    alt={`${style.name} sample ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Use This Style CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          className="mt-6 text-center"
        >
          <GoldButton
            onClick={() => onNavigate("create-deck")}
            className="text-sm px-8"
          >
            Use This Style
          </GoldButton>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}
