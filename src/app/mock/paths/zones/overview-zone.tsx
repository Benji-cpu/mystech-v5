'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { MockPath, MockRetreat } from '../path-mock-data';

interface OverviewZoneProps {
  path: MockPath;
  retreat: MockRetreat;
  userIntention: string;
  onSetUserIntention: (text: string) => void;
  suggestedIntention: string;
  onUseSuggested: () => void;
  onBeginPath: () => void;
  className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };
const MAX_CHARS = 200;

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

export function OverviewZone({
  path,
  retreat,
  userIntention,
  onSetUserIntention,
  suggestedIntention,
  onUseSuggested,
  onBeginPath,
  className,
}: OverviewZoneProps) {
  const charCount = userIntention.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('flex flex-col gap-2 p-3', className)}
    >
      {/* Path label + Retreat name */}
      <motion.div variants={itemVariants}>
        <p className="text-[10px] font-medium tracking-widest uppercase text-[#c9a94e] mb-1">
          {path.name} Path
        </p>
        <h2 className="text-xl font-bold text-white leading-tight">
          {retreat.name}
        </h2>
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants}>
        <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
          {retreat.description}
        </p>
      </motion.div>

      {/* ── Intention section ── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        {/* Lyra prompt */}
        <p className="text-xs italic text-white/40 text-center">
          Set your intention for this path
        </p>

        {/* Suggested intention */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl p-2 flex items-center gap-2',
            'bg-white/5 backdrop-blur-xl border border-white/10',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#c9a94e]/5 to-transparent pointer-events-none rounded-xl" />
          <p
            className="relative z-10 flex-1 font-serif italic text-sm text-[#c9a94e] leading-relaxed"
            style={{ textShadow: '0 0 24px rgba(201,169,78,0.2)' }}
          >
            &ldquo;{suggestedIntention}&rdquo;
          </p>
          <button
            onClick={onUseSuggested}
            className={cn(
              'relative z-10 shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium',
              'border border-[#c9a94e]/40 text-[#c9a94e]',
              'bg-transparent hover:bg-[#c9a94e]/10',
              'transition-colors duration-200',
            )}
          >
            Use This
          </button>
        </div>

        {/* Intention textarea */}
        <Textarea
          value={userIntention}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              onSetUserIntention(e.target.value);
            }
          }}
          placeholder="What draws you to this path?"
          className={cn(
            'min-h-[52px] resize-none text-sm',
            'bg-white/5 backdrop-blur-xl border-white/10 rounded-xl',
            'text-white/80 placeholder:text-white/20',
            'focus-visible:border-[#c9a94e]/50 focus-visible:ring-[#c9a94e]/20',
          )}
        />
        {charCount > 0 && (
          <p className={cn(
            'text-[10px] text-right -mt-1',
            charCount > MAX_CHARS * 0.9 ? 'text-amber-400/60' : 'text-white/20',
          )}>
            {charCount}/{MAX_CHARS}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
