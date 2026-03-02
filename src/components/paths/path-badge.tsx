'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Compass, Flower2, Flame, Sparkles, ChevronRight } from 'lucide-react';
import type { JourneyPosition } from '@/types';

function PathIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const props = { className: cn('h-3.5 w-3.5', className) };
  switch (iconKey) {
    case 'drama':
      return <Compass {...props} />;
    case 'lotus':
      return <Flower2 {...props} />;
    case 'flame':
      return <Flame {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

interface PathBadgeProps {
  position: JourneyPosition;
  className?: string;
}

export function PathBadge({ position, className }: PathBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn('w-full', className)}
    >
      <Link
        href={`/paths/${position.path.id}`}
        className={cn(
          'flex items-center gap-2.5 w-full',
          'rounded-xl px-3 py-2',
          'bg-[#c9a94e]/8 border border-[#c9a94e]/20',
          'hover:bg-[#c9a94e]/12 hover:border-[#c9a94e]/30',
          'transition-colors duration-200',
        )}
      >
        {/* Icon pill */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c9a94e]/15 text-[#c9a94e]">
          <PathIcon iconKey={position.path.iconKey} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#c9a94e]/70 font-medium uppercase tracking-wider leading-none mb-0.5 truncate">
            {position.path.name}
          </p>
          <p className="text-xs text-white/60 leading-tight truncate">
            {position.retreat.name}
          </p>
        </div>

        {/* Chevron */}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
      </Link>
    </motion.div>
  );
}

interface PathBadgeEmptyProps {
  className?: string;
}

export function PathBadgeEmpty({ className }: PathBadgeEmptyProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn('w-full', className)}
    >
      <Link
        href="/paths"
        className={cn(
          'flex items-center gap-2.5 w-full',
          'rounded-xl px-3 py-2',
          'bg-white/5 border border-white/10 border-dashed',
          'hover:bg-white/8 hover:border-white/20',
          'transition-colors duration-200',
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-white/30">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40 leading-tight truncate">
            Begin a spiritual path
          </p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/20" />
      </Link>
    </motion.div>
  );
}
