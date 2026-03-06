'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
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
  userReflection: string;
  onSetUserReflection: (text: string) => void;
  onSkipReflection: () => void;
  reflectionSkipped: boolean;
  className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };
const MAX_REFLECTION_CHARS = 1000;

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
  userReflection,
  onSetUserReflection,
  onSkipReflection,
  reflectionSkipped,
  className,
}: ReflectionZoneProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-3 p-4', className)}
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

      {/* Lyra reflection prompt */}
      <motion.div
        variants={itemVariants}
        className="flex gap-3 items-start"
      >
        <div className="mt-1 shrink-0 w-5 h-5 rounded-full border border-[#c9a94e]/40 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/60" />
        </div>
        <p className="text-sm italic text-white/50 leading-relaxed line-clamp-2">
          What resonated with you? What truths are you carrying forward?
        </p>
      </motion.div>

      {/* Journal textarea */}
      <motion.div variants={itemVariants}>
        <Textarea
          value={userReflection}
          onChange={(e) => {
            if (e.target.value.length <= MAX_REFLECTION_CHARS) {
              onSetUserReflection(e.target.value);
            }
          }}
          placeholder="Write what emerged for you..."
          disabled={reflectionSkipped}
          className={cn(
            'min-h-[60px] resize-none',
            'bg-white/5 backdrop-blur-xl border-white/10 rounded-xl',
            'text-white/80 placeholder:text-white/20',
            'focus-visible:border-[#c9a94e]/50 focus-visible:ring-[#c9a94e]/20',
            reflectionSkipped && 'opacity-30',
          )}
        />
        <div className="flex items-center justify-between mt-1.5">
          {/* Skip link */}
          {!reflectionSkipped && !userReflection.trim() && (
            <button
              onClick={onSkipReflection}
              className="text-white/30 text-xs underline underline-offset-2 hover:text-white/50 transition-colors"
            >
              Skip
            </button>
          )}
          {reflectionSkipped && (
            <p className="text-white/25 text-xs italic">Skipped</p>
          )}
          {!reflectionSkipped && userReflection.length > 0 && <span />}
          {/* Character counter */}
          {userReflection.length > 0 && (
            <p className={cn(
              'text-[10px]',
              userReflection.length > MAX_REFLECTION_CHARS * 0.9 ? 'text-amber-400/60' : 'text-white/20',
            )}>
              {userReflection.length}/{MAX_REFLECTION_CHARS}
            </p>
          )}
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
