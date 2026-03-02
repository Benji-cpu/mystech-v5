'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MockWaypoint } from '../path-journey-data';
import type { WaypointSubPhase } from '../path-journey-state';

// ── Decoration icons ──────────────────────────────────────────────────────────

function ArchwayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 40 L8 22 Q8 8 24 8 Q40 8 40 22 L40 40"
        stroke="#c9a94e"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <line x1="4" y1="40" x2="44" y2="40" stroke="#c9a94e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function MirrorIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="24" cy="20" rx="12" ry="16" stroke="#c9a94e" strokeWidth="1.5" opacity="0.7" />
      <path d="M18 37 L20 42 L28 42 L30 37" stroke="#c9a94e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <line x1="24" y1="10" x2="24" y2="14" stroke="#c9a94e" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function CliffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 40 L4 22 L18 22 L18 12 L32 12 L32 22 L44 16 L44 40"
        stroke="#c9a94e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <line x1="4" y1="40" x2="44" y2="40" stroke="#c9a94e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const DECORATION_ICONS: Record<MockWaypoint['decorationIcon'], typeof ArchwayIcon> = {
  archway: ArchwayIcon,
  mirror: MirrorIcon,
  cliff: CliffIcon,
};

// ── Component ─────────────────────────────────────────────────────────────────

interface WaypointZoneProps {
  waypoint: MockWaypoint;
  waypointIndex: number;
  subPhase: WaypointSubPhase | null;
  onProceedToIntention: () => void;
  className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { ...SPRING, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

export function WaypointZone({
  waypoint,
  waypointIndex,
  subPhase,
  onProceedToIntention,
  className,
}: WaypointZoneProps) {
  const isPresent = subPhase === 'present';
  const DecoIcon = DECORATION_ICONS[waypoint.decorationIcon];

  // Note: auto-advance from arriving → present is handled by the shell's useEffect

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-4 p-4', className)}
    >
      {/* Waypoint header — icon + name */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3"
      >
        <DecoIcon className="w-10 h-10 shrink-0" />
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#c9a94e]/70 mb-0.5">
            Waypoint {waypointIndex + 1}
          </p>
          <h3
            className="text-lg font-bold text-white leading-tight"
            style={{ textShadow: '0 0 20px rgba(201,169,78,0.25)' }}
          >
            {waypoint.name}
          </h3>
        </div>
      </motion.div>

      {/* Description — slides in when present */}
      <motion.div
        layout
        animate={{
          opacity: isPresent ? 1 : 0,
          height: isPresent ? 'auto' : 0,
        }}
        transition={SPRING}
        className="overflow-hidden"
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl p-4',
            'bg-white/5 backdrop-blur-xl border border-white/10',
            'shadow-lg shadow-purple-900/20',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-2xl" />
          <p className="relative z-10 text-sm text-white/60 leading-relaxed">
            {waypoint.description}
          </p>
        </div>
      </motion.div>

      {/* Lyra guidance — delayed reveal when present */}
      <motion.div
        layout
        animate={{
          opacity: isPresent ? 1 : 0,
          height: isPresent ? 'auto' : 0,
        }}
        transition={{ ...SPRING, delay: isPresent ? 0.18 : 0 }}
        className="overflow-hidden"
      >
        <div className="flex gap-3 items-start">
          {/* Lyra sigil dot */}
          <div className="mt-1 shrink-0 w-5 h-5 rounded-full border border-[#c9a94e]/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/60" />
          </div>
          <p className="text-sm italic text-white/50 leading-relaxed">
            {waypoint.lyraGuidance}
          </p>
        </div>
      </motion.div>

      {/* CTA — only shown when present */}
      <motion.div
        layout
        animate={{
          opacity: isPresent ? 1 : 0,
          height: isPresent ? 'auto' : 0,
        }}
        transition={{ ...SPRING, delay: isPresent ? 0.28 : 0 }}
        className="overflow-hidden"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onProceedToIntention}
          className={cn(
            'w-full py-3 px-6 rounded-2xl text-sm font-semibold',
            'border border-[#c9a94e]/40 text-[#c9a94e]',
            'bg-[#c9a94e]/5 hover:bg-[#c9a94e]/10',
            'transition-colors duration-200',
          )}
        >
          Set My Intention
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
