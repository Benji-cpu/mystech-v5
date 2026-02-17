"use client";

import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive, moodPresets } from "@/components/mock/mock-immersive-provider";
import { motion } from "framer-motion";
import Link from "next/link";

const presetEntries = Object.entries(moodPresets);

function MoodControls() {
  const { mood, setMoodPreset } = useMockImmersive();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <Link
          href="/mock/effects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Effects
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Background Moods
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Click a preset to smoothly transition the nebula background. The hue shift and sparkle color change via the MockImmersiveProvider.
        </p>

        {/* Current mood info */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Mood</p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border border-white/20"
              style={{
                background: `hsl(${mood.primaryHue}, 60%, 40%)`,
                boxShadow: `0 0 20px hsla(${mood.primaryHue}, 60%, 40%, 0.5)`,
              }}
            />
            <div>
              <p className="text-sm text-white font-medium">Hue: {Math.round(mood.primaryHue)}</p>
              <p className="text-xs text-white/50">Sparkle: {mood.sparkleColor}</p>
            </div>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-2 gap-3">
          {presetEntries.map(([name, preset]) => {
            const isActive = Math.round(mood.primaryHue) === preset.primaryHue && mood.sparkleColor === preset.sparkleColor;
            return (
              <motion.button
                key={name}
                onClick={() => setMoodPreset(name)}
                className={`relative rounded-xl border p-4 text-left transition-colors ${
                  isActive
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: `hsl(${preset.primaryHue}, 60%, 50%)`,
                      boxShadow: `0 0 8px hsla(${preset.primaryHue}, 60%, 50%, 0.5)`,
                    }}
                  />
                  <span className="text-sm font-medium text-white capitalize">
                    {name.replace(/-/g, " ")}
                  </span>
                </div>
                <p className="text-[10px] text-white/40">
                  Hue {preset.primaryHue} / {preset.sparkleColor}
                </p>
                {isActive && (
                  <motion.div
                    layoutId="active-mood"
                    className="absolute inset-0 rounded-xl border-2 border-white/40 pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BackgroundMoodsPage() {
  return (
    <MockImmersiveShell>
      <MoodControls />
    </MockImmersiveShell>
  );
}
