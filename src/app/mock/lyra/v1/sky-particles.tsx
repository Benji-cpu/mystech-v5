"use client";

import { memo, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { MoodConfig } from "./lyra-v1-theme";
import type { ParticleCommand } from "./lyra-v1-state";

// ── Particle types ──────────────────────────────────────────────────

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  warmth: number;
}

interface Wisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

interface TwinkleParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  decay: number;
  vx: number;
  vy: number;
}

// ── Public handle ───────────────────────────────────────────────────

export interface SkyParticleHandle {
  executeCommand: (cmd: ParticleCommand) => void;
}

// ── Component ───────────────────────────────────────────────────────

interface SkyParticlesProps {
  mood: MoodConfig;
}

const MOBILE_BREAKPOINT = 768;

function SkyParticlesInner(
  { mood }: SkyParticlesProps,
  ref: React.Ref<SkyParticleHandle>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const wispsRef = useRef<Wisp[]>([]);
  const twinklesRef = useRef<TwinkleParticle[]>([]);
  const dimFactorRef = useRef(1);
  const dimTargetRef = useRef(1);
  const moodRef = useRef(mood);
  const rafRef = useRef<number>(0);

  moodRef.current = mood;

  const initMotes = useCallback((count: number, width: number, height: number) => {
    const motes: Mote[] = [];
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        warmth: 0.3 + Math.random() * 0.7,
      });
    }
    return motes;
  }, []);

  const initWisps = useCallback((count: number, width: number, height: number) => {
    const wisps: Wisp[] = [];
    for (let i = 0; i < count; i++) {
      wisps.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        size: 8 + Math.random() * 16,
        alpha: 0.03 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return wisps;
  }, []);

  const executeCommand = useCallback((cmd: ParticleCommand) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    switch (cmd.type) {
      case "twinkle": {
        // Convert SVG viewBox coords (200x100) to canvas pixel coords
        const scaleX = canvas.offsetWidth / 200;
        const scaleY = canvas.offsetHeight / 100;
        const cx = cmd.x * scaleX;
        const cy = cmd.y * scaleY;

        const particles: TwinkleParticle[] = [];
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 2;
          particles.push({
            x: cx + (Math.random() - 0.5) * 8,
            y: cy + (Math.random() - 0.5) * 8,
            size: 0.8 + Math.random() * 1.5,
            alpha: 0.8,
            decay: 0.96 + Math.random() * 0.02,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
          });
        }
        twinklesRef.current = [...twinklesRef.current, ...particles];
        break;
      }

      case "dim":
        dimTargetRef.current = 0.3;
        break;

      case "brighten":
        dimTargetRef.current = 1;
        break;

      case "idle":
        break;
    }
  }, []);

  useImperativeHandle(ref, () => ({ executeCommand }), [executeCommand]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const moteCount = isMobile
      ? Math.floor(moodRef.current.moteCount * 0.57)
      : moodRef.current.moteCount;
    const wispCount = isMobile
      ? Math.floor(moodRef.current.wispCount * 0.53)
      : moodRef.current.wispCount;

    motesRef.current = initMotes(moteCount, canvas.offsetWidth, canvas.offsetHeight);
    wispsRef.current = initWisps(wispCount, canvas.offsetWidth, canvas.offsetHeight);

    let time = 0;

    const loop = () => {
      time += 0.016;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const currentMood = moodRef.current;

      dimFactorRef.current += (dimTargetRef.current - dimFactorRef.current) * 0.05;
      ctx.clearRect(0, 0, w, h);
      const dim = dimFactorRef.current;

      // Draw wisps
      for (const wisp of wispsRef.current) {
        wisp.x += wisp.vx * currentMood.speed;
        wisp.y += wisp.vy * currentMood.speed;
        wisp.vx += (Math.random() - 0.5) * 0.01;
        wisp.vy += (Math.random() - 0.5) * 0.01;
        wisp.vx *= 0.99;
        wisp.vy *= 0.99;

        if (wisp.x < -20) wisp.x = w + 20;
        if (wisp.x > w + 20) wisp.x = -20;
        if (wisp.y < -20) wisp.y = h + 20;
        if (wisp.y > h + 20) wisp.y = -20;

        const flicker = 0.7 + Math.sin(time * 2 + wisp.phase) * 0.3;
        const warmth = currentMood.warmth;
        const r = Math.floor(196 - warmth * 40);
        const g = Math.floor(206 - warmth * 30);
        const b = 255;
        const alpha = wisp.alpha * flicker * dim;

        const gradient = ctx.createRadialGradient(wisp.x, wisp.y, 0, wisp.x, wisp.y, wisp.size);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(wisp.x - wisp.size, wisp.y - wisp.size, wisp.size * 2, wisp.size * 2);
      }

      // Draw motes
      for (const mote of motesRef.current) {
        mote.x += mote.vx * currentMood.speed;
        mote.y += mote.vy * currentMood.speed;
        mote.vx += (Math.random() - 0.5) * 0.02;
        mote.vy += (Math.random() - 0.5) * 0.02;
        mote.vx *= 0.99;
        mote.vy *= 0.99;

        if (mote.x < -20) mote.x = w + 20;
        if (mote.x > w + 20) mote.x = -20;
        if (mote.y < -20) mote.y = h + 20;
        if (mote.y > h + 20) mote.y = -20;

        const flicker = 0.7 + Math.sin(time * 2 + mote.phase) * 0.3;
        const warmth = currentMood.warmth;
        const r = Math.floor(212 + warmth * 30);
        const g = Math.floor(168 - warmth * 20);
        const b = Math.floor(67 - warmth * 20);
        const alpha = mote.alpha * flicker * dim;

        // Glow
        const glow = ctx.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, mote.size * 3);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(
          mote.x - mote.size * 3,
          mote.y - mote.size * 3,
          mote.size * 6,
          mote.size * 6
        );

        // Core
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      // Draw twinkle particles
      twinklesRef.current = twinklesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= p.decay;

        if (p.alpha < 0.01) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 78, ${p.alpha * dim})`;
        ctx.fill();
        return true;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [initMotes, initWisps]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
    />
  );
}

export const SkyParticles = memo(forwardRef(SkyParticlesInner));
