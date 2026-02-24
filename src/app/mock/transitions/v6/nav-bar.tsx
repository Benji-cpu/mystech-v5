"use client";

import { motion } from "framer-motion";
import type { ViewId, TransitionMood } from "./types";
import { ALL_VIEWS, VIEW_LABELS, MOOD_CONFIGS } from "./types";

interface NavBarProps {
  currentView: ViewId;
  activeMood: TransitionMood;
  autoMood: boolean;
  speed: number;
  isTransitioning: boolean;
  onNavigate: (view: ViewId) => void;
  onMoodChange: (mood: TransitionMood) => void;
  onToggleAutoMood: () => void;
  onSpeedChange: (speed: number) => void;
}

const MOOD_ICONS: Record<TransitionMood, string> = {
  "gentle-ripple": "~",
  "mystic-wave": "w",
  "deep-portal": "o",
  "warm-dissolve": ".",
};

const SPEEDS = [0.5, 1, 2];

export function NavBar({
  currentView,
  activeMood,
  autoMood,
  speed,
  isTransitioning,
  onNavigate,
  onMoodChange,
  onToggleAutoMood,
  onSpeedChange,
}: NavBarProps) {
  return (
    <div className="shrink-0 flex flex-col gap-2 p-3 z-10">
      {/* View navigation */}
      <div className="flex gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
        {ALL_VIEWS.map((view) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            disabled={isTransitioning || currentView === view}
            className="relative flex-1 py-2 px-1 text-[10px] sm:text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            <span
              className={
                currentView === view ? "text-amber-300" : "text-white/50 hover:text-white/70"
              }
            >
              {VIEW_LABELS[view]}
            </span>
            {currentView === view && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-amber-400 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Mood selector */}
        <div className="flex gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1">
          {(Object.keys(MOOD_CONFIGS) as TransitionMood[]).map((mood) => (
            <button
              key={mood}
              onClick={() => onMoodChange(mood)}
              disabled={autoMood}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${
                activeMood === mood && !autoMood
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : autoMood
                    ? "text-white/20"
                    : "text-white/40 hover:text-white/60"
              }`}
              title={MOOD_CONFIGS[mood].label}
            >
              {MOOD_ICONS[mood]}
            </button>
          ))}
        </div>

        {/* Auto-mood toggle */}
        <button
          onClick={onToggleAutoMood}
          className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${
            autoMood
              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
              : "bg-white/5 text-white/40 border-white/10 hover:text-white/60"
          }`}
        >
          Auto
        </button>

        {/* Speed control */}
        <div className="flex gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 ml-auto">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                speed === s
                  ? "bg-white/10 text-white/80"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
