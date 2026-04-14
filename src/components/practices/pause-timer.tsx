'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const DIAMETER = 120;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GOLD = 'var(--gold)';

const BREATHING_CYCLE_MS = 4000;
const BREATHING_CUES = ['Breathe in...', 'Breathe out...'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PauseTimerProps {
  remainingMs: number;
  totalMs: number;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PauseTimer({ remainingMs, totalMs, className }: PauseTimerProps) {
  const [breathingIndex, setBreathingIndex] = useState(0);

  // Alternate breathing cue every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingIndex((i) => (i + 1) % BREATHING_CUES.length);
    }, BREATHING_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  // Calculate arc: full circle at 1.0, empty at 0.0
  const ratio = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - ratio);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* SVG countdown ring */}
      <div className="relative" style={{ width: DIAMETER, height: DIAMETER }}>
        <svg
          width={DIAMETER}
          height={DIAMETER}
          viewBox={`0 0 ${DIAMETER} ${DIAMETER}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track ring */}
          <circle
            cx={DIAMETER / 2}
            cy={DIAMETER / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={4}
          />
          {/* Progress arc */}
          <motion.circle
            cx={DIAMETER / 2}
            cy={DIAMETER / 2}
            r={RADIUS}
            fill="none"
            stroke={GOLD}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          />
        </svg>

        {/* Centered time label */}
        <div className="absolute inset-0 flex items-center justify-center rotate-0">
          <span className="text-sm font-mono text-white/80 tabular-nums">
            {formatTime(remainingMs)}
          </span>
        </div>
      </div>

      {/* Breathing cue */}
      <div className="h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={breathingIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
            className="text-xs text-gold/70 tracking-widest uppercase text-center"
          >
            {BREATHING_CUES[breathingIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
