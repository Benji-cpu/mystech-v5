"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { SentenceBuffer } from "@/lib/voice/sentence-buffer";
import { AudioQueue, type AudioQueueState } from "@/lib/voice/audio-queue";

function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")     // **bold**
    .replace(/\*(.+?)\*/g, "$1")         // *italic*
    .replace(/__(.+?)__/g, "$1")         // __bold__
    .replace(/_(.+?)_/g, "$1")           // _italic_
    .replace(/~~(.+?)~~/g, "$1")         // ~~strikethrough~~
    .replace(/`(.+?)`/g, "$1")           // `code`
    .replace(/^#{1,6}\s+/gm, "")         // # headers
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")  // [link](url)
    .replace(/^\s*[-*+]\s+/gm, "")       // bullet points
    .replace(/^\s*\d+\.\s+/gm, "")       // numbered lists
    .trim();
}

interface UseTextToSpeechOptions {
  voiceId?: string;
  speed?: string;
  enabled?: boolean;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { voiceId, speed = "1.0", enabled = true } = options;
  const [queueState, setQueueState] = useState<AudioQueueState>("idle");
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const sentenceBufferRef = useRef<SentenceBuffer | null>(null);
  const activeAbortsRef = useRef<Set<AbortController>>(new Set());
  const synthesisChainRef = useRef<Promise<void>>(Promise.resolve());

  // Initialize audio queue
  const getQueue = useCallback(() => {
    if (!audioQueueRef.current) {
      audioQueueRef.current = new AudioQueue({
        onStateChange: setQueueState,
        onError: (error) => setAudioError(error),
      });
    }
    return audioQueueRef.current;
  }, []);

  // Fetch TTS for a single sentence and enqueue
  const synthesizeAndEnqueue = useCallback(
    async (text: string, signal?: AbortSignal) => {
      if (!enabled) return;

      const cleanText = stripMarkdownForSpeech(text);
      if (!cleanText) return;

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText, voiceId, speed }),
          signal,
        });

        if (!res.ok) return;

        const audioBuffer = await res.arrayBuffer();
        // Check signal after await — fetch may have completed before abort
        if (signal?.aborted) return;
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
        // Capture the current set of active aborts to derive a signal
        // The most recently created controller is the "owning" one for streaming
        const aborts = activeAbortsRef.current;
        const latestAbort = [...aborts].pop();
        const signal = latestAbort?.signal;

        // Chain synthesis calls so audio is always enqueued in sentence order,
        // regardless of which TTS fetch completes first
        synthesisChainRef.current = synthesisChainRef.current.then(() =>
          synthesizeAndEnqueue(sentence, signal)
        );
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
      const controller = new AbortController();
      activeAbortsRef.current.add(controller);
      try {
        await synthesizeAndEnqueue(text, controller.signal);
      } finally {
        activeAbortsRef.current.delete(controller);
      }
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
    // Abort ALL in-flight fetches
    for (const controller of activeAbortsRef.current) {
      controller.abort();
    }
    activeAbortsRef.current.clear();
    audioQueueRef.current?.stop();
    // Reset sentence buffer and synthesis chain
    sentenceBufferRef.current = null;
    synthesisChainRef.current = Promise.resolve();
  }, []);

  const clearError = useCallback(() => setAudioError(null), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const controller of activeAbortsRef.current) {
        controller.abort();
      }
      activeAbortsRef.current.clear();
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
    clearError,
    isPlaying: queueState === "playing",
    isPaused: queueState === "paused",
    isLoading: queueState === "loading",
    state: queueState,
    audioError,
  };
}
