"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MOCK_USER } from "@/app/mock/full/_shared/mock-data-v1";
import { GlassPanel } from "./shared/glass-panel";
import { GoldButton } from "./shared/gold-button";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

interface UsageBarProps {
  label: string;
  used: number;
  total: number;
  delay?: number;
}

function UsageBar({ label, used, total, delay = 0 }: UsageBarProps) {
  const percentage = Math.min((used / total) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-xs text-white/40">
          {used}/{total}
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.3 + delay, duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#c9a94e] to-[#daa520] rounded-full"
        />
      </div>
    </div>
  );
}

export function SettingsFloor() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div {...fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Settings</h1>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassPanel className="p-4 sm:p-6 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a94e] to-[#8a6d2b] flex items-center justify-center text-xl font-bold text-black">
              {MOCK_USER.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white/90">{MOCK_USER.name}</h3>
              <p className="text-xs text-white/40 truncate">{MOCK_USER.email}</p>
            </div>
            <span className="px-2.5 py-1 bg-[#c9a94e]/10 border border-[#c9a94e]/30 rounded-full text-xs text-[#c9a94e] font-medium uppercase">
              {MOCK_USER.plan}
            </span>
          </GlassPanel>
        </motion.div>

        {/* Usage */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Usage This Period
          </h2>
          <GlassPanel className="p-4 sm:p-6 space-y-4">
            <UsageBar label="Cards Created" used={7} total={11} delay={0} />
            <UsageBar label="Readings" used={3} total={5} delay={0.1} />
            <UsageBar label="Images Generated" used={2} total={5} delay={0.2} />
          </GlassPanel>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Appearance
          </h2>
          <GlassPanel className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Dark Mode</span>
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  darkMode ? "bg-[#c9a94e]" : "bg-white/20"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ x: darkMode ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </motion.button>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-3"
        >
          <GoldButton className="w-full text-sm">
            Manage Subscription
          </GoldButton>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white/70 hover:border-white/20 transition-colors"
          >
            Sign Out
          </motion.button>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </motion.div>
    </div>
  );
}
