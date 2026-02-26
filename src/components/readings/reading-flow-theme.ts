// Reading flow — design tokens: springs and mood mapping

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

// ── Mood mapping per phase ──────────────────────────────────────────────

export const MOOD_MAP: Record<ReadingPhase, MoodPresetName> = {
  setup: "reading-setup",
  creating: "midnight",
  drawing: "card-draw",
  presenting: "card-reveal",
  complete: "card-reveal",
};
