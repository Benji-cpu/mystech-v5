"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { TransitionProps } from "../mirror-types";

/**
 * Smoke Dissolve — GSAP + Canvas overlay
 * Canvas overlay renders smoke/particle scatter effect.
 * Outgoing fades during particle burst, incoming fades in as particles settle.
 * ~50 particles with random positions, velocities, opacity fading.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
  color: string;
}

export function SmokeDissolve({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const tlRef = useRef<gsap.core.Timeline | undefined>(undefined);
  const hasRunRef = useRef(-1);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (tlRef.current) tlRef.current.kill();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to container
    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width ?? 300;
    canvas.height = rect?.height ?? 300;

    const W = canvas.width;
    const H = canvas.height;

    // Create particles
    const PARTICLE_COUNT = 55;
    const particles: Particle[] = [];
    const colors = [
      "rgba(150, 100, 200,",
      "rgba(201, 169, 78,",
      "rgba(180, 120, 220,",
      "rgba(100, 80, 160,",
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      particles.push({
        x: W * 0.3 + Math.random() * W * 0.4,
        y: H * 0.3 + Math.random() * H * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // slight upward drift
        radius: 4 + Math.random() * 18,
        opacity: 0,
        maxOpacity: 0.2 + Math.random() * 0.4,
        life: 0,
        maxLife: 40 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Set initial states
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = "1";
      outgoingRef.current.style.transition = "none";
    }
    if (incomingRef.current) {
      incomingRef.current.style.opacity = "0";
      incomingRef.current.style.transition = "none";
    }

    let frame = 0;
    const TOTAL_FRAMES = 80;

    function drawFrame() {
      ctx!.clearRect(0, 0, W, H);

      frame++;

      for (const p of particles) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02; // gravity/buoyancy
        p.vx *= 0.98; // drag

        // Opacity: rise then fall
        const lifeProgress = p.life / p.maxLife;
        if (lifeProgress < 0.3) {
          p.opacity = (lifeProgress / 0.3) * p.maxOpacity;
        } else {
          p.opacity = p.maxOpacity * (1 - (lifeProgress - 0.3) / 0.7);
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius * (1 + lifeProgress * 0.5), 0, Math.PI * 2);

        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `${p.color} ${p.opacity})`);
        gradient.addColorStop(1, `${p.color} 0)`);

        ctx!.fillStyle = gradient;
        ctx!.fill();
      }

      // Fade outgoing out during first half
      const progress = frame / TOTAL_FRAMES;
      if (outgoingRef.current) {
        outgoingRef.current.style.opacity = String(Math.max(0, 1 - progress * 2.5));
      }
      // Fade incoming in during second half
      if (incomingRef.current) {
        incomingRef.current.style.opacity = String(Math.max(0, (progress - 0.4) * (1 / 0.6)));
      }

      if (frame < TOTAL_FRAMES) {
        rafRef.current = requestAnimationFrame(drawFrame);
      } else {
        ctx!.clearRect(0, 0, W, H);
        onComplete();
      }
    }

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [transitionKey, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Outgoing layer */}
      <div ref={outgoingRef} className="absolute inset-0">
        {outgoing}
      </div>

      {/* Incoming layer */}
      <div ref={incomingRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {incoming}
      </div>

      {/* Canvas overlay for smoke particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />
    </div>
  );
}
