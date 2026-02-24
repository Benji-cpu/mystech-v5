"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";

// ─── Theme constants ────────────────────────────────────────────────────────
const THEME = {
  bg: "#0f0b08",
  surface: "#1a1510",
  surface2: "#241c14",
  border: "#3d3020",
  gold: "#c9a94e",
  goldBright: "#e0c65c",
  goldDim: "#8b7340",
  parchment: "#f0e6d2",
  parchmentDim: "#b8a88a",
  crimson: "#8b2020",
} as const;

// ─── Size map ────────────────────────────────────────────────────────────────
const SIZE_MAP = {
  sm: { width: 100, className: "w-[100px]" },
  md: { width: 140, className: "w-[140px]" },
  lg: { width: 200, className: "w-[200px]" },
} as const;

type CardSize = "sm" | "md" | "lg";

// ─── Gold glow animation helper ─────────────────────────────────────────────
function getGlowAnimation(delay: number = 0): {
  animate: { boxShadow: string[] };
  transition: Transition;
} {
  return {
    animate: {
      boxShadow: [
        `0 0 8px 1px rgba(201, 169, 78, 0.2), inset 0 0 6px 0px rgba(201, 169, 78, 0.06)`,
        `0 0 18px 4px rgba(201, 169, 78, 0.45), inset 0 0 12px 2px rgba(201, 169, 78, 0.14)`,
      ],
    },
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 2.8,
      delay,
      ease: "easeInOut",
    },
  };
}

// ─── Corner Flourish SVGs ───────────────────────────────────────────────────
function CornerFlourishes({ size }: { size: CardSize }) {
  const scale = size === "sm" ? 0.6 : size === "md" ? 0.8 : 1;
  const inset = size === "sm" ? 4 : size === "md" ? 5 : 6;

  // A small curling scroll flourish path
  const flourishPath =
    "M 0 12 Q 0 0, 12 0 Q 8 0, 6 2 Q 2 6, 4 10 Q 5 12, 3 14 Q 1 12, 0 12 Z";

  const corners = [
    // Top-left: as-is
    { top: inset, left: inset, transform: `scale(${scale})` },
    // Top-right: flip horizontally
    { top: inset, right: inset, transform: `scale(${-scale}, ${scale})` },
    // Bottom-left: flip vertically
    { bottom: inset, left: inset, transform: `scale(${scale}, ${-scale})` },
    // Bottom-right: flip both
    { bottom: inset, right: inset, transform: `scale(${-scale}, ${-scale})` },
  ] as const;

  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            ...pos,
            width: 16,
            height: 16,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: pos.transform }}
          >
            <path
              d={flourishPath}
              fill={THEME.gold}
              opacity={0.3}
            />
            {/* Secondary smaller curl */}
            <path
              d="M 0 6 Q 0 0, 6 0 Q 4 1, 3 3 Q 1 5, 0 6 Z"
              fill={THEME.gold}
              opacity={0.2}
            />
          </svg>
        </div>
      ))}
    </>
  );
}

// ─── GildedCardFront ────────────────────────────────────────────────────────
interface GildedCardFrontProps {
  imageUrl: string;
  title: string;
  size?: CardSize;
  glowDelay?: number;
  onClick?: () => void;
}

export function GildedCardFront({
  imageUrl,
  title,
  size = "md",
  glowDelay = 0,
  onClick,
}: GildedCardFrontProps) {
  const { className: sizeClass } = SIZE_MAP[size];
  const glow = getGlowAnimation(glowDelay);

  return (
    <motion.div
      className={`relative ${sizeClass} aspect-[2/3] rounded-xl overflow-hidden cursor-pointer select-none`}
      style={{
        backgroundColor: THEME.surface,
        border: `1px solid rgba(139, 115, 64, 0.5)`,
      }}
      animate={glow.animate}
      transition={glow.transition}
      whileHover={{
        scale: 1.03,
        boxShadow: `0 0 28px 8px rgba(201, 169, 78, 0.55), inset 0 0 16px 3px rgba(201, 169, 78, 0.18)`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      onClick={onClick}
    >
      {/* Card image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bottom gradient overlay for title readability */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background: `linear-gradient(to bottom, transparent, ${THEME.surface})`,
        }}
      />

      {/* Title */}
      <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 flex items-end justify-center">
        <span
          className="font-serif text-center leading-tight"
          style={{
            fontFamily: "var(--font-manuscript), serif",
            color: THEME.parchment,
            fontSize:
              size === "sm" ? "0.55rem" : size === "md" ? "0.7rem" : "0.9rem",
            textShadow: `0 1px 4px rgba(15, 11, 8, 0.9)`,
          }}
        >
          {title}
        </span>
      </div>

      {/* Corner flourishes */}
      <CornerFlourishes size={size} />
    </motion.div>
  );
}

// ─── Sunburst Sigil SVG ─────────────────────────────────────────────────────
function SunburstSigil({ size }: { size: CardSize }) {
  const sizeMap = { sm: 60, md: 80, lg: 110 };
  const r = sizeMap[size];
  const half = r / 2;
  const outerR = half * 0.75;

  // Build 8-pointed star path
  const starPoints: string[] = [];
  for (let i = 0; i < 8; i++) {
    const outerAngle = (i * 45 * Math.PI) / 180 - Math.PI / 2;
    const innerAngle = ((i * 45 + 22.5) * Math.PI) / 180 - Math.PI / 2;
    const outerDist = outerR * 0.85;
    const innerDist = outerR * 0.4;

    starPoints.push(
      `${half + Math.cos(outerAngle) * outerDist},${half + Math.sin(outerAngle) * outerDist}`
    );
    starPoints.push(
      `${half + Math.cos(innerAngle) * innerDist},${half + Math.sin(innerAngle) * innerDist}`
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 1 }}
    >
      {/* Radial glow behind sigil */}
      <div
        className="absolute rounded-full"
        style={{
          width: r,
          height: r,
          background: `radial-gradient(circle, rgba(201, 169, 78, 0.12) 0%, transparent 70%)`,
        }}
      />

      <svg
        width={r}
        height={r}
        viewBox={`0 0 ${r} ${r}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle
          cx={half}
          cy={half}
          r={outerR}
          stroke={THEME.gold}
          strokeWidth={1}
          opacity={0.7}
        />

        {/* 8-pointed sunburst star */}
        <polygon
          points={starPoints.join(" ")}
          stroke={THEME.gold}
          strokeWidth={1}
          opacity={0.6}
          fill="none"
        />

        {/* Inner decorative circle */}
        <circle
          cx={half}
          cy={half}
          r={outerR * 0.35}
          stroke={THEME.goldDim}
          strokeWidth={0.5}
          opacity={0.4}
        />
      </svg>

      {/* Pulsing center dot (Framer Motion outside SVG for animation) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size === "sm" ? 5 : size === "md" ? 7 : 10,
          height: size === "sm" ? 5 : size === "md" ? 7 : 10,
          backgroundColor: THEME.gold,
        }}
        animate={{
          boxShadow: [
            `0 0 4px 1px rgba(201, 169, 78, 0.5)`,
            `0 0 10px 3px rgba(201, 169, 78, 0.85)`,
          ],
          scale: [1, 1.15],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.8,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ─── GildedCardBack ─────────────────────────────────────────────────────────
interface GildedCardBackProps {
  size?: CardSize;
  glowDelay?: number;
}

export function GildedCardBack({ size = "md", glowDelay = 0 }: GildedCardBackProps) {
  const { className: sizeClass } = SIZE_MAP[size];
  const glow = getGlowAnimation(glowDelay);

  return (
    <motion.div
      className={`relative ${sizeClass} aspect-[2/3] rounded-xl overflow-hidden select-none`}
      style={{
        background: `linear-gradient(160deg, ${THEME.surface} 0%, ${THEME.bg} 100%)`,
        border: `1px solid rgba(61, 48, 32, 0.5)`,
      }}
      animate={glow.animate}
      transition={glow.transition}
    >
      {/* Sunburst sigil */}
      <SunburstSigil size={size} />

      {/* Inner ornamental border line */}
      <div
        className="absolute pointer-events-none rounded-lg"
        style={{
          inset: 8,
          border: `1px solid rgba(201, 169, 78, 0.15)`,
        }}
      />

      {/* Corner flourishes */}
      <CornerFlourishes size={size} />
    </motion.div>
  );
}

// ─── Gold burst particles ───────────────────────────────────────────────────
interface GoldParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
}

function generateParticles(count: number): GoldParticle[] {
  const colors = [
    THEME.gold,
    THEME.goldBright,
    "#d4940a",
    "#f0d060",
    "#b8860b",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 30 + Math.random() * 80,
    size: 3 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 0.55 + Math.random() * 0.3,
  }));
}

function GoldBurst({ burstKey }: { burstKey: number }) {
  const particles = useRef(generateParticles(24));

  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 20 }}
        >
          {particles.current.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;

            return (
              <motion.div
                key={`${burstKey}-${p.id}`}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  top: "50%",
                  left: "50%",
                  marginTop: -p.size / 2,
                  marginLeft: -p.size / 2,
                  boxShadow: `0 0 ${p.size * 1.5}px ${p.size * 0.5}px ${p.color}88`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 18,
                  duration: p.duration,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── GildedFlipCard ─────────────────────────────────────────────────────────
interface GildedFlipCardProps {
  imageUrl: string;
  title: string;
  isFlipped: boolean;
  size?: CardSize;
  glowDelay?: number;
  onFlip?: () => void;
  enableTilt?: boolean;
}

export function GildedFlipCard({
  imageUrl,
  title,
  isFlipped,
  size = "md",
  glowDelay = 0,
  onFlip,
  enableTilt = false,
}: GildedFlipCardProps) {
  const { width: cardWidth } = SIZE_MAP[size];

  // Tilt state for desktop hover
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Burst key -- increments each time card is revealed (isFlipped -> true)
  const [burstKey, setBurstKey] = useState(0);
  const prevFlipped = useRef(isFlipped);

  useEffect(() => {
    if (isFlipped && !prevFlipped.current) {
      setBurstKey((k) => k + 1);
    }
    prevFlipped.current = isFlipped;
  }, [isFlipped]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = (e.clientX - centerX) / (rect.width / 2);
      const offsetY = (e.clientY - centerY) / (rect.height / 2);
      // rotateY based on horizontal offset, rotateX inverted for natural feel
      setTiltY(offsetX * 8);
      setTiltX(-offsetY * 8);
    },
    [enableTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTiltX(0);
    setTiltY(0);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative select-none"
      style={{
        perspective: "800px",
        width: cardWidth,
        aspectRatio: "2/3",
        cursor: "pointer",
      }}
      onClick={onFlip}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flip + tilt container */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: isFlipped ? 0 : 180,
          rotateX: tiltX,
        }}
        transition={{
          rotateY: { type: "spring", stiffness: 200, damping: 25 },
          rotateX: { type: "spring", stiffness: 260, damping: 28 },
        }}
      >
        {/* Tilt layer */}
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: tiltY }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          {/* Front face -- shown when isFlipped = true */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <GildedCardFront
              imageUrl={imageUrl}
              title={title}
              size={size}
              glowDelay={glowDelay}
            />
          </div>

          {/* Back face -- shown when isFlipped = false */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <GildedCardBack size={size} glowDelay={glowDelay} />
          </div>
        </motion.div>
      </motion.div>

      {/* Gold burst -- outside the flip container so particles escape card bounds */}
      <GoldBurst burstKey={burstKey} />
    </div>
  );
}
