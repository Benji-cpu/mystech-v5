'use client';

import { useEffect, useId, useRef } from 'react';
import { interpolate } from 'flubber';
import type { TransitionProps } from '../mirror-types';

// ─── Easing helpers ────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── 1. TurbulenceRipple ───────────────────────────────────────────────────
// Uses SVG feTurbulence + feDisplacementMap to warp old content away,
// revealing new content underneath. Duration ~1200 ms.

export function TurbulenceRipple({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `turbulence-filter-${uid}`;

  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const oldLayerRef = useRef<HTMLDivElement | null>(null);
  const newLayerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const DURATION = 1200;
    const PEAK_FREQ = 0.04;
    const PEAK_SCALE = 40;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / DURATION, 1);

      // Triangle wave: ramps 0→1 then 1→0 over the full duration
      const wave = rawT < 0.5 ? rawT * 2 : (1 - rawT) * 2;

      const freq = PEAK_FREQ * wave;
      const scale = PEAK_SCALE * wave;

      if (turbulenceRef.current) {
        turbulenceRef.current.setAttribute('baseFrequency', String(freq));
      }
      if (displacementRef.current) {
        displacementRef.current.setAttribute('scale', String(scale));
      }

      // At halfway, swap layer visibility
      if (oldLayerRef.current && newLayerRef.current) {
        if (rawT < 0.5) {
          oldLayerRef.current.style.opacity = String(1 - rawT * 2);
          newLayerRef.current.style.opacity = '0';
        } else {
          oldLayerRef.current.style.opacity = '0';
          newLayerRef.current.style.opacity = String((rawT - 0.5) * 2);
        }
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const { width, height } = dimensions;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* SVG filter definition */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbulenceRef}
              type="turbulence"
              baseFrequency="0"
              numOctaves={3}
              result="turbulence"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="turbulence"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
          </filter>
        </defs>
      </svg>

      {/* New content — sits behind, fades in from halfway */}
      <div
        ref={newLayerRef}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        {newContent}
      </div>

      {/* Old content — turbulence applied, fades out by halfway */}
      <div
        ref={oldLayerRef}
        className="absolute inset-0"
        style={{ filter: `url(#${filterId})`, opacity: 1 }}
      >
        {oldContent}
      </div>
    </div>
  );
}

// ─── 2. PathMorphMask ──────────────────────────────────────────────────────
// Uses flubber to interpolate a clip path from a small center circle to a
// full rectangle, revealing new content. Duration ~1500 ms.

export function PathMorphMask({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `path-morph-clip-${uid}`;

  const clipPathElemRef = useRef<SVGPathElement | null>(null);
  const newLayerRef = useRef<HTMLDivElement | null>(null);
  const oldLayerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const DURATION = 1500;
    const { width, height } = dimensions;

    // Full rectangle path (clockwise)
    const rectPath = `M0,0 L${width},0 L${width},${height} L0,${height} Z`;

    // Small circle in center (approximated with cubic bezier)
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.04;
    const k = r * 0.5523; // cubic bezier control point ratio for circle
    const circlePath =
      `M${cx},${cy - r} ` +
      `C${cx + k},${cy - r} ${cx + r},${cy - k} ${cx + r},${cy} ` +
      `C${cx + r},${cy + k} ${cx + k},${cy + r} ${cx},${cy + r} ` +
      `C${cx - k},${cy + r} ${cx - r},${cy + k} ${cx - r},${cy} ` +
      `C${cx - r},${cy - k} ${cx - k},${cy - r} ${cx},${cy - r} Z`;

    const morphFn = interpolate(circlePath, rectPath, { maxSegmentLength: 4 });

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / DURATION, 1);
      const t = easeInOut(rawT);

      const d = morphFn(t);

      if (clipPathElemRef.current) {
        clipPathElemRef.current.setAttribute('d', d);
      }

      // Old content fades as new content is revealed
      if (oldLayerRef.current) {
        oldLayerRef.current.style.opacity = String(1 - t);
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (oldLayerRef.current) oldLayerRef.current.style.opacity = '0';
        if (newLayerRef.current) newLayerRef.current.style.clipPath = 'none';
        onComplete();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, onComplete, dimensions]);

  if (!isActive) return null;

  const { width, height } = dimensions;

  // Initial circle d value for SSR/initial render
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.04;
  const k = r * 0.5523;
  const initialD =
    `M${cx},${cy - r} ` +
    `C${cx + k},${cy - r} ${cx + r},${cy - k} ${cx + r},${cy} ` +
    `C${cx + r},${cy + k} ${cx + k},${cy + r} ${cx},${cy + r} ` +
    `C${cx - k},${cy + r} ${cx - r},${cy + k} ${cx - r},${cy} ` +
    `C${cx - r},${cy - k} ${cx - k},${cy - r} ${cx},${cy - r} Z`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* SVG clip path definition */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path ref={clipPathElemRef} d={initialD} />
          </clipPath>
        </defs>
      </svg>

      {/* Old content — fades out as reveal progresses */}
      <div
        ref={oldLayerRef}
        className="absolute inset-0"
        style={{ opacity: 1 }}
      >
        {oldContent}
      </div>

      {/* New content — clipped by morphing path */}
      <div
        ref={newLayerRef}
        className="absolute inset-0"
        style={{ clipPath: `url(#${clipId})` }}
      >
        {newContent}
      </div>
    </div>
  );
}

// ─── 3. SpiralReveal ──────────────────────────────────────────────────────
// Draws an Archimedean spiral path and animates stroke-dashoffset to
// reveal new content through the thick stroke mask. Duration ~1500 ms.

function buildArchimedeanSpiral(
  cx: number,
  cy: number,
  maxR: number,
  turns: number,
  steps: number
): string {
  const points: string[] = [];
  const totalAngle = turns * 2 * Math.PI;

  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const angle = frac * totalAngle;
    const r = frac * maxR;
    const x = cx + r * Math.cos(angle - Math.PI / 2);
    const y = cy + r * Math.sin(angle - Math.PI / 2);
    points.push(i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }

  return points.join(' ');
}

export function SpiralReveal({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const uid = useId().replace(/:/g, '');
  const maskId = `spiral-mask-${uid}`;

  const strokePathRef = useRef<SVGPathElement | null>(null);
  const maskPathRef = useRef<SVGPathElement | null>(null);
  const oldLayerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pathLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    // Compute path length after mount
    if (strokePathRef.current) {
      pathLengthRef.current = strokePathRef.current.getTotalLength();
    }
    if (maskPathRef.current) {
      // Keep in sync
      pathLengthRef.current = maskPathRef.current.getTotalLength();
    }

    const totalLen = pathLengthRef.current;
    if (totalLen === 0) {
      onComplete();
      return;
    }

    // Set initial dasharray/dashoffset
    const setDash = (offset: number) => {
      if (strokePathRef.current) {
        strokePathRef.current.style.strokeDasharray = `${totalLen}`;
        strokePathRef.current.style.strokeDashoffset = `${offset}`;
      }
      if (maskPathRef.current) {
        maskPathRef.current.style.strokeDasharray = `${totalLen}`;
        maskPathRef.current.style.strokeDashoffset = `${offset}`;
      }
    };

    setDash(totalLen);

    const DURATION = 1500;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / DURATION, 1);
      const t = easeInOut(rawT);

      const offset = totalLen * (1 - t);
      setDash(offset);

      // Old content fades when spiral reaches ~50%
      if (oldLayerRef.current) {
        const fadeT = Math.max(0, (rawT - 0.5) / 0.5);
        oldLayerRef.current.style.opacity = String(1 - fadeT);
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const { width, height } = dimensions;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy) * 1.1; // reach corners
  const TURNS = 5;
  const STEPS = 600;
  const spiralD = buildArchimedeanSpiral(cx, cy, maxR, TURNS, STEPS);
  // Stroke width chosen to fully cover area when drawn (spacing between turns)
  const strokeW = (maxR / TURNS) * 2.2;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* SVG mask definition */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            {/* Black background = hide */}
            <rect width={width} height={height} fill="black" />
            {/* White spiral stroke = reveal */}
            <path
              ref={maskPathRef}
              d={spiralD}
              fill="none"
              stroke="white"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          </mask>
        </defs>
      </svg>

      {/* Old content — fades at 50% reveal */}
      <div
        ref={oldLayerRef}
        className="absolute inset-0"
        style={{ opacity: 1 }}
      >
        {oldContent}
      </div>

      {/* New content — revealed by spiral mask */}
      <div
        className="absolute inset-0"
        style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
      >
        {newContent}
      </div>

      {/* Visible spiral reference path (optional subtle glow) */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          opacity: 0,
        }}
        aria-hidden="true"
      >
        <path
          ref={strokePathRef}
          d={spiralD}
          fill="none"
          stroke="transparent"
          strokeWidth={strokeW}
        />
      </svg>
    </div>
  );
}

// ─── 4. SmilSweep ─────────────────────────────────────────────────────────
// Uses SVG SMIL <animate> on a rect's x attribute to sweep a mask from
// left to right, revealing new content. Duration ~1000 ms.

export function SmilSweep({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const uid = useId().replace(/:/g, '');
  const maskId = `smil-mask-${uid}`;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const animateRef = useRef<SVGAnimateElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const DURATION = 1000;

    // Detect SMIL support
    const smilSupported =
      typeof SVGElement !== 'undefined' &&
      typeof (SVGElement.prototype as unknown as Record<string, unknown>).beginElement === 'function';

    if (smilSupported && animateRef.current) {
      // Trigger the SMIL animation
      try {
        (animateRef.current as SVGAnimateElement & { beginElement: () => void }).beginElement();
      } catch {
        // Ignore if already running
      }
      timerRef.current = setTimeout(() => {
        onComplete();
      }, DURATION);
    } else {
      // rAF fallback — manually animate a CSS clip-path on the new layer
      const newLayer = svgRef.current?.closest('.smil-new-layer') as HTMLDivElement | null;
      const startTime = performance.now();

      function tick(now: number) {
        const elapsed = now - startTime;
        const rawT = Math.min(elapsed / DURATION, 1);
        const t = easeInOut(rawT);
        const xPct = (1 - t) * 100;

        if (newLayer) {
          newLayer.style.clipPath = `inset(0 0 0 ${xPct}%)`;
        }

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          onComplete();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const { width, height } = dimensions;
  const DURATION_S = 1; // seconds for SMIL dur attribute

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* SVG mask definition */}
      <svg
        ref={svgRef}
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect
              x="-100%"
              y="0"
              width="100%"
              height="100%"
              fill="white"
            >
              <animate
                ref={animateRef}
                attributeName="x"
                from="-100%"
                to="0%"
                dur={`${DURATION_S}s`}
                begin="indefinite"
                fill="freeze"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.4 0 0.2 1"
              />
            </rect>
          </mask>
        </defs>
      </svg>

      {/* Old content — sits behind, visible until sweep passes */}
      <div className="absolute inset-0">
        {oldContent}
      </div>

      {/* New content — revealed by sweeping mask */}
      <div
        className="smil-new-layer absolute inset-0"
        style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
      >
        {newContent}
      </div>
    </div>
  );
}
