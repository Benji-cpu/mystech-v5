"use client";

import { useRef, useEffect, useCallback } from "react";
import type { MoodId } from "../_shared/types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GoldMoteParticle {
  kind: "gold";
  x: number;
  y: number;
  vy: number;         // upward velocity (px/frame at 60fps baseline)
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number; // phase offset so particles don't sway in sync
  size: number;       // radius in canvas pixels
  color: string;      // one of the gold mote colors
  life: number;       // 0-1, current position in its lifecycle
  lifeSpeed: number;  // how fast life advances per frame
  spawnX: number;     // original X for sway calculation relative to spawn
}

interface InkSpeckParticle {
  kind: "ink";
  x: number;
  y: number;
  vx: number;         // horizontal drift
  vy: number;         // downward velocity
  size: number;
  alpha: number;      // fixed alpha (0.08-0.15)
}

type Particle = GoldMoteParticle | InkSpeckParticle;

// ─── Mood Configuration ─────────────────────────────────────────────────────

interface MoodConfig {
  goldCount: number;
  inkCount: number;
  speedMultiplier: number;
  goldColors: string[];
}

const MOOD_CONFIGS: Record<MoodId, MoodConfig> = {
  default: {
    goldCount: 35,
    inkCount: 20,
    speedMultiplier: 1.0,
    goldColors: ["#c9a94e", "#e0c65c", "#d4940a"],
  },
  reading: {
    goldCount: 60,
    inkCount: 10,
    speedMultiplier: 0.7,
    goldColors: ["#c9a94e", "#e0c65c", "#f0d060"],
  },
  creating: {
    goldCount: 45,
    inkCount: 25,
    speedMultiplier: 1.2,
    goldColors: ["#d4940a", "#c9a94e", "#b8860b"],
  },
  warm: {
    goldCount: 70,
    inkCount: 8,
    speedMultiplier: 0.8,
    goldColors: ["#e0c65c", "#c9a94e", "#f0d060"],
  },
  viewing: {
    goldCount: 25,
    inkCount: 15,
    speedMultiplier: 0.6,
    goldColors: ["#c9a94e", "#d4940a", "#e0c65c"],
  },
};

// ─── Particle Factories ──────────────────────────────────────────────────────

function createGoldMote(
  canvasWidth: number,
  canvasHeight: number,
  config: MoodConfig,
  speedMultiplier: number
): GoldMoteParticle {
  const colors = config.goldColors;
  const x = Math.random() * canvasWidth;
  return {
    kind: "gold",
    x,
    y: canvasHeight + Math.random() * 40, // start just below viewport
    vy: (0.2 + Math.random() * 0.4) * speedMultiplier, // slower than embers
    swayAmplitude: 15 + Math.random() * 15, // gentler sway (15-30px)
    swayFrequency: 0.008 + Math.random() * 0.016,
    swayOffset: Math.random() * Math.PI * 2,
    size: 1 + Math.random() * 1.5, // 1-2.5px radius
    color: colors[Math.floor(Math.random() * colors.length)],
    // Spread lifecycle start so particles don't all spawn at zero
    life: Math.random(),
    lifeSpeed: 0.002 + Math.random() * 0.004,
    spawnX: x,
  };
}

function createInkSpeck(
  canvasWidth: number,
  canvasHeight: number,
  speedMultiplier: number
): InkSpeckParticle {
  return {
    kind: "ink",
    x: Math.random() * canvasWidth,
    // Spawn anywhere in the top half
    y: Math.random() * (canvasHeight * 0.5),
    vx: (Math.random() - 0.5) * 0.3,
    vy: (0.1 + Math.random() * 0.2) * speedMultiplier, // slow downward drift
    size: 1 + Math.random() * 1, // 1-2px
    alpha: 0.08 + Math.random() * 0.07, // 0.08-0.15
  };
}

// ─── Component API ───────────────────────────────────────────────────────────

export interface GildedParticlesProps {
  mood?: MoodId;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GildedParticles({ mood = "default" }: GildedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const moodRef = useRef<MoodId>(mood);
  const lastTimeRef = useRef<number>(0);

  // Store mood in ref so the animation loop always reads the latest value
  // without needing to restart the entire loop.
  moodRef.current = mood;

  // ── Spawn initial pool ───────────────────────────────────────────────────

  const buildInitialPool = useCallback(
    (
      canvasWidth: number,
      canvasHeight: number,
      config: MoodConfig,
      isMobile: boolean
    ): Particle[] => {
      const divisor = isMobile ? 2 : 1;
      const goldCount = Math.ceil(config.goldCount / divisor);
      const inkCount = Math.ceil(config.inkCount / divisor);
      const particles: Particle[] = [];

      for (let i = 0; i < goldCount; i++) {
        particles.push(createGoldMote(canvasWidth, canvasHeight, config, config.speedMultiplier));
      }
      for (let i = 0; i < inkCount; i++) {
        particles.push(createInkSpeck(canvasWidth, canvasHeight, config.speedMultiplier));
      }
      return particles;
    },
    []
  );

  // ── Main animation effect ───────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect prefers-reduced-motion — skip canvas entirely
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const isMobile = window.innerWidth < 768;
    const dpr = window.devicePixelRatio || 1;

    // ── Set canvas dimensions ──────────────────────────────────────────────
    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    // ── Build initial particles ────────────────────────────────────────────
    const config = MOOD_CONFIGS[moodRef.current];
    particlesRef.current = buildInitialPool(
      window.innerWidth,
      window.innerHeight,
      config,
      isMobile
    );

    // Tracks the pool sizes we last committed, used for smooth mood transitions
    const committedCount = {
      gold: particlesRef.current.filter((p) => p.kind === "gold").length,
      ink: particlesRef.current.filter((p) => p.kind === "ink").length,
    };

    // Transition state — mood changes ramp particle counts over ~60 frames
    const transition = {
      goldTarget: committedCount.gold,
      inkTarget: committedCount.ink,
      framesLeft: 0,
    };

    // ── Animation tick ────────────────────────────────────────────────────
    const animate = (timestamp: number) => {
      // Delta-time normalised to 60fps
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDelta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      // Clamp delta so paused tabs don't cause massive jumps
      const dt = Math.min(rawDelta, 50) / (1000 / 60);

      const W = window.innerWidth;
      const H = window.innerHeight;

      ctx.clearRect(0, 0, W, H);

      // ── Check if mood changed, queue transition ──────────────────────────
      const currentConfig = MOOD_CONFIGS[moodRef.current];
      const divisor = isMobile ? 2 : 1;
      const desiredGold = Math.ceil(currentConfig.goldCount / divisor);
      const desiredInk = Math.ceil(currentConfig.inkCount / divisor);

      if (desiredGold !== transition.goldTarget || desiredInk !== transition.inkTarget) {
        transition.goldTarget = desiredGold;
        transition.inkTarget = desiredInk;
        // ~1 second ramp at 60fps
        transition.framesLeft = 60;
      }

      // ── Gradually spawn/remove to reach targets ─────────────────────────
      if (transition.framesLeft > 0) {
        transition.framesLeft--;

        const currentGold = particlesRef.current.filter((p) => p.kind === "gold").length;
        const currentInk = particlesRef.current.filter((p) => p.kind === "ink").length;

        // Spawn missing gold motes (a few per frame)
        if (currentGold < transition.goldTarget) {
          const toAdd = Math.ceil((transition.goldTarget - currentGold) / Math.max(transition.framesLeft, 1));
          for (let i = 0; i < toAdd; i++) {
            particlesRef.current.push(createGoldMote(W, H, currentConfig, currentConfig.speedMultiplier));
          }
        }

        // Remove excess gold motes (mark life as nearly done so they fade out naturally)
        if (currentGold > transition.goldTarget) {
          let removed = 0;
          const excess = currentGold - transition.goldTarget;
          for (const p of particlesRef.current) {
            if (removed >= excess) break;
            if (p.kind === "gold" && p.life < 0.8) {
              p.life = 0.8; // fast-forward to fade-out region
              removed++;
            }
          }
        }

        // Ink: spawn
        if (currentInk < transition.inkTarget) {
          const toAdd = Math.ceil((transition.inkTarget - currentInk) / Math.max(transition.framesLeft, 1));
          for (let i = 0; i < toAdd; i++) {
            particlesRef.current.push(createInkSpeck(W, H, currentConfig.speedMultiplier));
          }
        }
      }

      // ── Update and draw each particle ────────────────────────────────────
      const surviving: Particle[] = [];

      for (const p of particlesRef.current) {
        if (p.kind === "gold") {
          // Advance lifecycle
          p.life += p.lifeSpeed * dt;

          if (p.life >= 1) {
            // Check if we're still above gold target — recycle or drop
            const currentGoldCount = particlesRef.current.filter((pp) => pp.kind === "gold").length;
            const divisorNow = isMobile ? 2 : 1;
            const targetGold = Math.ceil(MOOD_CONFIGS[moodRef.current].goldCount / divisorNow);
            if (currentGoldCount <= targetGold) {
              // Recycle: reset to bottom with fresh properties
              const newMote = createGoldMote(W, H, MOOD_CONFIGS[moodRef.current], MOOD_CONFIGS[moodRef.current].speedMultiplier);
              newMote.life = 0;
              surviving.push(newMote);
            }
            // If over target, just drop this particle (don't push)
            continue;
          }

          // Move upward
          p.y -= p.vy * dt;

          // Sinusoidal sway — horizontal oscillation around spawn X
          const sway = Math.sin(p.life * p.swayFrequency * 1000 + p.swayOffset) * p.swayAmplitude;
          p.x = p.spawnX + sway;

          // Alpha based on lifecycle — fade in first 20%, hold, fade out last 20%
          // Peak alpha capped at 0.7 for more translucent feel than embers
          let alpha: number;
          if (p.life < 0.2) {
            alpha = (p.life / 0.2) * 0.7;
          } else if (p.life > 0.8) {
            alpha = ((1 - p.life) / 0.2) * 0.7;
          } else {
            alpha = 0.7;
          }
          alpha = Math.max(0, Math.min(0.7, alpha));

          // Draw gold mote as a glowing circle
          ctx.save();
          ctx.globalAlpha = alpha;

          // Outer glow — subtler than embers (size * 2.5 vs size * 3)
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Keep if still in viewport (with margin)
          if (p.y > -20) {
            surviving.push(p);
          }
        } else {
          // Ink speck particle
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Gentle sway via slow vx drift
          p.vx += (Math.random() - 0.5) * 0.02 * dt;
          p.vx = Math.max(-0.4, Math.min(0.4, p.vx));

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = "#3d3020";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Recycle ink specks that drift out of viewport
          if (p.y > H + 20 || p.x < -20 || p.x > W + 20) {
            const divisorNow = isMobile ? 2 : 1;
            const targetInk = Math.ceil(MOOD_CONFIGS[moodRef.current].inkCount / divisorNow);
            const currentInkCount = particlesRef.current.filter((pp) => pp.kind === "ink").length;
            if (currentInkCount <= targetInk) {
              const fresh = createInkSpeck(W, H, MOOD_CONFIGS[moodRef.current].speedMultiplier);
              surviving.push(fresh);
            }
            // else drop
          } else {
            surviving.push(p);
          }
        }
      }

      particlesRef.current = surviving;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // ── Resize handler ────────────────────────────────────────────────────
    const handleResize = () => {
      setSize();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [buildInitialPool]);

  // ─── Reduced-motion fallback ─────────────────────────────────────────────
  // Rendered unconditionally; canvas stays hidden on reduced-motion via CSS.
  // The static warm gold gradient div acts as the fallback overlay.

  return (
    <>
      {/* Warm gold gradient fallback for prefers-reduced-motion */}
      <div
        aria-hidden="true"
        className="gilded-particles-static"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,169,78,0.08) 0%, transparent 70%)," +
            "radial-gradient(ellipse 60% 40% at 30% 80%, rgba(139,115,64,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Canvas — hidden when reduced motion is active via CSS */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="gilded-particles-canvas"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Subtle luminous shimmer overlay — barely perceptible warmth */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          animation: "gilded-shimmer 4s ease-in-out infinite",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(201,169,78,0.01) 50%, transparent 100%)",
        }}
      />

      {/* Keyframe injection */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .gilded-particles-static {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .gilded-particles-canvas {
            display: none;
          }
        }
        @keyframes gilded-shimmer {
          0%   { transform: translateY(0px); opacity: 0.6; }
          50%  { transform: translateY(0.3px); opacity: 1; }
          100% { transform: translateY(0px); opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
