'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, X, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PracticePlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'completed';

interface PracticeControlsProps {
  state: PracticePlayerState;
  currentSegmentIndex: number;
  totalSegments: number;
  remainingMs: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClose: () => void;
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CenterButtonProps {
  state: PracticePlayerState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
}

function CenterButton({ state, onPlay, onPause, onResume, onClose }: CenterButtonProps) {
  const isCompleted = state === 'completed';
  const isLoading = state === 'loading';
  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const isIdle = state === 'idle';

  function handlePress() {
    if (isIdle || isCompleted) return onPlay();
    if (isPlaying) return onPause();
    if (isPaused) return onResume();
  }

  return (
    <motion.button
      aria-label={
        isCompleted
          ? 'Return to path'
          : isLoading
            ? 'Loading'
            : isPlaying
              ? 'Pause practice'
              : isPaused
                ? 'Resume practice'
                : 'Begin practice'
      }
      onClick={isCompleted ? onClose : handlePress}
      disabled={isLoading}
      className={cn(
        'relative flex items-center justify-center',
        'w-16 h-16 rounded-full border',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2',
        'transition-colors',
      )}
      style={{
        background: isCompleted ? 'rgba(168, 134, 63, 0.2)' : 'rgba(168, 134, 63, 0.12)',
        borderColor: isCompleted ? 'rgba(168, 134, 63, 0.6)' : 'rgba(168, 134, 63, 0.4)',
        boxShadow: '0 0 24px rgba(168, 134, 63, 0.28)',
        color: 'var(--accent-gold)',
      }}
      whileHover={isLoading ? {} : { scale: 1.06 }}
      whileTap={isLoading ? {} : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Loader2 className="w-6 h-6 text-[var(--accent-gold)] animate-spin" />
          </motion.span>
        ) : isCompleted ? (
          <motion.span
            key="completed"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <CheckCircle className="w-6 h-6 text-[var(--accent-gold)]" />
          </motion.span>
        ) : isPlaying ? (
          <motion.span
            key="pause"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Pause className="w-6 h-6 text-[var(--accent-gold)]" />
          </motion.span>
        ) : (
          <motion.span
            key="play"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Play className="w-6 h-6 text-[var(--accent-gold)] translate-x-0.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PracticeControls({
  state,
  currentSegmentIndex,
  totalSegments,
  remainingMs,
  onPlay,
  onPause,
  onResume,
  onStop,
  onClose,
  className,
}: PracticeControlsProps) {
  const [showStopDialog, setShowStopDialog] = useState(false);

  const isActive = state === 'playing' || state === 'paused';
  const showRemainingTime = state === 'paused' && remainingMs > 0;
  const showReturnButton = state === 'completed';

  function handleStopRequest() {
    if (isActive) {
      setShowStopDialog(true);
    } else {
      onClose();
    }
  }

  function handleConfirmStop() {
    setShowStopDialog(false);
    onStop();
    onClose();
  }

  return (
    <>
      <div className={cn('relative flex flex-col items-center gap-4 px-6 pb-4', className)}>
        {/* Stop button — top right */}
        {state !== 'idle' && state !== 'completed' && (
          <motion.button
            aria-label="Stop practice"
            onClick={handleStopRequest}
            className={cn(
              'absolute top-0 right-6',
              'flex items-center justify-center w-9 h-9 rounded-full border',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-1',
            )}
            style={{
              background: 'var(--paper-card)',
              borderColor: 'var(--line)',
              color: 'var(--ink-mute)',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Square className="w-4 h-4" />
          </motion.button>
        )}

        {/* Center play/pause/begin/return button */}
        <CenterButton
          state={state}
          onPlay={onPlay}
          onPause={onPause}
          onResume={onResume}
          onClose={onClose}
        />

        {/* Contextual label below center button */}
        <div className="h-5 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showReturnButton ? (
              <motion.button
                key="return"
                onClick={onClose}
                className="eyebrow hover:underline transition-colors"
                style={{ color: 'var(--accent-gold)' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
                exit={{ opacity: 0, y: -6 }}
              >
                Return to path
              </motion.button>
            ) : showRemainingTime ? (
              <motion.p
                key="remaining"
                className="text-xs tabular-nums"
                style={{ color: 'var(--ink-mute)' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
                exit={{ opacity: 0, y: -6 }}
              >
                {formatTime(remainingMs)} remaining
              </motion.p>
            ) : state === 'idle' ? (
              <motion.p
                key="begin-hint"
                className="eyebrow"
                style={{ color: 'var(--ink-mute)' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
                exit={{ opacity: 0, y: -6 }}
              >
                Begin practice
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Segment indicator dots */}
        {totalSegments > 1 && state !== 'idle' && (
          <motion.div
            className="flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {Array.from({ length: totalSegments }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'rounded-full transition-colors',
                  i < currentSegmentIndex
                    ? 'w-1.5 h-1.5 bg-gold/60'     // completed
                    : i === currentSegmentIndex
                      ? 'w-2 h-2 bg-gold'           // current
                      : 'w-1.5 h-1.5 bg-white/15',       // upcoming
                )}
                animate={
                  i === currentSegmentIndex
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 1 }
                }
                transition={{
                  repeat: i === currentSegmentIndex && state === 'playing' ? Infinity : 0,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Stop confirmation dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent
          showCloseButton={false}
          className="daylight max-w-sm mx-auto"
          style={{ background: 'var(--paper-card)', borderColor: 'var(--line)' }}
        >
          <DialogHeader>
            <DialogTitle
              className="display text-base"
              style={{ color: 'var(--ink)' }}
            >
              Stop this practice?
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: 'var(--ink-mute)' }}
            >
              Your progress in this session will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setShowStopDialog(false)}
              className="flex-1"
              style={{ color: 'var(--ink-soft)' }}
            >
              Keep going
            </Button>
            <Button
              onClick={handleConfirmStop}
              className="flex-1 border"
              style={{
                background: 'var(--ink)',
                color: 'var(--paper)',
                borderColor: 'var(--ink)',
              }}
            >
              Stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
