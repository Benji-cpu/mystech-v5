"use client";

import { memo, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { MoodConfig } from "./lyra-journey-theme";
import type { ParticleCommand } from "./lyra-journey-state";

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
  warmth: number;
}

interface ConvergeParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  alpha: number;
  speed: number;
  arrived: boolean;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

interface SwirlState {
  centerX: number;
  centerY: number;
  radius: number;
  active: boolean;
  strength: number;
}

// ── Public handle ───────────────────────────────────────────────────

export interface ParticleHandle {
  executeCommand: (cmd: ParticleCommand) => void;
}

// ── Component ───────────────────────────────────────────────────────

interface LyraParticlesProps {
  mood: MoodConfig;
}

const MOBILE_BREAKPOINT = 768;

function LyraParticlesInner(
  { mood }: LyraParticlesProps,
  ref: React.Ref<ParticleHandle>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const wispsRef = useRef<Wisp[]>([]);
  const convergeRef = useRef<ConvergeParticle[]>([]);
  const burstsRef = useRef<BurstParticle[]>([]);
  const swirlRef = useRef<SwirlState>({ centerX: 0, centerY: 0, radius: 0, active: false, strength: 0 });
  const dimFactorRef = useRef(1); // 1 = normal, 0.3 = dimmed
  const dimTargetRef = useRef(1);
  const moodRef = useRef(mood);
  const rafRef = useRef<number>(0);

  moodRef.current = mood;

  // ── Particle initialization ─────────────────────────────────────

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
        warmth: 0.2 + Math.random() * 0.8,
      });
    }
    return wisps;
  }, []);

  // ── Command execution ───────────────────────────────────────────

  const executeCommand = useCallback((cmd: ParticleCommand) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    switch (cmd.type) {
      case "converge": {
        const rect = cmd.targetRect;
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        const cx = (rect.left + rect.width / 2) * scaleX;
        const cy = (rect.top + rect.height / 2) * scaleY;

        const particles: ConvergeParticle[] = [];
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 150 + Math.random() * 200;
          particles.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            targetX: cx + (Math.random() - 0.5) * rect.width * scaleX * 0.5,
            targetY: cy + (Math.random() - 0.5) * rect.height * scaleY * 0.5,
            size: 1 + Math.random() * 2,
            alpha: 0.6 + Math.random() * 0.4,
            speed: 0.02 + Math.random() * 0.03,
            arrived: false,
          });
        }
        convergeRef.current = [...convergeRef.current, ...particles];
        break;
      }

      case "burst": {
        const rect = cmd.sourceRect;
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        const cx = (rect.left + rect.width / 2) * scaleX;
        const cy = (rect.top + rect.height / 2) * scaleY;

        const particles: BurstParticle[] = [];
        for (let i = 0; i < 25; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          particles.push({
            x: cx + (Math.random() - 0.5) * rect.width * scaleX * 0.3,
            y: cy + (Math.random() - 0.5) * rect.height * scaleY * 0.3,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 2.5,
            alpha: 0.8,
            decay: 0.96 + Math.random() * 0.02,
          });
        }
        burstsRef.current = [...burstsRef.current, ...particles];
        break;
      }

      case "swirl": {
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        swirlRef.current = {
          centerX: cmd.center.x * scaleX,
          centerY: cmd.center.y * scaleY,
          radius: cmd.radius * scaleX,
          active: true,
          strength: 2,
        };
        // Auto-deactivate after 2s
        setTimeout(() => {
          swirlRef.current.active = false;
        }, 2000);
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

  // ── Animation loop ──────────────────────────────────────────────

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

      // Smooth dim interpolation
      dimFactorRef.current += (dimTargetRef.current - dimFactorRef.current) * 0.05;

      ctx.clearRect(0, 0, w, h);

      const dim = dimFactorRef.current;
      const swirl = swirlRef.current;

      // ── Draw wisps ─────────────────────────────────────────────
      for (const wisp of wispsRef.current) {
        wisp.x += wisp.vx * currentMood.speed;
        wisp.y += wisp.vy * currentMood.speed;
        wisp.vx += (Math.random() - 0.5) * 0.01;
        wisp.vy += (Math.random() - 0.5) * 0.01;
        wisp.vx *= 0.99;
        wisp.vy *= 0.99;

        // Edge wrap
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

      // ── Draw motes ─────────────────────────────────────────────
      for (const mote of motesRef.current) {
        // Apply swirl if active
        if (swirl.active) {
          const dx = mote.x - swirl.centerX;
          const dy = mote.y - swirl.centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < swirl.radius && dist > 0) {
            const factor = (1 - dist / swirl.radius) * swirl.strength;
            mote.vx += (-dy / dist) * factor * 0.1;
            mote.vy += (dx / dist) * factor * 0.1;
          }
        }

        mote.x += mote.vx * currentMood.speed;
        mote.y += mote.vy * currentMood.speed;
        mote.vx += (Math.random() - 0.5) * 0.02;
        mote.vy += (Math.random() - 0.5) * 0.02;
        mote.vx *= 0.99;
        mote.vy *= 0.99;

        // Edge wrap
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

      // ── Draw converge particles ────────────────────────────────
      convergeRef.current = convergeRef.current.filter((p) => {
        if (p.arrived) return false;
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        const dist = Math.sqrt((p.targetX - p.x) ** 2 + (p.targetY - p.y) ** 2);
        if (dist < 3) {
          p.arrived = true;
          return false;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 78, ${p.alpha * dim})`;
        ctx.fill();
        return true;
      });

      // ── Draw burst particles ───────────────────────────────────
      burstsRef.current = burstsRef.current.filter((p) => {
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

      // Decay swirl strength
      if (swirl.active) {
        swirl.strength *= 0.995;
      }

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

export const LyraParticles = memo(forwardRef(LyraParticlesInner));
