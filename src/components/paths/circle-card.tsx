'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lock,
  ChevronDown,
  CheckCircle2,
  Compass,
  Flower2,
  Flame,
  Sparkles,
} from 'lucide-react';
import type { Circle, UserCircleProgress, Path, UserPathProgress } from '@/types';

// ── Icon helper ────────────────────────────────────────────────────────────────

function PathIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const props = { className: cn('h-4 w-4', className) };
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

// ── Path list item ─────────────────────────────────────────────────────────────

interface PathListItemProps {
  path: Path;
  order: number;
  progress: UserPathProgress | null;
  isActivePath: boolean;
  isLocked: boolean;
}

function PathListItem({ path, order, progress, isActivePath, isLocked }: PathListItemProps) {
  const isCompleted = progress?.status === 'completed';
  const isStarted = progress?.status === 'active' || progress?.status === 'paused';

  // Stub paths: no retreats/waypoints content yet — determined by caller via a flag on the path.
  // We expose this as a component-level check: if `path.description` is empty and the path
  // has no progress, treat it as stub. Callers can also pass a special iconKey sentinel,
  // but for now we rely on presence of progress or description length.
  // (The "content coming soon" state is shown below when the path has no real content.)

  const inner = (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors duration-200',
        isLocked && 'opacity-40 cursor-default',
        isActivePath && 'bg-gold/8 border border-gold/20',
        !isActivePath && !isLocked && 'hover:bg-white/5',
      )}
    >
      {/* Order number / status indicator */}
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
          isCompleted && 'bg-emerald-500/20 text-emerald-400',
          isActivePath && !isCompleted && 'bg-gold/20 text-gold',
          !isActivePath && !isCompleted && !isLocked && 'bg-white/10 text-white/50',
          isLocked && 'bg-white/5 text-white/30',
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : isLocked ? (
          <Lock className="h-3 w-3" />
        ) : (
          <span>{order}</span>
        )}
      </div>

      {/* Path icon */}
      <PathIcon
        iconKey={path.iconKey}
        className={cn(
          'shrink-0',
          isCompleted && 'text-emerald-400',
          isActivePath && !isCompleted && 'text-gold',
          !isActivePath && !isCompleted && 'text-white/40',
          isLocked && 'text-white/20',
        )}
      />

      {/* Name + state */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-tight truncate',
            isCompleted && 'text-emerald-400',
            isActivePath && !isCompleted && 'text-gold',
            !isActivePath && !isCompleted && !isLocked && 'text-white/75',
            isLocked && 'text-white/30',
          )}
        >
          {path.name}
        </p>
        {/* "Content coming soon" for stub paths — no description, not locked, not started */}
        {!path.description && !isLocked && !isStarted && !isCompleted && (
          <p className="text-[11px] text-white/30 italic mt-0.5">Content coming soon</p>
        )}
      </div>

      {/* Status badge */}
      {isCompleted && (
        <Badge
          variant="outline"
          className="shrink-0 text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-1.5 py-0"
        >
          Done
        </Badge>
      )}
      {isActivePath && !isCompleted && (
        <Badge
          variant="outline"
          className="shrink-0 text-[10px] border-gold/40 text-gold bg-gold/10 px-1.5 py-0"
        >
          Active
        </Badge>
      )}
      {isStarted && !isActivePath && !isCompleted && (
        <Badge
          variant="outline"
          className="shrink-0 text-[10px] border-white/20 text-white/40 px-1.5 py-0"
        >
          Paused
        </Badge>
      )}
    </div>
  );

  // Locked paths are non-clickable
  if (isLocked) {
    return <div>{inner}</div>;
  }

  return (
    <Link href={`/paths/${path.id}`} className="block">
      {inner}
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface CircleCardProps {
  circle: Circle;
  circleProgress: UserCircleProgress | null;
  paths: Path[];
  pathProgressMap: Map<string, UserPathProgress>;
  activePathId: string | null;
  isExpanded?: boolean;
  className?: string;
}

export function CircleCard({
  circle,
  circleProgress,
  paths,
  pathProgressMap,
  activePathId,
  isExpanded: isExpandedProp,
  className,
}: CircleCardProps) {
  const circleStatus = circleProgress?.status ?? null;
  // First circle (sortOrder 0) is always accessible, even without a progress record
  const isFirstCircle = circle.sortOrder === 0;
  const isLocked = circleStatus === 'locked' || (circleStatus === null && !isFirstCircle);
  const isActive = circleStatus === 'active' || (circleStatus === null && isFirstCircle);
  const isCompleted = circleStatus === 'completed';

  // Default expanded state: active or completed circles expand, locked collapse
  const defaultExpanded = isExpandedProp ?? (isActive || isCompleted);
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Progress counts
  const totalPaths = paths.length;
  const completedPaths = circleProgress?.pathsCompleted ?? 0;
  const progressPct = totalPaths > 0 ? Math.round((completedPaths / totalPaths) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/[0.03] backdrop-blur-sm',
        'border transition-colors duration-300',
        isActive && 'border-gold/40 shadow-lg shadow-gold/8',
        isCompleted && 'border-emerald-500/30',
        isLocked && 'border-white/10 opacity-60',
        !isActive && !isCompleted && !isLocked && 'border-white/10',
        className,
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
      )}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10 p-4">
        {/* ── Header row ────────────────────────────────────────────── */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          {/* Circle number pill */}
          <span
            className={cn(
              'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              isActive && 'bg-gold/15 text-gold',
              isCompleted && 'bg-emerald-500/15 text-emerald-400',
              isLocked && 'bg-white/8 text-white/30',
            )}
          >
            {circle.name}
          </span>

          {/* Spacer for layout */}
          <span className="flex-1" />

          {/* Status indicator */}
          <span className="shrink-0 flex items-center gap-1.5">
            {isCompleted && (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            {isLocked && (
              <Lock className="h-3.5 w-3.5 text-white/25" />
            )}
          </span>

          {/* Chevron */}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'shrink-0',
              isLocked && 'text-white/20',
              isActive && 'text-gold/60',
              isCompleted && 'text-emerald-400/60',
              !isActive && !isCompleted && !isLocked && 'text-white/30',
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        {/* ── Progress bar (active / completed) ─────────────────────── */}
        {(isActive || isCompleted) && circleProgress && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>
                {completedPaths}/{totalPaths} paths completed
              </span>
              <span>{progressPct}%</span>
            </div>
            <Progress
              value={progressPct}
              className={cn(
                'h-1',
                isCompleted && '[&>[data-slot=progress-indicator]]:bg-emerald-400',
                isActive && '[&>[data-slot=progress-indicator]]:bg-gold',
              )}
            />
          </div>
        )}

        {/* ── Expandable body ────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                {/* Locked placeholder */}
                {isLocked ? (
                  <p className="text-xs text-white/30 italic px-1">
                    Complete the previous section to unlock.
                  </p>
                ) : (
                  <>
                    {/* Description */}
                    {circle.description && (
                      <p className="text-xs text-white/45 leading-relaxed px-1 pb-1">
                        {circle.description}
                      </p>
                    )}

                    {/* Divider */}
                    {circle.description && paths.length > 0 && (
                      <div className="h-px bg-white/8 mx-1" />
                    )}

                    {/* Path list */}
                    {paths.length > 0 ? (
                      <div className="space-y-0.5">
                        {paths
                          .slice()
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((path, idx) => {
                            const progress = pathProgressMap.get(path.id) ?? null;
                            const isThisPathActive = path.id === activePathId;

                            // A path is "locked" within an active/completed circle when
                            // a prior path hasn't been completed and this one hasn't started.
                            const prevPath = idx > 0
                              ? paths.slice().sort((a, b) => a.sortOrder - b.sortOrder)[idx - 1]
                              : null;
                            const prevProgress = prevPath
                              ? pathProgressMap.get(prevPath.id) ?? null
                              : null;
                            const prevCompleted = prevPath
                              ? prevProgress?.status === 'completed'
                              : true; // first path is never locked within the circle
                            const isPathLocked =
                              !progress && !prevCompleted;

                            return (
                              <PathListItem
                                key={path.id}
                                path={path}
                                order={idx + 1}
                                progress={progress}
                                isActivePath={isThisPathActive}
                                isLocked={isPathLocked}
                              />
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-white/30 italic px-1">
                        No paths available yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
