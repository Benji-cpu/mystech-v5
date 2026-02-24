"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T, SPRING } from "./marionette-theme";

// ─── Size map ────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { width: 100, className: "w-[100px]" },
  md: { width: 140, className: "w-[140px]" },
  lg: { width: 200, className: "w-[200px]" },
  xl: { width: 260, className: "w-[260px]" },
} as const;

type CardSize = "sm" | "md" | "lg" | "xl";

// ─── Gold pulsing glow ──────────────────────────────────────────────────────

function getGlowAnimation(delay: number = 0) {
  return {
    animate: {
      boxShadow: [
        `0 0 8px 1px rgba(201,169,78,0.20), inset 0 0 6px 0px rgba(201,169,78,0.06)`,
        `0 0 18px 4px rgba(201,169,78,0.45), inset 0 0 12px 2px rgba(201,169,78,0.14)`,
      ],
    },
    transition: {
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 2.6,
      delay,
      ease: "easeInOut" as const,
    },
  };
}

// ─── Gold attachment dot (puppet string connection point) ────────────────────

function AttachmentDot({ size }: { size: CardSize }) {
  const dotSize = size === "sm" ? 4 : size === "md" ? 5 : 6;
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 rounded-full"
      style={{
        top: -dotSize / 2,
        width: dotSize,
        height: dotSize,
        backgroundColor: T.gold,
        zIndex: 10,
      }}
      animate={{
        boxShadow: [
          `0 0 4px 1px rgba(201,169,78,0.5)`,
          `0 0 10px 3px rgba(201,169,78,0.85)`,
        ],
        scale: [1, 1.15],
      }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2,
        ease: "easeInOut",
      }}
    />
  );
}

// ─── MarionetteCardFront ────────────────────────────────────────────────────

interface MarionetteCardFrontProps {
  imageUrl: string;
  title: string;
  size?: CardSize;
  glowDelay?: number;
  onClick?: () => void;
}

export function MarionetteCardFront({
  imageUrl,
  title,
  size = "md",
  glowDelay = 0,
  onClick,
}: MarionetteCardFrontProps) {
  const { className: sizeClass } = SIZE_MAP[size];
  const glow = getGlowAnimation(glowDelay);

  return (
    <motion.div
      className={`relative ${sizeClass} aspect-[2/3] rounded-xl overflow-hidden cursor-pointer select-none`}
      style={{
        backgroundColor: T.surface,
        border: `1px solid rgba(201,169,78,0.20)`,
      }}
      animate={glow.animate}
      transition={glow.transition}
      whileHover={{
        y: -4,
        boxShadow: `0 0 28px 8px rgba(201,169,78,0.50), inset 0 0 16px 3px rgba(201,169,78,0.18)`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      onClick={onClick}
    >
      {/* Attachment dot */}
      <AttachmentDot size={size} />

      {/* Card image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background: `linear-gradient(to bottom, transparent, ${T.surface})`,
        }}
      />

      {/* Title */}
      <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 flex items-end justify-center">
        <span
          className="font-serif text-center leading-tight"
          style={{
            color: T.text,
            fontSize:
              size === "sm"
                ? "0.55rem"
                : size === "md"
                ? "0.7rem"
                : size === "lg"
                ? "0.9rem"
                : "1rem",
            textShadow: `0 1px 4px rgba(10, 1, 24, 0.9)`,
          }}
        >
          {title}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Thread Sigil (card back design) ────────────────────────────────────────

function ThreadSigil({ size }: { size: CardSize }) {
  const r = { sm: 60, md: 80, lg: 110, xl: 130 }[size];
  const half = r / 2;
  const outerR = half * 0.75;
  const innerR = half * 0.45;

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: r,
          height: r,
          background: `radial-gradient(circle, rgba(201,169,78,0.10) 0%, transparent 70%)`,
        }}
      />
      <svg width={r} height={r} viewBox={`0 0 ${r} ${r}`} fill="none">
        {/* Outer circle */}
        <circle cx={half} cy={half} r={outerR} stroke={T.gold} strokeWidth={0.8} opacity={0.6} />
        {/* Inner circle */}
        <circle cx={half} cy={half} r={innerR} stroke={T.gold} strokeWidth={0.6} opacity={0.3} />
        {/* Cross threads */}
        <line x1={half} y1={half - outerR} x2={half} y2={half + outerR} stroke={T.goldDim} strokeWidth={0.5} opacity={0.4} />
        <line x1={half - outerR} y1={half} x2={half + outerR} y2={half} stroke={T.goldDim} strokeWidth={0.5} opacity={0.4} />
        {/* Diagonal threads */}
        <line x1={half - innerR * 0.7} y1={half - innerR * 0.7} x2={half + innerR * 0.7} y2={half + innerR * 0.7} stroke={T.goldDim} strokeWidth={0.4} opacity={0.3} />
        <line x1={half + innerR * 0.7} y1={half - innerR * 0.7} x2={half - innerR * 0.7} y2={half + innerR * 0.7} stroke={T.goldDim} strokeWidth={0.4} opacity={0.3} />
      </svg>
      {/* Pulsing center dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size === "sm" ? 5 : size === "md" ? 7 : 10,
          height: size === "sm" ? 5 : size === "md" ? 7 : 10,
          backgroundColor: T.gold,
        }}
        animate={{
          boxShadow: [
            `0 0 4px 1px rgba(201,169,78,0.5)`,
            `0 0 10px 3px rgba(201,169,78,0.85)`,
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

// ─── MarionetteCardBack ─────────────────────────────────────────────────────

interface MarionetteCardBackProps {
  size?: CardSize;
  glowDelay?: number;
}

export function MarionetteCardBack({ size = "md", glowDelay = 0 }: MarionetteCardBackProps) {
  const { className: sizeClass } = SIZE_MAP[size];
  const glow = getGlowAnimation(glowDelay);

  return (
    <motion.div
      className={`relative ${sizeClass} aspect-[2/3] rounded-xl overflow-hidden select-none`}
      style={{
        background: `linear-gradient(160deg, ${T.surface} 0%, ${T.bg} 100%)`,
        border: `1px solid rgba(201,169,78,0.20)`,
      }}
      animate={glow.animate}
      transition={glow.transition}
    >
      <AttachmentDot size={size} />
      <ThreadSigil size={size} />
    </motion.div>
  );
}

// ─── Gold thread burst particles ────────────────────────────────────────────

interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
}

function generateParticles(count: number): BurstParticle[] {
  const colors = [T.gold, T.goldBright, "#ddc060", "#b89940", "#f0d870"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 30 + Math.random() * 80,
    size: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 0.55 + Math.random() * 0.3,
  }));
}

function GoldBurst({ burstKey }: { burstKey: number }) {
  const particles = useRef(generateParticles(20));

  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
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

// ─── MarionetteFlipCard ─────────────────────────────────────────────────────

interface MarionetteFlipCardProps {
  imageUrl: string;
  title: string;
  isFlipped: boolean;
  size?: CardSize;
  glowDelay?: number;
  onFlip?: () => void;
}

export function MarionetteFlipCard({
  imageUrl,
  title,
  isFlipped,
  size = "md",
  glowDelay = 0,
  onFlip,
}: MarionetteFlipCardProps) {
  const { width: cardWidth } = SIZE_MAP[size];
  const [burstKey, setBurstKey] = useState(0);
  const prevFlipped = useRef(isFlipped);

  useEffect(() => {
    if (isFlipped && !prevFlipped.current) {
      setBurstKey((k) => k + 1);
    }
    prevFlipped.current = isFlipped;
  }, [isFlipped]);

  return (
    <div
      className="relative select-none"
      style={{
        perspective: "800px",
        width: cardWidth,
        aspectRatio: "2/3",
        cursor: "pointer",
      }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <MarionetteCardFront
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
          <MarionetteCardBack size={size} glowDelay={glowDelay} />
        </div>
      </motion.div>
      <GoldBurst burstKey={burstKey} />
    </div>
  );
}
