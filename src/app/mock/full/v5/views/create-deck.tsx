"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkTextReveal } from "../ink-text-reveal";
import { InkFade } from "../ink-transitions";
import { inkGlass } from "../ink-theme";
import { MagneticTarget } from "../ink-magnetic";

interface CreateDeckViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
}

type Phase = "input" | "style";

const cardCountOptions = [6, 8, 10, 12];

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function CreateDeckView({ navigate }: CreateDeckViewProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState(8);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  const canProceedToStyle = deckName.trim().length > 0;
  const canGenerate = selectedStyleId !== null;

  function handleGenerate() {
    if (!canGenerate) return;
    navigate("generation", {
      deckName: deckName.trim(),
      styleId: selectedStyleId!,
    });
  }

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto md:px-6 md:py-8">
      {/* Both phases stay mounted -- opacity + height transitions, nothing unmounts */}

      {/* Phase: Input */}
      <motion.div
        animate={{
          opacity: phase === "input" ? 1 : 0,
          height: phase === "input" ? "auto" : 0,
          pointerEvents: phase === "input" ? "auto" : "none",
        }}
        transition={spring}
        className="overflow-hidden"
      >
        <div className="space-y-5">
          {/* Title */}
          <InkTextReveal
            text="Forge a New Deck"
            as="h1"
            className="text-2xl font-semibold tracking-tight"
            charDelay={0.04}
            glowColor="rgba(0, 229, 255, 0.15)"
          />

          {/* Name input */}
          <InkFade delay={0.15}>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Deck Name
              </span>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="e.g. Shadow Garden, Inner Cosmos..."
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 bg-white/[0.03] border border-white/[0.08] focus:border-cyan-500/40 focus:shadow-[0_0_12px_rgba(0,229,255,0.1)]"
              />
            </label>
          </InkFade>

          {/* Description textarea */}
          <InkFade delay={0.25}>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What themes or life experiences should this deck explore?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 resize-none bg-white/[0.03] border border-white/[0.08] focus:border-cyan-500/40 focus:shadow-[0_0_12px_rgba(0,229,255,0.1)]"
              />
            </label>
          </InkFade>

          {/* Card count selector */}
          <InkFade delay={0.35}>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Card Count
              </span>
              <div className="flex gap-2">
                {cardCountOptions.map((count) => {
                  const isSelected = cardCount === count;
                  return (
                    <MagneticTarget
                      key={count}
                      as="button"
                      strength={0.25}
                      radius={60}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                          : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-300 hover:border-white/[0.1]"
                      }`}
                      onClick={() => setCardCount(count)}
                    >
                      {count}
                    </MagneticTarget>
                  );
                })}
              </div>
            </div>
          </InkFade>

          {/* Continue button */}
          <InkFade delay={0.45}>
            <motion.button
              onClick={() => canProceedToStyle && setPhase("style")}
              disabled={!canProceedToStyle}
              className={`w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                canProceedToStyle
                  ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_16px_rgba(0,229,255,0.12)] cursor-pointer"
                  : "bg-white/[0.02] border border-white/[0.04] text-slate-600 cursor-not-allowed"
              }`}
              whileHover={canProceedToStyle ? { scale: 1.01 } : undefined}
              whileTap={canProceedToStyle ? { scale: 0.98 } : undefined}
            >
              Choose Art Style
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </InkFade>
        </div>
      </motion.div>

      {/* Phase: Style */}
      <motion.div
        animate={{
          opacity: phase === "style" ? 1 : 0,
          height: phase === "style" ? "auto" : 0,
          pointerEvents: phase === "style" ? "auto" : "none",
        }}
        transition={spring}
        className="overflow-hidden"
      >
        <div className="space-y-5">
          {/* Title */}
          {phase === "style" && (
            <InkTextReveal
              text="Choose Your Vision"
              as="h1"
              className="text-2xl font-semibold tracking-tight"
              charDelay={0.04}
              glowColor="rgba(139, 92, 246, 0.15)"
            />
          )}

          {/* Back to input */}
          <motion.button
            onClick={() => setPhase("input")}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "style" ? 1 : 0 }}
            transition={{ delay: 0.2 }}
          >
            &larr; Back to details
          </motion.button>

          {/* 2x4 art style grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {MOCK_ART_STYLES.map((style, i) => {
              const isSelected = selectedStyleId === style.id;
              return (
                <motion.button
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={`relative rounded-xl overflow-hidden text-left cursor-pointer group ${
                    isSelected
                      ? "ring-2 ring-cyan-400/60 ring-offset-1 ring-offset-transparent"
                      : "border border-white/[0.06]"
                  }`}
                  style={{ aspectRatio: "4 / 3" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                    delay: phase === "style" ? 0.1 + i * 0.06 : 0,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-60`}
                  />

                  {/* Darkening overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(2,4,8,0.2) 0%, rgba(2,4,8,0.7) 100%)",
                    }}
                  />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style={{
                        background: "rgba(0, 229, 255, 0.2)",
                        border: "1px solid rgba(0, 229, 255, 0.4)",
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    </motion.div>
                  )}

                  {/* Style name overlay */}
                  <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5">
                    <p className="text-xs font-medium text-slate-200 leading-tight">
                      {style.name}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Generate button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
              canGenerate
                ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_16px_rgba(0,229,255,0.12)] cursor-pointer"
                : "bg-white/[0.02] border border-white/[0.04] text-slate-600 cursor-not-allowed"
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: phase === "style" ? 1 : 0,
              y: phase === "style" ? 0 : 8,
            }}
            transition={{ ...spring, delay: phase === "style" ? 0.5 : 0 }}
            whileHover={canGenerate ? { scale: 1.01 } : undefined}
            whileTap={canGenerate ? { scale: 0.98 } : undefined}
          >
            <Sparkles className="w-4 h-4" />
            Begin Generation
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
