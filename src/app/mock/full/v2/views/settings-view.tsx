"use client";

import { motion } from "framer-motion";
import { Crown, Layers, Sparkles, Image as ImageIcon, ArrowRight } from "lucide-react";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_USER, MOCK_STATS } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export function SettingsView({}: ViewProps) {
  const initials = MOCK_USER.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-lg mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={fadeUp} className="text-xl sm:text-2xl font-bold text-white pt-2">
          Settings
        </motion.h1>

        {/* Profile */}
        <motion.div
          variants={fadeUp}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a94e] to-amber-600 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-white">{MOCK_USER.name}</p>
            <p className="text-sm text-white/40">{MOCK_USER.email}</p>
          </div>
        </motion.div>

        {/* Plan */}
        <motion.div
          variants={fadeUp}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60">Current Plan</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 uppercase tracking-wider">
              {MOCK_STATS.plan}
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Decks", used: MOCK_STATS.totalDecks, limit: 2, icon: Layers },
              { label: "Cards/mo", used: MOCK_STATS.totalCards, limit: 10, icon: Sparkles },
              { label: "Readings/mo", used: MOCK_STATS.totalReadings, limit: 5, icon: Sparkles },
              { label: "Images/mo", used: 3, limit: 5, icon: ImageIcon },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon size={12} className="text-white/20 shrink-0" />
                <span className="text-xs text-white/40 flex-1">{item.label}</span>
                <span className="text-xs text-white/60">
                  {item.used}/{item.limit}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade */}
        <motion.button
          variants={fadeUp}
          className="w-full bg-gradient-to-r from-[#c9a94e]/10 to-amber-600/10 border border-[#c9a94e]/30 rounded-2xl p-4 flex items-center gap-3 hover:border-[#c9a94e]/50 transition-colors"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
        >
          <Crown size={18} className="text-[#c9a94e] shrink-0" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-[#c9a94e]">Upgrade to Pro — $4.99/mo</p>
            <p className="text-xs text-white/40">100 cards, 50 readings, all spreads</p>
          </div>
          <ArrowRight size={14} className="text-[#c9a94e]/40 shrink-0" />
        </motion.button>
      </motion.div>
    </div>
  );
}
