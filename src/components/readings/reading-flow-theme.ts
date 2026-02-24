// Reading flow — design tokens: springs, narration, mood mapping

import type { ReadingPhase } from "./reading-flow-state";
import type { MoodPresetName } from "@/components/immersive/mood-config";

// ── Spring Presets ──────────────────────────────────────────────────────

export const SPRINGS = {
  /** Default zone transition spring */
  zone: { type: "spring" as const, stiffness: 300, damping: 30 },
  /** Snappy UI interactions */
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  /** Gentle content entrance */
  gentle: { type: "spring" as const, stiffness: 200, damping: 25 },
} as const;

// ── Narration text per phase ────────────────────────────────────────────

export const READING_NARRATION: Record<ReadingPhase, string> = {
  deck: "Which deck calls to you?",
  spread: "How deep shall we look?",
  intention: "What question guides this reading?",
  creating: "The cards are turning...",
  drawing: "Let us see what the cards reveal...",
  interpreting: "The pattern reveals itself...",
  complete: "Your reading is complete.",
};

// ── Mood mapping per phase ──────────────────────────────────────────────

export const MOOD_MAP: Record<ReadingPhase, MoodPresetName> = {
  deck: "reading-setup",
  spread: "reading-setup",
  intention: "reading-setup",
  creating: "midnight",
  drawing: "card-draw",
  interpreting: "card-reveal",
  complete: "card-reveal",
};
