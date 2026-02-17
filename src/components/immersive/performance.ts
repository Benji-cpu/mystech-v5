export type PerformanceTier = "full" | "reduced" | "minimal";

/** Detect performance tier based on device capabilities */
export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "full";

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return "minimal";

  // Check device memory (Chrome/Edge only)
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (deviceMemory !== undefined && deviceMemory < 4) return "reduced";

  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency;
  if (cores !== undefined && cores <= 2) return "reduced";

  // Mobile heuristic: small viewport + touch
  const isSmallScreen = window.innerWidth < 768;
  const isTouch = "ontouchstart" in window;
  if (isSmallScreen && isTouch) return "reduced";

  return "full";
}

export interface TierConfig {
  starCount: number;
  sparkleCount: number;
  sparkleAccentCount: number;
  nebulaOctaves: number;
  bloom: boolean;
}

export const tierConfigs: Record<PerformanceTier, TierConfig> = {
  full: { starCount: 5000, sparkleCount: 80, sparkleAccentCount: 30, nebulaOctaves: 5, bloom: true },
  reduced: { starCount: 2000, sparkleCount: 30, sparkleAccentCount: 10, nebulaOctaves: 3, bloom: false },
  minimal: { starCount: 0, sparkleCount: 0, sparkleAccentCount: 0, nebulaOctaves: 0, bloom: false },
};
