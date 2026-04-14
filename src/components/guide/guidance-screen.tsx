"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LyraSigil } from "./lyra-sigil";
import { LyraNarration } from "./lyra-narration";
import { AudioQueue } from "@/lib/voice/audio-queue";
import type { GuidanceData } from "@/hooks/use-guidance";

interface GuidanceScreenProps {
  guidance: GuidanceData;
  isFirstEncounter: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onListenAgain?: () => void;
  className?: string;
}

export function GuidanceScreen({
  guidance,
  isFirstEncounter,
  onComplete,
  onSkip,
  onListenAgain,
  className,
}: GuidanceScreenProps) {
  const [narrationDone, setNarrationDone] = useState(false);
  const [showSkip, setShowSkip] = useState(!isFirstEncounter);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  // Show skip button after 5s delay on first encounter
  useEffect(() => {
    if (!isFirstEncounter) return;
    const timer = setTimeout(() => setShowSkip(true), 5000);
    return () => clearTimeout(timer);
  }, [isFirstEncounter]);

  // Play audio if available
  useEffect(() => {
    if (!guidance.audioUrl) return;

    const queue = new AudioQueue({
      onStateChange: (state) => {
        setAudioPlaying(state === "playing" || state === "loading");
      },
    });
    audioQueueRef.current = queue;

    fetch(guidance.audioUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => queue.enqueue(buffer))
      .catch(() => {
        // Audio failed — text-only fallback
      });

    return () => {
      queue.dispose();
      audioQueueRef.current = null;
    };
  }, [guidance.audioUrl]);

  const handleComplete = useCallback(() => {
    audioQueueRef.current?.stop();
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    audioQueueRef.current?.stop();
    onSkip();
  }, [onSkip]);

  const handleListenAgain = useCallback(() => {
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

  // Collapsed/repeat state for non-first encounters
  if (!isFirstEncounter) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-surface-deep/95 backdrop-blur-md px-6",
          className
        )}
      >
        <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
          <LyraSigil size="md" state="speaking" />
          <p className="text-sm text-amber-200/90 italic font-serif leading-relaxed">
            {guidance.narrationText}
          </p>
          <div className="flex gap-3">
            {guidance.audioUrl && (
              <button
                onClick={handleListenAgain}
                className="px-5 py-2 rounded-xl bg-gold/20 border border-gold/30 text-gold text-sm hover:bg-gold/30 transition-colors"
              >
                Listen again
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-surface-deep/98 backdrop-blur-md",
        className
      )}
    >
      {/* Lyra zone */}
      <div className="shrink-0 flex flex-col items-center pt-16 pb-6 px-4">
        <LyraSigil size="lg" state={audioPlaying ? "speaking" : "attentive"} showLabel={false} />
      </div>

      {/* Content zone */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
            className="text-xs text-gold/70 uppercase tracking-widest mb-6"
          >
            {guidance.title}
          </motion.h2>
          <LyraNarration
            text={guidance.narrationText}
            speed={25}
            onComplete={() => setNarrationDone(true)}
          />
        </div>
      </div>

      {/* Action zone */}
      <div className="shrink-0 flex flex-col items-center gap-3 pb-10 pt-4 px-6">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: narrationDone ? 1 : 0, y: narrationDone ? 0 : 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={handleComplete}
          disabled={!narrationDone}
          className={cn(
            "w-full max-w-xs py-3 rounded-xl font-medium text-sm transition-all",
            "bg-gradient-to-r from-gold to-[#b89840] text-surface-deep",
            "shadow-lg shadow-gold/20",
            narrationDone
              ? "cursor-pointer hover:shadow-xl hover:shadow-gold/30"
              : "cursor-default"
          )}
        >
          Continue
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: showSkip ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleSkip}
          disabled={!showSkip}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Skip
        </motion.button>
      </div>
    </motion.div>
  );
}
