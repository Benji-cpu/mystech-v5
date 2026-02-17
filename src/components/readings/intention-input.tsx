"use client";

import { useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_READING_FLOW } from "@/components/guide/lyra-constants";
import { MicrophoneButton } from "@/components/voice/microphone-button";

interface IntentionInputProps {
  question: string;
  onChange: (question: string) => void;
}

export function IntentionInput({ question, onChange }: IntentionInputProps) {
  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        onChange(text.slice(0, 500));
      }
    },
    [onChange]
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LyraSigil size="sm" state="attentive" />
        <h2 className="text-lg font-semibold">{LYRA_READING_FLOW.intentionInput.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {LYRA_READING_FLOW.intentionInput.subtitle}
      </p>

      <div className="relative">
        <Textarea
          value={question}
          onChange={(e) => onChange(e.target.value.slice(0, 500))}
          placeholder="What does the universe wish me to know today?"
          className="min-h-[120px] bg-card/50 border-border/50 resize-none text-sm pr-14"
          maxLength={500}
        />
        <div className="absolute right-2 bottom-2">
          <MicrophoneButton onTranscript={handleTranscript} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-right">
        {question.length}/500
      </p>
    </div>
  );
}
