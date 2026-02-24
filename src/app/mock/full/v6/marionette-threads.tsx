"use client";

import { useRef, useEffect, useCallback } from "react";
import type { MoodId } from "../_shared/types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AmbientThread {
  kind: "ambient";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cpOffset: number; // control-point sag amount
  swayPhase: number; // phase offset for sway
  swayAmplitude: number;
  swaySpeed: number;
  thickness: number;
  alpha: number;
}

interface StructuralThread {
  kind: "structural";
  // Top anchor (puppeteer bar)
  topX: number;
  topY: number;
  // Bottom anchor (target UI region)
  targetX: number;
  targetY: number;
  // Current animated position (spring-interpolated)
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  thickness: number;
  alpha: number;
}

type Thread = AmbientThread | StructuralThread;

// ─── Mood Configuration ─────────────────────────────────────────────────────

interface MoodConfig {
  ambientCount: number;
  structuralCount: number;
  goldR: number;
  goldG: number;
  goldB: number;
  glowAlpha: number;
}

const MOOD_CONFIGS: Record<MoodId, MoodConfig> = {
  default: {
    ambientCount: 10,
    structuralCount: 4,
    goldR: 201, goldG: 169, goldB: 78,
    glowAlpha: 0.12,
  },
  reading: {
    ambientCount: 14,
    structuralCount: 5,
    goldR: 180, goldG: 150, goldB: 120,
    glowAlpha: 0.18,
  },
  creating: {
    ambientCount: 12,
    structuralCount: 4,
    goldR: 220, goldG: 180, goldB: 60,
    glowAlpha: 0.15,
  },
  warm: {
    ambientCount: 12,
    structuralCount: 4,
    goldR: 210, goldG: 170, goldB: 80,
    glowAlpha: 0.14,
  },
  viewing: {
    ambientCount: 8,
    structuralCount: 3,
    goldR: 201, goldG: 169, goldB: 78,
    glowAlpha: 0.10,
  },
};

// ─── Spring Physics ─────────────────────────────────────────────────────────

const STIFFNESS = 0.08;
const DAMPING = 0.85;

function springStep(
  current: number,
  target: number,
  velocity: number
): [number, number] {
  const force = (target - current) * STIFFNESS;
  const newVelocity = (velocity + force) * DAMPING;
  return [current + newVelocity, newVelocity];
}

// ─── Thread Factories ───────────────────────────────────────────────────────

function createAmbientThread(w: number, h: number): AmbientThread {
  const margin = w * 0.1;
  return {
    kind: "ambient",
    x1: margin + Math.random() * (w - margin * 2),
    y1: Math.random() * h * 0.3,
    x2: margin + Math.random() * (w - margin * 2),
    y2: h * 0.6 + Math.random() * h * 0.4,
    cpOffset: 30 + Math.random() * 60,
    swayPhase: Math.random() * Math.PI * 2,
    swayAmplitude: 15 + Math.random() * 30,
    swaySpeed: 0.0006 + Math.random() * 0.0008,
    thickness: 0.4 + Math.random() * 0.8,
    alpha: 0.15 + Math.random() * 0.25,
  };
}

function createStructuralThread(
  w: number,
  h: number,
  index: number,
  count: number
): StructuralThread {
  const spacing = w / (count + 1);
  const topX = spacing * (index + 1);
  const targetX = spacing * (index + 1) + (Math.random() - 0.5) * spacing * 0.5;
  const targetY = h * 0.4 + Math.random() * h * 0.35;
  return {
    kind: "structural",
    topX,
    topY: -10,
    targetX,
    targetY,
    currentX: targetX,
    currentY: targetY,
    velocityX: 0,
    velocityY: 0,
    thickness: 0.6 + Math.random() * 0.6,
    alpha: 0.3 + Math.random() * 0.2,
  };
}

// ─── Draw a bezier thread ───────────────────────────────────────────────────

function drawThread(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  sag: number,
  thickness: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
  glowAlpha: number
) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + sag;

  // Glow pass
  ctx.save();
  ctx.globalAlpha = glowAlpha * alpha;
  ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.lineWidth = thickness + 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();
  ctx.restore();

  // Core pass
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();
  ctx.restore();
}

// ─── Component ──────────────────────────────────────────────────────────────

export interface MarionetteThreadsProps {
  mood?: MoodId;
}

export function MarionetteThreads({ mood = "default" }: MarionetteThreadsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const threadsRef = useRef<Thread[]>([]);
  const moodRef = useRef<MoodId>(mood);
  const lastTimeRef = useRef<number>(0);

  moodRef.current = mood;

  // Build initial pool
  const buildPool = useCallback(
    (w: number, h: number, config: MoodConfig, mobile: boolean): Thread[] => {
      const threads: Thread[] = [];
      const ambientCount = mobile
        ? Math.ceil(config.ambientCount * 0.5)
        : config.ambientCount;
      const structuralCount = mobile
        ? Math.ceil(config.structuralCount * 0.6)
        : config.structuralCount;

      for (let i = 0; i < ambientCount; i++) {
        threads.push(createAmbientThread(w, h));
      }
      for (let i = 0; i < structuralCount; i++) {
        threads.push(createStructuralThread(w, h, i, structuralCount));
      }
      return threads;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const isMobile = window.innerWidth < 768;
    const dpr = window.devicePixelRatio || 1;

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

    const config = MOOD_CONFIGS[moodRef.current];
    threadsRef.current = buildPool(
      window.innerWidth,
      window.innerHeight,
      config,
      isMobile
    );

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDelta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDelta, 50) / (1000 / 60);

      const W = window.innerWidth;
      const H = window.innerHeight;
      const currentConfig = MOOD_CONFIGS[moodRef.current];
      const { goldR: r, goldG: g, goldB: b, glowAlpha } = currentConfig;

      ctx.clearRect(0, 0, W, H);

      for (const thread of threadsRef.current) {
        if (thread.kind === "ambient") {
          // Compute sway offset
          const sway =
            Math.sin(timestamp * thread.swaySpeed + thread.swayPhase) *
            thread.swayAmplitude;

          const sx1 = thread.x1 + sway * 0.6;
          const sx2 = thread.x2 - sway * 0.4;

          drawThread(
            ctx,
            sx1,
            thread.y1,
            sx2,
            thread.y2,
            thread.cpOffset + Math.sin(timestamp * 0.0003 + thread.swayPhase) * 15,
            thread.thickness,
            r,
            g,
            b,
            thread.alpha,
            glowAlpha
          );
        } else {
          // Structural thread — spring toward target
          const [newX, newVx] = springStep(
            thread.currentX,
            thread.targetX,
            thread.velocityX * dt
          );
          const [newY, newVy] = springStep(
            thread.currentY,
            thread.targetY,
            thread.velocityY * dt
          );
          thread.currentX = newX;
          thread.currentY = newY;
          thread.velocityX = newVx;
          thread.velocityY = newVy;

          // Gentle sway on the bottom anchor
          const sway =
            Math.sin(timestamp * 0.0005 + thread.topX * 0.01) * 8;

          drawThread(
            ctx,
            thread.topX,
            thread.topY,
            thread.currentX + sway,
            thread.currentY,
            30 + Math.abs(thread.currentY - thread.topY) * 0.08,
            thread.thickness,
            r,
            g,
            b,
            thread.alpha,
            glowAlpha
          );
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => setSize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [buildPool]);

  return (
    <>
      {/* Reduced-motion fallback: subtle golden gradient */}
      <div
        aria-hidden="true"
        className="marionette-threads-static"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,78,0.06) 0%, transparent 70%)," +
            "radial-gradient(ellipse 50% 40% at 30% 20%, rgba(201,169,78,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="marionette-threads-canvas"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Top puppeteer bar glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, transparent 10%, rgba(201,169,78,0.3) 30%, rgba(201,169,78,0.5) 50%, rgba(201,169,78,0.3) 70%, transparent 90%)",
          boxShadow: "0 0 20px 4px rgba(201,169,78,0.15)",
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .marionette-threads-static {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marionette-threads-canvas {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
