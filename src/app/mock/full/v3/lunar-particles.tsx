"use client";

import { useEffect, useRef } from "react";
import type { MoodId } from "../_shared/types";

// ─── Mood-reactive configuration ─────────────────────────────────────────────

interface MoodConfig {
  dustCount: number;
  dustSpeed: number;
  dustColor: [number, number, number]; // RGB
  shimmerCount: number;
  shimmerColor: [number, number, number];
  bgGradient: [string, string]; // top, bottom
}

const MOOD_CONFIGS: Record<MoodId, MoodConfig> = {
  default: {
    dustCount: 50,
    dustSpeed: 0.15,
    dustColor: [122, 184, 232],    // moonlight blue
    shimmerCount: 18,
    shimmerColor: [200, 220, 232],  // pearl
    bgGradient: ["#060d1a", "#0a1428"],
  },
  reading: {
    dustCount: 65,
    dustSpeed: 0.08,
    dustColor: [100, 160, 220],    // deeper blue
    shimmerCount: 25,
    shimmerColor: [148, 168, 192],  // silver
    bgGradient: ["#040a16", "#081020"],
  },
  creating: {
    dustCount: 55,
    dustSpeed: 0.25,
    dustColor: [140, 200, 240],    // brighter blue
    shimmerCount: 20,
    shimmerColor: [220, 232, 240],  // foam
    bgGradient: ["#060d1a", "#0c1a30"],
  },
  viewing: {
    dustCount: 40,
    dustSpeed: 0.12,
    dustColor: [122, 184, 232],
    shimmerCount: 15,
    shimmerColor: [200, 220, 232],
    bgGradient: ["#060d1a", "#0c1829"],
  },
  warm: {
    dustCount: 45,
    dustSpeed: 0.18,
    dustColor: [232, 200, 122],    // gold tint
    shimmerCount: 20,
    shimmerColor: [232, 220, 200],
    bgGradient: ["#0a0d1a", "#141828"],
  },
};

// ─── Particle types ──────────────────────────────────────────────────────────

interface DustParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  phase: number;       // lifecycle 0–1
  speed: number;
  swayOffset: number;
  swayFreq: number;
}

interface ShimmerParticle {
  x: number;
  y: number;
  width: number;
  opacity: number;
  life: number;
  maxLife: number;
  speed: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LunarParticles({ mood }: { mood: MoodId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  const configRef = useRef(MOOD_CONFIGS[mood]);

  // Update mood ref smoothly
  useEffect(() => {
    moodRef.current = mood;
    configRef.current = MOOD_CONFIGS[mood];
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    // Particles arrays
    let dustParticles: DustParticle[] = [];
    let shimmerParticles: ShimmerParticle[] = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
    }

    function initDust(count: number) {
      dustParticles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.1,
        phase: Math.random(),
        speed: 0.1 + Math.random() * 0.2,
        swayOffset: Math.random() * Math.PI * 2,
        swayFreq: 0.5 + Math.random() * 1.5,
      }));
    }

    function initShimmer(count: number) {
      shimmerParticles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        width: 10 + Math.random() * 30,
        opacity: 0,
        life: Math.random() * 200,
        maxLife: 100 + Math.random() * 150,
        speed: 0.3 + Math.random() * 0.5,
      }));
    }

    resize();
    initDust(configRef.current.dustCount);
    initShimmer(configRef.current.shimmerCount);

    window.addEventListener("resize", resize);

    let time = 0;

    function draw() {
      const config = configRef.current;
      time += 0.016;

      // Clear with gradient background
      const gradient = ctx!.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, config.bgGradient[0]);
      gradient.addColorStop(1, config.bgGradient[1]);
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, w, h);

      // ── Draw moon dust ──
      const [dr, dg, db] = config.dustColor;

      // Adjust particle count dynamically
      while (dustParticles.length < config.dustCount) {
        dustParticles.push({
          x: Math.random() * w,
          y: h + 10,
          size: 1 + Math.random() * 2,
          opacity: 0,
          phase: 0,
          speed: 0.1 + Math.random() * 0.2,
          swayOffset: Math.random() * Math.PI * 2,
          swayFreq: 0.5 + Math.random() * 1.5,
        });
      }
      if (dustParticles.length > config.dustCount) {
        dustParticles.length = config.dustCount;
      }

      for (const p of dustParticles) {
        // Move upward with sinusoidal sway
        p.y -= p.speed * (config.dustSpeed / 0.15);
        p.x += Math.sin(time * p.swayFreq + p.swayOffset) * 0.3;

        // Lifecycle: fade in, sustain, fade out
        p.phase += 0.001;
        if (p.phase > 1) p.phase = 0;
        const fadeIn = Math.min(p.phase * 5, 1);
        const fadeOut = Math.min((1 - p.phase) * 5, 1);
        const alpha = p.opacity * fadeIn * fadeOut;

        // Wrap around
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
          p.phase = 0;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${dr}, ${dg}, ${db}, ${alpha})`;
        ctx!.fill();
      }

      // ── Draw water shimmers ──
      const [sr, sg, sb] = config.shimmerColor;

      for (const s of shimmerParticles) {
        s.life += 1;

        if (s.life > s.maxLife) {
          // Reset shimmer
          s.x = Math.random() * w;
          s.y = Math.random() * h;
          s.width = 10 + Math.random() * 30;
          s.life = 0;
          s.maxLife = 100 + Math.random() * 150;
        }

        // Shimmer lifecycle: quick fade in, slow fade out
        const progress = s.life / s.maxLife;
        const shimmerAlpha =
          progress < 0.15
            ? progress / 0.15
            : progress > 0.6
            ? (1 - progress) / 0.4
            : 1;

        const alpha = shimmerAlpha * 0.3;
        const shimmerWidth = s.width * shimmerAlpha;

        // Horizontal glint line
        ctx!.beginPath();
        ctx!.moveTo(s.x - shimmerWidth / 2, s.y);
        ctx!.lineTo(s.x + shimmerWidth / 2, s.y);
        ctx!.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${alpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
