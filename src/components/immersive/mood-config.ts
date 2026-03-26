export interface Mood {
  primaryHue: number;
  sparkleColor: string;
}

/** Named mood presets for imperative use by flow components */
export const moodPresets = {
  default:         { primaryHue: 285, sparkleColor: "#c9a94e" },
  "reading-setup": { primaryHue: 280, sparkleColor: "#c9a94e" },
  "card-draw":     { primaryHue: 260, sparkleColor: "#7c9aff" },
  "card-reveal":   { primaryHue: 250, sparkleColor: "#ffd700" },
  forging:         { primaryHue: 30,  sparkleColor: "#ff8c00" },
  completion:      { primaryHue: 290, sparkleColor: "#c9a94e" },
  midnight:        { primaryHue: 240, sparkleColor: "#4a6cf7" },
  golden:          { primaryHue: 315, sparkleColor: "#ffd700" },
} as const satisfies Record<string, Mood>;

export type MoodPresetName = keyof typeof moodPresets;

const routeMoods: Record<string, Mood> = {
  "/dashboard": { primaryHue: 285, sparkleColor: "#c9a94e" },
  "/decks": { primaryHue: 270, sparkleColor: "#c9a94e" },
  "/decks/new": { primaryHue: 30, sparkleColor: "#ff8c00" },
  "/readings": { primaryHue: 280, sparkleColor: "#c9a94e" },
  "/readings/new": { primaryHue: 260, sparkleColor: "#7c9aff" },
  "/art-styles": { primaryHue: 240, sparkleColor: "#4a6cf7" },
  "/settings": { primaryHue: 285, sparkleColor: "#c9a94e" },
  "/admin": { primaryHue: 285, sparkleColor: "#c9a94e" },
};

const defaultMood: Mood = { primaryHue: 285, sparkleColor: "#c9a94e" };

/**
 * Find the best matching mood for a pathname.
 * Tries exact match first, then progressively shorter prefixes.
 */
export function getMoodForRoute(pathname: string): Mood {
  // Exact match
  if (routeMoods[pathname]) return routeMoods[pathname];

  // Try progressively shorter path prefixes
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const prefix = "/" + segments.join("/");
    if (routeMoods[prefix]) return routeMoods[prefix];
    segments.pop();
  }

  return defaultMood;
}

/** Linearly interpolate between two moods (hue only, snap sparkle color) */
export function lerpMood(from: Mood, to: Mood, t: number): Mood {
  const clampedT = Math.max(0, Math.min(1, t));
  return {
    primaryHue: from.primaryHue + (to.primaryHue - from.primaryHue) * clampedT,
    sparkleColor: to.sparkleColor, // snap color, don't lerp hex
  };
}
