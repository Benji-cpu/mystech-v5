'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MockRetreat } from '../path-journey-data';

// ── Sparkle particle ──────────────────────────────────────────────────────────

interface SparkleProps {
  x: string;
  y: string;
  delay: number;
  size: number;
}

function Sparkle({ x, y, delay, size }: SparkleProps) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#c9a94e] pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.9, 0],
        scale: [0, 1, 0],
        y: [0, -12, -24],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

const SPARKLES: SparkleProps[] = [
  { x: '10%', y: '20%', delay: 0,    size: 3 },
  { x: '25%', y: '10%', delay: 0.4,  size: 2 },
  { x: '50%', y: '5%',  delay: 0.8,  size: 4 },
  { x: '75%', y: '12%', delay: 0.25, size: 2 },
  { x: '88%', y: '22%', delay: 0.6,  size: 3 },
  { x: '15%', y: '55%', delay: 1.1,  size: 2 },
  { x: '85%', y: '50%', delay: 0.9,  size: 3 },
  { x: '40%', y: '15%', delay: 1.4,  size: 2 },
  { x: '62%', y: '8%',  delay: 0.55, size: 3 },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface RetreatCompleteZoneProps {
  retreat: MockRetreat;
  artifactTitle: string;
  artifactThemes: string[];
  artifactSummary: string;
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
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

export function RetreatCompleteZone({
  retreat,
  artifactTitle,
  artifactThemes,
  artifactSummary,
  className,
}: RetreatCompleteZoneProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('relative flex flex-col gap-5 p-4 overflow-hidden', className)}
    >
      {/* Ambient sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {SPARKLES.map((sp, i) => (
          <Sparkle key={i} {...sp} />
        ))}
      </div>

      {/* Heading */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-[10px] font-medium tracking-widest uppercase text-[#c9a94e]/70 mb-1">
          Retreat complete
        </p>
        <h2
          className="text-2xl font-bold text-[#c9a94e] leading-tight"
          style={{ textShadow: '0 0 30px rgba(201,169,78,0.35)' }}
        >
          {retreat.name} Complete
        </h2>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="w-full h-px mx-auto max-w-[200px]"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(201,169,78,0.5), transparent)',
        }}
      />

      {/* Artifact card */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4',
          'bg-white/5 backdrop-blur-xl',
          'border border-[#c9a94e]/40',
          'shadow-[0_0_30px_rgba(201,169,78,0.15)]',
        )}
        whileHover={{ scale: 1.01 }}
        transition={SPRING}
      >
        {/* Gold glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a94e]/8 via-transparent to-transparent pointer-events-none rounded-2xl" />
        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#c9a94e]/40" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#c9a94e]/40" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#c9a94e]/40" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#c9a94e]/40" />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Artifact label */}
          <p className="text-[9px] font-medium tracking-widest uppercase text-[#c9a94e]/60">
            Retreat artifact
          </p>

          {/* Artifact title */}
          <h3 className="text-base font-bold text-[#c9a94e]">
            {artifactTitle}
          </h3>

          {/* Theme chips */}
          <div className="flex flex-wrap gap-1.5">
            {artifactThemes.map((theme) => (
              <span
                key={theme}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full',
                  'text-[10px] font-medium',
                  'bg-[#c9a94e]/10 border border-[#c9a94e]/25 text-[#c9a94e]/80',
                )}
              >
                {theme}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            className="w-full h-px"
            style={{
              background: 'linear-gradient(to right, rgba(201,169,78,0.25), transparent)',
            }}
          />

          {/* Summary */}
          <p className="text-xs text-white/55 leading-relaxed">
            {artifactSummary}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
