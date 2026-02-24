"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { lunar } from "./lunar-theme";

// ─── Size map ─────────────────────────────────────────────────────────────────
const SIZE_MAP = {
  sm: { width: 100, className: "w-[100px]" },
  md: { width: 140, className: "w-[140px]" },
  lg: { width: 200, className: "w-[200px]" },
} as const;

type CardSize = "sm" | "md" | "lg";

// ─── Moonlight glow animation ─────────────────────────────────────────────────
function getGlowAnimation(delay: number = 0): {
  animate: { boxShadow: string[] };
  transition: Transition;
} {
  return {
    animate: {
      boxShadow: [
        `0 0 8px 1px rgba(122, 184, 232, 0.2), inset 0 0 6px 0px rgba(122, 184, 232, 0.06)`,
        `0 0 18px 4px rgba(122, 184, 232, 0.45), inset 0 0 12px 2px rgba(122, 184, 232, 0.12)`,
      ],
    },
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 3,
      delay,
      ease: "easeInOut",
    },
  };
}

// ─── Corner pearl dots ────────────────────────────────────────────────────────
function PearlDots() {
  const positions = [
    { top: 6, left: 6 },
    { top: 6, right: 6 },
    { bottom: 6, left: 6 },
    { bottom: 6, right: 6 },
  ] as const;

  return (
    <>
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute w-[4px] h-[4px] rounded-full"
          style={{
            ...pos,
            backgroundColor: lunar.pearl,
            boxShadow: `0 0 4px 1px rgba(200, 220, 232, 0.5)`,
          }}
        />
      ))}
    </>
  );
}

// ─── LunarCardFront ──────────────────────────────────────────────────────────
interface LunarCardFrontProps {
  imageUrl: string;
  title: string;
  size?: CardSize;
  glowDelay?: number;
  onClick?: () => void;
}

export function LunarCardFront({
  imageUrl,
  title,
  size = "md",
  glowDelay = 0,
  onClick,
}: LunarCardFrontProps) {
  const { className: sizeClass } = SIZE_MAP[size];
  const glow = getGlowAnimation(glowDelay);

  return (
    <motion.div
      className={`relative ${sizeClass} aspect-[2/3] rounded-xl overflow-hidden cursor-pointer select-none`}
      style={{
        backgroundColor: lunar.surface,
        border: `1px solid ${lunar.border}80`,
      }}
      animate={glow.animate}
      transition={glow.transition}
      whileHover={{
        scale: 1.03,
        boxShadow: `0 0 28px 8px rgba(122, 184, 232, 0.55), inset 0 0 16px 3px rgba(122, 184, 232, 0.15)`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Cool gradient overlay for title */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background: `linear-gradient(to bottom, transparent, ${lunar.surface})`,
        }}
      />

      {/* Title */}
      <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 flex items-end justify-center">
        <span
          className="font-serif text-center leading-tight"
          style={{
            color: lunar.foam,
            fontSize: size === "sm" ? "0.55rem" : size === "md" ? "0.7rem" : "0.9rem",
            textShadow: `0 1px 4px rgba(6, 13, 26, 0.9)`,
          }}
        >
          {title}
        </span>
      </div>

      <PearlDots />
    </motion.div>
  );
}

// ─── Crescent Moon Sigil ──────────────────────────────────────────────────────
function CrescentSigil({ size }: { size: CardSize }) {
  const sizeMap = { sm: 60, md: 80, lg: 110 };
  const r = sizeMap[size];
  const half = r / 2;
  const outerR = half * 0.7;

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
          background: `radial-gradient(circle, rgba(122, 184, 232, 0.1) 0%, transparent 70%)`,
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
          stroke={lunar.glow}
          strokeWidth={0.8}
          opacity={0.5}
        />

        {/* Crescent moon — two overlapping arcs */}
        <path
          d={`
            M ${half} ${half - outerR * 0.55}
            A ${outerR * 0.55} ${outerR * 0.55} 0 1 1 ${half} ${half + outerR * 0.55}
            A ${outerR * 0.4} ${outerR * 0.4} 0 1 0 ${half} ${half - outerR * 0.55}
          `}
          fill={lunar.glow}
          opacity={0.3}
        />

        {/* Three small stars around the crescent */}
        {[0, 120, 240].map((angle) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const cx = half + Math.cos(rad) * outerR * 0.85;
          const cy = half + Math.sin(rad) * outerR * 0.85;
          const starSize = size === "sm" ? 1.5 : size === "md" ? 2 : 2.5;
          return (
            <circle
              key={angle}
              cx={cx}
              cy={cy}
              r={starSize}
              fill={lunar.pearl}
              opacity={0.6}
            />
          );
        })}
      </svg>

      {/* Pulsing center dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size === "sm" ? 4 : size === "md" ? 6 : 9,
          height: size === "sm" ? 4 : size === "md" ? 6 : 9,
          backgroundColor: lunar.glow,
        }}
        animate={{
          boxShadow: [
            `0 0 4px 1px rgba(122, 184, 232, 0.4)`,
            `0 0 10px 3px rgba(122, 184, 232, 0.7)`,
          ],
          scale: [1, 1.15],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2.2,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ─── LunarCardBack ──────────────────────────────────────────────────────────
interface LunarCardBackProps {
  size?: CardSize;
  glowDelay?: number;
}

export function LunarCardBack({ size = "md", glowDelay = 0 }: LunarCardBackProps) {
  const { className: sizeClass } = SIZE_MAP[size];
  const glow = getGlowAnimation(glowDelay);

  return (
    <motion.div
      className={`relative ${sizeClass} aspect-[2/3] rounded-xl overflow-hidden select-none`}
      style={{
        background: `linear-gradient(160deg, ${lunar.surface2} 0%, ${lunar.bg} 100%)`,
        border: `1px solid ${lunar.border}80`,
      }}
      animate={glow.animate}
      transition={glow.transition}
    >
      <CrescentSigil size={size} />
      <PearlDots />
    </motion.div>
  );
}

// ─── Ripple burst particles (water ripple effect) ─────────────────────────────
interface RippleRing {
  id: number;
  delay: number;
  maxRadius: number;
}

function generateRipples(count: number): RippleRing[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: i * 0.12,
    maxRadius: 40 + i * 25,
  }));
}

function RippleBurst({ burstKey }: { burstKey: number }) {
  const ripples = useRef(generateRipples(5));

  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 20 }}>
          {ripples.current.map((ring) => (
            <motion.div
              key={`${burstKey}-${ring.id}`}
              className="absolute rounded-full"
              style={{
                border: `1.5px solid ${lunar.glow}`,
              }}
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{
                width: ring.maxRadius * 2,
                height: ring.maxRadius * 2,
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                delay: ring.delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            />
          ))}
          {/* Central flash */}
          <motion.div
            key={`${burstKey}-flash`}
            className="absolute rounded-full"
            style={{ backgroundColor: lunar.glow }}
            initial={{ width: 8, height: 8, opacity: 0.9 }}
            animate={{ width: 60, height: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── LunarFlipCard ──────────────────────────────────────────────────────────
interface LunarFlipCardProps {
  imageUrl: string;
  title: string;
  isFlipped: boolean;
  size?: CardSize;
  glowDelay?: number;
  onFlip?: () => void;
  enableTilt?: boolean;
}

export function LunarFlipCard({
  imageUrl,
  title,
  isFlipped,
  size = "md",
  glowDelay = 0,
  onFlip,
  enableTilt = false,
}: LunarFlipCardProps) {
  const { width: cardWidth } = SIZE_MAP[size];

  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: tiltY }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <LunarCardFront
              imageUrl={imageUrl}
              title={title}
              size={size}
              glowDelay={glowDelay}
            />
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <LunarCardBack size={size} glowDelay={glowDelay} />
          </div>
        </motion.div>
      </motion.div>

      <RippleBurst burstKey={burstKey} />
    </div>
  );
}
