'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface IntentionZoneProps {
  suggestedIntention: string;
  waypointName: string;
  userIntention: string;
  onSetUserIntention: (text: string) => void;
  onUseSuggested: () => void;
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
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

const MAX_CHARS = 300;

export function IntentionZone({
  suggestedIntention,
  waypointName,
  userIntention,
  onSetUserIntention,
  onUseSuggested,
  className,
}: IntentionZoneProps) {
  const charCount = userIntention.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-4 p-4', className)}
    >
      {/* Label */}
      <motion.p
        variants={itemVariants}
        className="text-xs font-medium tracking-widest uppercase text-white/40 text-center"
      >
        Your intention for {waypointName}
      </motion.p>

      {/* Suggested intention card */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'relative overflow-hidden rounded-2xl p-5',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'shadow-lg shadow-purple-900/20',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a94e]/5 to-transparent pointer-events-none rounded-2xl" />
        <p
          className="relative z-10 font-serif italic text-base text-[#c9a94e] leading-relaxed text-center"
          style={{ textShadow: '0 0 24px rgba(201,169,78,0.2)' }}
        >
          &ldquo;{suggestedIntention}&rdquo;
        </p>
      </motion.div>

      {/* Use suggested button */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUseSuggested}
          className={cn(
            'w-full py-2.5 px-6 rounded-xl text-sm font-medium',
            'border border-[#c9a94e]/40 text-[#c9a94e]',
            'bg-transparent hover:bg-[#c9a94e]/5',
            'transition-colors duration-200',
          )}
        >
          Use This Intention
        </motion.button>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3"
      >
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }}
        />
        <span className="text-[10px] tracking-widest uppercase text-white/25">
          or write your own
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }}
        />
      </motion.div>

      {/* Textarea */}
      <motion.div variants={itemVariants}>
        <Textarea
          value={userIntention}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              onSetUserIntention(e.target.value);
            }
          }}
          placeholder="What do you want to explore?"
          className={cn(
            'min-h-[80px] resize-none',
            'bg-white/5 backdrop-blur-xl border-white/10 rounded-xl',
            'text-white/80 placeholder:text-white/20',
            'focus-visible:border-[#c9a94e]/50 focus-visible:ring-[#c9a94e]/20',
          )}
        />
        {/* Character counter */}
        {charCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'text-[10px] text-right mt-1.5',
              charCount > MAX_CHARS * 0.9 ? 'text-amber-400/60' : 'text-white/20',
            )}
          >
            {charCount}/{MAX_CHARS}
          </motion.p>
        )}
      </motion.div>

      {/* Decorative stars */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-3"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.35,
            }}
            className="w-1 h-1 rounded-full bg-[#c9a94e]"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
