"use client";

import { useRef, useEffect, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

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

export interface StardustOverlayProps {
  /** When true, the animation runs */
  active: boolean;
  /** Bounding rect of the card being charged, relative to the canvas container */
  targetRect: DOMRect | null;
  /** Called when all particles have converged on the border (or after timeout) */
  onComplete?: () => void;
  /**
   * Number of particles to generate.
   * Defaults: full tier=200, reduced tier=80.
   * Pass 0 to skip canvas rendering (minimal/reduced-motion tier).
   */
  particleCount?: number;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildBorderPoints(rect: DOMRect, canvasRect: DOMRect, step = 3): [number, number][] {
  const points: [number, number][] = [];
  // Offset rect into canvas-local coords
  const x = rect.left - canvasRect.left;
  const y = rect.top - canvasRect.top;
  const w = rect.width;
  const h = rect.height;

  // Top edge
  for (let px = x; px <= x + w; px += step) points.push([px, y]);
  // Right edge
  for (let py = y; py <= y + h; py += step) points.push([x + w, py]);
  // Bottom edge (reverse)
  for (let px = x + w; px >= x; px -= step) points.push([px, y + h]);
  // Left edge (reverse)
  for (let py = y + h; py >= y; py -= step) points.push([x, py]);

  return points;
}

function createParticles(
  canvasW: number,
  canvasH: number,
  borderPoints: [number, number][],
  count: number
): StarParticle[] {
  const particles: StarParticle[] = [];

  // Distribute count particles across border points
  // If count < borderPoints.length, sample border points evenly
  const total = Math.min(count, borderPoints.length);
  const step = borderPoints.length / total;

  for (let i = 0; i < total; i++) {
    const [tx, ty] = borderPoints[Math.floor(i * step)];
    particles.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH,
      targetX: tx,
      targetY: ty,
      speed: 0.018 + Math.random() * 0.025,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.5,
      onBorder: false,
    });
  }

  return particles;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function StardustOverlay({
  active,
  targetRect,
  onComplete,
  particleCount = 200,
}: StardustOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const completedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAnimation = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    // Skip if no particles requested (minimal tier)
    if (particleCount === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    if (!active || !targetRect) {
      stopAnimation();
      clearCanvas();
      return;
    }

    completedRef.current = false;

    // Size canvas to container
    const containerRect = container.getBoundingClientRect();
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, particleCount === 80 ? 1 : 2);

    canvas.width = containerRect.width * dpr;
    canvas.height = containerRect.height * dpr;
    canvas.style.width = `${containerRect.width}px`;
    canvas.style.height = `${containerRect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const logicalW = containerRect.width;
    const logicalH = containerRect.height;

    // Build border points from targetRect (absolute) relative to canvas container (absolute)
    const borderPoints = buildBorderPoints(targetRect, containerRect);
    if (borderPoints.length === 0) return;

    const particles = createParticles(logicalW, logicalH, borderPoints, particleCount);

    // Safety timeout: fire onComplete after 1.8s regardless of particle state
    timeoutRef.current = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        stopAnimation();
        clearCanvas();
        onComplete?.();
      }
    }, 1800);

    const animate = () => {
      ctx.clearRect(0, 0, logicalW, logicalH);

      let allOnBorder = true;

      for (const p of particles) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1.5) {
          p.x += dx * p.speed;
          p.y += dy * p.speed;
          // Accelerate toward target, cap at 0.18
          p.speed = Math.min(p.speed * 1.012, 0.18);
          allOnBorder = false;
        } else {
          p.onBorder = true;
          p.x = p.targetX;
          p.y = p.targetY;
        }

        // Draw particle — glow trail + core
        const glow = p.onBorder ? 0.95 : p.alpha;
        const particleSize = p.onBorder ? p.size * 0.7 : p.size;

        if (!p.onBorder) {
          // Trail glow
          ctx.fillStyle = `rgba(201,169,78,${glow * 0.25})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core particle
        ctx.fillStyle = `rgba(201,169,78,${glow})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
        ctx.fill();

        // Border sparkle: extra shimmer when on border
        if (p.onBorder) {
          ctx.fillStyle = `rgba(255,220,120,0.6)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, particleSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (allOnBorder && !completedRef.current) {
        completedRef.current = true;
        // Small pause so user sees the fully formed border
        timeoutRef.current = setTimeout(() => {
          clearCanvas();
          onComplete?.();
        }, 250);
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      stopAnimation();
      clearCanvas();
    };
  }, [active, targetRect, particleCount, onComplete, stopAnimation, clearCanvas]);

  if (particleCount === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 pointer-events-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
