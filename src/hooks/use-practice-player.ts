"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { AudioQueue, type AudioQueueState } from "@/lib/voice/audio-queue";
import type { PracticeSegment } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

export type PracticePlayerState = "idle" | "loading" | "playing" | "paused" | "completed";

export interface UsePracticePlayerOptions {
  practiceId: string;
  segments: PracticeSegment[];
}

export interface UsePracticePlayerReturn {
  state: PracticePlayerState;
  currentSegment: PracticeSegment | null;
  currentSegmentIndex: number;
  totalSegments: number;
  remainingMs: number;
  elapsedMs: number;
  estimatedTotalMs: number;
  fallbackText: string | null;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

// ── Pause scaling helper ──────────────────────────────────────────────────────

const MIN_PAUSE_MS = 15_000; // 15 seconds minimum per pause

export function scaleSegmentPauses(
  segments: PracticeSegment[],
  targetDurationMs: number,
): PracticeSegment[] {
  // Sum speech estimated durations
  const speechTotalMs = segments.reduce(
    (acc, seg) => acc + (seg.segmentType === "speech" ? (seg.estimatedDurationMs ?? 0) : 0),
    0,
  );

  // Sum original pause durations
  const originalPauseTotalMs = segments.reduce(
    (acc, seg) => acc + (seg.segmentType === "pause" ? (seg.durationMs ?? 0) : 0),
    0,
  );

  if (originalPauseTotalMs <= 0) return segments;

  const availableForPauses = Math.max(0, targetDurationMs - speechTotalMs);
  const pauseCount = segments.filter((s) => s.segmentType === "pause").length;
  const minTotalPause = pauseCount * MIN_PAUSE_MS;

  // If budget is less than minimum, clamp each pause to MIN_PAUSE_MS
  const effectiveBudget = Math.max(availableForPauses, minTotalPause);
  const ratio = effectiveBudget / originalPauseTotalMs;

  return segments.map((seg) => {
    if (seg.segmentType !== "pause") return seg;
    const scaled = Math.max(MIN_PAUSE_MS, Math.round((seg.durationMs ?? 0) * ratio));
    return { ...seg, durationMs: scaled };
  });
}

// ── State machine ─────────────────────────────────────────────────────────────
//   idle → loading → playing → paused → completed
//                      ↑          |
//                      +----------+

interface PlayerState {
  status: PracticePlayerState;
  currentSegmentIndex: number;
  remainingMs: number;
  elapsedMs: number;
  fallbackText: string | null;
}

type PlayerAction =
  | { type: "PLAY" }
  | { type: "LOADING" }
  | { type: "PLAYING" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "COMPLETE" }
  | { type: "ADVANCE_SEGMENT"; index: number; remainingMs: number }
  | { type: "TICK_ELAPSED"; deltaMs: number }
  | { type: "TICK_PAUSE"; remainingMs: number }
  | { type: "SET_FALLBACK"; text: string | null };

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY":
      return { ...state, status: "loading", currentSegmentIndex: 0, elapsedMs: 0, fallbackText: null };
    case "LOADING":
      return { ...state, status: "loading" };
    case "PLAYING":
      return { ...state, status: "playing" };
    case "PAUSE":
      return { ...state, status: "paused" };
    case "RESUME":
      return { ...state, status: "playing" };
    case "STOP":
      return { ...state, status: "idle", currentSegmentIndex: 0, remainingMs: 0, elapsedMs: 0, fallbackText: null };
    case "COMPLETE":
      return { ...state, status: "completed" };
    case "ADVANCE_SEGMENT":
      return { ...state, currentSegmentIndex: action.index, remainingMs: action.remainingMs };
    case "TICK_ELAPSED":
      return { ...state, elapsedMs: state.elapsedMs + action.deltaMs };
    case "TICK_PAUSE":
      return { ...state, remainingMs: action.remainingMs };
    case "SET_FALLBACK":
      return { ...state, fallbackText: action.text };
    default:
      return state;
  }
}

const initialState: PlayerState = {
  status: "idle",
  currentSegmentIndex: 0,
  remainingMs: 0,
  elapsedMs: 0,
  fallbackText: null,
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePracticePlayer({ practiceId, segments }: UsePracticePlayerOptions): UsePracticePlayerReturn {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Refs for imperative internals — never trigger re-renders
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const pauseRafRef = useRef<number | null>(null);
  const elapsedRafRef = useRef<number | null>(null);
  const lastElapsedTimestampRef = useRef<number | null>(null);

  // Pre-cache: holds the next speech segment's buffer while current plays
  const preCacheRef = useRef<ArrayBuffer | null>(null);
  const preCacheSegmentIdRef = useRef<string | null>(null);

  // Stable ref for state so callbacks can read latest without stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  // Stable ref for segments and practiceId
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const practiceIdRef = useRef(practiceId);
  practiceIdRef.current = practiceId;

  // ── Derived ────────────────────────────────────────────────────────────────

  const estimatedTotalMs = useMemo(() => {
    return segments.reduce((acc, seg) => {
      if (seg.segmentType === "speech") return acc + (seg.estimatedDurationMs ?? 0);
      if (seg.segmentType === "pause") return acc + (seg.durationMs ?? 0);
      return acc;
    }, 0);
  }, [segments]);

  // ── Wake lock helpers ──────────────────────────────────────────────────────

  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // Feature unsupported or permission denied — graceful no-op
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  // ── Elapsed RAF loop ───────────────────────────────────────────────────────

  const stopElapsedLoop = useCallback(() => {
    if (elapsedRafRef.current !== null) {
      cancelAnimationFrame(elapsedRafRef.current);
      elapsedRafRef.current = null;
    }
    lastElapsedTimestampRef.current = null;
  }, []);

  const startElapsedLoop = useCallback(() => {
    stopElapsedLoop();
    const tick = (timestamp: number) => {
      if (stateRef.current.status !== "playing") {
        stopElapsedLoop();
        return;
      }
      if (lastElapsedTimestampRef.current !== null) {
        const delta = timestamp - lastElapsedTimestampRef.current;
        dispatch({ type: "TICK_ELAPSED", deltaMs: delta });
      }
      lastElapsedTimestampRef.current = timestamp;
      elapsedRafRef.current = requestAnimationFrame(tick);
    };
    elapsedRafRef.current = requestAnimationFrame(tick);
  }, [stopElapsedLoop]);

  // ── Pause countdown RAF loop ───────────────────────────────────────────────

  const stopPauseCountdown = useCallback(() => {
    if (pauseRafRef.current !== null) {
      cancelAnimationFrame(pauseRafRef.current);
      pauseRafRef.current = null;
    }
  }, []);

  // ── TTS fetch helper ───────────────────────────────────────────────────────

  const fetchSegmentAudio = useCallback(async (segmentId: string, retryCount = 0): Promise<ArrayBuffer | null> => {
    try {
      const res = await fetch("/api/practices/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceId: practiceIdRef.current, segmentId }),
      });
      if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);
      return await res.arrayBuffer();
    } catch (err) {
      if (retryCount < 1) {
        return fetchSegmentAudio(segmentId, retryCount + 1);
      }
      console.error("usePracticePlayer: TTS fetch failed after retry", err);
      return null;
    }
  }, []);

  // ── Pre-cache next speech segment ─────────────────────────────────────────

  const preCacheNextSpeech = useCallback(async (afterIndex: number) => {
    const segs = segmentsRef.current;
    // Find the next speech segment after afterIndex
    for (let i = afterIndex + 1; i < segs.length; i++) {
      const seg = segs[i];
      if (seg.segmentType === "speech" && seg.text) {
        // Don't fetch if already cached for this segment
        if (preCacheSegmentIdRef.current === seg.id) return;
        preCacheSegmentIdRef.current = seg.id;
        const buffer = await fetchSegmentAudio(seg.id);
        preCacheRef.current = buffer; // may be null if fetch failed
        return;
      }
    }
    // No next speech segment — clear cache
    preCacheRef.current = null;
    preCacheSegmentIdRef.current = null;
  }, [fetchSegmentAudio]);

  // ── Core segment runner ────────────────────────────────────────────────────

  // Forward-declared via ref so the pause-countdown callback can call it without
  // a stale-closure problem, even though it is defined after this point.
  const runSegmentRef = useRef<(index: number) => Promise<void>>(async () => {});

  const runSegment = useCallback(async (index: number) => {
    const segs = segmentsRef.current;

    // All segments done
    if (index >= segs.length) {
      dispatch({ type: "COMPLETE" });
      releaseWakeLock();
      stopElapsedLoop();
      audioQueueRef.current?.stop();
      return;
    }

    const seg = segs[index];
    dispatch({ type: "ADVANCE_SEGMENT", index, remainingMs: seg.durationMs ?? 0 });

    // ── Pause segment ──────────────────────────────────────────────────────
    if (seg.segmentType === "pause") {
      const durationMs = seg.durationMs ?? 2000;
      let remaining = durationMs;
      let lastTs: number | null = null;

      const tick = (timestamp: number) => {
        // Frozen while player is paused
        if (stateRef.current.status === "paused") {
          pauseRafRef.current = requestAnimationFrame(tick);
          lastTs = null; // reset delta so we don't accumulate time from a paused gap
          return;
        }
        // Stopped or completed — abort
        if (stateRef.current.status !== "playing") {
          stopPauseCountdown();
          return;
        }
        if (lastTs !== null) {
          const delta = timestamp - lastTs;
          remaining = Math.max(0, remaining - delta);
          dispatch({ type: "TICK_PAUSE", remainingMs: remaining });
        }
        lastTs = timestamp;

        if (remaining <= 0) {
          stopPauseCountdown();
          // 1-second crossfade delay before next segment
          setTimeout(() => {
            if (stateRef.current.status === "playing" || stateRef.current.status === "loading") {
              runSegmentRef.current(index + 1);
            }
          }, 1000);
          return;
        }
        pauseRafRef.current = requestAnimationFrame(tick);
      };
      pauseRafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── Speech segment ─────────────────────────────────────────────────────
    if (seg.segmentType === "speech") {
      dispatch({ type: "LOADING" });

      let audioBuffer: ArrayBuffer | null = null;

      // Use pre-cached buffer if available for this segment
      if (preCacheSegmentIdRef.current === seg.id && preCacheRef.current) {
        audioBuffer = preCacheRef.current;
        preCacheRef.current = null;
        preCacheSegmentIdRef.current = null;
      } else {
        audioBuffer = await fetchSegmentAudio(seg.id);
      }

      // If still not playing/loading after async fetch, we were stopped
      if (stateRef.current.status !== "loading" && stateRef.current.status !== "playing") return;

      if (!audioBuffer) {
        // TTS failed after retry — set fallback text and skip to next segment
        dispatch({ type: "SET_FALLBACK", text: seg.text ?? null });
        setTimeout(() => runSegmentRef.current(index + 1), 1000);
        return;
      }

      // Clear any previous fallback
      if (stateRef.current.fallbackText !== null) {
        dispatch({ type: "SET_FALLBACK", text: null });
      }

      // Start pre-caching next speech segment in background
      preCacheNextSpeech(index);

      const queue = audioQueueRef.current!;

      // Listen for the playing→idle transition to advance
      const onStateChange = (queueState: AudioQueueState) => {
        if (queueState === "idle" && stateRef.current.status === "playing") {
          // Speech finished — remove listener, apply crossfade delay, advance
          queue["callbacks"].onStateChange = undefined;
          setTimeout(() => {
            if (stateRef.current.status === "playing") {
              runSegmentRef.current(index + 1);
            }
          }, 1000);
        }
      };

      // Replace the queue's callback with our per-segment listener
      queue["callbacks"] = { onStateChange };
      queue.enqueue(audioBuffer);

      dispatch({ type: "PLAYING" });
      startElapsedLoop();
      return;
    }
  }, [
    fetchSegmentAudio,
    preCacheNextSpeech,
    releaseWakeLock,
    startElapsedLoop,
    stopElapsedLoop,
    stopPauseCountdown,
  ]);

  // Keep runSegmentRef in sync so the pause-countdown timeout always calls
  // the latest version without stale-closure issues
  useEffect(() => {
    runSegmentRef.current = runSegment;
  }, [runSegment]);

  // ── AudioQueue singleton ───────────────────────────────────────────────────

  const getQueue = useCallback(() => {
    if (!audioQueueRef.current) {
      audioQueueRef.current = new AudioQueue({});
    }
    return audioQueueRef.current;
  }, []);

  // ── Controls ───────────────────────────────────────────────────────────────

  const play = useCallback(async () => {
    if (stateRef.current.status !== "idle" && stateRef.current.status !== "completed") return;
    dispatch({ type: "PLAY" });

    // Ensure a fresh AudioQueue
    audioQueueRef.current?.dispose();
    audioQueueRef.current = null;
    getQueue();

    // Reset cache
    preCacheRef.current = null;
    preCacheSegmentIdRef.current = null;

    await acquireWakeLock();
    dispatch({ type: "PLAYING" });
    startElapsedLoop();
    runSegmentRef.current(0);
  }, [acquireWakeLock, getQueue, startElapsedLoop]);

  const pause = useCallback(() => {
    if (stateRef.current.status !== "playing") return;
    audioQueueRef.current?.pause();
    stopElapsedLoop();
    dispatch({ type: "PAUSE" });
    // Note: pause-countdown RAF loop detects status === "paused" and freezes itself
  }, [stopElapsedLoop]);

  const resume = useCallback(() => {
    if (stateRef.current.status !== "paused") return;
    dispatch({ type: "RESUME" });
    audioQueueRef.current?.resume();
    startElapsedLoop();
    // The pause-countdown RAF loop self-resumes when it sees status === "playing"
  }, [startElapsedLoop]);

  const stop = useCallback(() => {
    stopElapsedLoop();
    stopPauseCountdown();
    audioQueueRef.current?.stop();
    releaseWakeLock();
    preCacheRef.current = null;
    preCacheSegmentIdRef.current = null;
    dispatch({ type: "STOP" });
  }, [releaseWakeLock, stopElapsedLoop, stopPauseCountdown]);

  // ── Navigation-away warning ────────────────────────────────────────────────

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const s = stateRef.current.status;
      if (s === "playing" || s === "paused") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopElapsedLoop();
      stopPauseCountdown();
      audioQueueRef.current?.dispose();
      releaseWakeLock();
    };
  }, [releaseWakeLock, stopElapsedLoop, stopPauseCountdown]);

  // ── Return ─────────────────────────────────────────────────────────────────

  const currentSegment = segments[state.currentSegmentIndex] ?? null;

  return {
    state: state.status,
    currentSegment,
    currentSegmentIndex: state.currentSegmentIndex,
    totalSegments: segments.length,
    remainingMs: state.remainingMs,
    elapsedMs: state.elapsedMs,
    estimatedTotalMs,
    fallbackText: state.fallbackText,
    play,
    pause,
    resume,
    stop,
  };
}
