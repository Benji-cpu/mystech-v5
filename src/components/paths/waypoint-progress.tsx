'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Dot } from 'lucide-react';
import type { Waypoint, UserWaypointProgress } from '@/types';

type RetreatState = 'completed' | 'active' | 'future';

interface WaypointProgressProps {
  waypoints: Waypoint[];
  currentWaypointId: string | null;
  waypointProgressList: UserWaypointProgress[];
  retreatState: RetreatState;
  className?: string;
}

export function WaypointProgress({
  waypoints,
  currentWaypointId,
  waypointProgressList,
  retreatState,
  className,
}: WaypointProgressProps) {
  const progressByWaypointId = new Map(
    waypointProgressList.map((wp) => [wp.waypointId, wp])
  );

  return (
    <div className={cn('space-y-2 rounded-2xl bg-white/3 border border-white/8 p-4', className)}>
      {/* Retreat description callout */}
      <p className="text-xs text-white/40 leading-relaxed mb-3 pl-1">
        Waypoints mark your progress through this retreat.
      </p>

      <div className="space-y-1.5">
        {waypoints.map((waypoint, index) => {
          const progress = progressByWaypointId.get(waypoint.id) ?? null;
          const isCompleted = progress?.status === 'completed' || retreatState === 'completed';
          const isCurrent = waypoint.id === currentWaypointId && retreatState === 'active';
          const isFuture = !isCompleted && !isCurrent;

          const readingsDone = progress?.readingCount ?? 0;
          const readingsRequired = waypoint.requiredReadings;

          return (
            <motion.div
              key={waypoint.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: index * 0.05,
              }}
              className={cn(
                'flex items-start gap-3 rounded-xl p-3 transition-colors duration-200',
                isCurrent
                  ? 'bg-[#c9a94e]/8 border border-[#c9a94e]/20'
                  : isCompleted
                    ? 'opacity-60'
                    : 'opacity-50',
              )}
            >
              {/* Status icon */}
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Dot className="h-4 w-4 text-[#c9a94e] animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-white/20" />
                )}
              </div>

              {/* Waypoint content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight truncate',
                      isCurrent
                        ? 'text-white/90'
                        : isCompleted
                          ? 'text-white/70'
                          : 'text-white/40',
                    )}
                  >
                    {waypoint.name}
                  </p>

                  {/* Reading count */}
                  <span
                    className={cn(
                      'text-[10px] shrink-0 tabular-nums',
                      isCurrent ? 'text-[#c9a94e]' : 'text-white/30',
                    )}
                  >
                    {isCompleted
                      ? `${readingsRequired}/${readingsRequired}`
                      : `${readingsDone}/${readingsRequired}`}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={cn(
                    'text-xs leading-relaxed line-clamp-2',
                    isCurrent ? 'text-white/50' : 'text-white/30',
                  )}
                >
                  {waypoint.description}
                </p>

                {/* Suggested intention — only for current waypoint */}
                {isCurrent && waypoint.suggestedIntention && (
                  <div className="mt-2 rounded-lg bg-[#c9a94e]/8 border border-[#c9a94e]/15 p-2">
                    <p className="text-[10px] text-[#c9a94e]/60 font-medium uppercase tracking-wider mb-0.5">
                      Suggested Intention
                    </p>
                    <p className="text-xs text-[#c9a94e]/80 italic leading-relaxed">
                      &ldquo;{waypoint.suggestedIntention}&rdquo;
                    </p>
                  </div>
                )}

                {/* Progress mini-bar for current waypoint with multiple readings required */}
                {isCurrent && readingsRequired > 1 && (
                  <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#c9a94e] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(readingsDone / readingsRequired) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 30, delay: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
