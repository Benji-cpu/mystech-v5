"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LYRA_STARS, LYRA_LINES } from "./lyra-v3-data";
import type { LyraState } from "./lyra-v3-state";

// ── Organic breathing via pseudo-Perlin noise ───────────────────────────

function pseudoNoise(t: number, seed: number): number {
  // Layered sine waves for organic feel (not true Perlin, but close enough)
  return (
    Math.sin(t * 1.0 + seed) * 0.5 +
    Math.sin(t * 2.3 + seed * 1.7) * 0.25 +
    Math.sin(t * 0.7 + seed * 3.1) * 0.25
  );
}

// ── Props ───────────────────────────────────────────────────────────────

interface LyraGuideProps {
  state: LyraState;
  starsRevealed?: number; // 0-5 for Phase 1 staggered reveal
  linesRevealed?: number; // 0-5 for Phase 1 line drawing
  breathing?: boolean;
  pointingTarget?: { x: number; y: number } | null;
  size?: number; // Pixel size of the SVG container
  position?: { x: number; y: number }; // Normalized 0-1 position within parent
  traveling?: boolean;
  travelFrom?: { x: number; y: number };
  travelTo?: { x: number; y: number };
  onTravelComplete?: () => void;
  className?: string;
}

export function LyraGuide({
  state,
  starsRevealed = 5,
  linesRevealed = 5,
  breathing = true,
  pointingTarget,
  size = 120,
  className,
}: LyraGuideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Star seeds for organic breathing offsets
  const starSeeds = useMemo(() => LYRA_STARS.map((_, i) => i * 2.7 + 0.3), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      timeRef.current += 0.016; // ~60fps
      const t = timeRef.current;
      ctx.clearRect(0, 0, size, size);

      // Breathing parameters based on state
      const breathSpeed = state === "dormant" ? 0.3 : state === "attentive" ? 0.6 : 0.9;
      const breathAmp = state === "dormant" ? 2 : state === "attentive" ? 3 : 4;
      const baseOpacity = state === "dormant" ? 0.4 : state === "attentive" ? 0.8 : 1.0;

      // Calculate animated star positions
      const animatedStars = LYRA_STARS.map((star, i) => {
        if (i >= starsRevealed) return null;
        const noise = breathing ? pseudoNoise(t * breathSpeed, starSeeds[i]) : 0;
        const ox = noise * breathAmp * 0.3;
        const oy = pseudoNoise(t * breathSpeed + 1.5, starSeeds[i]) * breathAmp;
        return {
          x: star.x * size + ox,
          y: star.y * size + oy,
          radius: star.radius * (size / 25),
          opacity: baseOpacity,
        };
      });

      // Draw constellation lines with string vibration
      LYRA_LINES.forEach(([fromIdx, toIdx], lineIdx) => {
        if (lineIdx >= linesRevealed) return;
        const from = animatedStars[fromIdx];
        const to = animatedStars[toIdx];
        if (!from || !to) return;

        // String vibration: midpoint oscillates perpendicular to the line
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        // Perpendicular direction
        const px = -dy / len;
        const py = dx / len;

        // Vibration amplitude varies by state
        const vibAmp = state === "speaking" ? 2.5 : state === "attentive" ? 1.2 : 0.6;
        const vibSpeed = state === "speaking" ? 3 : 1.5;
        const vibration = Math.sin(t * vibSpeed + lineIdx * 1.3) * vibAmp;

        const cpx = mx + px * vibration;
        const cpy = my + py * vibration;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(cpx, cpy, to.x, to.y);
        ctx.strokeStyle = `rgba(201, 169, 78, ${baseOpacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw stars with glow
      animatedStars.forEach((star, i) => {
        if (!star) return;

        // Speaking pulse per star
        const speakingPulse =
          state === "speaking"
            ? 1 + Math.sin(t * 3 + i * 0.5) * 0.3
            : 1;

        const r = star.radius * speakingPulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, r * 4
        );
        gradient.addColorStop(0, `rgba(201, 169, 78, ${star.opacity * 0.3})`);
        gradient.addColorStop(1, "rgba(201, 169, 78, 0)");
        ctx.beginPath();
        ctx.arc(star.x, star.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 78, ${star.opacity})`;
        ctx.fill();

        // Bright center for Vega
        if (i === 0) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 240, ${star.opacity * 0.8})`;
          ctx.fill();
        }
      });

      // Draw pointing line if target exists
      if (pointingTarget) {
        const vega = animatedStars[0];
        if (vega) {
          const tx = pointingTarget.x * size;
          const ty = pointingTarget.y * size;

          // Bezier arc from Vega to target
          const midX = (vega.x + tx) / 2;
          const midY = Math.min(vega.y, ty) - 15;

          ctx.beginPath();
          ctx.moveTo(vega.x, vega.y);
          ctx.quadraticCurveTo(midX, midY, tx, ty);
          ctx.strokeStyle = `rgba(201, 169, 78, ${baseOpacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Target glow circle
          const glowR = 4 + Math.sin(t * 2) * 1;
          ctx.beginPath();
          ctx.arc(tx, ty, glowR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(201, 169, 78, ${baseOpacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, starsRevealed, linesRevealed, breathing, pointingTarget, size, starSeeds]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("pointer-events-none", className)}
      style={{ width: size, height: size }}
    />
  );
}

// ── SVG-based Lyra for Phase 1 staggered reveal ────────────────────────

interface LyraSVGRevealProps {
  starsRevealed: number;
  linesRevealed: number;
  breathing: boolean;
  className?: string;
}

export function LyraSVGReveal({
  starsRevealed,
  linesRevealed,
  breathing,
  className,
}: LyraSVGRevealProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      fill="none"
    >
      {/* Constellation lines */}
      {LYRA_LINES.map(([fromIdx, toIdx], i) => {
        if (i >= linesRevealed) return null;
        const from = LYRA_STARS[fromIdx];
        const to = LYRA_STARS[toIdx];
        return (
          <motion.line
            key={`line-${i}`}
            x1={from.x * 100}
            y1={from.y * 100}
            x2={to.x * 100}
            y2={to.y * 100}
            stroke="rgba(201, 169, 78, 0.3)"
            strokeWidth={0.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { type: "spring", stiffness: 100, damping: 20, delay: i * 0.3 },
              opacity: { duration: 0.3, delay: i * 0.3 },
            }}
          />
        );
      })}

      {/* Stars */}
      {LYRA_STARS.map((star, i) => {
        if (i >= starsRevealed) return null;
        const baseR = i === 0 ? 3 : 2;
        return (
          <motion.g key={star.id}>
            {/* Glow */}
            <motion.circle
              cx={star.x * 100}
              cy={star.y * 100}
              r={baseR * 3}
              fill="rgba(201, 169, 78, 0.1)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: breathing ? [0.05, 0.15, 0.05] : 0.1,
              }}
              transition={
                breathing
                  ? { opacity: { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" } }
                  : { duration: 0.5 }
              }
            />
            {/* Core */}
            <motion.circle
              cx={star.x * 100}
              cy={star.y * 100}
              r={baseR}
              fill="#c9a94e"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: breathing ? [0.6, 1, 0.6] : 0.8,
              }}
              transition={
                breathing
                  ? {
                      scale: { type: "spring", stiffness: 300, damping: 20 },
                      opacity: { duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut" },
                    }
                  : { type: "spring", stiffness: 300, damping: 20 }
              }
            />
            {/* Bright center for Vega */}
            {i === 0 && (
              <motion.circle
                cx={star.x * 100}
                cy={star.y * 100}
                r={baseR * 0.4}
                fill="rgba(255, 255, 240, 0.9)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

// ── Lyra Travel Arc Animation ──────────────────────────────────────────

interface LyraTravelProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export function LyraTravel({
  from,
  to,
  duration = 1.5,
  onComplete,
  className,
}: LyraTravelProps) {
  // Calculate bezier arc — Lyra travels in an arc, not a straight line
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 0.15; // Arc upward

  return (
    <motion.div
      className={cn("absolute pointer-events-none", className)}
      initial={{ left: `${from.x * 100}%`, top: `${from.y * 100}%` }}
      animate={{ left: `${to.x * 100}%`, top: `${to.y * 100}%` }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        duration,
      }}
      onAnimationComplete={onComplete}
    >
      <LyraGuide
        state="attentive"
        size={60}
        breathing
      />
      {/* Trail particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-400/40"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          style={{
            left: -i * 4,
            top: -i * 2,
          }}
        />
      ))}
    </motion.div>
  );
}
