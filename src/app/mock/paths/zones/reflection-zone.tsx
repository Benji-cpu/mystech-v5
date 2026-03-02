'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MockWaypoint } from '../path-journey-data';

// ── Check circle icon ─────────────────────────────────────────────────────────

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 12.5 L10.5 15.5 L16.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Lock icon ─────────────────────────────────────────────────────────────────

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11 L8 7 Q8 4 12 4 Q16 4 16 7 L16 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ReflectionZoneProps {
  waypoint: MockWaypoint;
  waypointIndex: number;
  isLastWaypoint: boolean;
  isTimeLocked: boolean;
  className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

export function ReflectionZone({
  waypoint,
  waypointIndex,
  isLastWaypoint,
  isTimeLocked,
  className,
}: ReflectionZoneProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-4 p-4', className)}
    >
      {/* Completion badge */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2"
      >
        <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm font-semibold text-emerald-400">
          Waypoint {waypointIndex + 1} complete
        </p>
      </motion.div>

      {/* Waypoint name recap */}
      <motion.p
        variants={itemVariants}
        className="text-base font-semibold text-white/80"
      >
        {waypoint.name}
      </motion.p>

      {/* Lyra encouragement */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'shadow-lg shadow-purple-900/20',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-2xl" />
        <div className="relative z-10 flex gap-3 items-start">
          <div className="mt-1 shrink-0 w-5 h-5 rounded-full border border-[#c9a94e]/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/60" />
          </div>
          <p className="text-sm italic text-white/50 leading-relaxed">
            Let this settle. The next step on the path will be here for you tomorrow.
          </p>
        </div>
      </motion.div>

      {/* Last waypoint celebration */}
      {isLastWaypoint && (
        <motion.div
          variants={itemVariants}
          className={cn(
            'text-center py-3 px-4 rounded-2xl',
            'border border-[#c9a94e]/30 bg-[#c9a94e]/5',
          )}
        >
          <p className="text-sm font-semibold text-[#c9a94e]">
            You have completed The Threshold
          </p>
        </motion.div>
      )}

      {/* Time lock indicator */}
      {isTimeLocked && !isLastWaypoint && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-white/30"
        >
          <LockIcon className="w-4 h-4 shrink-0" />
          <p className="text-xs">
            Available tomorrow
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
