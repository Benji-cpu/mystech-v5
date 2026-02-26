"use client";

import { useRef, useCallback } from "react";

interface UseVoiceInputOptions {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

/**
 * Encapsulates the pattern of snapshotting pre-speech text when the mic activates,
 * then appending transcribed speech to it. Consumers just wire up handleTranscript
 * and handleListeningChange to MicrophoneButton props.
 */
export function useVoiceInput({ value, onChange, maxLength }: UseVoiceInputOptions) {
  const preSpeechTextRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleListeningChange = useCallback(
    (isListening: boolean) => {
      if (isListening) {
        // Snapshot the current text when mic activates
        preSpeechTextRef.current = valueRef.current;
      }
    },
    []
  );

  const handleTranscript = useCallback(
    (text: string, _isFinal?: boolean) => {
      const prefix = preSpeechTextRef.current;
      const separator = prefix.length > 0 && !prefix.endsWith(" ") ? " " : "";
      const combined = prefix + separator + text;
      const clamped = maxLength ? combined.slice(0, maxLength) : combined;
      onChange(clamped);
    },
    [onChange, maxLength]
  );

  return { handleTranscript, handleListeningChange };
}
