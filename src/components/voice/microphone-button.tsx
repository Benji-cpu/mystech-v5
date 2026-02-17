"use client";

import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { cn } from "@/lib/utils";

interface MicrophoneButtonProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  className?: string;
}

export function MicrophoneButton({ onTranscript, className }: MicrophoneButtonProps) {
  const { startListening, stopListening, isListening, isSupported } = useSpeechToText({
    onTranscript,
  });

  if (!isSupported) return null;

  function handleClick() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex h-[44px] w-[44px] items-center justify-center rounded-lg transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-white/10",
        isListening && "text-red-400",
        className
      )}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="absolute inset-0 rounded-lg border-2 border-red-400 animate-pulse" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
