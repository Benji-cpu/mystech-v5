'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Compass, Sparkles, Clock } from 'lucide-react';

interface JourneyContextBannerProps {
  circleName?: string | null;
  circleNumber?: number | null;
  pathName: string;
  retreatName: string;
  waypointName: string;
  suggestedIntention: string;
  waypointIndex?: number;
  totalWaypoints?: number;
  pacingBlocked?: boolean;
  nextAvailableAt?: string;
  className?: string;
}

function formatNextAvailable(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffHours <= 1) return 'in about an hour';
  if (diffHours < 24) return `in about ${diffHours} hours`;
  return 'tomorrow';
}

export function JourneyContextBanner({
  circleName,
  circleNumber,
  pathName,
  retreatName,
  waypointName,
  suggestedIntention,
  waypointIndex,
  totalWaypoints,
  pacingBlocked,
  nextAvailableAt,
  className,
}: JourneyContextBannerProps) {
  const hasProgress = waypointIndex !== undefined && totalWaypoints !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-white/[0.03] backdrop-blur-sm',
        pacingBlocked ? 'border border-white/10' : 'border border-gold/30',
        'shadow-lg shadow-purple-900/20',
        'p-4',
        className
      )}
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative z-10">
        {/* Path position — prominent display */}
        <div className="flex items-center gap-2 mb-1">
          <Compass className={cn('h-4 w-4 shrink-0', pacingBlocked ? 'text-white/40' : 'text-[color:var(--gold)]')} />
          <span className={cn('text-sm font-semibold tracking-wide', pacingBlocked ? 'text-white/60' : 'text-foreground')}>
            {pathName} Path
          </span>
        </div>

        {/* Breadcrumb position */}
        <p className={cn('text-xs font-medium mb-3 ml-6', pacingBlocked ? 'text-white/30' : 'text-gold/80')}>
          {retreatName}
          {hasProgress && (
            <span className="text-muted-foreground">
              {' '}&mdash; Step {waypointIndex + 1} of {totalWaypoints}: {waypointName}
            </span>
          )}
          {!hasProgress && (
            <span className="text-muted-foreground">
              {' '}&middot; {waypointName}
            </span>
          )}
        </p>

        {/* Progress dots */}
        {hasProgress && (
          <div className="flex items-center gap-1.5 ml-6 mb-3">
            {Array.from({ length: totalWaypoints }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i < waypointIndex
                    ? 'w-4 bg-emerald-500/80'
                    : i === waypointIndex
                      ? 'w-6 bg-gold'
                      : 'w-3 bg-white/15'
                )}
              />
            ))}
          </div>
        )}

        {pacingBlocked ? (
          /* Pacing-blocked: muted info message */
          <div className={cn(
            'flex items-start gap-2.5 px-3 py-2.5',
            'rounded-lg',
            'border border-white/10',
            'bg-white/5'
          )}>
            <Clock className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
            <p className="text-sm text-white/50 leading-relaxed">
              Your next step opens{' '}
              <span className="text-white/70 font-medium">
                {nextAvailableAt ? formatNextAvailable(nextAvailableAt) : 'tomorrow'}
              </span>
              . You can still do a casual reading now.
            </p>
          </div>
        ) : (
          /* Normal: the intention IS the question */
          <div className={cn(
            'flex items-start gap-2.5 px-3 py-2.5',
            'rounded-lg',
            'border border-gold/20',
            'bg-gold/5'
          )}>
            <Sparkles className="h-4 w-4 text-[color:var(--gold)] shrink-0 mt-0.5" />
            <p className="text-sm text-gold italic font-medium leading-relaxed">
              &ldquo;{suggestedIntention}&rdquo;
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
