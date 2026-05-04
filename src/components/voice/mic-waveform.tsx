"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MicWaveformProps {
  active: boolean;
  className?: string;
  /** Bar color (CSS color). Defaults to red-400. */
  color?: string;
}

/**
 * Canvas-based mic level visualization. When `active` becomes true we
 * acquire a private getUserMedia stream, route it through an AnalyserNode,
 * and draw 12 bars whose heights track the time-domain amplitude.
 *
 * The stream is independent of any STT pipeline, so it works alongside
 * the Web Speech API (which doesn't expose its own audio source).
 */
export function MicWaveform({ active, className, color = "rgb(248,113,113)" }: MicWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let rafId = 0;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
        audioCtx = new Ctx();
        if (audioCtx.state === "suspended") await audioCtx.resume();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Honour device pixel ratio for crisp bars
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.clientWidth;
        const cssHeight = canvas.clientHeight;
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
        ctx.scale(dpr, dpr);

        const barCount = 12;
        const gap = 2;
        const barWidth = (cssWidth - gap * (barCount - 1)) / barCount;

        const draw = () => {
          if (!analyser) return;
          analyser.getByteTimeDomainData(buffer);

          // Compute RMS of each bucket
          const bucketSize = Math.floor(buffer.length / barCount);
          ctx.clearRect(0, 0, cssWidth, cssHeight);
          ctx.fillStyle = color;

          for (let i = 0; i < barCount; i++) {
            let sum = 0;
            for (let j = 0; j < bucketSize; j++) {
              const v = (buffer[i * bucketSize + j] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / bucketSize);
            // Scale + amplify quiet input so bars feel responsive
            const h = Math.max(2, Math.min(cssHeight, rms * cssHeight * 4));
            const y = (cssHeight - h) / 2;
            const x = i * (barWidth + gap);
            ctx.fillRect(x, y, barWidth, h);
          }

          rafId = requestAnimationFrame(draw);
        };
        draw();
      } catch {
        // Permission denied or not available — silently skip the visual
        cleanupRef.current?.();
      }
    })();

    cleanupRef.current = () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (analyser) {
        try { analyser.disconnect(); } catch { /* noop */ }
      }
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-6 w-20 block", className)}
      aria-hidden="true"
    />
  );
}
