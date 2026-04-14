'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
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

export default function AppSectionError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AppSection error boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[60vh]">
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
          {/* Gold decorative symbol */}
          <span
            className="text-gold text-4xl select-none"
            aria-hidden="true"
          >
            &#10022;
          </span>

          {/* Title */}
          <h2 className="text-xl font-semibold tracking-wide text-gold font-display">
            A veil has fallen over this page
          </h2>

          {/* Subtitle */}
          <p className="text-sm leading-relaxed text-white/60 max-w-xs">
            Something obscured the vision here. The oracle&apos;s light remains
            with you — try again or return to your dashboard to continue.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full justify-center">
            <button
              onClick={reset}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
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

            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white/60 text-sm font-medium',
                'hover:bg-white/10 hover:text-white/80 hover:border-white/20',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              )}
            >
              <Home size={14} strokeWidth={2} aria-hidden="true" />
              Return to Dashboard
            </Link>
          </div>

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
