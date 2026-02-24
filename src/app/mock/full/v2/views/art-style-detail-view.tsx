"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getStyleById } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

export function ArtStyleDetailView({ navigate, viewParams }: ViewProps) {
  const style = getStyleById(viewParams.styleId ?? "");

  if (!style) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        Style not found
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6 pt-14 sm:pt-8">
        {/* Hero gradient with layoutId */}
        <motion.div
          layoutId={`style-${style.id}`}
          className={`w-full aspect-[21/9] sm:aspect-[3/1] rounded-2xl bg-gradient-to-br ${style.gradient} relative overflow-hidden border border-white/10`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{style.name}</h1>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
          className="space-y-4"
        >
          <p className="text-sm text-white/60 leading-relaxed">{style.description}</p>

          {/* Sample cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Sample Cards
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {style.sampleImages.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 + i * 0.08 }}
                  className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative"
                >
                  <Image
                    src={img}
                    alt={`${style.name} sample ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
            onClick={() => navigate("create-deck")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c9a94e]/10 border border-[#c9a94e]/30 text-sm text-[#c9a94e] hover:bg-[#c9a94e]/20 hover:border-[#c9a94e]/50 transition-colors"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Wand2 size={14} />
            Use This Style
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
