"use client";

import { motion } from "framer-motion";
import { MOCK_ART_STYLES } from "@/app/mock/full/_shared/mock-data-v1";
import { GlassPanel } from "./shared/glass-panel";
import type { ViewId, ViewParams } from "@/app/mock/full/_shared/types";

interface ArtStylesFloorProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

export function ArtStylesFloor({ onNavigate }: ArtStylesFloorProps) {
  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Art Styles</h1>
          <p className="text-sm text-white/40 mt-1">Explore visual styles for your oracle decks</p>
        </motion.div>

        {/* Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MOCK_ART_STYLES.map((style, idx) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.06, type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("art-style-detail", { styleId: style.id })}
                className="w-full text-left"
              >
                <motion.div
                  layoutId={`style-card-${style.id}`}
                  className="rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Gradient background */}
                  <div className={`aspect-[4/3] bg-gradient-to-br ${style.gradient} relative`}>
                    {/* 2x2 sample image thumbnails */}
                    <div className="absolute inset-2 grid grid-cols-2 gap-1 opacity-40">
                      {style.sampleImages.slice(0, 4).map((img, i) => (
                        <div key={i} className="rounded overflow-hidden">
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Name */}
                  <div className="bg-white/5 backdrop-blur px-3 py-2.5">
                    <h3 className="text-sm font-semibold text-white/90">{style.name}</h3>
                    <p className="text-xs text-white/40 line-clamp-1 mt-0.5">{style.description}</p>
                  </div>
                </motion.div>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}
