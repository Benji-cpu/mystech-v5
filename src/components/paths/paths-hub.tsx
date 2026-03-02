'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedItem } from '@/components/ui/animated-item';
import { PathCard } from '@/components/paths/path-card';
import { Map as MapIcon } from 'lucide-react';
import type { Path, UserPathProgress, JourneyPosition } from '@/types';

interface PathsHubProps {
  paths: Path[];
  allProgress: UserPathProgress[];
  activePosition: JourneyPosition | null;
  className?: string;
}

export function PathsHub({ paths, allProgress, activePosition, className }: PathsHubProps) {
  const activePathId = activePosition?.path.id ?? null;

  // Build a map of pathId → progress for quick lookup
  const progressByPathId = new Map(allProgress.map((p) => [p.pathId, p]));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Active journey callout */}
      {activePosition && (
        <AnimatedItem>
          <div className="rounded-2xl bg-gradient-to-r from-[#c9a94e]/10 to-purple-900/10 border border-[#c9a94e]/20 p-4">
            <p className="text-xs text-[#c9a94e] font-medium uppercase tracking-wider mb-0.5">
              Current Journey
            </p>
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white/90">{activePosition.path.name}</span>
              {' — '}
              <span className="text-white/60">{activePosition.retreat.name}</span>
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              Waypoint: {activePosition.waypoint.name}
            </p>
          </div>
        </AnimatedItem>
      )}

      {/* Path cards */}
      <AnimatedItem>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path, index) => {
            const progress = progressByPathId.get(path.id) ?? null;
            const isActive = path.id === activePathId;

            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.08,
                }}
              >
                <PathCard
                  path={path}
                  progress={progress}
                  isActive={isActive}
                />
              </motion.div>
            );
          })}
        </div>
      </AnimatedItem>

      {paths.length === 0 && (
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
