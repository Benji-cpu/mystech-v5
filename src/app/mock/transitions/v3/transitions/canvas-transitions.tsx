'use client';

import { useEffect, useRef } from 'react';
import type { TransitionProps } from '../mirror-types';

// ─── FluidSim ────────────────────────────────────────────────────────────────
//
// A simplified Navier-Stokes-inspired fluid simulation rendered on a canvas
// overlay. A density field is seeded with a central impulse that spreads
// outward, advected and diffused each frame. The density is rendered as a
// dark-to-transparent overlay sitting between the old and new content layers.
//
// Timeline (2000 ms total):
//   0 → 1000 ms   old content fades 1→0, new content fades 0→1, density builds
//   1000 → 2000 ms density dissipates, canvas clears, new content fully visible
//   2000 ms        onComplete fired

const FLUID_DURATION = 2000;

function createFluidGrid(size: number): Float32Array {
  return new Float32Array(size * size);
}

function ix(x: number, y: number, size: number): number {
  const cx = Math.max(0, Math.min(size - 1, x));
  const cy = Math.max(0, Math.min(size - 1, y));
  return cy * size + cx;
}

function diffuse(
  b: Float32Array,
  x0: Float32Array,
  diff: number,
  size: number,
): void {
  const a = diff;
  // 4 Gauss-Seidel iterations — cheap but visually convincing
  for (let k = 0; k < 4; k++) {
    for (let j = 1; j < size - 1; j++) {
      for (let i = 1; i < size - 1; i++) {
        b[ix(i, j, size)] =
          (x0[ix(i, j, size)] +
            a *
              (b[ix(i - 1, j, size)] +
                b[ix(i + 1, j, size)] +
                b[ix(i, j - 1, size)] +
                b[ix(i, j + 1, size)])) /
          (1 + 4 * a);
      }
    }
  }
}

function advect(
  d: Float32Array,
  d0: Float32Array,
  vx: Float32Array,
  vy: Float32Array,
  dt: number,
  size: number,
): void {
  const dt0 = dt * (size - 2);
  for (let j = 1; j < size - 1; j++) {
    for (let i = 1; i < size - 1; i++) {
      let x = i - dt0 * vx[ix(i, j, size)];
      let y = j - dt0 * vy[ix(i, j, size)];
      x = Math.max(0.5, Math.min(size - 1.5, x));
      y = Math.max(0.5, Math.min(size - 1.5, y));
      const i0 = Math.floor(x);
      const i1 = i0 + 1;
      const j0 = Math.floor(y);
      const j1 = j0 + 1;
      const s1 = x - i0;
      const s0 = 1 - s1;
      const t1 = y - j0;
      const t0 = 1 - t1;
      d[ix(i, j, size)] =
        s0 * (t0 * d0[ix(i0, j0, size)] + t1 * d0[ix(i0, j1, size)]) +
        s1 * (t0 * d0[ix(i1, j0, size)] + t1 * d0[ix(i1, j1, size)]);
    }
  }
}

export function FluidSim({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oldRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    completedRef.current = false;
    startRef.current = null;

    const canvas = canvasRef.current;
    const oldEl = oldRef.current;
    const newEl = newRef.current;
    if (!canvas || !oldEl || !newEl) return;

    // Grid size: smaller on mobile to keep it performant
    const SIM_SIZE = dimensions.width < 400 ? 64 : 128;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = SIM_SIZE;
    canvas.height = SIM_SIZE;

    // Allocate fluid buffers
    let density = createFluidGrid(SIM_SIZE);
    let densityPrev = createFluidGrid(SIM_SIZE);
    let vx = createFluidGrid(SIM_SIZE);
    let vy = createFluidGrid(SIM_SIZE);
    let vxPrev = createFluidGrid(SIM_SIZE);
    let vyPrev = createFluidGrid(SIM_SIZE);

    // Seed a central impulse — large blob of density + outward velocity
    const cx = Math.floor(SIM_SIZE / 2);
    const cy = Math.floor(SIM_SIZE / 2);
    const radius = Math.floor(SIM_SIZE * 0.18);

    for (let j = cy - radius; j <= cy + radius; j++) {
      for (let i = cx - radius; i <= cx + radius; i++) {
        const dist = Math.sqrt((i - cx) ** 2 + (j - cy) ** 2);
        if (dist < radius) {
          const strength = (1 - dist / radius) ** 2;
          density[ix(i, j, SIM_SIZE)] += strength * 1.8;
          // Swirl outward velocity with a slight rotational bias
          const angle = Math.atan2(j - cy, i - cx) + Math.PI * 0.15;
          vx[ix(i, j, SIM_SIZE)] += Math.cos(angle) * strength * 2.5;
          vy[ix(i, j, SIM_SIZE)] += Math.sin(angle) * strength * 2.5;
        }
      }
    }

    // Set initial DOM states
    oldEl.style.opacity = '1';
    newEl.style.opacity = '0';

    const imageData = ctx.createImageData(SIM_SIZE, SIM_SIZE);

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const rawProgress = Math.min(elapsed / FLUID_DURATION, 1);

      // Ease-in-out
      const t =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      // ── Fluid sim step ───────────────────────────────────────────────────
      const dt = 0.12;
      const diffRate = 0.0003;
      const viscosity = 0.0001;

      // Diffuse velocity
      diffuse(vxPrev, vx, viscosity, SIM_SIZE);
      diffuse(vyPrev, vy, viscosity, SIM_SIZE);
      // Swap
      [vx, vxPrev] = [vxPrev, vx];
      [vy, vyPrev] = [vyPrev, vy];
      // Advect velocity
      advect(vxPrev, vx, vx, vy, dt, SIM_SIZE);
      advect(vyPrev, vy, vx, vy, dt, SIM_SIZE);
      [vx, vxPrev] = [vxPrev, vx];
      [vy, vyPrev] = [vyPrev, vy];

      // Diffuse & advect density
      diffuse(densityPrev, density, diffRate, SIM_SIZE);
      [density, densityPrev] = [densityPrev, density];
      advect(densityPrev, density, vx, vy, dt, SIM_SIZE);
      [density, densityPrev] = [densityPrev, density];

      // Dissipate density over time — faster in second half
      const dissipation = rawProgress < 0.5 ? 0.992 : 0.975;
      for (let i = 0; i < density.length; i++) {
        density[i] *= dissipation;
      }

      // ── Render density field to canvas ──────────────────────────────────
      // Color: deep purple (26, 0, 51) with alpha driven by density value
      const canvasAlpha =
        rawProgress < 0.5
          ? // Build up in first half
            Math.min(rawProgress * 2, 1) * 0.85
          : // Fade out in second half
            (1 - (rawProgress - 0.5) * 2) * 0.85;

      for (let j = 0; j < SIM_SIZE; j++) {
        for (let i = 0; i < SIM_SIZE; i++) {
          const d = Math.min(density[ix(i, j, SIM_SIZE)], 1);
          const pixelIdx = (j * SIM_SIZE + i) * 4;
          imageData.data[pixelIdx] = 26;      // R — dark purple
          imageData.data[pixelIdx + 1] = 0;   // G
          imageData.data[pixelIdx + 2] = 51;  // B
          imageData.data[pixelIdx + 3] = Math.floor(d * canvasAlpha * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // ── Crossfade content layers ─────────────────────────────────────────
      oldEl.style.opacity = String(1 - t);
      newEl.style.opacity = String(t);

      if (rawProgress >= 1) {
        if (!completedRef.current) {
          completedRef.current = true;
          ctx.clearRect(0, 0, SIM_SIZE, SIM_SIZE);
          oldEl.style.opacity = '0';
          newEl.style.opacity = '1';
          onComplete();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isActive, onComplete, dimensions.width]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Old content — z-0, fades out */}
      <div ref={oldRef} className="absolute inset-0" style={{ zIndex: 0 }}>
        {oldContent}
      </div>

      {/* New content — z-10, fades in beneath canvas */}
      <div
        ref={newRef}
        className="absolute inset-0"
        style={{ zIndex: 10, opacity: 0 }}
      >
        {newContent}
      </div>

      {/* Canvas overlay — z-20, renders density field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          zIndex: 20,
          imageRendering: 'pixelated',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}

// ─── InkDrop ─────────────────────────────────────────────────────────────────
//
// An expanding ink-in-water simulation from the center. An organic ink blob
// grows outward from the container centre with noise-perturbed edges. The blob
// is rendered as a dark-purple fill on the canvas overlay while the underlying
// content layers crossfade beneath it. Once the blob has fully expanded, the
// canvas overlay fades and onComplete is fired.
//
// Timeline (1500 ms total):
//   0 → 750 ms    ink blob expands to cover full frame
//                 old content: opacity 1→0, new content: opacity 0→1
//   750 → 1500 ms ink blob diffuses / fades out, revealing new content clearly
//   1500 ms        onComplete fired

const INK_DURATION = 1500;

// Returns a perturbed radius for the ink blob at a given angle.
// Multiple sine harmonics produce organic, fractal-ish edges.
function inkRadius(
  angle: number,
  baseR: number,
  time: number,
  seed: number,
): number {
  const n1 = Math.sin(angle * 3 + time * 1.2 + seed) * 0.08;
  const n2 = Math.sin(angle * 7 - time * 0.8 + seed * 2) * 0.04;
  const n3 = Math.sin(angle * 13 + time * 2.1 + seed * 0.5) * 0.025;
  const n4 = Math.sin(angle * 21 - time * 1.5 + seed * 3) * 0.015;
  return baseR * (1 + n1 + n2 + n3 + n4);
}

export function InkDrop({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oldRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    completedRef.current = false;
    startRef.current = null;

    const canvas = canvasRef.current;
    const oldEl = oldRef.current;
    const newEl = newRef.current;
    if (!canvas || !oldEl || !newEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = dimensions.width;
    const H = dimensions.height;
    canvas.width = W;
    canvas.height = H;

    const centerX = W / 2;
    const centerY = H / 2;
    // Max radius must reach the farthest corner
    const maxRadius = Math.sqrt(centerX ** 2 + centerY ** 2) * 1.1;

    // Deterministic seed so each activation looks the same (not random)
    const seed = 1.618;

    // Set initial DOM states
    oldEl.style.opacity = '1';
    newEl.style.opacity = '0';

    const NUM_POINTS = 120;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const rawProgress = Math.min(elapsed / INK_DURATION, 1);

      // Ease-in-out curve
      const t =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      ctx.clearRect(0, 0, W, H);

      // ── Ink blob geometry ────────────────────────────────────────────────
      // First half: expand; second half: just hold or recede slightly
      const expandT = rawProgress < 0.5 ? rawProgress * 2 : 1;
      // Eased expansion
      const expandEased = expandT < 0.5
        ? 2 * expandT * expandT
        : 1 - Math.pow(-2 * expandT + 2, 2) / 2;

      const currentBaseRadius = maxRadius * expandEased;

      // Time parameter for noise animation (slow drift)
      const time = elapsed * 0.001;

      // Canvas alpha envelope: high in first half, fades in second half
      const canvasOpacity =
        rawProgress < 0.5
          ? Math.min(rawProgress * 2, 1) * 0.9
          : (1 - (rawProgress - 0.5) * 2) * 0.9;

      if (currentBaseRadius > 0.5 && canvasOpacity > 0.01) {
        // Build blob polygon
        ctx.beginPath();
        for (let i = 0; i <= NUM_POINTS; i++) {
          const angle = (i / NUM_POINTS) * Math.PI * 2;
          const r = inkRadius(angle, currentBaseRadius, time, seed);
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();

        // Radial gradient inside blob: deep purple core → violet edge
        const grad = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          currentBaseRadius,
        );
        grad.addColorStop(0, `rgba(10, 1, 24, ${canvasOpacity})`);
        grad.addColorStop(0.55, `rgba(26, 0, 61, ${canvasOpacity * 0.92})`);
        grad.addColorStop(0.85, `rgba(45, 0, 90, ${canvasOpacity * 0.7})`);
        grad.addColorStop(1, `rgba(70, 10, 120, ${canvasOpacity * 0.3})`);

        ctx.fillStyle = grad;
        ctx.fill();

        // Feathered edge — draw a slightly larger path with very low alpha
        ctx.beginPath();
        for (let i = 0; i <= NUM_POINTS; i++) {
          const angle = (i / NUM_POINTS) * Math.PI * 2;
          const r = inkRadius(angle, currentBaseRadius * 1.06, time + 0.3, seed);
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(80, 20, 140, ${canvasOpacity * 0.18})`;
        ctx.fill();
      }

      // ── Crossfade underlying content layers ──────────────────────────────
      oldEl.style.opacity = String(1 - t);
      newEl.style.opacity = String(t);

      if (rawProgress >= 1) {
        if (!completedRef.current) {
          completedRef.current = true;
          ctx.clearRect(0, 0, W, H);
          oldEl.style.opacity = '0';
          newEl.style.opacity = '1';
          onComplete();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isActive, onComplete, dimensions.width, dimensions.height]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Old content — z-0, fades out */}
      <div ref={oldRef} className="absolute inset-0" style={{ zIndex: 0 }}>
        {oldContent}
      </div>

      {/* New content — z-10, fades in beneath canvas */}
      <div
        ref={newRef}
        className="absolute inset-0"
        style={{ zIndex: 10, opacity: 0 }}
      >
        {newContent}
      </div>

      {/* Canvas overlay — z-20, renders expanding ink blob */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
