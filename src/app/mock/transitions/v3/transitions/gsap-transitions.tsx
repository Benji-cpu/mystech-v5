'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { TransitionProps } from '../mirror-types';

// Number of points along the leading sine-wave edge
const WAVE_POINTS = 10;

/**
 * Build a CSS clip-path polygon string for a left-to-right wipe where the
 * leading edge has a sine-wave shape.
 *
 * @param progress  0 → 1, how far across the container the wipe has travelled
 * @param width     Container width in px
 * @param height    Container height in px
 * @param amplitude Max horizontal oscillation of the leading edge in px
 * @param frequency Number of full sine cycles visible along the height
 * @param phase     Phase offset for the sine wave (animated over time)
 */
function buildLiquidPolygon(
  progress: number,
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number
): string {
  // Sweep position — x coordinate of the "centre" of the leading edge
  const sweepX = progress * width;

  // Build points along the leading (right) edge, top → bottom
  const leadingPoints: [number, number][] = [];
  for (let i = 0; i <= WAVE_POINTS; i++) {
    const t = i / WAVE_POINTS; // 0 → 1 along the height
    const y = t * height;
    // Sine wave: amplitude shrinks to zero as progress → 1 so the edge
    // straightens out cleanly at the right border.
    const sine = Math.sin(t * frequency * Math.PI * 2 + phase);
    const x = sweepX + sine * amplitude * (1 - progress);
    leadingPoints.push([x, y]);
  }

  // The polygon covers the revealed (left) portion of the new content layer.
  // Winding: top-left → top of leading edge → bottom of leading edge → bottom-left.
  const topLeft = `0px 0px`;
  const bottomLeft = `0px ${height}px`;

  // Leading edge points, top → bottom
  const leadingEdge = leadingPoints
    .map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`)
    .join(', ');

  // Leading edge points, bottom → top (close the polygon back on the left side)
  const leadingEdgeReversed = [...leadingPoints]
    .reverse()
    .map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`)
    .join(', ');

  // Simple rectangular reveal: left edge → leading edge (top-to-bottom) →
  // left edge again (bottom-to-top). Because we go top-left, along leading
  // edge top→bottom, then bottom-left, the clipped region is everything to the
  // LEFT of the leading edge.
  return `polygon(${topLeft}, ${leadingEdge}, ${bottomLeft})`;
}

export function LiquidClipWipe({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const newLayerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const { width, height } = dimensions;
    if (!newLayerRef.current || width === 0 || height === 0) return;

    // Initial state: new content is completely hidden (clip reveals nothing)
    const initialPolygon = `polygon(0px 0px, 0px 0px, 0px ${height}px, 0px ${height}px)`;
    newLayerRef.current.style.clipPath = initialPolygon;

    const amplitude = width * 0.08; // 8% of width as max wave amplitude
    const frequency = 3;            // 3 sine cycles along the full height
    let phase = 0;

    const proxy = { progress: 0 };

    tweenRef.current = gsap.to(proxy, {
      progress: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate() {
        if (!newLayerRef.current) return;
        // Advance the phase slightly per frame for a "flowing water" feel
        phase += 0.04;
        const polygon = buildLiquidPolygon(
          proxy.progress,
          width,
          height,
          amplitude,
          frequency,
          phase
        );
        newLayerRef.current.style.clipPath = polygon;
      },
      onComplete() {
        // Ensure the layer is fully unclipped
        if (newLayerRef.current) {
          newLayerRef.current.style.clipPath = 'none';
        }
        onComplete();
      },
    });

    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  const { width, height } = dimensions;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ width, height }}
    >
      {/* Old content — sits beneath, fully visible until wipe covers it */}
      <div
        className="absolute inset-0"
        style={{ width, height }}
      >
        {oldContent}
      </div>

      {/* New content — starts clipped to nothing, revealed by the wipe */}
      <div
        ref={newLayerRef}
        className="absolute inset-0"
        style={{ width, height, clipPath: 'none', willChange: 'clip-path' }}
      >
        {newContent}
      </div>
    </div>
  );
}
