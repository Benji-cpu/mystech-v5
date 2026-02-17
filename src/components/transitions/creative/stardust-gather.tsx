"use client";

import { useRef, useEffect, useCallback } from "react";
import { DemoWrapper } from "../demo-wrapper";
import { TransitionStage } from "../transition-stage";

interface StarParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  alpha: number;
  onBorder: boolean;
}

export function StardustGather() {
  return (
    <DemoWrapper
      title="Stardust Gather"
      description="Gold particles converge from chaos to form the card border outline"
      library="Creative"
    >
      {(playing) => <StardustContent playing={playing} />}
    </DemoWrapper>
  );
}

function StardustContent({ playing }: { playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const createParticles = useCallback((w: number, h: number): StarParticle[] => {
    const particles: StarParticle[] = [];
    const cardW = 120;
    const cardH = 180;
    const cx = (w - cardW) / 2;
    const cy = (h - cardH) / 2;

    // Generate particles that will form the card border
    const borderPoints: [number, number][] = [];
    // Top edge
    for (let x = cx; x <= cx + cardW; x += 3) borderPoints.push([x, cy]);
    // Right edge
    for (let y = cy; y <= cy + cardH; y += 3) borderPoints.push([cx + cardW, y]);
    // Bottom edge
    for (let x = cx + cardW; x >= cx; x -= 3) borderPoints.push([x, cy + cardH]);
    // Left edge
    for (let y = cy + cardH; y >= cy; y -= 3) borderPoints.push([cx, y]);

    for (const [tx, ty] of borderPoints) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        targetX: tx,
        targetY: ty,
        speed: 0.02 + Math.random() * 0.03,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.5,
        onBorder: false,
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw scattered particles
      const particles = createParticles(canvas.width, canvas.height);
      for (const p of particles) {
        ctx.fillStyle = `rgba(201,169,78,${p.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    const particles = createParticles(canvas.width, canvas.height);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allDone = true;
      for (const p of particles) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          p.x += dx * p.speed;
          p.y += dy * p.speed;
          p.speed = Math.min(p.speed * 1.01, 0.15); // accelerate
          allDone = false;
        } else {
          p.onBorder = true;
        }

        const glow = p.onBorder ? 0.9 : p.alpha;
        ctx.fillStyle = `rgba(201,169,78,${glow})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.onBorder ? p.size * 0.8 : p.size, 0, Math.PI * 2);
        ctx.fill();

        if (!p.onBorder) {
          ctx.fillStyle = `rgba(201,169,78,${glow * 0.3})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!allDone) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, createParticles]);

  return (
    <TransitionStage>
      <canvas ref={canvasRef} className="max-w-full" />
    </TransitionStage>
  );
}
