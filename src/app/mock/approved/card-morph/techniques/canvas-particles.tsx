"use client";

import { useEffect, useRef, useCallback } from "react";
import type { TechniqueProps } from "../types";

/**
 * Technique 8: Canvas Particles
 * 500+ gold particles stream along bezier curves to card positions.
 * Comet trails, inverse-square attraction. The only canvas-rendered technique.
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

export function CanvasParticles({ morphed, onMorphComplete, children }: TechniqueProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const morphedRef = useRef(morphed);
  const completedRef = useRef(false);
  const startTimeRef = useRef(0);
  const oracleImageRef = useRef<HTMLImageElement | null>(null);
  const hasChildrenRef = useRef(!!children);

  morphedRef.current = morphed;
  hasChildrenRef.current = !!children;

  useEffect(() => {
    const img = new Image();
    img.src = "/mock/cards/the-oracle.png";
    img.onload = () => { oracleImageRef.current = img; };
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;

    // Card rect for target positions
    const cardW = width * 0.7;
    const cardH = height * 0.8;
    const cardX = cx - cardW / 2;
    const cardY = cy - cardH / 2;

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      // Scatter from edges
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(width, height) * 0.6;
      const originX = cx + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
      const originY = cy + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);

      // Target on card surface
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

      for (const p of particlesRef.current) {
        const tx = isMorphed ? p.targetX : p.originX;
        const ty = isMorphed ? p.targetY : p.originY;

        const dx = tx - p.x;
        const dy = ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Inverse-square attraction
        const force = Math.min(0.08, 200 / (dist * dist + 100));
        p.vx += dx * force;
        p.vy += dy * force;

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

        // Draw trail
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

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 78, ${p.alpha})`;
        ctx.fill();

        if (dist < 2) settledCount++;
      }

      // Draw "Ask the Oracle" text in scattered state (only when no children)
      if (!isMorphed && !hasChildrenRef.current) {
        const textAlpha = Math.max(0, 1 - elapsed / 2000) * 0.7 + 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha * 0.8})`;
        ctx.font = "bold 16px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Ask the Oracle", rect.width / 2, rect.height / 2);

        // Sparkle icon
        ctx.fillStyle = `rgba(201, 169, 78, ${textAlpha})`;
        ctx.font = "32px system-ui";
        ctx.fillText("✦", rect.width / 2, rect.height / 2 - 40);
      }

      // Card outline (visible when morphed and particles settling)
      if (isMorphed && elapsed > 800) {
        const cardW = rect.width * 0.7;
        const cardH = rect.height * 0.8;
        const cardX = rect.width / 2 - cardW / 2;
        const cardY = rect.height / 2 - cardH / 2;
        const alpha = Math.min((elapsed - 800) / 500, 0.8);

        ctx.strokeStyle = `rgba(201, 169, 78, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.stroke();

        // Draw oracle image and title only when no children (children handle their own content)
        if (!hasChildrenRef.current) {
          if (oracleImageRef.current && elapsed > 1000) {
            const imgAlpha = Math.min((elapsed - 1000) / 500, 1);
            ctx.globalAlpha = imgAlpha;
            const imgSize = Math.min(cardW, cardH) * 0.4;
            ctx.drawImage(
              oracleImageRef.current,
              rect.width / 2 - imgSize / 2,
              rect.height / 2 - imgSize / 2 - 20,
              imgSize,
              imgSize
            );
            ctx.globalAlpha = 1;
          }

          // Title
          if (elapsed > 1200) {
            const titleAlpha = Math.min((elapsed - 1200) / 400, 0.9);
            ctx.fillStyle = `rgba(201, 169, 78, ${titleAlpha})`;
            ctx.font = "bold 14px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("THE ORACLE", rect.width / 2, rect.height / 2 + cardH * 0.35);
          }

          // Sparkle icon
          if (elapsed > 1000) {
            const iconAlpha = Math.min((elapsed - 1000) / 400, 0.8);
            ctx.fillStyle = `rgba(201, 169, 78, ${iconAlpha})`;
            ctx.font = "24px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("✦", rect.width / 2, rect.height / 2 - 20);
          }
        }
      }

      // Check completion
      if (settledCount > PARTICLE_COUNT * 0.9 && !completedRef.current && elapsed > 500) {
        completedRef.current = true;
        onMorphComplete?.();
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [morphed, initParticles, onMorphComplete]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Children base layer — rendered behind the canvas */}
      {children && (
        <div className="absolute inset-0 z-0">{children}</div>
      )}
      {/* Canvas particle overlay — always on top */}
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
