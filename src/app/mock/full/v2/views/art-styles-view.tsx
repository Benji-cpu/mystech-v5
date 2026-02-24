"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

export function ArtStylesView({ navigate }: ViewProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Art Styles</h1>
          <p className="text-sm text-white/40 mt-0.5">Choose a visual identity for your deck</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MOCK_ART_STYLES.map((style) => (
            <motion.button
              key={style.id}
              variants={fadeUp}
              onClick={() => navigate("art-style-detail", { styleId: style.id })}
              className="group text-left"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                layoutId={`style-${style.id}`}
                className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${style.gradient} overflow-hidden relative border border-white/10`}
                whileHover={{
                  borderColor: "rgba(201,169,78,0.3)",
                  boxShadow: "0 0 20px rgba(201,169,78,0.1)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Thumbnail previews */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {style.sampleImages.slice(0, 2).map((img, i) => (
                    <div key={i} className="w-7 h-9 rounded overflow-hidden bg-black/30 relative">
                      <Image src={img} alt="" fill className="object-cover" sizes="28px" />
                    </div>
                  ))}
                </div>

                {/* Style name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
                  <p className="text-xs font-medium text-white/90">{style.name}</p>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
