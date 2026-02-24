"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import type { TransitionMood, EffectsHandle } from "./types";
import { MOOD_CONFIGS } from "./types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  hue: number;
  phase: "gather" | "burst" | "fade";
  life: number;
  maxLife: number;
}

interface EffectsLayerProps {
  className?: string;
}

export const EffectsLayer = forwardRef<EffectsHandle, EffectsLayerProps>(
  function EffectsLayer({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const activeRef = useRef(false);

    const spawnParticles = useCallback(
      (mood: TransitionMood, w: number, h: number) => {
        const config = MOOD_CONFIGS[mood];
        const isMobile = w < 640;
        const count = isMobile ? 15 : mood === "deep-portal" ? 40 : 25;
        const particles: Particle[] = [];

        const cx = w / 2;
        const cy = h / 2;

        for (let i = 0; i < count; i++) {
          // Spawn from edges
          const edge = Math.floor(Math.random() * 4);
          let x: number, y: number;
          switch (edge) {
            case 0:
              x = Math.random() * w;
              y = -10;
              break;
            case 1:
              x = w + 10;
              y = Math.random() * h;
              break;
            case 2:
              x = Math.random() * w;
              y = h + 10;
              break;
            default:
              x = -10;
              y = Math.random() * h;
              break;
          }

          // Velocity toward center
          const angle = Math.atan2(cy - y, cx - x);
          const speed = 1.5 + Math.random() * 2;

          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 3,
            alpha: 0,
            maxAlpha: 0.6 + Math.random() * 0.4,
            hue: 40 + Math.random() * 15, // gold range
            phase: "gather",
            life: 0,
            maxLife: config.duration * 60, // frames
          });
        }

        return particles;
      },
      [],
    );

    const animate = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      let anyAlive = false;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        const progress = p.life / p.maxLife;

        if (p.phase === "gather") {
          // Accelerate toward center
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 20) {
            p.vx += (dx / dist) * 0.15;
            p.vy += (dy / dist) * 0.15;
          }
          p.alpha = Math.min(p.alpha + 0.03, p.maxAlpha);

          // Switch to burst at ~45% through
          if (progress > 0.45) {
            p.phase = "burst";
            // Burst outward
            const burstAngle = Math.atan2(p.y - cy, p.x - cx);
            const burstSpeed = 3 + Math.random() * 4;
            p.vx = Math.cos(burstAngle) * burstSpeed;
            p.vy = Math.sin(burstAngle) * burstSpeed;
            p.alpha = 1;
            p.size *= 1.5;
          }
        } else if (p.phase === "burst") {
          // Decelerate
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.alpha *= 0.97;

          if (p.alpha < 0.1) {
            p.phase = "fade";
          }
        } else {
          p.alpha *= 0.92;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.alpha > 0.01) {
          anyAlive = true;

          // Draw glow
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 3,
          );
          gradient.addColorStop(
            0,
            `hsla(${p.hue}, 80%, 65%, ${p.alpha * 0.6})`,
          );
          gradient.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Draw core
          ctx.fillStyle = `hsla(${p.hue}, 70%, 75%, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (anyAlive) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        activeRef.current = false;
        particlesRef.current = [];
      }
    }, []);

    useImperativeHandle(ref, () => ({
      triggerTransition: (mood: TransitionMood) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvas.clientWidth * (window.devicePixelRatio > 1 ? 2 : 1);
        canvas.height =
          canvas.clientHeight * (window.devicePixelRatio > 1 ? 2 : 1);

        particlesRef.current = spawnParticles(
          mood,
          canvas.width,
          canvas.height,
        );

        if (!activeRef.current) {
          activeRef.current = true;
          rafRef.current = requestAnimationFrame(animate);
        }
      },
    }));

    useEffect(() => {
      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />
    );
  },
);
