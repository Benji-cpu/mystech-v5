"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { STTProvider, STTProviderType, STTStatus, STTModelProgress } from "@/lib/voice/stt";
import { detectSTTProvider, createSTTProvider } from "@/lib/voice/stt";

interface UseSpeechToTextOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  language?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscript, language = "en-US" } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelProgress, setModelProgress] = useState<STTModelProgress | null>(null);
  const [providerType, setProviderType] = useState<STTProviderType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef<STTProvider | null>(null);
  const detectedTypeRef = useRef<STTProviderType | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep callback ref fresh
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Detect capabilities on mount
  useEffect(() => {
    const detected = detectSTTProvider();
    detectedTypeRef.current = detected;
    setIsSupported(detected !== null);
    setProviderType(detected);
  }, []);

  const startListening = useCallback(async () => {
    const type = detectedTypeRef.current;
    if (!type) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    // Stop any existing provider
    if (providerRef.current) {
      providerRef.current.stop();
      providerRef.current = null;
    }

    setError(null);

    // Create provider lazily (Whisper is code-split via dynamic import)
    const provider = await createSTTProvider(type);
    providerRef.current = provider;

    provider.start(
      {
        onTranscript: (text, isFinal) => {
          onTranscriptRef.current?.(text, isFinal);
        },
        onStatusChange: (status: STTStatus) => {
          switch (status) {
            case "listening":
              setIsListening(true);
              setIsProcessing(false);
              setIsLoadingModel(false);
              break;
            case "processing":
              setIsProcessing(true);
              break;
            case "loading-model":
              setIsLoadingModel(true);
              setIsProcessing(false);
              break;
            case "idle":
              setIsListening(false);
              setIsProcessing(false);
              setIsLoadingModel(false);
              setModelProgress(null);
              break;
            case "error":
              setIsListening(false);
              setIsProcessing(false);
              setIsLoadingModel(false);
              setModelProgress(null);
              break;
          }
        },
        onError: (message) => {
          setError(message);
        },
        onModelProgress: (progress) => {
          setModelProgress(progress);
        },
      },
      language
    );
  }, [language]);

  const stopListening = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.stop();
      providerRef.current = null;
    }
    setIsListening(false);
    setIsProcessing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      providerRef.current?.dispose();
    };
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported,
    isProcessing,
    isLoadingModel,
    modelProgress,
    providerType,
    error,
  };
}
