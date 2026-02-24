"use client";

import { memo, useRef, useEffect, useMemo } from "react";
import { interpolate } from "flubber";
import gsap from "gsap";
import {
  CONNECTIONS,
  FORMATIONS,
  CONNECTION_CURVE_OFFSETS,
  AURORA,
  type FormationId,
} from "./aurora-journey-theme";

interface AuroraConnectionsProps {
  formation: FormationId;
  showConnections: boolean;
  isBreathPause: boolean;
}

// Build a bezier path string for a connection in a given formation
function buildConnectionPath(
  fromId: string,
  toId: string,
  formation: FormationId
): string {
  const positions = FORMATIONS[formation];
  const from = positions[fromId];
  const to = positions[toId];
  if (!from || !to) return `M 50 50 L 50 50`;

  const key = `${fromId}-${toId}`;
  const offsets = CONNECTION_CURVE_OFFSETS[formation][key] || { dx: 0, dy: 0 };

  const midX = (from.cx + to.cx) / 2 + offsets.dx;
  const midY = (from.cy + to.cy) / 2 + offsets.dy;

  return `M ${from.cx} ${from.cy} Q ${midX} ${midY} ${to.cx} ${to.cy}`;
}

function AuroraConnectionsInner({
  formation,
  showConnections,
  isBreathPause,
}: AuroraConnectionsProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const tweenRefs = useRef<gsap.core.Tween[]>([]);
  const breathTlRef = useRef<gsap.core.Timeline | null>(null);
  const prevFormationRef = useRef<FormationId>(formation);
  const opacityRef = useRef<{ value: number }>({ value: 0 });

  // Connection identifiers
  const connectionKeys = useMemo(
    () => CONNECTIONS.map(([from, to]) => `${from}-${to}`),
    []
  );

  // Morph paths when formation changes via Flubber + GSAP
  useEffect(() => {
    const prev = prevFormationRef.current;
    prevFormationRef.current = formation;

    if (prev === formation) return;

    // Kill in-flight tweens
    tweenRefs.current.forEach((t) => t.kill());
    tweenRefs.current = [];

    CONNECTIONS.forEach(([fromId, toId], i) => {
      const pathEl = pathRefs.current[i];
      const glowEl = glowRefs.current[i];
      if (!pathEl) return;

      const fromPath = buildConnectionPath(fromId, toId, prev);
      const toPath = buildConnectionPath(fromId, toId, formation);

      try {
        const interp = interpolate(fromPath, toPath, { maxSegmentLength: 10 });
        const progressObj = { value: 0 };

        const tween = gsap.to(progressObj, {
          value: 1,
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: () => {
            const d = interp(progressObj.value);
            pathEl.setAttribute("d", d);
            glowEl?.setAttribute("d", d);
          },
        });

        tweenRefs.current.push(tween);
      } catch {
        // Fallback: just set the path directly
        const d = buildConnectionPath(fromId, toId, formation);
        pathEl.setAttribute("d", d);
        glowEl?.setAttribute("d", d);
      }
    });

    return () => {
      tweenRefs.current.forEach((t) => t.kill());
    };
  }, [formation]);

  // Show/hide opacity animation
  useEffect(() => {
    gsap.to(opacityRef.current, {
      value: showConnections ? 1 : 0,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        pathRefs.current.forEach((el) => {
          if (el) el.style.opacity = String(opacityRef.current.value * (isBreathPause ? 0.3 : 0.5));
        });
        glowRefs.current.forEach((el) => {
          if (el) el.style.opacity = String(opacityRef.current.value * (isBreathPause ? 0.1 : 0.2));
        });
      },
    });
  }, [showConnections, isBreathPause]);

  // Breathing animation — oscillate control point offsets
  useEffect(() => {
    breathTlRef.current?.kill();

    if (!showConnections) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    const proxy = { offset: 0 };

    tl.to(proxy, {
      offset: 1,
      duration: 3,
      ease: "sine.inOut",
      onUpdate: () => {
        const t = proxy.offset;
        CONNECTIONS.forEach(([fromId, toId], i) => {
          const pathEl = pathRefs.current[i];
          const glowEl = glowRefs.current[i];
          if (!pathEl) return;

          const positions = FORMATIONS[formation];
          const from = positions[fromId];
          const to = positions[toId];
          if (!from || !to) return;

          const key = `${fromId}-${toId}`;
          const offsets = CONNECTION_CURVE_OFFSETS[formation][key] || { dx: 0, dy: 0 };

          // Oscillate control point
          const breathDx = offsets.dx + Math.sin(t * Math.PI) * 3;
          const breathDy = offsets.dy + Math.cos(t * Math.PI) * 2;

          const midX = (from.cx + to.cx) / 2 + breathDx;
          const midY = (from.cy + to.cy) / 2 + breathDy;

          const d = `M ${from.cx} ${from.cy} Q ${midX} ${midY} ${to.cx} ${to.cy}`;
          pathEl.setAttribute("d", d);
          glowEl?.setAttribute("d", d);
        });
      },
    });

    breathTlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [showConnections, formation]);

  // Initial paths
  const initialPaths = useMemo(
    () => CONNECTIONS.map(([fromId, toId]) => buildConnectionPath(fromId, toId, formation)),
    [formation]
  );

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="aurora-connection-glow">
          <feGaussianBlur stdDeviation="0.8" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CONNECTIONS.map(([fromId, toId], i) => (
        <g key={connectionKeys[i]}>
          {/* Glow path (behind) */}
          <path
            ref={(el) => { glowRefs.current[i] = el; }}
            d={initialPaths[i]}
            stroke={AURORA.accent}
            strokeWidth="0.8"
            fill="none"
            filter="url(#aurora-connection-glow)"
            style={{ opacity: 0 }}
          />
          {/* Main path */}
          <path
            ref={(el) => { pathRefs.current[i] = el; }}
            d={initialPaths[i]}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.3"
            fill="none"
            style={{ opacity: 0 }}
          />
        </g>
      ))}
    </svg>
  );
}

export const AuroraConnections = memo(AuroraConnectionsInner);
