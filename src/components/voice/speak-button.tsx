"use client";

import { Volume2, Pause, Loader2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  voiceId?: string;
  speed?: string;
  className?: string;
}

export function SpeakButton({ text, voiceId, speed, className }: SpeakButtonProps) {
  const tts = useTextToSpeech({ voiceId, speed, enabled: true });

  function handleClick() {
    if (tts.isPlaying) {
      tts.pause();
    } else if (tts.isPaused) {
      tts.play();
    } else {
      tts.speak(text);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-white/10",
        tts.isPlaying && "text-gold",
        className
      )}
      aria-label={tts.isPlaying ? "Pause" : "Listen"}
    >
      {tts.isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : tts.isPlaying ? (
        <Pause className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
