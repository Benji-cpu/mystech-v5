"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { SentenceBuffer } from "@/lib/voice/sentence-buffer";
import { AudioQueue, type AudioQueueState } from "@/lib/voice/audio-queue";

interface UseTextToSpeechOptions {
  voiceId?: string;
  speed?: string;
  enabled?: boolean;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { voiceId, speed = "1.0", enabled = true } = options;
  const [queueState, setQueueState] = useState<AudioQueueState>("idle");
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const sentenceBufferRef = useRef<SentenceBuffer | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Initialize audio queue
  const getQueue = useCallback(() => {
    if (!audioQueueRef.current) {
      audioQueueRef.current = new AudioQueue({
        onStateChange: setQueueState,
      });
    }
    return audioQueueRef.current;
  }, []);

  // Fetch TTS for a single sentence and enqueue
  const synthesizeAndEnqueue = useCallback(
    async (text: string) => {
      if (!enabled) return;

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId, speed }),
          signal: abortRef.current?.signal,
        });

        if (!res.ok) return;

        const audioBuffer = await res.arrayBuffer();
        getQueue().enqueue(audioBuffer);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("TTS fetch error:", err);
      }
    },
    [enabled, voiceId, speed, getQueue]
  );

  // Initialize sentence buffer
  const getBuffer = useCallback(() => {
    if (!sentenceBufferRef.current) {
      sentenceBufferRef.current = new SentenceBuffer((sentence) => {
        synthesizeAndEnqueue(sentence);
      });
    }
    return sentenceBufferRef.current;
  }, [synthesizeAndEnqueue]);

  // Push streaming token
  const pushToken = useCallback(
    (token: string) => {
      if (!enabled) return;
      getBuffer().push(token);
    },
    [enabled, getBuffer]
  );

  // Flush remaining buffer (call when stream ends)
  const flush = useCallback(() => {
    if (!enabled) return;
    sentenceBufferRef.current?.flush();
  }, [enabled]);

  // One-shot speak for pre-known text
  const speak = useCallback(
    async (text: string) => {
      if (!enabled || !text.trim()) return;
      abortRef.current = new AbortController();
      await synthesizeAndEnqueue(text);
    },
    [enabled, synthesizeAndEnqueue]
  );

  const play = useCallback(() => {
    getQueue().resume();
  }, [getQueue]);

  const pause = useCallback(() => {
    audioQueueRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioQueueRef.current?.stop();
    // Reset sentence buffer
    sentenceBufferRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      audioQueueRef.current?.dispose();
    };
  }, []);

  return {
    pushToken,
    flush,
    speak,
    play,
    pause,
    stop,
    isPlaying: queueState === "playing",
    isPaused: queueState === "paused",
    isLoading: queueState === "loading",
    state: queueState,
  };
}
