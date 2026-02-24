"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_USER } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── Theme ───────────────────────────────────────────────────────────────────

const T = {
  bg: "#0a0118",
  surface: "#110220",
  surface2: "#1a0530",
  border: "rgba(201,169,78,0.15)",
  gold: "#c9a94e",
  goldBright: "#e8c84e",
  goldDim: "#8a7535",
  text: "#e8e0d4",
  textMuted: "#9e957e",
} as const;

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
};

// ─── Usage data ─────────────────────────────────────────────────────────────

const USAGE_METERS = [
  {
    label: "Cards",
    used: 7,
    total: 10,
    color: T.gold,
    warnColor: "#d4940a",
  },
  {
    label: "Readings",
    used: 5,
    total: 5,
    color: T.goldBright,
    warnColor: "#e8c84e",
  },
  {
    label: "Images",
    used: 3,
    total: 5,
    color: T.goldDim,
    warnColor: "#b89940",
  },
] as const;

// ─── Toggle Switch ──────────────────────────────────────────────────────────

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none"
      style={{
        background: enabled
          ? `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`
          : T.surface2,
        boxShadow: enabled ? `0 0 12px rgba(201,169,78,0.40)` : "none",
      }}
      aria-checked={enabled}
      role="switch"
    >
      <motion.span
        className="absolute top-0.5 w-5 h-5 rounded-full shadow-sm"
        style={{ background: T.text }}
        animate={{ left: enabled ? "22px" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    </button>
  );
}

// ─── Usage Meter Row ────────────────────────────────────────────────────────

function UsageMeter({
  label,
  used,
  total,
  color,
  delay,
}: {
  label: string;
  used: number;
  total: number;
  color: string;
  delay: number;
}) {
  const pct = Math.min((used / total) * 100, 100);
  const isMaxed = used >= total;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: T.text }}>
          {label}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: isMaxed ? T.goldBright : color }}
        >
          {used} / {total}
          {isMaxed && (
            <span className="ml-1.5 text-[10px] uppercase tracking-wider" style={{ color: T.goldBright }}>
              maxed
            </span>
          )}
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: T.surface2 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.3 + delay * 0.1,
          }}
        />
      </div>
    </div>
  );
}

// ─── MarionetteSettings ─────────────────────────────────────────────────────

interface MarionetteSettingsProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

export function MarionetteSettings({ onNavigate: _onNavigate }: MarionetteSettingsProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  const initials = MOCK_USER.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const toggleSettings = [
    { label: "Dark Mode", value: darkMode, onChange: () => setDarkMode((v) => !v) },
    { label: "Notifications", value: notifications, onChange: () => setNotifications((v) => !v) },
    { label: "Sound Effects", value: soundEffects, onChange: () => setSoundEffects((v) => !v) },
  ];

  return (
    <motion.div
      className="w-full h-full overflow-y-auto"
      style={{ color: T.text }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-10">

        {/* 1. Profile Section */}
        <motion.div variants={sectionVariants} className="flex flex-col items-center gap-3 pt-4 pb-2">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: T.surface2,
              border: `2px solid ${T.gold}`,
              boxShadow: `0 0 20px rgba(201,169,78,0.30)`,
            }}
          >
            <span className="font-serif text-xl font-bold" style={{ color: T.gold }}>
              {initials}
            </span>
          </div>

          {/* Name & Email */}
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold" style={{ color: T.text }}>
              {MOCK_USER.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
              {MOCK_USER.email}
            </p>
          </div>
        </motion.div>

        {/* 2. Plan Status Card */}
        <motion.div
          variants={sectionVariants}
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(201,169,78,0.10)",
            boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
          }}
        >
          {/* Badge + header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: T.text }}>
              Your Plan
            </h2>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{
                color: T.goldDim,
                border: `1px solid ${T.border}`,
                background: "rgba(201,169,78,0.08)",
              }}
            >
              Free Plan
            </span>
          </div>

          {/* Usage Meters */}
          <div className="space-y-3">
            {USAGE_METERS.map((meter, idx) => (
              <UsageMeter
                key={meter.label}
                label={meter.label}
                used={meter.used}
                total={meter.total}
                color={meter.color}
                delay={idx}
              />
            ))}
          </div>

          {/* Upgrade button */}
          <motion.button
            className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
            style={{
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
              color: T.bg,
              boxShadow: `0 4px 20px rgba(201,169,78,0.35)`,
            }}
            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
          >
            Upgrade to Pro
          </motion.button>
        </motion.div>

        {/* 3. Settings List */}
        <motion.div
          variants={sectionVariants}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(201,169,78,0.10)",
            boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
          }}
        >
          {toggleSettings.map((setting, idx) => (
            <div
              key={setting.label}
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom:
                  idx < toggleSettings.length - 1
                    ? "1px solid rgba(201,169,78,0.08)"
                    : "none",
              }}
            >
              <span className="text-sm font-medium" style={{ color: T.text }}>
                {setting.label}
              </span>
              <ToggleSwitch enabled={setting.value} onChange={setting.onChange} />
            </div>
          ))}
        </motion.div>

        {/* 4. Sign Out */}
        <motion.div variants={sectionVariants} className="flex justify-center pt-2">
          <motion.button
            className="text-sm"
            style={{ color: T.textMuted }}
            whileHover={{ color: T.gold, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
          >
            Sign Out
          </motion.button>
        </motion.div>

        {/* 5. App Info */}
        <motion.div
          variants={sectionVariants}
          className="text-center pt-2 pb-2 space-y-1"
        >
          <p className="text-xs" style={{ color: T.goldDim }}>
            MysTech v5.0
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: T.surface2 }}>
            Marionette Strings Theme
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
