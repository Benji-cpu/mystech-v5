"use client";

import { useCompletion } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, AlertCircle, Square } from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { SpeakButton } from "@/components/voice/speak-button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";

function renderBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ReadingInterpretation({
  readingId,
  existingInterpretation,
}: {
  readingId: string;
  existingInterpretation: string | null;
}) {
  const hasTriggered = useRef(false);
  const prevCompletionRef = useRef("");
  const { preferences } = useVoicePreferences();
  const tts = useTextToSpeech({
    voiceId: preferences.voiceId ?? undefined,
    speed: preferences.speed,
    enabled: preferences.enabled && preferences.autoplay,
  });

  const {
    completion,
    complete,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: "/api/ai/reading",
    body: { readingId },
    initialCompletion: existingInterpretation ?? "",
  });

  // Auto-trigger on mount if no existing interpretation
  useEffect(() => {
    if (!existingInterpretation && !hasTriggered.current) {
      hasTriggered.current = true;
      complete("");
    }
  }, [existingInterpretation, complete]);

  // Feed streaming deltas to TTS
  useEffect(() => {
    if (!isLoading || !completion || !preferences.enabled || !preferences.autoplay) return;

    const prevLen = prevCompletionRef.current.length;
    if (completion.length > prevLen) {
      const delta = completion.slice(prevLen);
      tts.pushToken(delta);
    }
    prevCompletionRef.current = completion;
  }, [completion, isLoading, preferences.enabled, preferences.autoplay, tts]);

  // Flush TTS when stream ends
  useEffect(() => {
    if (!isLoading && prevCompletionRef.current.length > 0) {
      tts.flush();
      prevCompletionRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleRegenerate = () => {
    tts.stop();
    prevCompletionRef.current = "";
    complete("");
  };

  const handleStop = () => {
    tts.stop();
    stop();
  };

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-card/50 border border-destructive/30">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold">Interpretation Error</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Something went wrong generating your interpretation. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={handleRegenerate}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!completion && isLoading) {
    return (
      <div className="p-6 rounded-xl bg-card/50 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <LyraSigil size="sm" state="speaking" />
          <h2 className="text-sm font-semibold">Lyra is reading the cards...</h2>
        </div>
        <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
      </div>
    );
  }

  if (!completion && !isLoading) {
    return null;
  }

  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <LyraSigil size="sm" state={isLoading || tts.isPlaying ? "speaking" : "attentive"} />
          Lyra&apos;s Interpretation
        </h2>
        <div className="flex items-center gap-1">
          {!isLoading && completion && preferences.enabled && (
            <SpeakButton
              text={completion}
              voiceId={preferences.voiceId ?? undefined}
              speed={preferences.speed}
            />
          )}
          {isLoading ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              className="h-7 text-xs text-muted-foreground"
            >
              <Square className="h-3 w-3 mr-1.5" />
              Stop
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              className="h-7 text-xs text-muted-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Regenerate
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {renderBoldMarkdown(completion)}
        {isLoading && (
          <span className="inline-block w-1.5 h-4 bg-primary/70 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  );
}
