"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { getStyleById } from "../../_shared/mock-data-v1";
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

export function ArtStyleDetailView({ navigate, viewParams }: NavProps) {
  const style = getStyleById(viewParams.styleId || "");

  if (!style) {
    return (
      <div className="h-full flex items-center justify-center sm:pl-[72px]">
        <p className="text-[#8b87a0]">Style not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-14">
        {/* Gradient hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className={`relative h-40 rounded-xl bg-gradient-to-br ${style.gradient} overflow-hidden mb-6 flex items-center justify-center`}
        >
          <span className="text-5xl opacity-30">{style.icon}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e]/60 to-transparent" />
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeUp}>
            <h1 className={`text-2xl text-[#e8e6f0] ${DREAM.heading} font-serif`}>{style.name}</h1>
            <p className="text-sm text-[#8b87a0] mt-1 leading-relaxed">{style.description}</p>
          </motion.div>

          {/* Sample cards */}
          <motion.div variants={fadeUp}>
            <h2 className={`text-sm text-[#c4ceff] mb-3 ${DREAM.heading} font-serif`}>Sample Cards</h2>
            <div className="grid grid-cols-2 gap-2">
              {style.sampleImages.map((img, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${style.name} sample ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 256px"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Use this style CTA */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("create-deck")}
            className={`w-full ${DREAM.goldGradient} rounded-xl py-3 flex items-center justify-center gap-2 ${DREAM.goldGlow}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={16} className="text-[#0a0b1e]" />
            <span className={`text-sm font-semibold text-[#0a0b1e] ${DREAM.heading} font-serif`}>Use This Style</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
