"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { cn } from "@/lib/utils";
import { WhisperDownloadIndicator } from "./whisper-download-indicator";
import { MicWaveform } from "./mic-waveform";

interface MicrophoneButtonProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
  className?: string;
}

export function MicrophoneButton({ onTranscript, onListeningChange, className }: MicrophoneButtonProps) {
  const {
    startListening,
    stopListening,
    isListening,
    isSupported,
    isProcessing,
    isLoadingModel,
    modelProgress,
    error,
  } = useSpeechToText({
    onTranscript,
  });

  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!isSupported) return null;

  const isBusy = isLoadingModel || isProcessing;

  function handleClick() {
    if (isBusy) return; // Don't interrupt model loading or processing
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Live waveform — only rendered while actively listening so we don't
          claim a mic stream we don't need. */}
      <AnimatePresence initial={false}>
        {isListening && (
          <motion.div
            key="waveform"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="overflow-hidden"
          >
            <MicWaveform active className="h-6 w-20" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        className={cn(
          "relative flex h-[44px] w-[44px] items-center justify-center rounded-lg transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-white/10",
          isListening && "text-red-400 bg-red-400/10 hover:bg-red-400/15",
          isProcessing && "text-amber-400",
          isLoadingModel && "text-purple-400",
          error && !isListening && "text-red-400/60",
          isBusy && "cursor-wait",
          className
        )}
        aria-label={
          isLoadingModel
            ? "Loading speech model"
            : isProcessing
              ? "Processing speech"
              : isListening
                ? "Stop listening"
                : "Start voice input"
        }
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={isLoadingModel ? 'loading' : isProcessing ? 'processing' : isListening ? 'listening' : 'idle'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center justify-center"
          >
            {isLoadingModel ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="absolute inset-0 rounded-lg border-2 border-amber-400 animate-pulse" />
              </>
            ) : isListening ? (
              // Square = clear "tap to stop" affordance; the waveform to the
              // left already conveys the active recording state.
              <Square className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>

      <WhisperDownloadIndicator
        isLoading={isLoadingModel}
        progress={modelProgress}
      />
    </div>
  );
}
