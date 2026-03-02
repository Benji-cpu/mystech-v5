'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedItem } from '@/components/ui/animated-item';
import { RetreatMap } from '@/components/paths/retreat-map';
import { PathCardCollection } from '@/components/paths/path-card-collection';
import {
  Compass,
  Flower2,
  Flame,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type {
  PathWithRetreats,
  UserPathProgress,
  UserRetreatProgress,
  UserWaypointProgress,
} from '@/types';

function PathIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const props = { className: cn('h-6 w-6', className) };
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

interface PathDetailProps {
  path: PathWithRetreats;
  pathProgress: UserPathProgress | null;
  retreatProgressList: UserRetreatProgress[];
  waypointProgressMap: Record<string, UserWaypointProgress[]>;
  className?: string;
}

export function PathDetail({
  path,
  pathProgress,
  retreatProgressList,
  waypointProgressMap,
  className,
}: PathDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activating, setActivating] = useState(false);

  const status = pathProgress?.status ?? null;
  const isNotStarted = !pathProgress;
  const isPaused = status === 'paused';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const canActivate = isNotStarted || isPaused;

  async function handleActivate() {
    setActivating(true);
    try {
      const res = await fetch('/api/paths/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathId: path.id }),
      });
      if (!res.ok) throw new Error('Failed to activate path');
      startTransition(() => {
        router.refresh();
      });
    } catch {
      // Silently fail — user can retry
    } finally {
      setActivating(false);
    }
  }

  const statusBadge = isActive
    ? { label: 'Active', className: 'border-[#c9a94e]/50 text-[#c9a94e] bg-[#c9a94e]/10' }
    : isCompleted
      ? { label: 'Completed', className: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' }
      : isPaused
        ? { label: 'Paused', className: 'border-white/20 text-white/50 bg-white/5' }
        : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Path header card */}
      <AnimatedItem>
        <motion.div
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-white/5 backdrop-blur-xl',
            'border shadow-lg shadow-purple-900/20',
            isActive ? 'border-[#c9a94e]/30' : 'border-white/10',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#c9a94e]/5 to-transparent pointer-events-none" />
          )}

          <div className="relative z-10 p-6 space-y-4">
            {/* Icon + name + badge */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                  isActive ? 'bg-[#c9a94e]/15 text-[#c9a94e]' : 'bg-white/10 text-white/60',
                )}
              >
                <PathIcon iconKey={path.iconKey} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-white/90 leading-tight">
                    {path.name}
                  </h1>
                  {statusBadge && (
                    <Badge variant="outline" className={cn('shrink-0 text-xs', statusBadge.className)}>
                      {statusBadge.label}
                    </Badge>
                  )}
                </div>
                {path.themes.length > 0 && (
                  <p className="text-xs text-white/40 mt-1">
                    {path.themes.join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/60 leading-relaxed">
              {path.description}
            </p>

            {/* Interpretive lens */}
            <div className="rounded-xl bg-white/5 border border-white/8 p-3">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium mb-1">
                Interpretive Lens
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                {path.interpretiveLens}
              </p>
            </div>

            {/* Activate / Resume button */}
            {canActivate && (
              <Button
                onClick={handleActivate}
                disabled={activating || isPending}
                className="bg-[#c9a94e] text-black hover:bg-[#c9a94e]/90 shadow-[0_0_20px_rgba(201,169,78,0.3)] w-full sm:w-auto"
              >
                {activating || isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isPaused ? 'Resume Path' : 'Begin This Path'}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatedItem>

      {/* Retreat map */}
      <AnimatedItem>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider px-1">
            Retreats
          </h2>
          <RetreatMap
            retreats={path.retreats}
            currentRetreatId={pathProgress?.currentRetreatId ?? null}
            currentWaypointId={pathProgress?.currentWaypointId ?? null}
            retreatProgressList={retreatProgressList}
            waypointProgressMap={waypointProgressMap}
          />
        </div>
      </AnimatedItem>

      {/* Path cards — only show when user has started the path */}
      {pathProgress && (
        <AnimatedItem>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider px-1">
              Forged Cards
            </h2>
            <PathCardCollection pathId={path.id} />
          </div>
        </AnimatedItem>
      )}
    </div>
  );
}
