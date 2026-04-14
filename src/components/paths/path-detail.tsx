'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedItem } from '@/components/ui/animated-item';
import { RetreatMap } from '@/components/paths/retreat-map';
import { PathCardCollection } from '@/components/paths/path-card-collection';
import { CurrentPracticeCard } from '@/components/paths/current-practice-card';
import { RetreatGuidanceCheck } from '@/components/paths/retreat-guidance-check';
import { GuidanceScreen } from '@/components/guide/guidance-screen';
import { useGuidance } from '@/hooks/use-guidance';
import {
  Compass,
  Flower2,
  Flame,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type {
  PathWithRetreats,
  Practice,
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

type PracticeProgressEntry = {
  practiceId: string;
  completed: boolean;
  playCount: number;
};

type CurrentPracticeData = Practice & {
  completed: boolean;
  playCount: number;
};

interface PathDetailProps {
  path: PathWithRetreats;
  pathProgress: UserPathProgress | null;
  retreatProgressList: UserRetreatProgress[];
  waypointProgressMap: Record<string, UserWaypointProgress[]>;
  practiceProgressMap?: Record<string, PracticeProgressEntry>;
  currentPractice?: CurrentPracticeData | null;
  currentWaypointName?: string | null;
  className?: string;
}

// Derive path guidance trigger key from path name
function getPathGuidanceTriggerKey(pathName: string): string {
  // "The Archetypal Path" → "archetypal", "The Mindfulness Path" → "mindfulness", etc.
  const slug = pathName.toLowerCase().replace(/^the\s+/, '').replace(/\s+path$/, '').trim();
  return `path.${slug}.intro`;
}

export function PathDetail({
  path,
  pathProgress,
  retreatProgressList,
  waypointProgressMap,
  practiceProgressMap,
  currentPractice,
  currentWaypointName,
  className,
}: PathDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activating, setActivating] = useState(false);
  const [showPathGuidance, setShowPathGuidance] = useState(false);

  const status = pathProgress?.status ?? null;
  const isNotStarted = !pathProgress;
  const isPaused = status === 'paused';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const canActivate = isNotStarted || isPaused;

  // Path-level guidance — shows after activation
  const pathGuidanceTriggerKey = getPathGuidanceTriggerKey(path.name);
  const pathGuidance = useGuidance({
    triggerKey: pathGuidanceTriggerKey,
    enabled: showPathGuidance,
  });

  async function handleActivate() {
    setActivating(true);
    try {
      const res = await fetch('/api/paths/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathId: path.id }),
      });
      if (!res.ok) throw new Error('Failed to activate path');
      // Check for path guidance before refreshing
      setShowPathGuidance(true);
    } catch {
      // Silently fail — user can retry
    } finally {
      setActivating(false);
    }
  }

  // When guidance completes/skips, refresh the page
  function handleGuidanceDone() {
    pathGuidance.complete().then(() => {
      startTransition(() => router.refresh());
    });
  }

  function handleGuidanceSkip() {
    pathGuidance.skip().then(() => {
      startTransition(() => router.refresh());
    });
  }

  // Show guidance screen after activation
  if (showPathGuidance && pathGuidance.shouldShow && pathGuidance.guidance) {
    return (
      <GuidanceScreen
        guidance={pathGuidance.guidance}
        isFirstEncounter={pathGuidance.isFirstEncounter}
        onComplete={handleGuidanceDone}
        onSkip={handleGuidanceSkip}
        onListenAgain={pathGuidance.listenAgain}
      />
    );
  }

  // If guidance loading triggered but shouldn't show, refresh
  useEffect(() => {
    if (showPathGuidance && !pathGuidance.isLoading && !pathGuidance.shouldShow) {
      setShowPathGuidance(false);
      startTransition(() => router.refresh());
    }
  }, [showPathGuidance, pathGuidance.isLoading, pathGuidance.shouldShow, router]);

  // Find current retreat name for retreat-level guidance
  const currentRetreat = pathProgress?.currentRetreatId
    ? path.retreats.find((r) => r.id === pathProgress.currentRetreatId)
    : null;

  const statusBadge = isActive
    ? { label: 'Active', className: 'border-gold/50 text-gold bg-gold/10' }
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
            'bg-white/[0.03] backdrop-blur-sm',
            'border shadow-lg shadow-purple-900/20',
            isActive ? 'border-gold/30' : 'border-white/10',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
          )}

          <div className="relative z-10 p-6 space-y-4">
            {/* Icon + name + badge */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                  isActive ? 'bg-gold/15 text-gold' : 'bg-white/10 text-white/60',
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
                className="bg-gold text-black hover:bg-gold/90 shadow-[0_0_20px_rgba(201,169,78,0.3)] w-full sm:w-auto"
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

      {/* Retreat-level guidance — shows on first encounter with current retreat */}
      {isActive && currentRetreat && (
        <RetreatGuidanceCheck pathName={path.name} retreatName={currentRetreat.name} />
      )}

      {/* Current practice card — prominent position above retreats */}
      {isActive && currentPractice && currentWaypointName && (
        <AnimatedItem>
          <CurrentPracticeCard
            practice={currentPractice}
            waypointName={currentWaypointName}
            completed={currentPractice.completed}
            playCount={currentPractice.playCount}
          />
        </AnimatedItem>
      )}

      {/* Retreat map */}
      <AnimatedItem>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider px-1">
            Chapters
          </h2>
          <RetreatMap
            retreats={path.retreats}
            currentRetreatId={pathProgress?.currentRetreatId ?? null}
            currentWaypointId={pathProgress?.currentWaypointId ?? null}
            retreatProgressList={retreatProgressList}
            waypointProgressMap={waypointProgressMap}
            practiceProgressMap={practiceProgressMap}
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
