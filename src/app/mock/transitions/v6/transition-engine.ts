import gsap from "gsap";
import type { TransitionMood, TransitionPhase } from "./types";
import { MOOD_CONFIGS } from "./types";
import type { SvgFilterHandle } from "./svg-filters";
import type { AtmosphereHandle, EffectsHandle } from "./types";

interface TransitionRefs {
  filter: SvgFilterHandle;
  atmosphere: AtmosphereHandle | null;
  effects: EffectsHandle | null;
  outgoingEl: HTMLDivElement | null;
  incomingEl: HTMLDivElement | null;
}

interface TransitionCallbacks {
  onSwap: () => void;
  onPhaseChange: (phase: TransitionPhase) => void;
  onComplete: () => void;
}

const ATMOSPHERE_SPLATS: Record<
  TransitionMood,
  { colors: [number, number, number][]; intensity: number; radius?: number }
> = {
  "gentle-ripple": {
    colors: [[0.05, 0.02, 0.12]],
    intensity: 0.001,
  },
  "mystic-wave": {
    colors: [
      [0.1, 0.04, 0.2],
      [0.05, 0.02, 0.12],
    ],
    intensity: 0.002,
  },
  "deep-portal": {
    colors: [
      [0.1, 0.04, 0.2],
      [0.3, 0.25, 0.08],
    ],
    intensity: 0.004,
    radius: 0.4,
  },
  "warm-dissolve": {
    colors: [
      [0.3, 0.25, 0.08],
      [0.15, 0.1, 0.03],
    ],
    intensity: 0.002,
  },
};

export function createTransitionTimeline(
  mood: TransitionMood,
  refs: TransitionRefs,
  callbacks: TransitionCallbacks,
  speedMultiplier: number = 1,
): gsap.core.Timeline {
  const config = MOOD_CONFIGS[mood];
  const duration = config.duration / speedMultiplier;

  // Configure filter for this mood
  refs.filter.configureMood(mood);
  refs.filter.randomizeSeed();

  // Proxy object for GSAP to animate
  const filterState = { scale: 0, blur: 0, freq: 0.012 };

  const tl = gsap.timeline({
    onComplete: () => {
      callbacks.onPhaseChange("idle");
      callbacks.onComplete();
    },
  });

  // Set initial states
  if (refs.outgoingEl) gsap.set(refs.outgoingEl, { opacity: 1 });
  if (refs.incomingEl) gsap.set(refs.incomingEl, { opacity: 0 });

  // ─── GATHER PHASE (0% → 40%) ────────────────────────────────────
  const gatherDuration = duration * 0.4;

  tl.add(() => {
    callbacks.onPhaseChange("gather");
    // Trigger atmosphere splats
    if (refs.atmosphere) {
      const splatConfig = ATMOSPHERE_SPLATS[mood];
      for (const color of splatConfig.colors) {
        const angle = Math.random() * Math.PI * 2;
        refs.atmosphere.splat(
          0.3 + Math.random() * 0.4,
          0.3 + Math.random() * 0.4,
          Math.cos(angle) * splatConfig.intensity,
          Math.sin(angle) * splatConfig.intensity,
          color[0],
          color[1],
          color[2],
          splatConfig.radius,
        );
      }
    }
    // Trigger particle effects
    refs.effects?.triggerTransition(mood);
  }, 0);

  // Ramp up displacement
  tl.to(
    filterState,
    {
      scale: config.peakScale,
      freq: 0.012 + config.peakScale * 0.0003,
      duration: gatherDuration,
      ease: "power2.in",
      onUpdate: () => {
        refs.filter.setScale(filterState.scale);
        refs.filter.setBaseFrequency(filterState.freq);
      },
    },
    0,
  );

  // Ramp up blur if mood uses it
  if (config.blur > 0) {
    tl.to(
      filterState,
      {
        blur: config.blur,
        duration: gatherDuration,
        ease: "power2.in",
        onUpdate: () => {
          refs.filter.setBlur(filterState.blur);
        },
      },
      0,
    );
  }

  // ─── THRESHOLD PHASE (40% → 55%) ──────────────────────────────
  const thresholdStart = gatherDuration;
  const thresholdDuration = duration * 0.15;

  tl.add(() => {
    callbacks.onPhaseChange("threshold");
  }, thresholdStart);

  // Content swap — fast crossfade at peak distortion
  tl.to(
    refs.outgoingEl,
    { opacity: 0, duration: thresholdDuration * 0.6 },
    thresholdStart,
  );
  tl.to(
    refs.incomingEl,
    { opacity: 1, duration: thresholdDuration * 0.6 },
    thresholdStart,
  );

  // Call the swap callback (for state update)
  tl.add(() => {
    callbacks.onSwap();
  }, thresholdStart + thresholdDuration * 0.3);

  // Additional atmosphere burst at threshold
  tl.add(() => {
    if (refs.atmosphere) {
      const splatConfig = ATMOSPHERE_SPLATS[mood];
      const color =
        splatConfig.colors[
          Math.floor(Math.random() * splatConfig.colors.length)
        ];
      refs.atmosphere.splat(
        0.5,
        0.5,
        (Math.random() - 0.5) * splatConfig.intensity * 2,
        (Math.random() - 0.5) * splatConfig.intensity * 2,
        color[0] * 1.5,
        color[1] * 1.5,
        color[2] * 1.5,
      );
    }
  }, thresholdStart + thresholdDuration * 0.5);

  // ─── CRYSTALLIZE PHASE (55% → 100%) ────────────────────────────
  const crystallizeStart = thresholdStart + thresholdDuration;
  const crystallizeDuration = duration * 0.45;

  tl.add(() => {
    callbacks.onPhaseChange("crystallize");
  }, crystallizeStart);

  // Ramp down displacement
  tl.to(
    filterState,
    {
      scale: 0,
      freq: 0.012,
      duration: crystallizeDuration,
      ease: "power2.out",
      onUpdate: () => {
        refs.filter.setScale(filterState.scale);
        refs.filter.setBaseFrequency(filterState.freq);
      },
    },
    crystallizeStart,
  );

  // Ramp down blur
  if (config.blur > 0) {
    tl.to(
      filterState,
      {
        blur: 0,
        duration: crystallizeDuration * 0.8,
        ease: "power2.out",
        onUpdate: () => {
          refs.filter.setBlur(filterState.blur);
        },
      },
      crystallizeStart,
    );
  }

  return tl;
}
