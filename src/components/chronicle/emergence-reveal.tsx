'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OracleCard } from '@/components/cards/oracle-card';
import type { CardImageStatus, CardType } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────

type RevealPhase = 'gathering' | 'coalescing' | 'reveal' | 'holding';

export interface EmergenceRevealProps {
  card: {
    id: string;
    title: string;
    meaning: string;
    guidance: string;
    imageUrl: string | null;
    imageStatus: string;
    cardType: 'obstacle' | 'threshold';
  };
  onCardRevealed: () => void;
}

// ── Springs ───────────────────────────────────────────────────────────────

const CARD_SPRING = { type: 'spring' as const, stiffness: 200, damping: 25 };
const STATUS_SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

// ── Particle seed — stable across renders ─────────────────────────────────

interface ParticleSeed {
  id: number;
  /** 0–1 relative to container width */
  originX: number;
  /** 0–1 relative to container height */
  originY: number;
  size: number;
  /** seconds */
  duration: number;
  delay: number;
  /** additional rotation */
  rotate: number;
}

function generateParticles(count: number): ParticleSeed[] {
  return Array.from({ length: count }, (_, i) => {
    // Distribute origins around the edges and corners for the "drifting inward" effect.
    // Use a deterministic seeding approach so particles are stable on re-render.
    const angle = (i / count) * Math.PI * 2;
    const edgeX = 0.5 + Math.cos(angle) * (0.45 + (i % 3) * 0.04);
    const edgeY = 0.5 + Math.sin(angle) * (0.45 + (i % 4) * 0.03);

    return {
      id: i,
      originX: Math.min(1, Math.max(0, edgeX)),
      originY: Math.min(1, Math.max(0, edgeY)),
      size: 2 + (i % 3),
      duration: 2.4 + (i % 5) * 0.4,
      delay: (i % 8) * 0.15,
      rotate: (i % 6) * 60,
    };
  });
}

// ── Status text map ───────────────────────────────────────────────────────

const STATUS_LABELS: Record<RevealPhase, string | null> = {
  gathering: 'The oracle stirs...',
  coalescing: 'Something is taking shape...',
  reveal: null,
  holding: null,
};

// ── Sub-components ────────────────────────────────────────────────────────

/**
 * A single drifting particle — CSS-animated via Framer Motion.
 * In the gathering/coalescing phases it moves toward center.
 * In holding it settles into a slow ambient orbit.
 */
function Particle({
  seed,
  phase,
  isObstacle,
}: {
  seed: ParticleSeed;
  phase: RevealPhase;
  isObstacle: boolean;
}) {
  const baseColor = isObstacle
    ? 'rgba(139,92,246,' // purple
    : 'rgba(201,169,78,'; // gold

  // Target positions as percentages of container.
  // gathering/coalescing: drift toward center (50%, 50%)
  // reveal/holding: orbit gently near center
  const targetX = phase === 'holding' ? `${44 + seed.id % 12}%` : '50%';
  const targetY = phase === 'holding' ? `${44 + seed.id % 10}%` : '50%';

  const opacity = (() => {
    if (phase === 'gathering') return 0.55;
    if (phase === 'coalescing') return 0.75;
    if (phase === 'reveal') return 0.4;
    return 0.25; // holding — settled ambience
  })();

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: seed.size,
        height: seed.size,
        left: `${seed.originX * 100}%`,
        top: `${seed.originY * 100}%`,
        background: `${baseColor}${opacity})`,
        boxShadow: `0 0 ${seed.size * 3}px ${baseColor}${opacity * 0.6})`,
      }}
      animate={
        phase === 'holding'
          ? {
              x: [0, (seed.id % 2 === 0 ? 4 : -4), 0],
              y: [0, (seed.id % 3 === 0 ? 3 : -3), 0],
              opacity: [opacity, opacity * 1.3, opacity],
            }
          : {
              // Each phase update animates from current position toward center
              left: targetX,
              top: targetY,
              opacity,
            }
      }
      transition={
        phase === 'holding'
          ? {
              duration: seed.duration,
              delay: seed.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {
              duration: seed.duration * (phase === 'coalescing' ? 0.7 : 1),
              delay: seed.delay * (phase === 'coalescing' ? 0.5 : 1),
              ease: 'easeInOut',
            }
      }
    />
  );
}

/**
 * Vertical light beam — faint white/color column descending from top.
 * Only visible during coalescing phase.
 */
function LightBeam({ isObstacle }: { isObstacle: boolean }) {
  const midColor = isObstacle ? 'rgba(139,92,246,0.25)' : 'rgba(201,169,78,0.2)';
  const topColor = isObstacle ? 'rgba(139,92,246,0.15)' : 'rgba(201,169,78,0.12)';

  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{
        width: 40,
        height: '55%',
        left: '50%',
        transform: 'translateX(-50%)',
        transformOrigin: 'top center',
        background: `linear-gradient(to bottom, transparent 0%, ${topColor} 40%, ${midColor} 60%, transparent 100%)`,
        filter: 'blur(6px)',
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  );
}

/**
 * Radial glow pulse that radiates outward on card reveal.
 * Scales up from 0 to ~1.8 while fading out.
 */
function RevealPulse({ isObstacle }: { isObstacle: boolean }) {
  const color = isObstacle
    ? 'rgba(139,92,246,0.35)'
    : 'rgba(201,169,78,0.3)';

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, ease: 'easeOut', times: [0, 0.3, 1] }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
        initial={{ scale: 0.2 }}
        animate={{ scale: 2.2 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/**
 * Radial pulse at center during gathering phase — soft atmospheric heartbeat.
 */
function AtmosphericPulse({ isObstacle }: { isObstacle: boolean }) {
  const color = isObstacle
    ? 'rgba(139,92,246,0.1)'
    : 'rgba(201,169,78,0.08)';

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
        animate={{
          scale: [0.8, 1.4, 0.8],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function EmergenceReveal({ card, onCardRevealed }: EmergenceRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('gathering');
  const [showRevealPulse, setShowRevealPulse] = useState(false);
  const [hasCalledBack, setHasCalledBack] = useState(false);

  const isObstacle = card.cardType === 'obstacle';

  // Stable particle seeds — generated once
  const particles = useMemo(() => generateParticles(14), []);

  // Phase timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('coalescing'), 1500);
    const t2 = setTimeout(() => setPhase('reveal'), 3000);
    const t3 = setTimeout(() => {
      setShowRevealPulse(true);
    }, 3200);
    const t4 = setTimeout(() => {
      setPhase('holding');
      setShowRevealPulse(false);
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Fire onCardRevealed callback once card is fully visible (end of reveal phase)
  const handleCardAnimationComplete = useCallback(() => {
    if (phase === 'reveal' && !hasCalledBack) {
      setHasCalledBack(true);
      onCardRevealed();
    }
  }, [phase, hasCalledBack, onCardRevealed]);

  const statusLabel = STATUS_LABELS[phase];

  // Card data shaped for OracleCard
  const cardData = {
    id: card.id,
    title: card.title,
    meaning: card.meaning,
    guidance: card.guidance,
    imageUrl: card.imageUrl,
    imageStatus: card.imageStatus as CardImageStatus,
    cardType: card.cardType as CardType,
    originContext: null,
  };

  // Glow ring color around card
  const glowShadow = isObstacle
    ? 'shadow-[0_0_40px_rgba(139,92,246,0.4)]'
    : 'shadow-[0_0_40px_rgba(201,169,78,0.4)]';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">

      {/* ── Particle layer — always present, phase-aware ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((seed) => (
          <Particle
            key={seed.id}
            seed={seed}
            phase={phase}
            isObstacle={isObstacle}
          />
        ))}
      </div>

      {/* ── Atmospheric radial pulse (gathering only) ── */}
      <AnimatePresence>
        {phase === 'gathering' && (
          <AtmosphericPulse key="atm-pulse" isObstacle={isObstacle} />
        )}
      </AnimatePresence>

      {/* ── Light beam (coalescing only) ── */}
      <AnimatePresence>
        {phase === 'coalescing' && (
          <LightBeam key="light-beam" isObstacle={isObstacle} />
        )}
      </AnimatePresence>

      {/* ── Status text — floats above center, exits when card reveals ── */}
      <AnimatePresence mode="wait">
        {statusLabel && (
          <motion.p
            key={statusLabel}
            className={cn(
              'absolute top-[12%] left-0 right-0 text-center text-sm tracking-widest uppercase z-10',
              isObstacle ? 'text-purple-300/70' : 'text-gold/70',
            )}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={STATUS_SPRING}
          >
            {statusLabel}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Card — hidden in gathering/coalescing, scales in on reveal ── */}
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'holding') && (
          <motion.div
            key="emergence-card"
            className={cn('relative z-20 rounded-2xl', glowShadow)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={CARD_SPRING}
            onAnimationComplete={handleCardAnimationComplete}
          >
            <OracleCard card={cardData} size="md" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Glow pulse radiates outward on card reveal ── */}
      <AnimatePresence>
        {showRevealPulse && (
          <RevealPulse key="reveal-pulse" isObstacle={isObstacle} />
        )}
      </AnimatePresence>

      {/* ── Holding phase: ambient glow ring behind card ── */}
      <AnimatePresence>
        {phase === 'holding' && (
          <motion.div
            key="holding-glow"
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <motion.div
              className="rounded-full"
              style={{
                width: 180,
                height: 270,
                background: isObstacle
                  ? 'radial-gradient(ellipse, rgba(139,92,246,0.12), transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(201,169,78,0.1), transparent 70%)',
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
