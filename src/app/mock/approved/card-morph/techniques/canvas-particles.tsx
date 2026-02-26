"use client";

import { useEffect, useRef, useCallback } from "react";
import type { TechniqueProps } from "../types";

/**
 * Technique: Canvas Particles
 * 500+ gold particles stream along bezier curves to card positions.
 *
 * stageTransition: scatter particles to edges → call onMidpoint → converge back
 * morphed toggle: same scatter/converge cycle
 */

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  trail: { x: number; y: number }[];
}

const PARTICLE_COUNT = 500;
const TRAIL_LENGTH = 6;

export function CanvasParticles({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const morphedRef = useRef(morphed);
  const completedRef = useRef(false);
  const startTimeRef = useRef(0);
  const prevStageKeyRef = useRef<string | null>(null);
  const phaseRef = useRef<"idle" | "scatter" | "converge">("idle");
  const midpointCalledRef = useRef(false);
  const stageTransitionRef = useRef(stageTransition);

  morphedRef.current = morphed;
  stageTransitionRef.current = stageTransition;

  const initParticles = useCallback((width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;

    const cardW = width * 0.7;
    const cardH = height * 0.8;
    const cardX = cx - cardW / 2;
    const cardY = cy - cardH / 2;

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(width, height) * 0.6;
      const originX = cx + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
      const originY = cy + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);

      const targetX = cardX + Math.random() * cardW;
      const targetY = cardY + Math.random() * cardH;

      return {
        x: originX,
        y: originY,
        targetX,
        targetY,
        originX,
        originY,
        vx: 0,
        vy: 0,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
        trail: [],
      };
    });
  }, []);

  // Handle stageTransition
  useEffect(() => {
    if (!stageTransition) {
      prevStageKeyRef.current = null;
      return;
    }
    if (stageTransition.key === prevStageKeyRef.current) return;
    prevStageKeyRef.current = stageTransition.key;

    phaseRef.current = "scatter";
    midpointCalledRef.current = false;
    completedRef.current = false;
    startTimeRef.current = performance.now();
  }, [stageTransition?.key]);

  // Handle morphed toggle
  useEffect(() => {
    if (stageTransition) return;

    completedRef.current = false;
    startTimeRef.current = performance.now();
    phaseRef.current = "idle";
  }, [morphed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    initParticles(rect.width, rect.height);
    completedRef.current = false;
    startTimeRef.current = performance.now();

    const tick = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, rect.width, rect.height);

      let settledCount = 0;
      const isMorphed = morphedRef.current;
      const elapsed = performance.now() - startTimeRef.current;
      const phase = phaseRef.current;

      if (phase === "scatter" && elapsed > 600 && !midpointCalledRef.current) {
        midpointCalledRef.current = true;
        stageTransitionRef.current?.onMidpoint();
        phaseRef.current = "converge";
        startTimeRef.current = performance.now();
      }

      for (const p of particlesRef.current) {
        let tx: number, ty: number;

        if (phase === "scatter") {
          tx = p.originX;
          ty = p.originY;
        } else {
          tx = isMorphed ? p.targetX : p.originX;
          ty = isMorphed ? p.targetY : p.originY;
        }

        const dx = tx - p.x;
        const dy = ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const force = Math.min(0.08, 200 / (dist * dist + 100));
        p.vx += dx * force;
        p.vy += dy * force;

        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = `rgba(201, 169, 78, ${p.alpha * 0.3})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 78, ${p.alpha})`;
        ctx.fill();

        if (dist < 2) settledCount++;
      }

      if (settledCount > PARTICLE_COUNT * 0.9 && !completedRef.current && elapsed > 500) {
        completedRef.current = true;
        if (phase === "converge") {
          phaseRef.current = "idle";
        }
        onMorphComplete?.();
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [morphed, initParticles, onMorphComplete, stageTransition?.key]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {children && (
        <div className="absolute inset-0 z-0">{children}</div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: "block",
          ...(children
            ? { position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }
            : undefined),
        }}
      />
    </div>
  );
}
