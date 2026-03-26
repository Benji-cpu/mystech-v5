/**
 * Barrel file for hand-crafted meditation practice content.
 *
 * Each path has its own content file in scripts/content/.
 * This module re-exports them as a unified lookup map keyed by:
 *   pathName → retreatName → waypointName → MeditationScript
 */

import { ARCHETYPAL_CONTENT } from "./content/archetypal-meditations";
import { MINDFULNESS_CONTENT } from "./content/mindfulness-meditations";
import { MYSTICISM_CONTENT } from "./content/mysticism-meditations";

export type MeditationScript = {
  segments: string[];
};

/**
 * All hand-crafted meditation content, keyed by path → retreat → waypoint.
 */
export const PRACTICE_CONTENT: Record<
  string,
  Record<string, Record<string, MeditationScript>>
> = {
  Archetypal: ARCHETYPAL_CONTENT,
  Mindfulness: MINDFULNESS_CONTENT,
  Mysticism: MYSTICISM_CONTENT,
};
