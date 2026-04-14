'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Headphones, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardPracticeCardProps {
  practiceTitle: string;
  durationMin: number;
  pathId: string;
  pathName: string;
  waypointName: string;
  className?: string;
}

export function DashboardPracticeCard({
  practiceTitle,
  durationMin,
  pathId,
  pathName,
  waypointName,
  className,
}: DashboardPracticeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(className)}
    >
      <Link href={`/paths/${pathId}`}>
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-white/[0.03] backdrop-blur-sm',
            'border border-gold/20',
            'p-4',
            'hover:bg-white/8 transition-colors',
            'group',
          )}
        >
          {/* Gold accent gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15">
              <Headphones className="h-5 w-5 text-gold" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gold/60 uppercase tracking-wider font-medium">
                Practice Available
              </p>
              <p className="text-sm font-medium text-white/90 truncate mt-0.5">
                {practiceTitle}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-white/30" />
                  <span className="text-[10px] text-white/30 tabular-nums">5–30m</span>
                </div>
                <span className="text-white/15">·</span>
                <span className="text-[10px] text-white/30 truncate">
                  {pathName} — {waypointName}
                </span>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-4 w-4 text-white/20 shrink-0 group-hover:text-white/40 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
