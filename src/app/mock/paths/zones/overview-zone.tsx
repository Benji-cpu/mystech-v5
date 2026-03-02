'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MockPath, MockRetreat } from '../path-journey-data';

interface OverviewZoneProps {
  path: MockPath;
  retreat: MockRetreat;
  onBeginJourney: () => void;
  className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING, staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

export function OverviewZone({ path, retreat, onBeginJourney, className }: OverviewZoneProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('flex flex-col gap-4 p-4', className)}
    >
      {/* Path label */}
      <motion.p
        variants={itemVariants}
        className="text-[10px] font-medium tracking-widest uppercase text-[#c9a94e]"
      >
        {path.name} Path
      </motion.p>

      {/* Retreat name */}
      <motion.h2
        variants={itemVariants}
        className="text-xl font-bold text-white leading-tight"
      >
        {retreat.name}
      </motion.h2>

      {/* Description */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'shadow-lg shadow-purple-900/20',
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-2xl" />
        <p className="relative z-10 text-sm text-white/60 leading-relaxed line-clamp-3">
          {retreat.description}
        </p>
      </motion.div>

      {/* Theme chip */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
            'bg-[#c9a94e]/10 border border-[#c9a94e]/30 text-[#c9a94e]',
          )}
        >
          {retreat.theme}
        </span>
      </motion.div>

      {/* Begin journey button */}
      <motion.button
        variants={itemVariants}
        onClick={onBeginJourney}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'mt-1 w-full py-3 px-6 rounded-2xl text-sm font-semibold',
          'bg-[#c9a94e] text-[#0a0118]',
          'shadow-[0_0_20px_rgba(201,169,78,0.3)]',
          'transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(201,169,78,0.45)]',
        )}
      >
        Begin Journey
      </motion.button>
    </motion.div>
  );
}
