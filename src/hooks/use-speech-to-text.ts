"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechToTextOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  language?: string;
}

// Extend Window for webkit-prefixed Speech Recognition
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscript, language = "en-US" } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<AnyRecognition>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep callback ref fresh
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Check browser support
  useEffect(() => {
    const w = window as unknown as SpeechRecognitionWindow;
    const supported = !!w.SpeechRecognition || !!w.webkitSpeechRecognition;
    setIsSupported(supported);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setError(null);

    const w = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscriptRef.current?.(finalTranscript, true);
      } else if (interimTranscript) {
        onTranscriptRef.current?.(interimTranscript, false);
      }
    };

    recognition.onerror = (event: Event) => {
      const speechEvent = event as Event & { error: string };
      if (speechEvent.error === "not-allowed") {
        setError("Microphone permission denied");
      } else if (speechEvent.error !== "aborted") {
        setError(`Speech recognition error: ${speechEvent.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported,
    error,
  };
}
