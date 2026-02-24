"use client";

import { memo, useMemo, useEffect, useRef } from "react";
import { useSprings, useTrail, animated, easings } from "@react-spring/web";
import gsap from "gsap";
import {
  STARS,
  FORMATIONS,
  RS_CONSTELLATION,
  AURORA,
  type FormationId,
} from "./aurora-journey-theme";
import type { UserStar } from "./aurora-journey-state";

interface AuroraConstellationProps {
  formation: FormationId;
  showConnections: boolean;
  userStars: UserStar[];
  isBreathPause: boolean;
  isSpeaking?: boolean;
}

function AuroraConstellationInner({
  formation,
  showConnections,
  userStars,
  isBreathPause,
  isSpeaking = false,
}: AuroraConstellationProps) {
  const positions = FORMATIONS[formation];
  const speakingTlRef = useRef<gsap.core.Timeline | null>(null);
  const starGlowRefs = useRef<(SVGCircleElement | null)[]>([]);

  // ── Star springs (React Spring useSprings) ────────────────────

  const [starSprings, starApi] = useSprings(STARS.length, (i) => {
    const pos = positions[STARS[i].id];
    return {
      cx: pos?.cx ?? 50,
      cy: pos?.cy ?? 50,
      opacity: 0.8,
      r: STARS[i].baseRadius,
      config: RS_CONSTELLATION,
    };
  });

  // Update springs when formation changes
  useEffect(() => {
    starApi.start((i) => {
      const pos = positions[STARS[i].id];
      return {
        cx: pos?.cx ?? 50,
        cy: pos?.cy ?? 50,
        config: RS_CONSTELLATION,
      };
    });
  }, [formation, positions, starApi]);

  // Breath pause opacity
  useEffect(() => {
    starApi.start(() => ({
      opacity: isBreathPause ? 0.3 : isSpeaking ? 1 : 0.8,
      config: { duration: 400 },
    }));
  }, [isBreathPause, isSpeaking, starApi]);

  // Speaking pulse via GSAP (drives radius oscillation)
  useEffect(() => {
    speakingTlRef.current?.kill();

    if (isSpeaking) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to({}, {
        duration: 1.5,
        ease: "sine.inOut",
        onUpdate: function () {
          const progress = this.progress();
          const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
          starApi.start((i) => ({
            r: STARS[i].baseRadius * scale,
            immediate: true,
          }));
        },
      });
      speakingTlRef.current = tl;
    } else {
      starApi.start((i) => ({
        r: STARS[i].baseRadius,
        config: { duration: 300 },
      }));
    }

    return () => {
      speakingTlRef.current?.kill();
    };
  }, [isSpeaking, starApi]);

  // ── User star trails (staggered wobbly entry) ─────────────────

  const userTrail = useTrail(userStars.length, {
    opacity: isBreathPause ? 0.3 : 0.9,
    scale: 1,
    from: { opacity: 0, scale: 0 },
    config: { tension: 200, friction: 15 },
  });

  // ── Connection visibility spring ──────────────────────────────

  const connectionOpacity = showConnections ? (isBreathPause ? 0.15 : 0.5) : 0;

  // Build user connection data
  const userConnectionPaths = useMemo(() => {
    return userStars.map((us) => {
      const target = positions[us.connectedTo];
      if (!target) return null;
      return { id: `user-${us.id}`, d: `M ${us.cx} ${us.cy} L ${target.cx} ${target.cy}` };
    }).filter(Boolean) as { id: string; d: string }[];
  }, [userStars, positions]);

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="aurora-star-glow">
          <feGaussianBlur stdDeviation="1.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="aurora-star-glow-strong">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="aurora-user-star-glow">
          <feGaussianBlur stdDeviation="2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* User star connection lines (amber dashed) */}
      {userConnectionPaths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          stroke={AURORA.accent}
          strokeWidth="0.25"
          fill="none"
          strokeDasharray="1 1"
          opacity={isBreathPause ? 0.12 : 0.4}
        />
      ))}

      {/* Main constellation stars — React Spring animated */}
      {starSprings.map((spring, i) => (
        <animated.circle
          key={STARS[i].id}
          ref={(el: SVGCircleElement | null) => { starGlowRefs.current[i] = el; }}
          cx={spring.cx}
          cy={spring.cy}
          r={spring.r}
          fill={AURORA.accent}
          opacity={spring.opacity}
          filter={isSpeaking ? "url(#aurora-star-glow-strong)" : "url(#aurora-star-glow)"}
        />
      ))}

      {/* Vega highlight */}
      {starSprings[0] && (
        <animated.circle
          cx={starSprings[0].cx}
          cy={starSprings[0].cy}
          r={2}
          fill="white"
          opacity={isBreathPause ? 0.1 : 0.4}
        />
      )}

      {/* User stars — React Spring trail for staggered entry */}
      {userTrail.map((style, i) => {
        const us = userStars[i];
        return (
          <animated.circle
            key={us.id}
            cx={us.cx}
            cy={us.cy}
            r={3}
            fill={AURORA.accentLight}
            filter="url(#aurora-user-star-glow)"
            opacity={style.opacity}
            transform={style.scale.to(
              (s) => `translate(${us.cx}, ${us.cy}) scale(${s}) translate(${-us.cx}, ${-us.cy})`
            )}
          />
        );
      })}
    </svg>
  );
}

export const AuroraConstellation = memo(AuroraConstellationInner);
