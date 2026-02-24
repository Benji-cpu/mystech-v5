"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MOCK_ART_STYLES } from "@/app/mock/full/_shared/mock-data-v1";
import { GlassPanel } from "./shared/glass-panel";
import { GoldButton } from "./shared/gold-button";
import type { ViewId } from "@/app/mock/full/_shared/types";

type CreatePhaseLocal = "input" | "style";

interface CreateDeckFloorProps {
  onNavigate: (view: ViewId) => void;
  onBack: () => void;
}

export function CreateDeckFloor({ onNavigate, onBack }: CreateDeckFloorProps) {
  const [phase, setPhase] = useState<CreatePhaseLocal>("input");
  const [themeName, setThemeName] = useState("");
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState(8);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleGenerate = () => {
    onNavigate("generation");
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with back */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-6"
        >
          <button
            onClick={onBack}
            className="text-sm text-white/40 hover:text-white/70 transition-colors mb-3 flex items-center gap-1"
          >
            <span>&larr;</span> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Create a Deck</h1>
          <p className="text-sm text-white/40 mt-1">Bring a new oracle deck to life</p>
        </motion.div>

        {/* Phase zones - both always mounted */}
        <div className="space-y-0">
          {/* Zone 1: Input phase */}
          <motion.div
            layout
            animate={{
              height: phase === "input" ? "auto" : 0,
              opacity: phase === "input" ? 1 : 0,
              marginBottom: phase === "input" ? 24 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <GlassPanel className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                  Deck Theme
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="e.g., Inner Wilderness, Shadow Work..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/20 focus:border-[#c9a94e]/40 focus:outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What themes and energies should this deck explore?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/20 focus:border-[#c9a94e]/40 focus:outline-none transition-colors text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                  Number of Cards
                </label>
                <div className="flex gap-2">
                  {[6, 8, 10, 12].map((count) => (
                    <motion.button
                      key={count}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCardCount(count)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        cardCount === count
                          ? "bg-[#c9a94e]/20 border border-[#c9a94e]/40 text-[#c9a94e]"
                          : "bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
                      }`}
                    >
                      {count}
                    </motion.button>
                  ))}
                </div>
              </div>

              <GoldButton
                onClick={() => setPhase("style")}
                className="w-full text-sm"
              >
                Choose Art Style
              </GoldButton>
            </GlassPanel>
          </motion.div>

          {/* Zone 2: Style picker phase */}
          <motion.div
            layout
            animate={{
              height: phase === "style" ? "auto" : 0,
              opacity: phase === "style" ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white/90">Art Style</h2>
                <button
                  onClick={() => setPhase("input")}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  &larr; Back to details
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {MOCK_ART_STYLES.map((style, idx) => (
                  <motion.button
                    key={style.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.06, type: "spring", stiffness: 300, damping: 30 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-colors ${
                      selectedStyle === style.id
                        ? "border-[#c9a94e]"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
                    <div className="absolute inset-0 flex items-end p-2">
                      <span className="text-xs font-medium text-white/90 drop-shadow-lg leading-tight">
                        {style.name}
                      </span>
                    </div>
                    {selectedStyle === style.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#c9a94e] flex items-center justify-center text-black text-xs font-bold"
                      >
                        {"\u2713"}
                      </motion.div>
                    )}
                  </motion.button>
                ))}

                {/* Custom slot */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: MOCK_ART_STYLES.length * 0.06, type: "spring", stiffness: 300, damping: 30 }}
                  className="rounded-xl aspect-square border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/50 hover:border-white/20 transition-colors"
                >
                  <span className="text-lg">+</span>
                  <span className="text-xs">Custom</span>
                </motion.button>
              </div>

              <GoldButton
                onClick={handleGenerate}
                disabled={!selectedStyle}
                className="w-full text-sm"
              >
                Generate Deck
              </GoldButton>
            </div>
          </motion.div>
        </div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}
