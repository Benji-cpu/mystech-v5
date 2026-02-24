"use client";

import { memo, useRef, useEffect } from "react";
import gsap from "gsap";
import { AURORA } from "./aurora-journey-theme";

interface GoldenThreadTarget {
  id: string;
  fromCx: number;
  fromCy: number;
  toX: number;
  toY: number;
}

interface AuroraGoldenThreadProps {
  threads: GoldenThreadTarget[];
  containerWidth: number;
  containerHeight: number;
}

function AuroraGoldenThreadInner({ threads, containerWidth, containerHeight }: AuroraGoldenThreadProps) {
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const glowRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const activeIdsRef = useRef<Set<string>>(new Set());
  const tweensRef = useRef<Map<string, gsap.core.Tween>>(new Map());

  useEffect(() => {
    const currentIds = new Set(threads.map((t) => t.id));
    const prevIds = activeIdsRef.current;

    // Animate in new threads
    for (const thread of threads) {
      if (!prevIds.has(thread.id)) {
        const pathEl = pathRefs.current.get(thread.id);
        const glowEl = glowRefs.current.get(thread.id);
        if (pathEl) {
          // Kill any existing tween for this id
          tweensRef.current.get(thread.id)?.kill();

          gsap.set(pathEl, { strokeDashoffset: 1 });
          const tween = gsap.to(pathEl, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          });
          tweensRef.current.set(thread.id, tween);

          if (glowEl) {
            gsap.set(glowEl, { strokeDashoffset: 1 });
            gsap.to(glowEl, {
              strokeDashoffset: 0,
              opacity: 0.5,
              duration: 0.8,
              ease: "power2.out",
            });
          }
        }
      }
    }

    // Animate out removed threads
    for (const id of prevIds) {
      if (!currentIds.has(id)) {
        const pathEl = pathRefs.current.get(id);
        const glowEl = glowRefs.current.get(id);
        tweensRef.current.get(id)?.kill();

        if (pathEl) {
          gsap.to(pathEl, {
            strokeDashoffset: 1,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
          });
        }
        if (glowEl) {
          gsap.to(glowEl, {
            strokeDashoffset: 1,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
          });
        }
      }
    }

    activeIdsRef.current = currentIds;

    return () => {
      tweensRef.current.forEach((t) => t.kill());
    };
  }, [threads]);

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      style={{ zIndex: 25 }}
    >
      <defs>
        <linearGradient id="aurora-thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={AURORA.accent} stopOpacity="0.8" />
          <stop offset="50%" stopColor={AURORA.accentLight} stopOpacity="1" />
          <stop offset="100%" stopColor={AURORA.accent} stopOpacity="0.3" />
        </linearGradient>
        <filter id="aurora-thread-glow">
          <feGaussianBlur stdDeviation="0.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {threads.map((thread) => {
        const toCxPct = containerWidth > 0 ? (thread.toX / containerWidth) * 100 : 50;
        const toCyPct = containerHeight > 0 ? (thread.toY / containerHeight) * 100 : 50;

        const midX = (thread.fromCx + toCxPct) / 2;
        const midY = Math.min(thread.fromCy, toCyPct) - 8;

        const d = `M ${thread.fromCx} ${thread.fromCy} Q ${midX} ${midY} ${toCxPct} ${toCyPct}`;

        return (
          <g key={thread.id}>
            {/* Glow path */}
            <path
              ref={(el) => { if (el) glowRefs.current.set(thread.id, el); }}
              d={d}
              stroke="url(#aurora-thread-grad)"
              strokeWidth="0.6"
              fill="none"
              filter="url(#aurora-thread-glow)"
              opacity={0}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
            {/* Main path */}
            <path
              ref={(el) => { if (el) pathRefs.current.set(thread.id, el); }}
              d={d}
              stroke="url(#aurora-thread-grad)"
              strokeWidth="0.3"
              fill="none"
              opacity={0}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          </g>
        );
      })}
    </svg>
  );
}

export const AuroraGoldenThread = memo(AuroraGoldenThreadInner);
