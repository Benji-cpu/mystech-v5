import type { STTProviderType } from "./provider";

interface SpeechRecognitionWindow {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
}

function isBraveBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(navigator as any).brave;
}

function hasWebSpeechAPI(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as SpeechRecognitionWindow;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

function canRunWhisper(): boolean {
  if (typeof window === "undefined") return false;
  return typeof MediaRecorder !== "undefined" && typeof WebAssembly !== "undefined";
}

/**
 * Detects the best available STT provider for the current browser.
 *
 * Priority:
 * 1. Web Speech API (Chrome/Edge) — streaming, free, zero bundle cost
 * 2. Whisper.js (Brave/Firefox/Safari) — offline, accurate, ~31MB model
 * 3. null — no STT support
 */
export function detectSTTProvider(): STTProviderType | null {
  // Web Speech API available AND not Brave (which blocks the Google servers)
  if (hasWebSpeechAPI() && !isBraveBrowser()) {
    return "web-speech";
  }

  // Whisper fallback needs MediaRecorder + WebAssembly
  if (canRunWhisper()) {
    return "whisper";
  }

  return null;
}

export { isBraveBrowser, hasWebSpeechAPI, canRunWhisper };
