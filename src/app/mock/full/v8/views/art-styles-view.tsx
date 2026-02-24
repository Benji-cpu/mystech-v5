"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
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
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: SPRING } };

export function ArtStylesView({ navigate }: NavProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className={`text-2xl text-[#e8e6f0] mb-6 ${DREAM.heading} font-serif`}
        >
          Art Styles
        </motion.h1>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {MOCK_ART_STYLES.map((style) => (
            <motion.button
              key={style.id}
              variants={fadeUp}
              onClick={() => navigate("art-style-detail", { styleId: style.id })}
              className={`${DREAM.glass} rounded-xl overflow-hidden text-left group`}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Gradient header */}
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${style.gradient} overflow-hidden`}>
                {/* Sample thumbnails */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                  {style.sampleImages.slice(0, 2).map((img, i) => (
                    <div key={i} className="relative w-8 h-10 rounded overflow-hidden border border-white/20">
                      <Image src={img} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                  ))}
                </div>
                {/* Icon overlay */}
                <div className="absolute top-2 right-2 text-xl opacity-40">
                  {style.icon}
                </div>
              </div>
              <div className="p-3">
                <p className={`text-sm text-[#e8e6f0] ${DREAM.heading} font-serif`}>{style.name}</p>
                <p className="text-[10px] text-[#8b87a0] mt-0.5 line-clamp-2">{style.description}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
