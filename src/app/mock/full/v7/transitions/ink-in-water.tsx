"use client";

import { useEffect, useRef } from "react";
import type { TransitionProps } from "../mirror-types";

/**
 * Ink in Water — Canvas 2D
 * Canvas overlay renders expanding ink blobs (circles with varying opacity).
 * Blobs expand from center, creating an organic "ink drop" effect.
 * During expansion, content underneath swaps.
 * ~30 ink circles with random offsets.
 */

interface InkBlob {
  x: number;
  y: number;
  maxRadius: number;
  currentRadius: number;
  opacity: number;
  color: string;
  delay: number; // frame delay before starting
  speed: number;
}

export function InkInWater({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const hasRunRef = useRef(-1);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width ?? 300;
    canvas.height = rect?.height ?? 300;

    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    const BLOB_COUNT = 30;
    const TOTAL_FRAMES = 70;

    const inkColors = [
      "rgba(80, 40, 120,",
      "rgba(40, 20, 80,",
      "rgba(120, 60, 180,",
      "rgba(201, 169, 78,",
      "rgba(60, 30, 100,",
    ];

    const blobs: InkBlob[] = [];
    for (let i = 0; i < BLOB_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(W, H) * 0.35;
      blobs.push({
        x: CX + Math.cos(angle) * dist,
        y: CY + Math.sin(angle) * dist,
        maxRadius: 20 + Math.random() * 60,
        currentRadius: 0,
        opacity: 0.6 + Math.random() * 0.4,
        color: inkColors[Math.floor(Math.random() * inkColors.length)],
        delay: Math.floor(Math.random() * 20),
        speed: 1.5 + Math.random() * 2,
      });
    }

    // Reset
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = "1";
      outgoingRef.current.style.transition = "none";
    }
    if (incomingRef.current) {
      incomingRef.current.style.opacity = "0";
      incomingRef.current.style.transition = "none";
    }

    let frame = 0;
    let swapped = false;

    function drawFrame() {
      ctx!.clearRect(0, 0, W, H);
      frame++;

      let allExpanded = true;

      for (const blob of blobs) {
        if (frame < blob.delay) {
          allExpanded = false;
          continue;
        }

        const active = frame - blob.delay;
        blob.currentRadius = Math.min(blob.maxRadius, active * blob.speed);

        if (blob.currentRadius < blob.maxRadius) allExpanded = false;

        // Fade out as blob reaches max size
        const progress = blob.currentRadius / blob.maxRadius;
        const alpha = blob.opacity * (1 - Math.pow(progress, 1.5));

        if (alpha <= 0) continue;

        ctx!.beginPath();
        ctx!.arc(blob.x, blob.y, blob.currentRadius, 0, Math.PI * 2);

        const gradient = ctx!.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.currentRadius
        );
        gradient.addColorStop(0, `${blob.color} ${alpha})`);
        gradient.addColorStop(0.6, `${blob.color} ${alpha * 0.5})`);
        gradient.addColorStop(1, `${blob.color} 0)`);

        ctx!.fillStyle = gradient;
        ctx!.fill();
      }

      // Coverage check — swap content at 40% through animation
      const progress = frame / TOTAL_FRAMES;

      if (!swapped && progress > 0.4) {
        swapped = true;
        if (outgoingRef.current) {
          outgoingRef.current.style.transition = "opacity 0.25s ease-out";
          outgoingRef.current.style.opacity = "0";
        }
        if (incomingRef.current) {
          incomingRef.current.style.transition = "opacity 0.25s ease-in";
          incomingRef.current.style.opacity = "1";
        }
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

      {/* Canvas overlay for ink blobs */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10, mixBlendMode: "screen" }}
      />
    </div>
  );
}
