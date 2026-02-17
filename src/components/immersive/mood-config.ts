export interface Mood {
  primaryHue: number;
  sparkleColor: string;
}

const routeMoods: Record<string, Mood> = {
  "/dashboard": { primaryHue: 285, sparkleColor: "#c9a94e" },
  "/home": { primaryHue: 285, sparkleColor: "#c9a94e" },
  "/decks": { primaryHue: 283, sparkleColor: "#c9a94e" },
  "/readings": { primaryHue: 280, sparkleColor: "#c9a94e" },
  "/readings/new": { primaryHue: 280, sparkleColor: "#c9a94e" },
  "/explore": { primaryHue: 290, sparkleColor: "#c9a94e" },
  "/settings": { primaryHue: 285, sparkleColor: "#c9a94e" },
  "/profile": { primaryHue: 285, sparkleColor: "#c9a94e" },
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
