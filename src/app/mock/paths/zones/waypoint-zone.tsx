'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MockWaypoint } from '../path-mock-data';

interface WaypointZoneProps {
  waypoint: MockWaypoint;
  waypointIndex: number;
  onDrawCards: () => void;
  className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { ...SPRING, staggerChildren: 0.12 },
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
  onDrawCards,
  className,
}: WaypointZoneProps) {
  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-3 p-4', className)}
    >
      {/* Waypoint header — number + name */}
      <motion.div
        variants={itemVariants}
      >
        <p className="text-[10px] font-medium tracking-widest uppercase text-[#c9a94e]/70 mb-0.5">
          Waypoint {waypointIndex + 1}
        </p>
        <h3
          className="text-lg font-bold text-white leading-tight"
          style={{ textShadow: '0 0 20px rgba(201,169,78,0.25)' }}
        >
          {waypoint.name}
        </h3>
      </motion.div>

      {/* Description */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'relative overflow-hidden rounded-2xl p-3',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'shadow-lg shadow-purple-900/20',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-2xl" />
        <p className="relative z-10 text-sm text-white/60 leading-relaxed line-clamp-2">
          {waypoint.description}
        </p>
      </motion.div>

      {/* Lyra guidance */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-3 items-start">
          {/* Lyra sigil dot */}
          <div className="mt-1 shrink-0 w-5 h-5 rounded-full border border-[#c9a94e]/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/60" />
          </div>
          <p className="text-sm italic text-white/50 leading-relaxed line-clamp-3">
            {waypoint.lyraGuidance}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
