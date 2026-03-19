'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MockRetreat } from '../path-mock-data';

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

// Sparkles concentrated around the badge area (top-center)
const SPARKLES: SparkleProps[] = [
  { x: '30%', y: '5%',  delay: 0,    size: 3 },
  { x: '40%', y: '2%',  delay: 0.4,  size: 2 },
  { x: '50%', y: '0%',  delay: 0.8,  size: 4 },
  { x: '60%', y: '3%',  delay: 0.25, size: 2 },
  { x: '70%', y: '6%',  delay: 0.6,  size: 3 },
  { x: '35%', y: '10%', delay: 1.1,  size: 2 },
  { x: '65%', y: '9%',  delay: 0.9,  size: 3 },
  { x: '45%', y: '7%',  delay: 1.4,  size: 2 },
  { x: '55%', y: '1%',  delay: 0.55, size: 3 },
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

const STATS = [
  { value: '3', label: 'Waypoints' },
  { value: '9', label: 'Cards Drawn' },
  { value: '3', label: 'Themes' },
];

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
      className={cn('relative flex flex-col gap-3 p-3 overflow-hidden', className)}
    >
      {/* Ambient sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {SPARKLES.map((sp, i) => (
          <Sparkle key={i} {...sp} />
        ))}
      </div>

      {/* ── Achievement badge ── */}
      <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
        {/* Glowing badge circle */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 20px rgba(201,169,78,0.2)',
              '0 0 35px rgba(201,169,78,0.4)',
              '0 0 20px rgba(201,169,78,0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ borderRadius: '50%' }}
        >
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              'border-2 border-[#c9a94e] bg-[#c9a94e]/10',
            )}
          >
            {/* Diamond/star SVG */}
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden="true">
              <path
                d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z"
                fill="#c9a94e"
                opacity={0.9}
              />
            </svg>
          </div>
        </motion.div>

        {/* Badge title */}
        <p
          className="text-sm font-bold text-[#c9a94e]"
          style={{ textShadow: '0 0 20px rgba(201,169,78,0.3)' }}
        >
          Threshold Walker
        </p>
        <p className="text-xs text-white/40">
          First retreat completed
        </p>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col items-center px-3 py-2 rounded-xl text-center',
              'bg-white/5 border border-white/10',
            )}
          >
            <span className="text-base font-bold text-[#c9a94e]">{stat.value}</span>
            <span className="text-[10px] text-white/40">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="w-full h-px mx-auto max-w-[200px]"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(201,169,78,0.5), transparent)',
        }}
      />

      {/* ── Artifact card ── */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'relative overflow-hidden rounded-2xl p-3',
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

        <div className="relative z-10 flex flex-col gap-2">
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
          <p className="text-xs text-white/55 leading-relaxed line-clamp-3">
            {artifactSummary}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
