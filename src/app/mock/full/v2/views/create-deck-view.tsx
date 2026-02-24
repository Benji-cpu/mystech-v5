"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Wand2 } from "lucide-react";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const CARD_COUNTS = [6, 8, 10, 12];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

export function CreateDeckView({ navigate, goBack }: ViewProps) {
  const [phase, setPhase] = useState<"input" | "style">("input");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState(8);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center gap-3 pt-2"
        >
          <button
            onClick={phase === "style" ? () => setPhase("input") : goBack}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Create a Deck</h1>
            <p className="text-xs text-white/40">
              Step {phase === "input" ? "1" : "2"} of 2 &middot;{" "}
              {phase === "input" ? "Theme & Details" : "Choose Art Style"}
            </p>
          </div>
        </motion.div>

        {/* Phase 1: Input */}
        <motion.div
          animate={{
            opacity: phase === "input" ? 1 : 0,
            height: phase === "input" ? "auto" : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Deck Theme
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Inner Strength, Ocean Wisdom..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#c9a94e]/40 focus:ring-1 focus:ring-[#c9a94e]/20 transition-colors"
              />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What experiences or themes should this deck explore?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#c9a94e]/40 focus:ring-1 focus:ring-[#c9a94e]/20 transition-colors resize-none"
              />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Card Count
              </label>
              <div className="flex gap-2">
                {CARD_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setCardCount(count)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      cardCount === count
                        ? "bg-[#c9a94e]/10 border-[#c9a94e]/40 text-[#c9a94e]"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.button
              variants={fadeUp}
              initial="hidden"
              animate="show"
              onClick={() => setPhase("style")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mt-4"
              whileTap={{ scale: 0.98 }}
            >
              Next: Choose Style
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>

        {/* Phase 2: Style selection */}
        <motion.div
          animate={{
            opacity: phase === "style" ? 1 : 0,
            height: phase === "style" ? "auto" : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOCK_ART_STYLES.map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    selectedStyle === style.id
                      ? "border-[#c9a94e] shadow-[0_0_20px_rgba(201,169,78,0.2)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${style.gradient} p-3 flex flex-col justify-between`}>
                    <div className="flex gap-1 justify-end">
                      {style.sampleImages.slice(0, 2).map((img, i) => (
                        <div key={i} className="w-8 h-10 rounded overflow-hidden bg-black/20 relative">
                          <Image src={img} alt="" fill className="object-cover" sizes="32px" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-medium text-white/90 text-left">{style.name}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => navigate("generation")}
              disabled={!selectedStyle}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedStyle
                  ? "bg-[#c9a94e]/10 border border-[#c9a94e]/40 text-[#c9a94e] hover:bg-[#c9a94e]/20"
                  : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
              }`}
              whileTap={selectedStyle ? { scale: 0.98 } : undefined}
            >
              <Wand2 size={14} />
              Generate Deck
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
