"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Crown, Moon, Sun, LogOut, Layers, BookOpen, Sparkles } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { MOCK_USER, MOCK_STATS } from "../../_shared/mock-data-v1";
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

export function SettingsView(_props: NavProps) {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className={`text-2xl text-[#e8e6f0] mb-6 ${DREAM.heading} font-serif`}
        >
          Settings
        </motion.h1>

        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {/* Profile */}
          <motion.div variants={fadeUp} className={`${DREAM.glass} rounded-xl p-4 flex items-center gap-4`}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4a843]/30 to-[#c4ceff]/20 flex items-center justify-center border border-[#2a2b5a]/40">
              <User size={24} className="text-[#c4ceff]" />
            </div>
            <div className="flex-1">
              <p className={`text-base text-[#e8e6f0] ${DREAM.heading} font-serif`}>{MOCK_USER.name}</p>
              <p className="text-xs text-[#8b87a0]">{MOCK_USER.email}</p>
            </div>
            <span className="text-[10px] text-[#d4a843] bg-[#d4a843]/10 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
              {MOCK_USER.plan}
            </span>
          </motion.div>

          {/* Usage stats */}
          <motion.div variants={fadeUp}>
            <h2 className={`text-sm text-[#c4ceff] mb-3 ${DREAM.heading} font-serif`}>Usage</h2>
            <div className="space-y-2">
              {[
                { label: "Decks", value: MOCK_STATS.totalDecks, max: MOCK_USER.plan === "free" ? 2 : "∞", icon: Layers },
                { label: "Cards", value: MOCK_STATS.totalCards, max: MOCK_USER.plan === "free" ? 10 : 100, icon: BookOpen },
                { label: "Readings", value: MOCK_STATS.totalReadings, max: MOCK_USER.plan === "free" ? 5 : 50, icon: Sparkles },
              ].map((stat) => (
                <div key={stat.label} className={`${DREAM.glass} rounded-xl p-3 flex items-center gap-3`}>
                  <stat.icon size={16} className="text-[#d4a843] shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#e8e6f0]">{stat.label}</span>
                      <span className="text-xs text-[#8b87a0]">{stat.value}/{stat.max}</span>
                    </div>
                    <div className="h-1 bg-[#2a2b5a]/60 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c96a]"
                        style={{ width: `${Math.min((stat.value / (typeof stat.max === "number" ? stat.max : 100)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Theme toggle */}
          <motion.div variants={fadeUp} className={`${DREAM.glass} rounded-xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={16} className="text-[#c4ceff]" /> : <Sun size={16} className="text-[#d4a843]" />}
              <span className="text-sm text-[#e8e6f0]">Dark Mode</span>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isDark ? "bg-[#d4a843]" : "bg-[#2a2b5a]"}`}
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-white absolute top-1"
                animate={{ left: isDark ? 22 : 4 }}
                transition={SPRING}
              />
            </button>
          </motion.div>

          {/* Upgrade */}
          <motion.button
            variants={fadeUp}
            className="w-full bg-gradient-to-br from-[#d4a843]/10 to-[#c4ceff]/5 border border-[#d4a843]/20 rounded-xl p-4 flex items-center gap-3 text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Crown size={20} className="text-[#d4a843] shrink-0" />
            <div>
              <p className={`text-sm text-[#e8e6f0] font-semibold ${DREAM.heading} font-serif`}>Upgrade to Pro</p>
              <p className="text-xs text-[#8b87a0]">$4.99/mo — unlimited everything</p>
            </div>
          </motion.button>

          {/* Sign out */}
          <motion.button
            variants={fadeUp}
            className={`w-full ${DREAM.glass} rounded-xl p-4 flex items-center gap-3 text-left ${DREAM.glassHover} transition-colors`}
          >
            <LogOut size={16} className="text-red-400/60" />
            <span className="text-sm text-red-400/60">Sign Out</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
