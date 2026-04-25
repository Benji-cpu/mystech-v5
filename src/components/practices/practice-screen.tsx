'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePracticePlayer, scaleSegmentPauses } from '@/hooks/use-practice-player';
import { useImmersiveOptional } from '@/components/immersive/immersive-provider';
import { PauseTimer } from './pause-timer';
import { PracticeControls } from './practice-controls';
import type { PracticeWithSegments } from '@/types';

// ── Springs ───────────────────────────────────────────────────────────────────

const ZONE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 };
const CONTENT_SPRING = { type: 'spring' as const, stiffness: 300, damping: 28 };

// ── Constants ─────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [5, 10, 15, 20, 30] as const;

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
  selectedDuration: number;
  onSelectDuration: (min: number) => void;
}

function VisualContent({
  state,
  currentSegment,
  remainingMs,
  totalMs,
  fallbackText,
  selectedDuration,
  onSelectDuration,
}: VisualContentProps) {
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
            <motion.div
              className="w-20 h-20 rounded-full border flex items-center justify-center"
              style={{
                background: 'rgba(168, 134, 63, 0.08)',
                borderColor: 'rgba(168, 134, 63, 0.35)',
                color: 'var(--accent-gold)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 134, 63, 0.18)',
                  '0 0 40px rgba(168, 134, 63, 0.35)',
                  '0 0 20px rgba(168, 134, 63, 0.18)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <span className="text-3xl">✦</span>
            </motion.div>
            <h2
              className="display text-xl tracking-wide"
              style={{ color: 'var(--accent-gold)' }}
            >
              Practice Complete
            </h2>
            <p
              className="whisper text-base max-w-xs"
              style={{ color: 'var(--ink-soft)' }}
            >
              Take a moment to rest in the stillness you have cultivated.
            </p>
          </div>
        )}

        {isIdle && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center"
              style={{
                background: 'rgba(168, 134, 63, 0.05)',
                borderColor: 'rgba(168, 134, 63, 0.3)',
                color: 'var(--accent-gold)',
              }}
            >
              <span className="text-lg">◈</span>
            </div>
            <p
              className="whisper text-base max-w-xs leading-relaxed"
              style={{ color: 'var(--ink-mute)' }}
            >
              Find a comfortable position and press begin when you are ready.
            </p>

            {/* Duration picker */}
            <div className="flex items-center gap-2">
              {DURATION_OPTIONS.map((min) => (
                <motion.button
                  key={min}
                  onClick={() => onSelectDuration(min)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                    'min-w-[44px] min-h-[36px] border',
                  )}
                  style={
                    selectedDuration === min
                      ? {
                          borderColor: 'var(--accent-gold)',
                          background: 'rgba(168, 134, 63, 0.15)',
                          color: 'var(--accent-gold)',
                        }
                      : {
                          borderColor: 'var(--line)',
                          background: 'var(--paper-card)',
                          color: 'var(--ink-mute)',
                        }
                  }
                  whileTap={{ scale: 0.95 }}
                >
                  {min}m
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <motion.div
            className="flex flex-col items-center gap-3"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--accent-gold)' }}
            />
            <p
              className="eyebrow"
              style={{ color: 'var(--ink-mute)' }}
            >
              Preparing
            </p>
          </motion.div>
        )}

        {isPause && (
          <PauseTimer
            remainingMs={remainingMs}
            totalMs={totalMs}
          />
        )}

        {(isSpeech || isPaused || (isLoading && currentSegment?.segmentType === 'speech')) && (
          <p
            className="whisper text-base text-center max-w-sm leading-relaxed"
            style={{ color: fallbackText ? 'var(--ink-soft)' : 'var(--ink-mute)' }}
          >
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
    <div
      className="relative w-full h-0.5 rounded-full overflow-hidden"
      style={{ background: 'var(--line)' }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: 'var(--accent-gold)' }}
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
  const immersive = useImmersiveOptional();
  const enterFocusMode = immersive?.enterFocusMode;
  const exitFocusMode = immersive?.exitFocusMode;

  // ── Focus mode: hide orb on mount, restore on unmount ──────────────────
  useEffect(() => {
    enterFocusMode?.();
    return () => exitFocusMode?.();
  }, [enterFocusMode, exitFocusMode]);

  // ── Duration selection ─────────────────────────────────────────────────
  const [selectedDuration, setSelectedDuration] = useState(
    practice.targetDurationMin,
  );

  const scaledSegments = useMemo(
    () => scaleSegmentPauses(practice.segments, selectedDuration * 60_000),
    [practice.segments, selectedDuration],
  );

  const player = usePracticePlayer({
    practiceId: practice.id,
    segments: scaledSegments,
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

  const canClose = state === 'idle' || state === 'completed';

  return (
    <motion.div
      className={cn(
        'daylight fixed inset-0 z-50',
        'flex flex-col',
        className,
      )}
      style={{ background: 'var(--paper)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* Subtle warm ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168, 134, 63, 0.06), transparent 60%)',
          }}
        />
      </div>

      {/* ── Header zone (FocusHeader-style vertical layout) ────────── */}
      <motion.header
        layout
        transition={ZONE_SPRING}
        className="relative z-10 flex-shrink-0 flex flex-col gap-2 px-5 pt-safe-top pt-4 pb-3"
      >
        {/* Back link — only when idle or completed */}
        <AnimatePresence>
          {canClose && (
            <motion.button
              onClick={onClose}
              className="eyebrow inline-flex items-center gap-1 transition-colors self-start min-h-[44px] hover:underline"
              style={{ color: 'var(--ink-mute)' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to path
            </motion.button>
          )}
        </AnimatePresence>

        {/* Title */}
        <h1
          className="display text-base leading-snug truncate"
          style={{ color: 'var(--ink)' }}
        >
          {practice.title}
        </h1>

        {/* Elapsed / total time */}
        <p className="text-xs tabular-nums" style={{ color: 'var(--ink-mute)' }}>
          {formatTime(elapsedMs)}
          {estimatedTotalMs > 0 && (
            <span style={{ color: 'var(--ink-faint)' }}> / {formatTime(estimatedTotalMs)}</span>
          )}
        </p>

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
          <p
            className="absolute bottom-2 text-xs text-center w-full px-4"
            style={{ color: '#b83a2b' }}
          >
            Could not record completion — your progress may not have saved.
          </p>
        )}

        <VisualContent
          state={state}
          currentSegment={currentSegment}
          remainingMs={remainingMs}
          totalMs={pauseTotalMs}
          fallbackText={fallbackText}
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
        />
      </motion.main>

      {/* ── Controls zone (~20% / flex-shrink-0) ────────────────────── */}
      <motion.footer
        layout
        transition={ZONE_SPRING}
        className="relative z-10 flex-shrink-0 pb-safe-bottom pb-6"
      >
        {/* Subtle separator */}
        <div
          className="h-px w-full mb-4"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--line), transparent)',
          }}
        />

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
