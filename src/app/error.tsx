'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
};

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[RootError boundary]', error);
  }, [error]);

  return (
    <div
      className={cn(
        'min-h-screen bg-[#0a0a0f]',
        'flex items-center justify-center p-6',
      )}
    >
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-card/80',
          'border border-white/[0.06]',
          'shadow-lg shadow-purple-900/20',
          'w-full max-w-md p-8',
          'flex flex-col items-center text-center gap-5',
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Icon */}
          <Sparkles
            className="text-gold"
            size={40}
            strokeWidth={1.5}
            aria-hidden="true"
          />

          {/* Title */}
          <h1 className="text-2xl font-semibold tracking-wide text-gold font-display leading-relaxed">
            The threads have tangled
          </h1>

          {/* Subtitle */}
          <p className="text-sm leading-relaxed text-white/60 max-w-xs">
            The unseen currents have momentarily disrupted your path. Take a
            breath — the oracle&apos;s vision can be restored.
          </p>

          {/* Reset button */}
          <button
            onClick={reset}
            className={cn(
              'mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl',
              'bg-gold/10 border border-gold/30',
              'text-gold text-sm font-medium',
              'hover:bg-gold/20 hover:border-gold/50',
              'transition-colors duration-200',
              'shadow-[0_0_20px_rgba(201,169,78,0.15)]',
              'hover:shadow-[0_0_24px_rgba(201,169,78,0.3)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
            )}
          >
            <RefreshCw size={14} strokeWidth={2} aria-hidden="true" />
            Try again
          </button>

          {/* Digest for debugging */}
          {error.digest && (
            <p className="text-[10px] text-white/20 font-mono mt-1">
              ref: {error.digest}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
