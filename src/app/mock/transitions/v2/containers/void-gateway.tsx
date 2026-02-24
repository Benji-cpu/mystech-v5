"use client";

import { useRef, useEffect } from "react";

export function VoidGateway({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

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

    // Create orbiting particles
    const particles: {
      angle: number;
      speed: number;
      radiusX: number;
      radiusY: number;
      size: number;
      hue: number;
    }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.008,
        radiusX: 0.4 + Math.random() * 0.12,
        radiusY: 0.35 + Math.random() * 0.15,
        size: 1 + Math.random() * 2.5,
        hue: Math.random() > 0.5 ? 45 : 270, // gold or purple
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const p of particles) {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.radiusX * canvas.width;
        const y = cy + Math.sin(p.angle) * p.radiusY * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${0.4 + Math.sin(p.angle * 3) * 0.3})`;
        ctx.fill();

        // Trail
        ctx.beginPath();
        ctx.arc(
          x - Math.cos(p.angle) * 4,
          y - Math.sin(p.angle) * 4,
          p.size * 0.6,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.15)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{ background: "#050510" }}
    >
      {/* SVG gravitational lensing filter */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <filter id="void-lens" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              seed="42"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Dark inset shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 40px rgba(0,0,0,0.8), inset 0 0 80px rgba(30,0,60,0.4)",
          zIndex: 3,
        }}
      />

      {/* Content with edge distortion */}
      <div
        className="absolute inset-[12px] overflow-hidden"
        style={{
          filter: "url(#void-lens)",
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Orbiting particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 4 }}
      />

      {/* Edge glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(100,0,200,0.1) 80%, rgba(30,0,60,0.3) 100%)",
          zIndex: 2,
        }}
      />
    </div>
  );
}
