"use client";

import { memo, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { AuroraMoodConfig } from "./aurora-journey-theme";
import type { AuroraCommand } from "./aurora-journey-state";

// ── Ribbon data ────────────────────────────────────────────────────

interface Ribbon {
  yCenter: number;         // Vertical center as fraction (0-1)
  width: number;           // Ribbon width in px
  speed: number;           // Individual speed multiplier
  phase: number;           // Phase offset for sine waves
  hueOffset: number;       // Individual hue offset
  terms: { freq: number; amp: number; phase: number }[];
}

// ── Public handle ──────────────────────────────────────────────────

export interface AuroraRibbonHandle {
  executeCommand: (cmd: AuroraCommand) => void;
}

// ── Component ──────────────────────────────────────────────────────

interface AuroraRibbonsProps {
  mood: AuroraMoodConfig;
}

const MOBILE_BREAKPOINT = 768;

function AuroraRibbonsInner(
  { mood }: AuroraRibbonsProps,
  ref: React.Ref<AuroraRibbonHandle>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ribbonsRef = useRef<Ribbon[]>([]);
  const moodRef = useRef(mood);
  const dimFactorRef = useRef(1);
  const dimTargetRef = useRef(1);
  const gatherTargetRef = useRef<{ x: number; y: number } | null>(null);
  const pulseRef = useRef({ active: false, intensity: 0, decay: 0.98 });
  const hueShiftRef = useRef({ current: 0, target: 0, speed: 0.02 });
  const rafRef = useRef<number>(0);

  moodRef.current = mood;

  // ── Ribbon initialization ─────────────────────────────────────

  const initRibbons = useCallback((count: number, height: number, isMobile: boolean) => {
    const ribbons: Ribbon[] = [];
    const termCount = isMobile ? 2 : 3;

    for (let i = 0; i < count; i++) {
      const terms: { freq: number; amp: number; phase: number }[] = [];
      for (let t = 0; t < termCount; t++) {
        terms.push({
          freq: 0.002 + Math.random() * 0.004,
          amp: 0.5 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      }

      ribbons.push({
        yCenter: 0.15 + (i / Math.max(count - 1, 1)) * 0.7,
        width: 30 + Math.random() * 40,
        speed: 0.7 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        hueOffset: (Math.random() - 0.5) * 40,
        terms,
      });
    }
    return ribbons;
  }, []);

  // ── Command execution ─────────────────────────────────────────

  const executeCommand = useCallback((cmd: AuroraCommand) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    switch (cmd.type) {
      case "gather": {
        const rect = cmd.targetRect;
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        gatherTargetRef.current = {
          x: (rect.left + rect.width / 2) * scaleX,
          y: (rect.top + rect.height / 2) * scaleY,
        };
        // Auto-release after 1.5s
        setTimeout(() => {
          gatherTargetRef.current = null;
        }, 1500);
        break;
      }
      case "release":
        gatherTargetRef.current = null;
        pulseRef.current = { active: true, intensity: 0.6, decay: 0.96 };
        break;
      case "pulse":
        pulseRef.current = { active: true, intensity: cmd.intensity, decay: 0.98 };
        break;
      case "shift_hue":
        hueShiftRef.current.target = cmd.targetHue;
        hueShiftRef.current.speed = 1 / (cmd.duration * 60); // Approximate frames
        break;
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

  // ── Animation loop ────────────────────────────────────────────

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
    const ribbonCount = isMobile
      ? Math.max(3, Math.floor(moodRef.current.ribbonCount * 0.6))
      : moodRef.current.ribbonCount;
    const stepSize = isMobile ? 6 : 4;

    ribbonsRef.current = initRibbons(ribbonCount, canvas.offsetHeight, isMobile);

    let time = 0;

    const loop = () => {
      time += 0.016;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const currentMood = moodRef.current;

      // Smooth dim interpolation
      dimFactorRef.current += (dimTargetRef.current - dimFactorRef.current) * 0.05;

      // Pulse decay
      if (pulseRef.current.active) {
        pulseRef.current.intensity *= pulseRef.current.decay;
        if (pulseRef.current.intensity < 0.01) {
          pulseRef.current.active = false;
        }
      }

      // Hue shift interpolation
      const hs = hueShiftRef.current;
      hs.current += (hs.target - hs.current) * hs.speed;

      ctx.clearRect(0, 0, w, h);

      const dim = dimFactorRef.current;
      const pulseBoost = pulseRef.current.active ? pulseRef.current.intensity : 0;
      const gatherTarget = gatherTargetRef.current;

      for (const ribbon of ribbonsRef.current) {
        const baseY = ribbon.yCenter * h;
        const hue = currentMood.hueCenter + ribbon.hueOffset + hs.current;
        const sat = currentMood.saturation * 100;
        const baseAlpha = currentMood.brightness * dim * (0.08 + pulseBoost * 0.1);

        // Build top and bottom edge paths
        ctx.beginPath();

        // Top edge: left to right
        for (let x = 0; x <= w; x += stepSize) {
          let yOffset = 0;
          for (const term of ribbon.terms) {
            yOffset += Math.sin(
              x * term.freq + time * currentMood.speed * ribbon.speed + term.phase + ribbon.phase
            ) * term.amp * currentMood.amplitude;
          }

          // Gather effect: bend toward target
          if (gatherTarget) {
            const dx = gatherTarget.x - x;
            const dy = gatherTarget.y - (baseY + yOffset);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pull = Math.max(0, 1 - dist / (w * 0.5)) * 30;
            yOffset += (dy > 0 ? 1 : -1) * pull;
          }

          const y = baseY + yOffset - ribbon.width / 2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Bottom edge: right to left
        for (let x = w; x >= 0; x -= stepSize) {
          let yOffset = 0;
          for (const term of ribbon.terms) {
            yOffset += Math.sin(
              x * term.freq + time * currentMood.speed * ribbon.speed + term.phase + ribbon.phase + 0.5
            ) * term.amp * currentMood.amplitude * 0.8;
          }

          if (gatherTarget) {
            const dx = gatherTarget.x - x;
            const dy = gatherTarget.y - (baseY + yOffset);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pull = Math.max(0, 1 - dist / (w * 0.5)) * 30;
            yOffset += (dy > 0 ? 1 : -1) * pull;
          }

          const y = baseY + yOffset + ribbon.width / 2;
          ctx.lineTo(x, y);
        }

        ctx.closePath();

        // Fill with horizontal gradient (transparent → color → transparent)
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        const color = `hsla(${hue}, ${sat}%, 60%, ${baseAlpha})`;
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.15, color);
        gradient.addColorStop(0.5, `hsla(${hue}, ${sat}%, 65%, ${baseAlpha * 1.3})`);
        gradient.addColorStop(0.85, color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fill();
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
  }, [initRibbons]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
    />
  );
}

export const AuroraRibbons = memo(forwardRef(AuroraRibbonsInner));
