"use client";

import { useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import type { MoodId } from "../_shared/types";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  type: "mote" | "wisp";
}

const MOOD_CONFIG: Record<MoodId, { moteCount: number; wispCount: number; speed: number; warmth: number; density: number }> = {
  default:  { moteCount: 35, wispCount: 15, speed: 0.3, warmth: 0.5, density: 1.0 },
  reading:  { moteCount: 50, wispCount: 20, speed: 0.2, warmth: 0.9, density: 1.4 },
  creating: { moteCount: 40, wispCount: 12, speed: 0.5, warmth: 0.7, density: 1.2 },
  viewing:  { moteCount: 30, wispCount: 10, speed: 0.25, warmth: 0.4, density: 0.8 },
  warm:     { moteCount: 45, wispCount: 18, speed: 0.35, warmth: 0.85, density: 1.3 },
};

function DreamParticlesInner({ mood }: { mood: MoodId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const animFrameRef = useRef<number>(0);
  const moodRef = useRef(mood);
  moodRef.current = mood;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 640;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    function initMotes() {
      const config = MOOD_CONFIG[moodRef.current];
      const motes = isMobile ? Math.floor(config.moteCount * 0.57) : config.moteCount;
      const wisps = isMobile ? Math.floor(config.wispCount * 0.53) : config.wispCount;
      const particles: Mote[] = [];

      for (let i = 0; i < motes; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.3 - 0.1,
          size: 1 + Math.random() * 2,
          alpha: 0.2 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          type: "mote",
        });
      }

      for (let i = 0; i < wisps; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          size: 8 + Math.random() * 16,
          alpha: 0.03 + Math.random() * 0.06,
          phase: Math.random() * Math.PI * 2,
          type: "wisp",
        });
      }

      motesRef.current = particles;
    }
    initMotes();

    let t = 0;
    function draw() {
      if (!ctx || !canvas) return;
      const config = MOOD_CONFIG[moodRef.current];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      for (const p of motesRef.current) {
        // Brownian drift
        p.vx += (Math.random() - 0.5) * 0.02 * config.speed;
        p.vy += (Math.random() - 0.5) * 0.02 * config.speed;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        // Gentle oscillation
        p.x += Math.sin(t + p.phase) * 0.15;
        p.y += Math.cos(t * 0.7 + p.phase) * 0.1;

        // Wrap edges
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const flicker = 0.7 + Math.sin(t * 2 + p.phase) * 0.3;
        const a = p.alpha * flicker * config.density;

        if (p.type === "mote") {
          // Amber-gold motes
          const r = Math.floor(212 + config.warmth * 30);
          const g = Math.floor(168 - config.warmth * 20);
          const b = Math.floor(67 - config.warmth * 20);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          ctx.fill();
          // Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.15})`;
          ctx.fill();
        } else {
          // Moonlight-blue wisps
          const r = 196 - Math.floor(config.warmth * 40);
          const g = 206 - Math.floor(config.warmth * 30);
          const b = 255;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.8})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Vignette overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: mood === "reading"
            ? "radial-gradient(ellipse at center, transparent 30%, rgba(10,11,30,0.6) 100%)"
            : "radial-gradient(ellipse at center, transparent 40%, rgba(10,11,30,0.4) 100%)",
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </div>
  );
}

export const DreamParticles = memo(DreamParticlesInner);
