"use client";

import { motion } from "framer-motion";
import { Sparkles, Layers, Plus, BookOpen, TrendingUp, ArrowRight, Crown } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { MOCK_STATS, MOCK_ACTIVITY } from "../../_shared/mock-data-v1";
import { DREAM, SPRING } from "../dream-theme";

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const ACTIVITY_ICONS = { sparkles: Sparkles, layers: Layers, plus: Plus, palette: BookOpen } as const;

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: SPRING } };

export function DashboardView({ navigate }: NavProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        {/* Greeting */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.p variants={fadeUp} className="text-[#8b87a0] text-sm">
            Dream Journal
          </motion.p>
          <motion.h1 variants={fadeUp} className={`text-2xl text-[#e8e6f0] mt-1 ${DREAM.heading} font-serif`}>
            Good evening, Luna
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#8b87a0] text-sm mt-1">
            What visions shall we explore tonight?
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Decks", value: MOCK_STATS.totalDecks, icon: Layers },
            { label: "Cards", value: MOCK_STATS.totalCards, icon: BookOpen },
            { label: "Readings", value: MOCK_STATS.totalReadings, icon: Sparkles },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className={`${DREAM.glass} rounded-xl p-3 text-center`}
            >
              <stat.icon size={16} className="text-[#d4a843] mx-auto mb-1" />
              <p className={`text-xl text-[#e8e6f0] ${DREAM.heading} font-serif`}>{stat.value}</p>
              <p className="text-[10px] text-[#8b87a0] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Credits bar */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`${DREAM.glass} rounded-xl p-4`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[#8b87a0]">Monthly Credits</span>
            <span className="text-xs text-[#d4a843]">{MOCK_STATS.creditsUsed}/{MOCK_STATS.creditsTotal}</span>
          </div>
          <div className="h-1.5 bg-[#2a2b5a]/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c96a]"
              initial={{ width: 0 }}
              animate={{ width: `${(MOCK_STATS.creditsUsed / MOCK_STATS.creditsTotal) * 100}%` }}
              transition={{ ...SPRING, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Primary CTAs */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("reading")}
            className={`w-full ${DREAM.goldGradient} rounded-xl p-4 flex items-center gap-3 text-left ${DREAM.goldGlow}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={20} className="text-[#0a0b1e] shrink-0" />
            <div className="flex-1">
              <p className={`text-sm font-semibold text-[#0a0b1e] ${DREAM.heading} font-serif`}>Begin a Reading</p>
              <p className="text-xs text-[#0a0b1e]/70">Consult the cards by moonlight</p>
            </div>
            <ArrowRight size={16} className="text-[#0a0b1e]/60" />
          </motion.button>

          <motion.button
            variants={fadeUp}
            onClick={() => navigate("create-deck")}
            className={`w-full ${DREAM.glass} rounded-xl p-4 flex items-center gap-3 text-left ${DREAM.glassHover} transition-colors`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} className="text-[#c4ceff] shrink-0" />
            <div className="flex-1">
              <p className={`text-sm font-semibold text-[#e8e6f0] ${DREAM.heading} font-serif`}>Create New Deck</p>
              <p className="text-xs text-[#8b87a0]">Weave cards from your dreams</p>
            </div>
            <ArrowRight size={16} className="text-[#8b87a0]" />
          </motion.button>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.h2 variants={fadeUp} className={`text-sm text-[#c4ceff] mb-3 ${DREAM.heading} font-serif`}>
            Recent Visions
          </motion.h2>
          <div className="space-y-2">
            {MOCK_ACTIVITY.map((act) => {
              const Icon = ACTIVITY_ICONS[act.icon] || Sparkles;
              return (
                <motion.div
                  key={act.id}
                  variants={fadeUp}
                  className={`${DREAM.glass} rounded-xl p-3 flex items-center gap-3`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#d4a843]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e8e6f0] truncate">{act.title}</p>
                    <p className="text-xs text-[#8b87a0] truncate">{act.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-[#8b87a0]/60 shrink-0">{act.timestamp}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Upgrade banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.5 }}
          className="bg-gradient-to-br from-[#d4a843]/10 to-[#c4ceff]/5 border border-[#d4a843]/20 rounded-xl p-4 flex items-center gap-3"
        >
          <Crown size={20} className="text-[#d4a843] shrink-0" />
          <div className="flex-1">
            <p className={`text-sm text-[#e8e6f0] font-semibold ${DREAM.heading} font-serif`}>Unlock Pro Dreams</p>
            <p className="text-xs text-[#8b87a0]">$4.99/mo — unlimited readings & decks</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
