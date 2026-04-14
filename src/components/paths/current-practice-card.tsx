'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Headphones, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PracticeScreen } from '@/components/practices/practice-screen';
import type { Practice, PracticeWithSegments } from '@/types';

interface CurrentPracticeCardProps {
  practice: Practice;
  waypointName: string;
  completed: boolean;
  playCount: number;
  className?: string;
}

export function CurrentPracticeCard({
  practice,
  waypointName,
  completed,
  playCount,
  className,
}: CurrentPracticeCardProps) {
  const router = useRouter();
  const [practiceData, setPracticeData] = useState<PracticeWithSegments | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBeginPractice() {
    setLoading(true);
    try {
      const res = await fetch(`/api/practices/${practice.waypointId}`);
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-white/[0.03] backdrop-blur-sm',
          'border border-gold/25',
          'shadow-lg shadow-gold/5',
          className,
        )}
      >
        {/* Subtle gold gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/8 to-transparent pointer-events-none" />

        <div className="relative z-10 p-5 space-y-3">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                completed
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-gold/15 text-gold',
              )}
            >
              {completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Headphones className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                {completed ? 'Practice Complete' : 'Current Practice'}
              </p>
              <h3 className="text-base font-semibold text-white/90 leading-tight mt-0.5 truncate">
                {practice.title}
              </h3>
            </div>

            {/* Duration badge */}
            <div className="flex items-center gap-1 shrink-0 rounded-full bg-white/5 border border-white/10 px-2.5 py-1">
              <Clock className="h-3 w-3 text-white/40" />
              <span className="text-[11px] text-white/50 tabular-nums">
                5–30m
              </span>
            </div>
          </div>

          {/* Waypoint context */}
          <p className="text-xs text-white/40">
            {waypointName}
          </p>

          {/* Action button */}
          <motion.button
            onClick={handleBeginPractice}
            disabled={loading}
            className={cn(
              'w-full rounded-xl py-3 px-4',
              'flex items-center justify-center gap-2',
              'text-sm font-medium transition-colors',
              'disabled:opacity-50',
              completed
                ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/8'
                : 'bg-gold text-black hover:bg-gold/90 shadow-[0_0_20px_rgba(201,169,78,0.2)]',
            )}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Headphones className="h-4 w-4" />
            {loading
              ? 'Loading...'
              : completed
                ? `Listen Again${playCount > 1 ? ` (${playCount}x)` : ''}`
                : 'Begin Practice'}
          </motion.button>
        </div>
      </motion.div>

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
