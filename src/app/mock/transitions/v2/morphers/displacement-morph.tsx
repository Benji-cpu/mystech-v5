"use client";

import { useRef, useEffect, useCallback } from "react";
import type { ContentStateIndex } from "../morph-explorer-state";
import { drawContentState } from "../content-texture";

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  onTransitionComplete: () => void;
}

const W = 280;
const H = 420;
const STRIP_COUNT = 24;
const DURATION_MS = 1200;

/** Smooth cubic ease-in-out */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Returns the displacement offset (in pixels) for a horizontal strip at
 * normalized y-position `ny`, given the current pattern index and a time
 * value used to drive oscillation.
 */
function computeDisplacement(
  pattern: number,
  ny: number,
  nx: number,
  time: number,
  intensity: number
): { dx: number; dy: number } {
  switch (pattern % 3) {
    case 0: {
      // Horizontal waves — dx driven by sin of y
      const freq = 6;
      const dx = Math.sin(ny * freq * Math.PI + time) * intensity;
      const dy = Math.cos(ny * freq * Math.PI * 0.5 + time * 0.7) * intensity * 0.3;
      return { dx, dy };
    }
    case 1: {
      // Circular ripple — displacement radiates from center
      const cx = 0.5;
      const cy = 0.5;
      const distX = nx - cx;
      const distY = ny - cy;
      const dist = Math.sqrt(distX * distX + distY * distY) + 0.001;
      const wave = Math.sin(dist * 14 - time * 2) * intensity;
      return {
        dx: (distX / dist) * wave,
        dy: (distY / dist) * wave,
      };
    }
    case 2:
    default: {
      // Turbulent — compound sin/cos oscillation
      const dx =
        Math.sin(nx * 3 + ny * 5 + time) * Math.cos(ny * 4 + time) * intensity;
      const dy =
        Math.cos(nx * 5 + ny * 3 + time) * Math.sin(nx * 4 + time) * intensity;
      return { dx, dy };
    }
  }
}

/**
 * DisplacementMorph — Canvas 2D transition using strip-based displacement.
 *
 * Splits the canvas into STRIP_COUNT horizontal strips. For each strip, a
 * displacement offset is computed from a sin/cos wave function whose
 * intensity ramps 0 → peak → 0 over the transition. The "from" image is
 * drawn shifted by the displacement; the "to" image is drawn shifted by the
 * inverse displacement and blended in with globalAlpha = eased progress.
 *
 * Three displacement patterns cycle on each successive transition:
 *   0 — horizontal sine waves
 *   1 — circular ripple from center
 *   2 — turbulent compound oscillation
 */
export function DisplacementMorph({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fromCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const toCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const patternRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);

  /** Ensure offscreen canvases exist at the correct size. */
  const ensureOffscreen = useCallback(() => {
    if (!fromCanvasRef.current) {
      fromCanvasRef.current = document.createElement("canvas");
    }
    if (!toCanvasRef.current) {
      toCanvasRef.current = document.createElement("canvas");
    }
    fromCanvasRef.current.width = W;
    fromCanvasRef.current.height = H;
    toCanvasRef.current.width = W;
    toCanvasRef.current.height = H;
  }, []);

  /** Draw the static current state (no transition). */
  const drawStatic = useCallback((state: ContentStateIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawContentState(ctx, state, W, H);
  }, []);

  /** Core animation frame — strip-based displacement blend. */
  const renderFrame = useCallback(
    (progress: number, time: number) => {
      const canvas = canvasRef.current;
      const fromCanvas = fromCanvasRef.current;
      const toCanvas = toCanvasRef.current;
      if (!canvas || !fromCanvas || !toCanvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      // Displacement intensity envelope: peaks at progress 0.5
      const envelope = Math.sin(progress * Math.PI);
      const maxDisplacement = 28;
      const intensity = envelope * maxDisplacement;

      const stripH = H / STRIP_COUNT;
      const pattern = patternRef.current;

      // Save once before strip loop
      ctx.save();

      for (let s = 0; s < STRIP_COUNT; s++) {
        const ny = (s + 0.5) / STRIP_COUNT; // normalised y of strip centre
        const nx = 0.5; // centred horizontally for simplicity

        const { dx, dy } = computeDisplacement(pattern, ny, nx, time, intensity);
        const { dx: dxInv, dy: dyInv } = computeDisplacement(
          pattern,
          ny,
          nx,
          time,
          -intensity
        );

        const sy = s * stripH;

        // Clip to strip
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, sy, W, stripH + 1); // +1 avoids sub-pixel gaps
        ctx.clip();

        // Draw "from" strip with displacement
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(fromCanvas, dx, dy);

        // Draw "to" strip with inverse displacement, blended by progress
        ctx.globalAlpha = progress;
        ctx.drawImage(toCanvas, dxInv, dyInv);

        ctx.restore();
      }

      ctx.restore();

      // Reset composite state
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
    []
  );

  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const rawProgress = Math.min(1, elapsed / DURATION_MS);
    const easedProgress = easeInOutCubic(rawProgress);
    // time drives oscillation frequency — advances quickly for visible waves
    const time = elapsed / 250;

    renderFrame(easedProgress, time);

    if (rawProgress < 1) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      // Transition finished — draw clean "to" state
      drawStatic(contentState);
      if (!completedRef.current) {
        completedRef.current = true;
        isTransitioningRef.current = false;
        onTransitionComplete();
      }
    }
  }, [contentState, renderFrame, drawStatic, onTransitionComplete]);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    completedRef.current = false;

    if (contentState === previousContentState) {
      drawStatic(contentState);
      return;
    }

    ensureOffscreen();

    // Render both states to their respective offscreen canvases
    const fromCtx = fromCanvasRef.current!.getContext("2d");
    const toCtx = toCanvasRef.current!.getContext("2d");
    if (fromCtx) drawContentState(fromCtx, previousContentState, W, H);
    if (toCtx) drawContentState(toCtx, contentState, W, H);

    // Advance to the next displacement pattern
    patternRef.current = (patternRef.current + 1) % 3;

    isTransitioningRef.current = true;
    startTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [contentState, previousContentState, animate, ensureOffscreen, drawStatic]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
