"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { LyraSigil } from "./lyra-sigil";
import { AudioQueue } from "@/lib/voice/audio-queue";
import type { GuidanceData } from "@/hooks/use-guidance";

interface GuidanceOverlayProps {
  guidance: GuidanceData;
  isFirstEncounter: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onListenAgain?: () => void;
  onDismiss: () => void;
  className?: string;
}

export function GuidanceOverlay({
  guidance,
  isFirstEncounter,
  onComplete,
  onSkip,
  onListenAgain,
  onDismiss,
  className,
}: GuidanceOverlayProps) {
  const [expanded, setExpanded] = useState(isFirstEncounter);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  // Play audio if available and first encounter
  useEffect(() => {
    if (!guidance.audioUrl || !isFirstEncounter) return;

    const queue = new AudioQueue({
      onStateChange: (state) => {
        setAudioPlaying(state === "playing" || state === "loading");
      },
    });
    audioQueueRef.current = queue;

    fetch(guidance.audioUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => queue.enqueue(buffer))
      .catch(() => {});

    return () => {
      queue.dispose();
      audioQueueRef.current = null;
    };
  }, [guidance.audioUrl, isFirstEncounter]);

  const handleComplete = useCallback(() => {
    audioQueueRef.current?.stop();
    onComplete();
  }, [onComplete]);

  const handleDismiss = useCallback(() => {
    audioQueueRef.current?.stop();
    onDismiss();
  }, [onDismiss]);

  const handleListenAgain = useCallback(() => {
    setExpanded(true);
    onListenAgain?.();
    if (!guidance.audioUrl) return;
    const queue = audioQueueRef.current;
    if (queue) {
      queue.stop();
      fetch(guidance.audioUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => queue.enqueue(buffer))
        .catch(() => {});
    }
  }, [guidance.audioUrl, onListenAgain]);

  // Collapsed pill for non-first encounters
  if (!isFirstEncounter && !expanded) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => setExpanded(true)}
        className={cn(
          "fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-white/5 backdrop-blur-xl border border-white/10",
          "shadow-lg shadow-black/20",
          className
        )}
      >
        <LyraSigil size="sm" state="idle" />
        <span className="text-xs text-amber-200/70 font-serif italic">
          {guidance.title}
        </span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {expanded && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Card */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "max-h-[60dvh] overflow-y-auto",
              "bg-[#0f0520]/95 backdrop-blur-xl border-t border-white/10",
              "rounded-t-2xl px-6 pt-5 pb-8",
              className
            )}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            <div className="flex gap-4">
              {/* Lyra sigil */}
              <div className="shrink-0 pt-1">
                <LyraSigil size="md" state={audioPlaying ? "speaking" : "attentive"} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gold/70 uppercase tracking-widest mb-2">
                  {guidance.title}
                </p>
                <p className="text-sm text-amber-200/90 italic font-serif leading-relaxed">
                  {guidance.narrationText}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-5">
              {!isFirstEncounter && guidance.audioUrl && (
                <button
                  onClick={handleListenAgain}
                  className="px-4 py-2 rounded-xl bg-gold/20 border border-gold/30 text-gold text-xs hover:bg-gold/30 transition-colors"
                >
                  Listen again
                </button>
              )}
              {isFirstEncounter && (
                <>
                  <button
                    onClick={onSkip}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 rounded-xl bg-gold/20 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/30 transition-colors"
                  >
                    Got it
                  </button>
                </>
              )}
              {!isFirstEncounter && (
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
