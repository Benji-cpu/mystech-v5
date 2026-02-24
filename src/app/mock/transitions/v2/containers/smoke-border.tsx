"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 45 = gold, 270 = purple
}

export function SmokeBorder({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  const spawnParticle = useCallback((w: number, h: number): Particle => {
    // Spawn on a random edge
    const edge = Math.floor(Math.random() * 4);
    let x = 0,
      y = 0,
      vx = 0,
      vy = 0;

    switch (edge) {
      case 0: // top
        x = Math.random() * w;
        y = 0;
        vx = (Math.random() - 0.5) * 0.5;
        vy = -0.3 - Math.random() * 0.5;
        break;
      case 1: // right
        x = w;
        y = Math.random() * h;
        vx = 0.3 + Math.random() * 0.5;
        vy = (Math.random() - 0.5) * 0.5;
        break;
      case 2: // bottom
        x = Math.random() * w;
        y = h;
        vx = (Math.random() - 0.5) * 0.5;
        vy = 0.3 + Math.random() * 0.5;
        break;
      case 3: // left
      default:
        x = 0;
        y = Math.random() * h;
        vx = -0.3 - Math.random() * 0.5;
        vy = (Math.random() - 0.5) * 0.5;
        break;
    }

    return {
      x,
      y,
      vx,
      vy,
      life: 0,
      maxLife: 60 + Math.random() * 80,
      size: 2 + Math.random() * 4,
      hue: Math.random() > 0.4 ? 270 : 45,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();

    // Initialize particles
    const count =
      typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 200;
    particlesRef.current = Array.from({ length: count }, () => {
      const p = spawnParticle(canvas.width, canvas.height);
      p.life = Math.random() * p.maxLife; // stagger initial states
      return p;
    });

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life >= p.maxLife) {
          Object.assign(p, spawnParticle(canvas.width, canvas.height));
        }

        // Mouse proximity boost
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            p.vx += (dx / dist) * 0.3;
            p.vy += (dy / dist) * 0.3;
          }
        }

        const alpha = 1 - p.life / p.maxLife;
        const sat = p.hue === 45 ? "70%" : "50%";
        const light = p.hue === 45 ? "55%" : "40%";
        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.size * (1 - (p.life / p.maxLife) * 0.5),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `hsla(${p.hue}, ${sat}, ${light}, ${alpha * 0.4})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [spawnParticle]);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{ background: "#0a0b1e" }}
      onMouseMove={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            active: true,
          };
        }
      }}
      onMouseLeave={() => {
        mouseRef.current.active = false;
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Content */}
      <div
        className="absolute inset-[12px] overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {children}
      </div>

      {/* Subtle border */}
      <div
        className="absolute inset-[4px] pointer-events-none"
        style={{
          border: "1px solid rgba(212,168,67,0.12)",
          zIndex: 3,
        }}
      />
    </div>
  );
}
