"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect, useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  Loader2,
} from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import { ReadingInterpretationSchema } from "@/lib/ai/prompts/reading-interpretation";

function renderBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white/90">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface ReadingInterpretationProps {
  readingId: string;
  existingInterpretation: string | null;
  onActiveCardChange?: (index: number | null) => void;
  onComplete?: () => void;
}

export function ReadingInterpretation({
  readingId,
  existingInterpretation,
  onActiveCardChange,
  onComplete,
}: ReadingInterpretationProps) {
  const hasTriggered = useRef(false);
  const prevSectionsRef = useRef<string[]>([]);
  const prevSynthesisRef = useRef("");
  const { preferences } = useVoicePreferences();
  const [isMuted, setIsMuted] = useState(!preferences.autoplay);
  const tts = useTextToSpeech({
    voiceId: preferences.voiceId ?? undefined,
    speed: preferences.speed,
    enabled: preferences.enabled,
  });

  const { object, submit, isLoading, error } = useObject({
    api: "/api/ai/reading",
    schema: ReadingInterpretationSchema,
  });

  // Auto-trigger on mount if no existing interpretation
  useEffect(() => {
    if (!existingInterpretation && !hasTriggered.current) {
      hasTriggered.current = true;
      submit({ readingId });
    }
  }, [existingInterpretation, submit, readingId]);

  // Derive active card from streaming partial object
  const activeCardIndex = useMemo(() => {
    if (!object?.cardSections) return null;
    const filledSections = object.cardSections.filter(
      (s) => s?.text && s.text.length > 0
    );
    if (filledSections.length === 0) return null;
    // If synthesis has started streaming, no card is active
    if (object.synthesis && object.synthesis.length > 0) return null;
    return filledSections.length - 1;
  }, [object]);

  // Notify parent of active card changes
  useEffect(() => {
    onActiveCardChange?.(activeCardIndex);
  }, [activeCardIndex, onActiveCardChange]);

  // Feed streaming deltas to TTS
  useEffect(() => {
    if (!isLoading || !object?.cardSections || !preferences.enabled || isMuted)
      return;

    object.cardSections.forEach((section, i) => {
      const prevLen = prevSectionsRef.current[i]?.length ?? 0;
      if (section?.text && section.text.length > prevLen) {
        tts.pushToken(section.text.slice(prevLen));
        prevSectionsRef.current[i] = section.text;
      }
    });

    // Track synthesis
    const prevSynthLen = prevSynthesisRef.current.length;
    if (object.synthesis && object.synthesis.length > prevSynthLen) {
      tts.pushToken(object.synthesis.slice(prevSynthLen));
      prevSynthesisRef.current = object.synthesis;
    }
  }, [object, isLoading, preferences.enabled, isMuted, tts]);

  // Flush TTS and notify complete when stream ends
  useEffect(() => {
    if (!isLoading && hasTriggered.current && object?.cardSections?.length) {
      tts.flush();
      prevSectionsRef.current = [];
      prevSynthesisRef.current = "";
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Reconstruct display text from structured object
  const displayText = useMemo(() => {
    if (!object?.cardSections) return "";
    const sections = object.cardSections
      .filter((s) => s?.text)
      .map((s) => s!.text);
    const parts = [...sections];
    if (object.synthesis) parts.push(object.synthesis);
    if (object.reflectiveQuestion) parts.push(object.reflectiveQuestion);
    return parts.join("\n\n");
  }, [object]);

  // Full text for TTS speak button (when streaming complete)
  const fullText = useMemo(() => {
    if (existingInterpretation) return existingInterpretation;
    return displayText;
  }, [existingInterpretation, displayText]);

  // Show existing interpretation (from DB) if available
  const textToShow = existingInterpretation || displayText;

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-destructive/30">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold text-white/90">
            Interpretation Error
          </h2>
        </div>
        <p className="text-sm text-white/40 mb-4">
          Something went wrong generating your interpretation. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => submit({ readingId })}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!textToShow && isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <LyraSigil size="sm" state="speaking" />
          <h2 className="text-sm font-semibold text-white/90">
            Lyra is reading the cards...
          </h2>
        </div>
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  if (!textToShow && !isLoading) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#c9a94e]">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium tracking-wider uppercase">
            Your Reading
          </span>
        </div>
        <div className="flex items-center gap-1">
          {preferences.enabled && isLoading && (
            <button
              onClick={() => {
                if (!isMuted) tts.stop();
                setIsMuted((m) => !m);
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#c9a94e]" />
              )}
            </button>
          )}
          {preferences.enabled && !isLoading && fullText && (
            <button
              onClick={() => {
                if (tts.isPlaying) tts.pause();
                else if (tts.isPaused) tts.play();
                else tts.speak(fullText);
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
              aria-label={tts.isPlaying ? "Pause" : "Play"}
            >
              {tts.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tts.isPlaying ? (
                <Pause className="w-4 h-4 text-[#c9a94e]" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/70">
        {renderBoldMarkdown(textToShow)}
        {isLoading && (
          <span className="inline-block w-1.5 h-4 bg-[#c9a94e]/70 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  );
}
