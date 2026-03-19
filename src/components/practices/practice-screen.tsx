'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePracticePlayer } from '@/hooks/use-practice-player';
import { PauseTimer } from './pause-timer';
import { PracticeControls } from './practice-controls';
import type { PracticeWithSegments } from '@/types';

// ── Springs ───────────────────────────────────────────────────────────────────

const ZONE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 };
const CONTENT_SPRING = { type: 'spring' as const, stiffness: 300, damping: 28 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PracticeScreenProps {
  practice: PracticeWithSegments;
  onComplete: () => void;
  onClose: () => void;
  className?: string;
}

// ── Visual zone content ───────────────────────────────────────────────────────

interface VisualContentProps {
  state: ReturnType<typeof usePracticePlayer>['state'];
  currentSegment: ReturnType<typeof usePracticePlayer>['currentSegment'];
  remainingMs: number;
  totalMs: number;
  fallbackText: string | null;
}

function VisualContent({ state, currentSegment, remainingMs, totalMs, fallbackText }: VisualContentProps) {
  const isPause = state === 'playing' && currentSegment?.segmentType === 'pause';
  const isSpeech = state === 'playing' && currentSegment?.segmentType === 'speech';
  const isLoading = state === 'loading';
  const isCompleted = state === 'completed';
  const isIdle = state === 'idle';
  const isPaused = state === 'paused';

  // Key for AnimatePresence — changes when content category changes
  const contentKey = isCompleted
    ? 'completed'
    : isIdle
      ? 'idle'
      : isLoading
        ? 'loading'
        : isPause
          ? `pause-${currentSegment?.id}`
          : isSpeech
            ? `speech-${currentSegment?.id}`
            : isPaused
              ? 'paused'
              : 'default';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={contentKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: CONTENT_SPRING }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        className="flex flex-col items-center justify-center h-full gap-6 px-8"
      >
        {isCompleted && (
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Gold glow pulse */}
            <motion.div
              className="w-20 h-20 rounded-full bg-[#c9a94e]/10 border border-[#c9a94e]/30 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(201,169,78,0.15)',
                  '0 0 40px rgba(201,169,78,0.35)',
                  '0 0 20px rgba(201,169,78,0.15)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <span className="text-3xl">✦</span>
            </motion.div>
            <h2 className="text-lg font-light text-[#c9a94e] tracking-wide">
              Practice Complete
            </h2>
            <p className="text-sm text-white/40 max-w-xs">
              Take a moment to rest in the stillness you have cultivated.
            </p>
          </div>
        )}

        {isIdle && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#c9a94e]/5 border border-[#c9a94e]/20 flex items-center justify-center">
              <span className="text-lg text-[#c9a94e]/50">◈</span>
            </div>
            <p className="text-sm text-white/30 max-w-xs leading-relaxed">
              Find a comfortable position and press begin when you are ready.
            </p>
          </div>
        )}

        {isLoading && (
          <motion.div
            className="flex flex-col items-center gap-3"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#c9a94e]/60" />
            <p className="text-xs text-white/30 tracking-wider uppercase">Preparing</p>
          </motion.div>
        )}

        {isPause && (
          <PauseTimer
            remainingMs={remainingMs}
            totalMs={totalMs}
          />
        )}

        {(isSpeech || isPaused || (isLoading && currentSegment?.segmentType === 'speech')) && (
          <p className={cn(
            'text-sm italic text-white/50 text-center max-w-sm leading-relaxed',
            fallbackText && 'text-white/70',
          )}>
            {fallbackText ?? currentSegment?.text ?? ''}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

interface ProgressStepsProps {
  currentIndex: number;
  total: number;
}

function ProgressSteps({ currentIndex, total }: ProgressStepsProps) {
  if (total === 0) return null;
  const completedFraction = total > 1 ? currentIndex / (total - 1) : 0;

  return (
    <div className="relative w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-[#c9a94e]/60 rounded-full"
        animate={{ width: `${completedFraction * 100}%` }}
        transition={ZONE_SPRING}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PracticeScreen({
  practice,
  onComplete,
  onClose,
  className,
}: PracticeScreenProps) {
  const player = usePracticePlayer({
    practiceId: practice.id,
    segments: practice.segments,
  });

  const completionPostedRef = useRef(false);
  const [completionError, setCompletionError] = useState(false);

  // Post completion and call onComplete when practice finishes
  useEffect(() => {
    if (player.state !== 'completed') return;
    if (completionPostedRef.current) return;
    completionPostedRef.current = true;

    fetch('/api/practices/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ practiceId: practice.id }),
    })
      .catch(() => setCompletionError(true))
      .finally(() => onComplete());
  }, [player.state, practice.id, onComplete]);

  const {
    state,
    currentSegment,
    currentSegmentIndex,
    totalSegments,
    remainingMs,
    elapsedMs,
    estimatedTotalMs,
    fallbackText,
    play,
    pause,
    resume,
    stop,
  } = player;

  // Pause segment total duration: stored on the segment itself
  const pauseTotalMs =
    state === 'playing' && currentSegment?.segmentType === 'pause'
      ? (currentSegment.durationMs ?? 4000)
      : 4000;

  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50',
        'flex flex-col',
        'bg-[#07010f]',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* Subtle ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-black/60" />
      </div>

      {/* ── Header zone (~8% / min-content) ──────────────────────────── */}
      <motion.header
        layout
        transition={ZONE_SPRING}
        className="relative z-10 flex-shrink-0 flex flex-col gap-2 px-5 pt-safe-top pt-4 pb-3"
      >
        {/* Title row */}
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          <h1 className="text-sm text-white/90 font-light truncate flex-1 leading-snug">
            {practice.title}
          </h1>

          {/* Time elapsed / total */}
          <p className="text-xs text-white/40 tabular-nums flex-shrink-0">
            {formatTime(elapsedMs)}
            {estimatedTotalMs > 0 && (
              <span className="text-white/20"> / {formatTime(estimatedTotalMs)}</span>
            )}
          </p>

          {/* Close button (only when idle or completed) */}
          {(state === 'idle' || state === 'completed') && (
            <motion.button
              aria-label="Close practice"
              onClick={onClose}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0',
                'bg-white/5 border border-white/10',
                'text-white/30 hover:text-white/60 hover:bg-white/10',
                'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30',
              )}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Segment progress bar */}
        <ProgressSteps
          currentIndex={currentSegmentIndex}
          total={totalSegments}
        />
      </motion.header>

      {/* ── Visual zone (flex-grow, dominant) ────────────────────────── */}
      <motion.main
        layout
        transition={ZONE_SPRING}
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center"
      >
        {completionError && (
          <p className="absolute bottom-2 text-xs text-red-400/60 text-center w-full px-4">
            Could not record completion — your progress may not have saved.
          </p>
        )}

        <VisualContent
          state={state}
          currentSegment={currentSegment}
          remainingMs={remainingMs}
          totalMs={pauseTotalMs}
          fallbackText={fallbackText}
        />
      </motion.main>

      {/* ── Controls zone (~20% / flex-shrink-0) ────────────────────── */}
      <motion.footer
        layout
        transition={ZONE_SPRING}
        className="relative z-10 flex-shrink-0 pb-safe-bottom pb-6"
      >
        {/* Subtle separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

        <PracticeControls
          state={state}
          currentSegmentIndex={currentSegmentIndex}
          totalSegments={totalSegments}
          remainingMs={remainingMs}
          onPlay={play}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onClose={onClose}
        />
      </motion.footer>
    </motion.div>
  );
}
