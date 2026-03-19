'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WaypointProgress } from '@/components/paths/waypoint-progress';
import { RetreatArtifactCard } from '@/components/paths/retreat-artifact-card';
import { OracleCard } from '@/components/cards/oracle-card';
import { CardDetailModal } from '@/components/cards/card-detail-modal';
import { useCardDetailModal } from '@/hooks/use-card-detail-modal';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  Milestone,
  BookOpen,
  Shield,
  Loader2,
} from 'lucide-react';
import type { Retreat, Waypoint, RetreatCard, UserRetreatProgress, UserWaypointProgress, CardDetailData } from '@/types';

interface RetreatWithWaypoints extends Retreat {
  waypoints: Waypoint[];
}

type PracticeProgressEntry = {
  practiceId: string;
  completed: boolean;
  playCount: number;
};

interface RetreatMapProps {
  retreats: RetreatWithWaypoints[];
  currentRetreatId: string | null;
  currentWaypointId: string | null;
  retreatProgressList: UserRetreatProgress[];
  waypointProgressMap: Record<string, UserWaypointProgress[]>;
  practiceProgressMap?: Map<string, PracticeProgressEntry>;
  className?: string;
}

type RetreatState = 'completed' | 'active' | 'future';

function RetreatChallenges({ retreatId }: { retreatId: string }) {
  const [cards, setCards] = useState<RetreatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { openCard, modalProps } = useCardDetailModal<CardDetailData>();

  useEffect(() => {
    fetch(`/api/retreats/${retreatId}/cards`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setCards(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [retreatId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 px-2 text-white/30">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs">Loading challenges...</span>
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Shield className="h-3.5 w-3.5 text-amber-400/70" />
        <p className="text-[11px] text-white/35 uppercase tracking-wider font-medium">
          Challenges of This Retreat
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => (
          <div key={card.id} className="space-y-1 cursor-pointer" onClick={() => openCard(card)}>
            <OracleCard card={card} size="fill" />
            <p className="text-[10px] text-white/30 truncate px-0.5">
              {card.title}
            </p>
          </div>
        ))}
      </div>
      <CardDetailModal {...modalProps} />
    </div>
  );
}

export function RetreatMap({
  retreats,
  currentRetreatId,
  currentWaypointId,
  retreatProgressList,
  waypointProgressMap,
  practiceProgressMap,
  className,
}: RetreatMapProps) {
  // Auto-expand the active retreat on mount
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(currentRetreatId ? [currentRetreatId] : [])
  );

  const progressByRetreatId = new Map(retreatProgressList.map((rp) => [rp.retreatId, rp]));

  function toggleRetreat(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function getRetreatState(retreat: RetreatWithWaypoints): RetreatState {
    const prog = progressByRetreatId.get(retreat.id);
    if (prog?.status === 'completed') return 'completed';
    if (retreat.id === currentRetreatId) return 'active';
    return 'future';
  }

  return (
    <div className={cn('relative space-y-2', className)}>
      {/* Vertical connector line */}
      <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />

      {retreats.map((retreat, index) => {
        const state = getRetreatState(retreat);
        const isExpanded = expandedIds.has(retreat.id);
        const retreatProgress = progressByRetreatId.get(retreat.id) ?? null;
        const waypointProgressList = waypointProgressMap[retreat.id] ?? [];

        return (
          <div key={retreat.id} className="relative">
            {/* Retreat header */}
            <motion.button
              onClick={() => toggleRetreat(retreat.id)}
              className={cn(
                'w-full text-left rounded-2xl',
                'bg-white/5 backdrop-blur-xl border transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a94e]/50',
                state === 'completed'
                  ? 'border-white/8 opacity-70 hover:opacity-100 hover:border-white/15'
                  : state === 'active'
                    ? 'border-[#c9a94e]/30 hover:border-[#c9a94e]/50'
                    : 'border-white/8 hover:border-white/15',
              )}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Node icon */}
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    state === 'completed'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : state === 'active'
                        ? 'bg-[#c9a94e]/15 border-[#c9a94e]/50 text-[#c9a94e]'
                        : 'bg-white/5 border-white/15 text-white/30',
                  )}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : state === 'active' ? (
                    <Milestone className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>

                {/* Retreat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 font-medium">
                      Retreat {index + 1}
                    </span>
                    {state === 'active' && (
                      <span className="text-[10px] text-[#c9a94e] font-medium">
                        • Current
                      </span>
                    )}
                    {state === 'completed' && (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        • Complete
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm font-semibold leading-tight truncate',
                      state === 'future' ? 'text-white/40' : 'text-white/90',
                    )}
                  >
                    {retreat.name}
                  </p>
                  <p className="text-xs text-white/35 mt-0.5 truncate">
                    {retreat.theme}
                  </p>
                </div>

                {/* Waypoint count + expand toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-white/30">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{retreat.waypoints.length}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={cn(
                      'text-white/30',
                      state !== 'future' && 'text-white/50',
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>

              {/* Retreat description — visible when not expanded */}
              {!isExpanded && (
                <div className="px-4 pb-3 -mt-1">
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2 pl-12">
                    {retreat.description}
                  </p>
                </div>
              )}
            </motion.button>

            {/* Expanded waypoints */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pl-4 space-y-3">
                    <WaypointProgress
                      waypoints={retreat.waypoints}
                      currentWaypointId={
                        retreat.id === currentRetreatId ? currentWaypointId : null
                      }
                      waypointProgressList={waypointProgressList}
                      retreatState={state}
                      practiceProgressMap={practiceProgressMap}
                    />
                    <RetreatChallenges retreatId={retreat.id} />
                    {retreatProgress && state === 'completed' && (
                      <RetreatArtifactCard
                        retreatId={retreat.id}
                        retreatName={retreat.name}
                        retreatProgress={retreatProgress}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
