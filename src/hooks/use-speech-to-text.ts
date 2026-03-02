"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechToTextOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  language?: string;
}

// Extend Window for webkit-prefixed Speech Recognition
interface SpeechRecognitionWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeechRecognition?: new () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: new () => any;
}

// Brave exposes webkitSpeechRecognition (it's Chromium-based) but blocks
// the network connection to Google's speech servers for privacy, causing
// an instant "network" error. Detect it so we can show a useful message.
function isBraveBrowser(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(navigator as any).brave;
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
  const finalizedSegmentsRef = useRef<string[]>([]);
  // Tracks whether the user explicitly requested stop (vs browser ending the session)
  const intentionalStopRef = useRef(false);
  // Prevents infinite restart loops on fatal errors
  const fatalErrorRef = useRef(false);
  // Cap auto-restarts per session to prevent infinite loops
  const restartCountRef = useRef(0);
  const MAX_RESTARTS = 3;

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
    console.debug("[STT] startListening called", {
      isSupported,
      hasExisting: !!recognitionRef.current,
      fatal: fatalErrorRef.current,
      intentional: intentionalStopRef.current,
    });

    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    // Stop any existing session before starting a new one
    if (recognitionRef.current) {
      intentionalStopRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore — may already be stopped
      }
      recognitionRef.current = null;
    }

    setError(null);
    intentionalStopRef.current = false;
    fatalErrorRef.current = false;
    restartCountRef.current = 0;
    // Reset accumulated text for new session
    finalizedSegmentsRef.current = [];

    const w = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      const stale = recognitionRef.current !== recognition;
      const fatal = fatalErrorRef.current;
      console.debug("[STT] onstart", { stale, fatal });
      if (stale) return;
      if (fatal) {
        console.debug("[STT] onstart GUARDED — fatal error already set, stopping");
        try { recognition.stop(); } catch { /* noop */ }
        return;
      }
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      console.debug("[STT] onresult", { resultCount: event.results.length });
      if (recognitionRef.current !== recognition) return;
      const finals: string[] = [];
      let currentInterim = "";

      // Iterate ALL results to build full accumulated text
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finals.push(result[0].transcript);
        } else {
          currentInterim += result[0].transcript;
        }
      }

      // Update stored finalized segments
      finalizedSegmentsRef.current = finals;

      // Full text = all finalized segments + current interim
      const fullText = [...finals, currentInterim].join("").trim();
      const isFinal = currentInterim.length === 0 && finals.length > 0;

      if (fullText) {
        onTranscriptRef.current?.(fullText, isFinal);
      }
    };

    recognition.onerror = (event: Event) => {
      const speechEvent = event as Event & { error: string };
      console.warn("[STT] onerror:", speechEvent.error, {
        fatal: fatalErrorRef.current,
        intentional: intentionalStopRef.current,
        isCurrentRef: recognitionRef.current === recognition,
      });

      // no-speech is normal — user just hasn't spoken yet
      // aborted fires when we intentionally stop
      // These are non-fatal; onend will auto-restart
      if (speechEvent.error === "no-speech" || speechEvent.error === "aborted") {
        return;
      }

      // Fatal errors — don't auto-restart
      fatalErrorRef.current = true;
      recognitionRef.current = null; // Null ref so onstart stale guard also triggers
      if (speechEvent.error === "not-allowed") {
        setError("Microphone permission denied");
      } else if (speechEvent.error === "network") {
        setError(
          isBraveBrowser()
            ? "Voice input is not supported in Brave. Chrome's speech recognition is disabled for privacy. Try Chrome or Edge instead."
            : "Voice input unavailable — check your internet connection or try Chrome/Edge."
        );
      } else if (speechEvent.error === "service-not-allowed") {
        setError("Speech recognition service is not allowed in this browser");
      } else {
        setError(`Speech recognition error: ${speechEvent.error}`);
      }
      setIsListening(false);

      // Belt-and-suspenders: if onstart fires in the same microtask batch
      // and sets isListening(true), this deferred cleanup wins
      setTimeout(() => {
        if (fatalErrorRef.current) {
          console.debug("[STT] deferred fatal cleanup running");
          setIsListening(false);
          recognitionRef.current = null;
        }
      }, 0);
    };

    recognition.onend = () => {
      const stale = recognitionRef.current !== recognition;
      console.debug("[STT] onend", {
        stale,
        intentional: intentionalStopRef.current,
        fatal: fatalErrorRef.current,
        restarts: restartCountRef.current,
      });

      // If a newer session replaced us, this handler is stale — bail out
      if (stale) return;

      // If the user didn't explicitly stop and there's no fatal error,
      // the browser ended the session on its own (no-speech timeout,
      // audio glitch, etc.) — restart automatically to stay "listening"
      if (!intentionalStopRef.current && !fatalErrorRef.current) {
        if (restartCountRef.current < MAX_RESTARTS) {
          restartCountRef.current++;
          console.debug("[STT] scheduling auto-restart", { attempt: restartCountRef.current });
          // Delay gives the browser time to release audio resources
          setTimeout(() => {
            // Re-check after delay — user may have stopped or a new session may have started
            if (intentionalStopRef.current || recognitionRef.current !== recognition) {
              console.debug("[STT] auto-restart aborted (stale or stopped)");
              return;
            }
            console.debug("[STT] auto-restart firing");
            try {
              recognition.start();
            } catch {
              console.debug("[STT] auto-restart failed, cleaning up");
              setIsListening(false);
              recognitionRef.current = null;
            }
          }, 200);
          return; // Stay in listening state while we wait to restart
        }
        // Exhausted restarts
        console.warn("[STT] max restarts reached, stopping");
      }

      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, language]);

  const stopListening = useCallback(() => {
    console.debug("[STT] stopListening called", { hasRef: !!recognitionRef.current });
    intentionalStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
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
