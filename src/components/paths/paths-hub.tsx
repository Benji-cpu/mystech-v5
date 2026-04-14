'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedItem } from '@/components/ui/animated-item';
import { CircleCard } from '@/components/paths/circle-card';
import { Map as MapIcon } from 'lucide-react';
import type { Circle, UserCircleProgress, Path, UserPathProgress, PathPosition } from '@/types';

interface PathsHubProps {
  circles: Circle[];
  circleProgress: UserCircleProgress[];
  paths: Path[];
  allProgress: UserPathProgress[];
  activePosition: PathPosition | null;
  className?: string;
}

export function PathsHub({
  circles,
  circleProgress,
  paths,
  allProgress,
  activePosition,
  className,
}: PathsHubProps) {
  const activePathId = activePosition?.path.id ?? null;
  const activeCircleRef = useRef<HTMLDivElement>(null);

  // Build lookup maps
  const progressByPathId = new Map(allProgress.map((p) => [p.pathId, p]));
  const circleProgressMap = new Map(circleProgress.map((cp) => [cp.circleId, cp]));
  const pathsByCircle = new Map<string, Path[]>();
  for (const p of paths) {
    if (!p.circleId) continue;
    const existing = pathsByCircle.get(p.circleId) ?? [];
    existing.push(p);
    pathsByCircle.set(p.circleId, existing);
  }

  // Auto-scroll active circle into view on mount
  const activeCircleId = activePosition?.circle?.id ?? null;
  useEffect(() => {
    if (activeCircleRef.current) {
      activeCircleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Separate circles with paths from orphan paths (no circle)
  const orphanPaths = paths.filter((p) => !p.circleId);
  const sortedCircles = [...circles].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active path callout */}
      {activePosition && (
        <AnimatedItem>
          <div className="rounded-2xl bg-gradient-to-r from-gold/10 to-purple-900/10 border border-gold/20 p-4">
            <p className="text-xs text-gold font-medium uppercase tracking-wider mb-0.5">
              Active Path
            </p>
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white/90">{activePosition.path.name}</span>
              {' — '}
              <span className="text-white/60">{activePosition.retreat.name}</span>
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              Step: {activePosition.waypoint.name}
            </p>
          </div>
        </AnimatedItem>
      )}

      {/* Circle cards */}
      {sortedCircles.map((circle, index) => {
        const cp = circleProgressMap.get(circle.id) ?? null;
        const circlePaths = (pathsByCircle.get(circle.id) ?? []).sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        const isActiveCircle = circle.id === activeCircleId;

        return (
          <motion.div
            key={circle.id}
            ref={isActiveCircle ? activeCircleRef : undefined}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: index * 0.06,
            }}
          >
            <CircleCard
              circle={circle}
              circleProgress={cp}
              paths={circlePaths}
              pathProgressMap={progressByPathId}
              activePathId={activePathId}
            />
          </motion.div>
        );
      })}

      {/* Orphan paths (no circle assigned — backward compatibility) */}
      {orphanPaths.length > 0 && (
        <AnimatedItem>
          <div className="rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Other Paths</p>
            {orphanPaths.map((path) => (
              <div key={path.id} className="text-sm text-white/60">
                {path.name}
              </div>
            ))}
          </div>
        </AnimatedItem>
      )}

      {circles.length === 0 && orphanPaths.length === 0 && (
        <AnimatedItem>
          <div className="text-center py-16 text-white/40">
            <MapIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No paths available yet.</p>
          </div>
        </AnimatedItem>
      )}
    </div>
  );
}
