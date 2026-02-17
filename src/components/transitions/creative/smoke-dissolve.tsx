"use client";

import { useRef, useEffect, useCallback } from "react";
import { DemoWrapper } from "../demo-wrapper";
import { TransitionStage } from "../transition-stage";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export function SmokeDissolve() {
  return (
    <DemoWrapper
      title="Smoke Dissolve"
      description="Canvas 2D particle scatter — card dissolves into smoke particles"
      library="Creative"
    >
      {(playing) => <SmokeContent playing={playing} />}
    </DemoWrapper>
  );
}

function SmokeContent({ playing }: { playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const phaseRef = useRef<"solid" | "dissolving" | "dissolved">("solid");

  const drawCard = useCallback((ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cw = 120;
    const ch = 180;
    const cx = (w - cw) / 2;
    const cy = (h - ch) / 2;

    // Card body
    const grad = ctx.createLinearGradient(cx, cy, cx, cy + ch);
    grad.addColorStop(0, "#1a0530");
    grad.addColorStop(1, "#0a0118");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 8);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "rgba(201,169,78,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Star
    ctx.fillStyle = "rgba(201,169,78,0.4)";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("✦", w / 2, h / 2);

    // Title
    ctx.fillStyle = "rgba(201,169,78,0.8)";
    ctx.font = "10px sans-serif";
    ctx.fillText("The Oracle", w / 2, cy + ch - 15);
  }, []);

  const spawnParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cw = 120;
    const ch = 180;
    const cx = (w - cw) / 2;
    const cy = (h - ch) / 2;
    const particles: Particle[] = [];

    for (let i = 0; i < 200; i++) {
      const px = cx + Math.random() * cw;
      const py = cy + Math.random() * ch;
      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        size: Math.random() * 4 + 2,
        alpha: Math.random() * 0.5 + 0.5,
        decay: Math.random() * 0.01 + 0.005,
        color:
          Math.random() > 0.6
            ? `rgba(201,169,78,`
            : `rgba(100,50,150,`,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 280;

    if (!playing) {
      phaseRef.current = "solid";
      particlesRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCard(ctx);
      return;
    }

    phaseRef.current = "solid";
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      if (phaseRef.current === "solid" && frame < 30) {
        drawCard(ctx);
      } else if (phaseRef.current === "solid") {
        phaseRef.current = "dissolving";
        particlesRef.current = spawnParticles(ctx);
      }

      if (phaseRef.current === "dissolving") {
        const particles = particlesRef.current;
        let alive = 0;
        for (const p of particles) {
          if (p.alpha <= 0) continue;
          alive++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.02; // float upward
          p.alpha -= p.decay;
          p.size *= 0.995;

          ctx.fillStyle = p.color + `${Math.max(0, p.alpha)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        if (alive === 0) phaseRef.current = "dissolved";
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, drawCard, spawnParticles]);

  return (
    <TransitionStage>
      <canvas ref={canvasRef} className="max-w-full" />
    </TransitionStage>
  );
}
