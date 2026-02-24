"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_USER, MOCK_STATS } from "../../_shared/mock-data-v1";

// ─── View Props ──────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── Toggle Component ────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full border transition-colors ${
        enabled
          ? "bg-[#c9a94e] border-[#c9a94e]"
          : "bg-[#241c14] border-[#3d3020]/50"
      }`}
      aria-checked={enabled}
      role="switch"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#f0e6d2]"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    </button>
  );
}

// ─── Usage Meter ─────────────────────────────────────────────────────────────

function UsageMeter({
  label,
  used,
  total,
  delay,
}: {
  label: string;
  used: number;
  total: number;
  delay: number;
}) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#b8a88a]">{label}</span>
        <span className="text-sm text-[#f0e6d2]">
          {used} / {total}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#241c14] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#e0c65c]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay,
          }}
        />
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsView({ navigate }: ViewProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  const initials = MOCK_USER.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-lg mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Avatar + Name ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-[#c9a94e]/50 bg-[#241c14] flex items-center justify-center">
            <span
              className="text-2xl text-[#c9a94e]"
              style={{ fontFamily: "var(--font-manuscript), serif" }}
            >
              {initials}
            </span>
          </div>
          <h1
            className="text-xl sm:text-2xl text-[#f0e6d2] mt-4 tracking-wide"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            {MOCK_USER.name}
          </h1>
          <p className="text-sm text-[#b8a88a] mt-1">{MOCK_USER.email}</p>
        </motion.div>

        {/* ── Plan Card ─────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl p-5 space-y-4"
        >
          <h2
            className="text-lg text-[#f0e6d2]"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            Apprentice Plan
          </h2>

          <div className="space-y-3">
            <UsageMeter label="Decks" used={MOCK_STATS.totalDecks} total={10} delay={0.3} />
            <UsageMeter label="Cards" used={MOCK_STATS.totalCards} total={100} delay={0.4} />
            <UsageMeter label="Readings" used={MOCK_STATS.totalReadings} total={50} delay={0.5} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3d3020]/50 to-transparent" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a94e]/20 border border-[#c9a94e]/30" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3d3020]/50 to-transparent" />
          </div>

          {/* Upgrade CTA */}
          <button
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#8b7340] text-[#0f0b08] font-semibold py-3 px-6 rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Ascend to Master
          </button>
        </motion.div>

        {/* ── Toggle Switches ───────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl divide-y divide-[#3d3020]/30"
        >
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-[#f0e6d2]">Dark Mode</span>
            <Toggle enabled={darkMode} onToggle={() => setDarkMode((v) => !v)} />
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-[#f0e6d2]">Notifications</span>
            <Toggle enabled={notifications} onToggle={() => setNotifications((v) => !v)} />
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-[#f0e6d2]">Sound Effects</span>
            <Toggle enabled={soundEffects} onToggle={() => setSoundEffects((v) => !v)} />
          </div>
        </motion.div>

        {/* ── Version Footer ────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="text-center">
          <p className="text-xs text-[#b8a88a]/60">
            MysTech v5.0 — Gilded Manuscript
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
