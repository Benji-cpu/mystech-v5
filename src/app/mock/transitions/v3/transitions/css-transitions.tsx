'use client';

import { useEffect, useRef } from 'react';
import type { TransitionProps } from '../mirror-types';

// ─── GooeyMerge ─────────────────────────────────────────────────────────────
//
// Uses CSS `filter: blur(10px) contrast(20)` on a parent wrapper while the
// old content fades out and new content fades in. When opposing opacity
// gradients overlap inside a high-contrast blur parent the anti-aliased
// alpha channel collapses into hard-edged blobs that merge and separate —
// creating the classic "gooey" effect.
//
// Timeline (800 ms total):
//   0 → 800 ms  old opacity 1→0, new opacity 0→1 (CSS transition on each child)
//   800 ms       filter removed, onComplete fired

export function GooeyMerge({
  oldContent,
  newContent,
  isActive,
  onComplete,
}: TransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const oldRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const DURATION = 800;

  useEffect(() => {
    if (!isActive) return;

    completedRef.current = false;
    startRef.current = null;

    const wrapper = wrapperRef.current;
    const oldEl = oldRef.current;
    const newEl = newRef.current;
    if (!wrapper || !oldEl || !newEl) return;

    // Apply the gooey parent filter immediately
    wrapper.style.filter = 'blur(10px) contrast(20)';
    wrapper.style.willChange = 'filter';

    // Set initial child states (no transition yet to avoid flash)
    oldEl.style.transition = 'none';
    newEl.style.transition = 'none';
    oldEl.style.opacity = '1';
    newEl.style.opacity = '0';

    // Force a reflow so the initial state is painted before we start
    void wrapper.offsetHeight;

    // Now enable CSS transitions on each child
    oldEl.style.transition = `opacity ${DURATION}ms ease-in-out`;
    newEl.style.transition = `opacity ${DURATION}ms ease-in-out`;

    // Start the crossfade
    oldEl.style.opacity = '0';
    newEl.style.opacity = '1';

    // rAF loop purely to detect when DURATION has elapsed so we can clean up
    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;

      if (elapsed >= DURATION) {
        if (!completedRef.current) {
          completedRef.current = true;

          // Remove the gooey filter so rendering is clean going forward
          if (wrapper) {
            wrapper.style.filter = 'none';
            wrapper.style.willChange = 'auto';
          }

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
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    // Outer clip so the blur+contrast filter does not bleed outside the mirror
    <div className="absolute inset-0 overflow-hidden">
      {/* Gooey filter parent — filter is set/removed imperatively above */}
      <div
        ref={wrapperRef}
        className="absolute inset-0"
        style={{ isolation: 'isolate' }}
      >
        {/* Old content — fades out */}
        <div ref={oldRef} className="absolute inset-0">
          {oldContent}
        </div>

        {/* New content — fades in */}
        <div ref={newRef} className="absolute inset-0">
          {newContent}
        </div>
      </div>
    </div>
  );
}

// ─── ChromaticSplit ──────────────────────────────────────────────────────────
//
// Simulates RGB channel separation (chromatic aberration) by layering three
// tinted copies of the old content (R, G, B) each translated in a different
// direction with mix-blend-mode: screen. The offsets are animated via rAF,
// reaching maximum displacement mid-transition then converging back to zero
// as the crossfade to the new content completes.
//
// Timeline (900 ms total):
//   0 → 450 ms  channel offsets grow from 0 → max, old content fades 1 → 0.4
//   450 → 900   channel offsets shrink back to 0, new content fades in 0 → 1
//   900 ms       onComplete fired

export function ChromaticSplit({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const rRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const oldBaseRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const DURATION = 900;
  // Maximum channel displacement as a fraction of the smaller dimension
  const MAX_OFFSET = Math.min(dimensions.width, dimensions.height) * 0.06;

  useEffect(() => {
    if (!isActive) return;

    completedRef.current = false;
    startRef.current = null;

    const rEl = rRef.current;
    const gEl = gRef.current;
    const bEl = bRef.current;
    const oldBase = oldBaseRef.current;
    const newEl = newRef.current;
    if (!rEl || !gEl || !bEl || !oldBase || !newEl) return;

    // Initial visibility states
    oldBase.style.opacity = '1';
    newEl.style.opacity = '0';
    rEl.style.opacity = '0';
    gEl.style.opacity = '0';
    bEl.style.opacity = '0';
    rEl.style.transform = 'translate(0px, 0px)';
    gEl.style.transform = 'translate(0px, 0px)';
    bEl.style.transform = 'translate(0px, 0px)';

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const rawProgress = Math.min(elapsed / DURATION, 1);

      // Eased progress — ease-in for first half, ease-out for second half
      const t = rawProgress < 0.5
        ? 2 * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      // Channel offset envelope: ramps up to 1 at t=0.5 then back to 0
      const envelope = t < 0.5 ? t * 2 : (1 - t) * 2;
      const offset = envelope * MAX_OFFSET;

      // R channel — top-right
      const rX = offset;
      const rY = -offset * 0.6;
      // G channel — left
      const gX = -offset * 0.7;
      const gY = offset * 0.4;
      // B channel — bottom
      const bX = offset * 0.3;
      const bY = offset;

      rEl.style.transform = `translate(${rX}px, ${rY}px)`;
      gEl.style.transform = `translate(${gX}px, ${gY}px)`;
      bEl.style.transform = `translate(${bX}px, ${bY}px)`;

      // Channel layers are most visible in the first half
      const channelOpacity = envelope * 0.75;
      rEl.style.opacity = String(channelOpacity);
      gEl.style.opacity = String(channelOpacity);
      bEl.style.opacity = String(channelOpacity);

      // Old base: fade out from 1 → 0 over full duration
      oldBase.style.opacity = String(1 - t);

      // New content: fade in from 0 → 1 over full duration
      newEl.style.opacity = String(t);

      if (rawProgress >= 1) {
        if (!completedRef.current) {
          completedRef.current = true;

          // Snap channel layers fully transparent so nothing bleeds through
          rEl.style.opacity = '0';
          gEl.style.opacity = '0';
          bEl.style.opacity = '0';
          oldBase.style.opacity = '0';
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
    };
  }, [isActive, onComplete, MAX_OFFSET]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Old content base — fades out as new fades in */}
      <div ref={oldBaseRef} className="absolute inset-0">
        {oldContent}
      </div>

      {/* R channel overlay — red tint, offset top-right */}
      <div
        ref={rRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(255,0,0,0.5)', mixBlendMode: 'multiply' }}
        />
        {oldContent}
      </div>

      {/* G channel overlay — green tint, offset left */}
      <div
        ref={gRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,255,0,0.5)', mixBlendMode: 'multiply' }}
        />
        {oldContent}
      </div>

      {/* B channel overlay — blue tint, offset bottom */}
      <div
        ref={bRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,255,0.5)', mixBlendMode: 'multiply' }}
        />
        {oldContent}
      </div>

      {/* New content — fades in on top of everything */}
      <div ref={newRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {newContent}
      </div>
    </div>
  );
}
