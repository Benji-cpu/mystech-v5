'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Dot, Headphones } from 'lucide-react';
import { PracticeScreen } from '@/components/practices/practice-screen';
import type { Waypoint, UserWaypointProgress, PracticeWithSegments } from '@/types';

type RetreatState = 'completed' | 'active' | 'future';

type PracticeProgressEntry = {
  practiceId: string;
  completed: boolean;
  playCount: number;
};

interface WaypointProgressProps {
  waypoints: Waypoint[];
  currentWaypointId: string | null;
  waypointProgressList: UserWaypointProgress[];
  retreatState: RetreatState;
  practiceProgressMap?: Record<string, PracticeProgressEntry>;
  className?: string;
}

export function WaypointProgress({
  waypoints,
  currentWaypointId,
  waypointProgressList,
  retreatState,
  practiceProgressMap,
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
          const practiceProgress = practiceProgressMap?.[waypoint.id] ?? null;

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

                {/* Practice callout — show for current waypoint when practice exists but not completed */}
                {isCurrent && practiceProgress && !practiceProgress.completed && (
                  <PracticeCallout waypointId={waypoint.id} />
                )}

                {/* Practice indicator for all waypoints with a practice */}
                {practiceProgress && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {practiceProgress.completed ? (
                      <>
                        <Headphones className="h-3 w-3 text-emerald-400/70" />
                        <span className="text-[10px] text-emerald-400/70">
                          Practice complete{practiceProgress.playCount > 1 ? ` (${practiceProgress.playCount}x)` : ''}
                        </span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <Headphones className="h-3 w-3 text-[#c9a94e]" />
                        <span className="text-[10px] text-[#c9a94e]/70">
                          Meditation available
                        </span>
                      </>
                    ) : (
                      <>
                        <Headphones className="h-3 w-3 text-white/20" />
                        <span className="text-[10px] text-white/20">
                          Meditation
                        </span>
                      </>
                    )}
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

/**
 * Practice callout — fetches practice data and opens the practice screen overlay.
 */
function PracticeCallout({ waypointId }: { waypointId: string }) {
  const router = useRouter();
  const [practiceData, setPracticeData] = useState<PracticeWithSegments | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBeginPractice() {
    setLoading(true);
    try {
      const res = await fetch(`/api/practices/${waypointId}`);
      const json = await res.json();
      if (json.success && json.data?.practice) {
        setPracticeData(json.data.practice);
        setShowPractice(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.button
        onClick={handleBeginPractice}
        disabled={loading}
        className={cn(
          'mt-2 w-full rounded-lg p-2.5',
          'bg-[#c9a94e]/10 border border-[#c9a94e]/25',
          'flex items-center gap-2',
          'hover:bg-[#c9a94e]/15 transition-colors',
          'disabled:opacity-50',
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Headphones className="h-4 w-4 text-[#c9a94e] shrink-0" />
        <div className="text-left flex-1">
          <p className="text-xs text-[#c9a94e] font-medium">
            {loading ? 'Loading...' : 'Begin Practice'}
          </p>
          <p className="text-[10px] text-[#c9a94e]/60">
            Guided meditation for this waypoint
          </p>
        </div>
      </motion.button>

      {showPractice && practiceData && createPortal(
        <PracticeScreen
          practice={practiceData}
          onComplete={() => {
            setShowPractice(false);
            router.refresh();
          }}
          onClose={() => setShowPractice(false)}
        />,
        document.body,
      )}
    </>
  );
}
