"use client";

import { useRef, useEffect, useCallback } from "react";
import type { MoodId } from "../_shared/types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface InkDroplet {
  kind: "droplet";
  x: number;
  y: number;
  vy: number; // upward drift speed (px/frame at 60fps)
  swayPhase: number; // noise-like sway phase offset
  swayAmplitude: number;
  swayFrequency: number;
  size: number; // radius 2-6px
  life: number; // 0-1 lifecycle position
  lifeSpeed: number;
  spawnX: number;
}

interface LuminousMote {
  kind: "mote";
  x: number;
  y: number;
  vx: number;
  vy: number;
  sinPhase: number; // phase for sinusoidal horizontal motion
  sinAmplitude: number;
  sinFrequency: number;
  size: number; // radius 1-3px
  color: string; // hex color
  life: number;
  lifeSpeed: number;
}

type Particle = InkDroplet | LuminousMote;

// ─── Mood Configuration ─────────────────────────────────────────────────────

interface MoodConfig {
  dropletCount: number;
  moteCount: number;
  speed: number;
  moteColorWeights: { color: string; weight: number }[];
}

const CYAN = "#00e5ff";
const VIOLET = "#8b5cf6";
const GOLD = "#d4a843";

const MOOD_CONFIGS: Record<MoodId, MoodConfig> = {
  default: {
    dropletCount: 30,
    moteCount: 15,
    speed: 0.8,
    moteColorWeights: [
      { color: CYAN, weight: 0.6 },
      { color: VIOLET, weight: 0.3 },
      { color: GOLD, weight: 0.1 },
    ],
  },
  reading: {
    dropletCount: 20,
    moteCount: 25,
    speed: 0.6,
    moteColorWeights: [
      { color: VIOLET, weight: 0.5 },
      { color: CYAN, weight: 0.3 },
      { color: GOLD, weight: 0.2 },
    ],
  },
  creating: {
    dropletCount: 40,
    moteCount: 20,
    speed: 1.0,
    moteColorWeights: [
      { color: CYAN, weight: 0.5 },
      { color: GOLD, weight: 0.3 },
      { color: VIOLET, weight: 0.2 },
    ],
  },
  viewing: {
    dropletCount: 25,
    moteCount: 12,
    speed: 0.5,
    moteColorWeights: [
      { color: CYAN, weight: 0.4 },
      { color: VIOLET, weight: 0.4 },
      { color: GOLD, weight: 0.2 },
    ],
  },
  warm: {
    dropletCount: 15,
    moteCount: 30,
    speed: 0.7,
    moteColorWeights: [
      { color: GOLD, weight: 0.6 },
      { color: CYAN, weight: 0.2 },
      { color: VIOLET, weight: 0.2 },
    ],
  },
};

// ─── Weighted Color Picker ──────────────────────────────────────────────────

function pickMoteColor(weights: MoodConfig["moteColorWeights"]): string {
  const roll = Math.random();
  let cumulative = 0;
  for (const { color, weight } of weights) {
    cumulative += weight;
    if (roll <= cumulative) return color;
  }
  return weights[weights.length - 1].color;
}

// ─── Particle Factories ─────────────────────────────────────────────────────

function createDroplet(
  w: number,
  h: number,
  speed: number,
  randomizeLife: boolean
): InkDroplet {
  const x = Math.random() * w;
  return {
    kind: "droplet",
    x,
    y: randomizeLife ? Math.random() * h : h + Math.random() * 40,
    vy: (0.15 + Math.random() * 0.35) * speed,
    swayPhase: Math.random() * Math.PI * 2,
    swayAmplitude: 15 + Math.random() * 30,
    swayFrequency: 0.006 + Math.random() * 0.012,
    size: 2 + Math.random() * 4,
    life: randomizeLife ? Math.random() : 0,
    lifeSpeed: 0.001 + Math.random() * 0.003,
    spawnX: x,
  };
}

function createMote(
  w: number,
  h: number,
  config: MoodConfig,
  randomizeLife: boolean
): LuminousMote {
  return {
    kind: "mote",
    x: Math.random() * w,
    y: randomizeLife ? Math.random() * h : Math.random() * h,
    vx: (Math.random() - 0.5) * 0.2 * config.speed,
    vy: (Math.random() - 0.5) * 0.15 * config.speed,
    sinPhase: Math.random() * Math.PI * 2,
    sinAmplitude: 10 + Math.random() * 20,
    sinFrequency: 0.01 + Math.random() * 0.02,
    size: 1 + Math.random() * 2,
    color: pickMoteColor(config.moteColorWeights),
    life: randomizeLife ? Math.random() : 0,
    lifeSpeed: 0.0015 + Math.random() * 0.003,
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function InkParticles({ mood }: { mood: MoodId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const moodRef = useRef<MoodId>(mood);
  const lastTimeRef = useRef<number>(0);

  // Keep mood ref in sync without restarting the loop
  moodRef.current = mood;

  // ── Build initial particle pool ─────────────────────────────────────────

  const buildPool = useCallback(
    (w: number, h: number, config: MoodConfig, isMobile: boolean): Particle[] => {
      const divisor = isMobile ? 2 : 1;
      const dropletCount = Math.ceil(config.dropletCount / divisor);
      const moteCount = Math.ceil(config.moteCount / divisor);
      const particles: Particle[] = [];

      for (let i = 0; i < dropletCount; i++) {
        particles.push(createDroplet(w, h, config.speed, true));
      }
      for (let i = 0; i < moteCount; i++) {
        particles.push(createMote(w, h, config, true));
      }
      return particles;
    },
    []
  );

  // ── Main animation effect ─────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;

    // ── Size canvas to parent ──────────────────────────────────────────

    const setSize = () => {
      const rect = parent
        ? parent.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    // ── ResizeObserver ──────────────────────────────────────────────────

    let resizeObserver: ResizeObserver | null = null;
    if (parent) {
      resizeObserver = new ResizeObserver(() => setSize());
      resizeObserver.observe(parent);
    } else {
      const handleResize = () => setSize();
      window.addEventListener("resize", handleResize, { passive: true });
    }

    // ── Build initial particles ────────────────────────────────────────

    const config = MOOD_CONFIGS[moodRef.current];
    particlesRef.current = buildPool(
      canvas.width / dpr,
      canvas.height / dpr,
      config,
      isMobile
    );

    // Mood transition tracking
    const transition = {
      dropletTarget: particlesRef.current.filter((p) => p.kind === "droplet").length,
      moteTarget: particlesRef.current.filter((p) => p.kind === "mote").length,
      framesLeft: 0,
    };

    // ── Animation loop ─────────────────────────────────────────────────

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDelta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      // Clamp to avoid huge jumps on tab re-focus
      const dt = Math.min(rawDelta, 50) / (1000 / 60);

      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      ctx.clearRect(0, 0, W, H);

      // ── Detect mood change, queue transition ────────────────────────

      const currentConfig = MOOD_CONFIGS[moodRef.current];
      const divisor = isMobile ? 2 : 1;
      const desiredDroplets = Math.ceil(currentConfig.dropletCount / divisor);
      const desiredMotes = Math.ceil(currentConfig.moteCount / divisor);

      if (
        desiredDroplets !== transition.dropletTarget ||
        desiredMotes !== transition.moteTarget
      ) {
        transition.dropletTarget = desiredDroplets;
        transition.moteTarget = desiredMotes;
        transition.framesLeft = 60; // ~1 second ramp
      }

      // ── Gradually adjust particle counts ────────────────────────────

      if (transition.framesLeft > 0) {
        transition.framesLeft--;
        const pool = particlesRef.current;

        const currentDroplets = pool.filter((p) => p.kind === "droplet").length;
        const currentMotes = pool.filter((p) => p.kind === "mote").length;

        // Spawn missing droplets
        if (currentDroplets < transition.dropletTarget) {
          const toAdd = Math.ceil(
            (transition.dropletTarget - currentDroplets) /
              Math.max(transition.framesLeft, 1)
          );
          for (let i = 0; i < toAdd; i++) {
            pool.push(createDroplet(W, H, currentConfig.speed, false));
          }
        }

        // Mark excess droplets for fast fade-out
        if (currentDroplets > transition.dropletTarget) {
          let removed = 0;
          const excess = currentDroplets - transition.dropletTarget;
          for (const p of pool) {
            if (removed >= excess) break;
            if (p.kind === "droplet" && p.life < 0.85) {
              p.life = 0.85;
              removed++;
            }
          }
        }

        // Spawn missing motes
        if (currentMotes < transition.moteTarget) {
          const toAdd = Math.ceil(
            (transition.moteTarget - currentMotes) /
              Math.max(transition.framesLeft, 1)
          );
          for (let i = 0; i < toAdd; i++) {
            pool.push(createMote(W, H, currentConfig, false));
          }
        }

        // Mark excess motes for fast fade-out
        if (currentMotes > transition.moteTarget) {
          let removed = 0;
          const excess = currentMotes - transition.moteTarget;
          for (const p of pool) {
            if (removed >= excess) break;
            if (p.kind === "mote" && p.life < 0.85) {
              p.life = 0.85;
              removed++;
            }
          }
        }
      }

      // ── Update and draw ─────────────────────────────────────────────

      const surviving: Particle[] = [];

      for (const p of particlesRef.current) {
        if (p.kind === "droplet") {
          // Advance lifecycle
          p.life += p.lifeSpeed * dt;

          if (p.life >= 1) {
            // Recycle if still under target
            const currentCount = particlesRef.current.filter(
              (pp) => pp.kind === "droplet"
            ).length;
            if (currentCount <= transition.dropletTarget) {
              surviving.push(createDroplet(W, H, currentConfig.speed, false));
            }
            continue;
          }

          // Upward drift
          p.y -= p.vy * dt;

          // Noise-like horizontal sway via combined sine waves
          const t = p.life * 1000;
          const sway =
            Math.sin(t * p.swayFrequency + p.swayPhase) * p.swayAmplitude +
            Math.sin(t * p.swayFrequency * 1.7 + p.swayPhase * 0.5) *
              p.swayAmplitude *
              0.3;
          p.x = p.spawnX + sway;

          // Lifecycle-based opacity: fade in 0-0.15, hold, fade out 0.85-1
          let alpha: number;
          if (p.life < 0.15) {
            alpha = p.life / 0.15;
          } else if (p.life > 0.85) {
            alpha = (1 - p.life) / 0.15;
          } else {
            alpha = 1;
          }

          // Additional fade near canvas edges
          const edgeFadeX = Math.min(p.x / 60, (W - p.x) / 60, 1);
          const edgeFadeY = Math.min(p.y / 60, (H - p.y) / 60, 1);
          alpha *= Math.max(0, Math.min(1, edgeFadeX)) *
                   Math.max(0, Math.min(1, edgeFadeY));
          alpha = Math.max(0, alpha);

          // Draw dark semi-transparent blob
          ctx.save();
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = "rgba(0, 10, 20, 1)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle outer halo for depth
          ctx.globalAlpha = alpha * 0.12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > -30) {
            surviving.push(p);
          }
        } else {
          // LuminousMote
          p.life += p.lifeSpeed * dt;

          if (p.life >= 1) {
            const currentCount = particlesRef.current.filter(
              (pp) => pp.kind === "mote"
            ).length;
            if (currentCount <= transition.moteTarget) {
              surviving.push(createMote(W, H, currentConfig, false));
            }
            continue;
          }

          // Gentle drift
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Sinusoidal horizontal motion layered on top of drift
          const sinOffset =
            Math.sin(p.life * 1000 * p.sinFrequency + p.sinPhase) *
            p.sinAmplitude *
            0.02 *
            dt;
          p.x += sinOffset;

          // Lifecycle-based opacity
          let alpha: number;
          if (p.life < 0.1) {
            alpha = p.life / 0.1;
          } else if (p.life > 0.85) {
            alpha = (1 - p.life) / 0.15;
          } else {
            alpha = 1;
          }
          alpha = Math.max(0, alpha);

          // Draw radial gradient glow
          const haloRadius = p.size * 6;
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            haloRadius
          );
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(0.3, p.color + "66"); // 40% opacity
          gradient.addColorStop(1, "transparent");

          ctx.save();
          ctx.globalAlpha = alpha * 0.7;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
          ctx.fill();

          // Bright core
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Colored core ring
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Wrap around edges for motes (seamless)
          if (p.x < -haloRadius) p.x = W + haloRadius;
          if (p.x > W + haloRadius) p.x = -haloRadius;
          if (p.y < -haloRadius) p.y = H + haloRadius;
          if (p.y > H + haloRadius) p.y = -haloRadius;

          surviving.push(p);
        }
      }

      particlesRef.current = surviving;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // ── Cleanup ────────────────────────────────────────────────────────

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [buildPool]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Static dark gradient fallback for prefers-reduced-motion */}
      <div
        aria-hidden="true"
        className="ink-particles-static"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(0, 229, 255, 0.04) 0%, transparent 70%), " +
            "radial-gradient(ellipse 50% 40% at 30% 60%, rgba(139, 92, 246, 0.03) 0%, transparent 60%), " +
            "linear-gradient(180deg, #020408 0%, #040810 50%, #020408 100%)",
        }}
      />

      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="ink-particles-canvas"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      {/* CSS to toggle between static/canvas based on motion preference */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .ink-particles-static {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ink-particles-canvas {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
