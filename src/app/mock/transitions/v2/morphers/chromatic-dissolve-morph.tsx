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
const DURATION_MS = 1400;

/** Smooth cubic ease-in-out */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * ChromaticDissolveMorph — Canvas 2D transition using RGB channel separation.
 *
 * At peak displacement (progress ≈ 0.5) the "from" image is drawn three times
 * with different per-channel offsets using the "lighter" composite mode,
 * creating a chromatic aberration / colour fringe look. The "to" image does the
 * inverse — its channels converge from the outside in. A scanline overlay and a
 * brief brightness flash at the midpoint complete the retro-digital feel.
 *
 * Performance strategy: no per-pixel ImageData manipulation. All effects are
 * achieved with canvas compositing (globalCompositeOperation, globalAlpha) and
 * multiple drawImage calls with small spatial offsets.
 */
export function ChromaticDissolveMorph({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fromCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const toCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  // Each channel tint layer needs its own small canvas so we can tint it
  // without touching the source offscreen canvases.
  const rLayerRef = useRef<HTMLCanvasElement | null>(null);
  const gLayerRef = useRef<HTMLCanvasElement | null>(null);
  const bLayerRef = useRef<HTMLCanvasElement | null>(null);

  /** Ensure all offscreen canvases exist at the correct size. */
  const ensureOffscreen = useCallback(() => {
    const make = (ref: React.MutableRefObject<HTMLCanvasElement | null>) => {
      if (!ref.current) ref.current = document.createElement("canvas");
      ref.current.width = W;
      ref.current.height = H;
    };
    make(fromCanvasRef);
    make(toCanvasRef);
    make(rLayerRef);
    make(gLayerRef);
    make(bLayerRef);
  }, []);

  /**
   * Builds a tinted copy of `source` onto `dest` using a colour fill and
   * "source-atop" compositing so only the non-transparent pixels are tinted.
   * `fillColor` should be a CSS colour string like "rgba(255,0,0,0.55)".
   */
  const buildTintedLayer = useCallback(
    (
      source: HTMLCanvasElement,
      dest: HTMLCanvasElement,
      fillColor: string
    ) => {
      const ctx = dest.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(source, 0, 0);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    },
    []
  );

  /** Draw the static current state (no transition). */
  const drawStatic = useCallback((state: ContentStateIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawContentState(ctx, state, W, H);
  }, []);

  /** Core frame renderer — handles chromatic separation, dissolve, scanlines, flash. */
  const renderFrame = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      const fromCanvas = fromCanvasRef.current;
      const toCanvas = toCanvasRef.current;
      const rLayer = rLayerRef.current;
      const gLayer = gLayerRef.current;
      const bLayer = bLayerRef.current;
      if (!canvas || !fromCanvas || !toCanvas || !rLayer || !gLayer || !bLayer)
        return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // --- Derived values ---
      // `separation` peaks (at progress 0.5) and returns to 0 at both ends
      const envelope = Math.sin(progress * Math.PI);
      const separation = envelope * 16; // max 16px spread at peak

      const fromAlpha = 1 - progress;
      const toAlpha = progress;

      // Tint intensity also peaks at midpoint
      const tintStrength = envelope * 0.6;

      // --- Rebuild tinted channel layers for "from" content ---
      buildTintedLayer(fromCanvas, rLayer, `rgba(255,60,60,${tintStrength})`);
      buildTintedLayer(fromCanvas, gLayer, `rgba(60,255,120,${tintStrength})`);
      buildTintedLayer(fromCanvas, bLayer, `rgba(60,120,255,${tintStrength})`);

      // --- Compose frame ---
      ctx.clearRect(0, 0, W, H);

      // == FROM content: channels disperse outward ==
      // Each channel is drawn at 1/3 alpha contribution; "lighter" adds them.
      // Combined they sum to approximately `fromAlpha` brightness.
      const channelAlpha = fromAlpha / 3;

      ctx.globalCompositeOperation = "source-over";

      // Red channel — offset left and up
      ctx.globalAlpha = channelAlpha;
      ctx.drawImage(rLayer, -separation, -separation * 0.5);

      // Green channel — offset right
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = channelAlpha;
      ctx.drawImage(gLayer, separation, 0);

      // Blue channel — offset down and left
      ctx.globalAlpha = channelAlpha;
      ctx.drawImage(bLayer, -separation * 0.5, separation);

      // == TO content: channels converge inward from opposite directions ==
      // Rebuild tinted layers for "to" content
      buildTintedLayer(toCanvas, rLayer, `rgba(255,60,60,${tintStrength})`);
      buildTintedLayer(toCanvas, gLayer, `rgba(60,255,120,${tintStrength})`);
      buildTintedLayer(toCanvas, bLayer, `rgba(60,120,255,${tintStrength})`);

      const toChannelAlpha = toAlpha / 3;

      // Red — approaches from right and down (inverse of from-R offset)
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = toChannelAlpha;
      ctx.drawImage(rLayer, separation, separation * 0.5);

      // Green — approaches from left
      ctx.globalAlpha = toChannelAlpha;
      ctx.drawImage(gLayer, -separation, 0);

      // Blue — approaches from up and right
      ctx.globalAlpha = toChannelAlpha;
      ctx.drawImage(bLayer, separation * 0.5, -separation);

      // == Restore composite mode for overlay passes ==
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // == Scanline overlay ==
      // Every 3rd row is tinted slightly darker for a CRT-screen feel.
      // We only draw this once per frame (not per strip) for performance.
      ctx.globalAlpha = 0.08 * envelope; // fades in/out with the transition
      ctx.fillStyle = "#000000";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      // == Brightness flash at peak (progress ≈ 0.5) ==
      // A narrow Gaussian-ish window centred on 0.5
      const flashWindow = Math.max(0, 1 - Math.abs(progress - 0.5) * 10);
      if (flashWindow > 0) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = flashWindow * 0.18;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }

      // Reset
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
    [buildTintedLayer]
  );

  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const rawProgress = Math.min(1, elapsed / DURATION_MS);
    const easedProgress = easeInOutCubic(rawProgress);

    renderFrame(easedProgress);

    if (rawProgress < 1) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      // Transition finished — draw clean "to" state
      drawStatic(contentState);
      if (!completedRef.current) {
        completedRef.current = true;
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
