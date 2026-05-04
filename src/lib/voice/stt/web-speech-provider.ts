import type { STTProvider, STTCallbacks } from "./provider";

interface SpeechRecognitionWindow {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeechRecognition?: new () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: new () => any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

// Effectively unlimited — the browser stops Web Speech every time it
// detects "silence" (~ a few seconds of quiet) so we keep restarting until
// the user explicitly taps stop. Capping low caused the recorder to
// "judge" when the user paused mid-thought and quit on them.
const MAX_RESTARTS = 1000;

export class WebSpeechProvider implements STTProvider {
  readonly type = "web-speech" as const;

  private recognition: AnyRecognition = null;
  private callbacks: STTCallbacks | null = null;
  private intentionalStop = false;
  private fatalError = false;
  private restartCount = 0;
  private finalizedSegments: string[] = [];
  private lang = "en-US";

  start(callbacks: STTCallbacks, lang = "en-US"): void {
    // Stop any existing session
    this.cleanup();

    this.callbacks = callbacks;
    this.lang = lang;
    this.intentionalStop = false;
    this.fatalError = false;
    this.restartCount = 0;
    this.finalizedSegments = [];

    const w = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      callbacks.onError("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      if (this.recognition !== recognition || this.fatalError) {
        try { recognition.stop(); } catch { /* noop */ }
        return;
      }
      callbacks.onStatusChange("listening");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      if (this.recognition !== recognition) return;

      const finals: string[] = [];
      let currentInterim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finals.push(result[0].transcript);
        } else {
          currentInterim += result[0].transcript;
        }
      }

      this.finalizedSegments = finals;
      const fullText = [...finals, currentInterim].join("").trim();
      const isFinal = currentInterim.length === 0 && finals.length > 0;

      if (fullText) {
        callbacks.onTranscript(fullText, isFinal);
      }
    };

    recognition.onerror = (event: Event) => {
      const speechEvent = event as Event & { error: string };

      if (speechEvent.error === "no-speech" || speechEvent.error === "aborted") {
        return;
      }

      this.fatalError = true;
      this.recognition = null;

      if (speechEvent.error === "not-allowed") {
        callbacks.onError("Microphone permission denied");
      } else if (speechEvent.error === "network") {
        callbacks.onError("Voice input unavailable — check your internet connection or try another browser.");
      } else if (speechEvent.error === "service-not-allowed") {
        callbacks.onError("Speech recognition service is not allowed in this browser");
      } else {
        callbacks.onError(`Speech recognition error: ${speechEvent.error}`);
      }

      callbacks.onStatusChange("error");

      setTimeout(() => {
        if (this.fatalError) {
          callbacks.onStatusChange("idle");
          this.recognition = null;
        }
      }, 0);
    };

    recognition.onend = () => {
      if (this.recognition !== recognition) return;

      if (!this.intentionalStop && !this.fatalError) {
        if (this.restartCount < MAX_RESTARTS) {
          this.restartCount++;
          setTimeout(() => {
            if (this.intentionalStop || this.recognition !== recognition) return;
            try {
              recognition.start();
            } catch {
              callbacks.onStatusChange("idle");
              this.recognition = null;
            }
          }, 200);
          return;
        }
      }

      callbacks.onStatusChange("idle");
      this.recognition = null;
    };

    this.recognition = recognition;
    recognition.start();
  }

  stop(): void {
    this.intentionalStop = true;
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* noop */ }
      this.recognition = null;
    }
    this.callbacks?.onStatusChange("idle");
  }

  dispose(): void {
    this.stop();
    this.callbacks = null;
  }

  private cleanup(): void {
    if (this.recognition) {
      this.intentionalStop = true;
      try { this.recognition.stop(); } catch { /* noop */ }
      this.recognition = null;
    }
  }
}
