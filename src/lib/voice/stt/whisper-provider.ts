import type { STTProvider, STTCallbacks } from "./provider";
import { blobToFloat32Array } from "./whisper-audio";

const MODEL_ID = "onnx-community/whisper-tiny";
const CHUNK_DURATION_MS = 3000;

/** BCP 47 → ISO 639-1: "en-US" → "en", "fr-FR" → "fr" */
function normalizeLanguageCode(lang: string): string {
  return lang.split("-")[0].toLowerCase();
}

// Singleton pipeline — shared across provider instances, loaded once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelinePromise: Promise<any> | null = null;

export class WhisperProvider implements STTProvider {
  readonly type = "whisper" as const;

  private callbacks: STTCallbacks | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private accumulatedText: string[] = [];
  private isActive = false;
  private processingQueue: Promise<void> = Promise.resolve();
  private chunkInterval: ReturnType<typeof setInterval> | null = null;
  private finalized = false;

  async start(callbacks: STTCallbacks, lang = "en"): Promise<void> {
    this.callbacks = callbacks;
    this.accumulatedText = [];
    this.isActive = true;
    this.finalized = false;

    // Load model if not yet loaded
    const pipeline = await this.ensurePipeline(callbacks);
    if (!pipeline || !this.isActive) return;

    // Get microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      callbacks.onError("Microphone permission denied");
      callbacks.onStatusChange("error");
      this.isActive = false;
      return;
    }

    this.stream = stream;
    callbacks.onStatusChange("listening");

    // Determine MIME type once
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

    // Start first recording cycle
    this.startRecorderCycle(stream, mimeType, pipeline, lang, callbacks);

    // Periodically stop recorder to produce complete, decodable blobs.
    // Each stop() triggers onstop which immediately restarts a new cycle.
    this.chunkInterval = setInterval(() => {
      if (this.mediaRecorder?.state === "recording") {
        this.mediaRecorder.stop();
      }
    }, CHUNK_DURATION_MS);
  }

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    // Stop the periodic chunk interval
    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
      this.chunkInterval = null;
    }

    // Stop the recorder — triggers onstop which will finalize (not restart)
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  dispose(): void {
    this.stop();
    this.callbacks = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async ensurePipeline(callbacks: STTCallbacks): Promise<any> {
    if (pipelinePromise) return pipelinePromise;

    callbacks.onStatusChange("loading-model");

    pipelinePromise = (async () => {
      try {
        const { pipeline: createPipeline } = await import("@huggingface/transformers");

        const pipe = await createPipeline(
          "automatic-speech-recognition",
          MODEL_ID,
          {
            dtype: "q4",
            device: "wasm",
            progress_callback: (progress: { progress?: number; file?: string; status?: string }) => {
              if (progress.progress !== undefined) {
                callbacks.onModelProgress?.({
                  progress: progress.progress,
                  file: progress.file,
                });
              }
            },
          }
        );

        return pipe;
      } catch {
        pipelinePromise = null;
        callbacks.onError("Failed to load speech recognition model");
        callbacks.onStatusChange("error");
        return null;
      }
    })();

    return pipelinePromise;
  }

  /**
   * Starts a single recording cycle. Each cycle produces one complete blob
   * on stop, which is independently decodable (has full container headers).
   * The interval in start() periodically calls stop() to trigger cycles.
   */
  private startRecorderCycle(
    stream: MediaStream,
    mimeType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipeline: any,
    lang: string,
    callbacks: STTCallbacks
  ): void {
    const recorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder = recorder;

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onerror = (event) => {
      console.warn("[Whisper] MediaRecorder error:", event);
      callbacks.onError("Microphone recording failed. Please try again.");
      this.isActive = false;
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });

      // Restart IMMEDIATELY if still active (minimizes audio gap)
      if (this.isActive && this.stream) {
        this.startRecorderCycle(stream, mimeType, pipeline, lang, callbacks);
      }

      // Always transcribe — never discard the final chunk
      if (blob.size > 0) {
        this.processingQueue = this.processingQueue.then(() =>
          this.transcribeChunk(blob, pipeline, lang, callbacks)
        );
      }

      // If no longer active, finalize after all transcription completes
      if (!this.isActive) {
        this.processingQueue.then(() => this.finalize());
      }
    };

    // No timeslice — produces a single complete blob when stop() is called
    recorder.start();
  }

  /** Clean up mic, emit final text, transition to idle. Guarded against double-call. */
  private finalize(): void {
    if (this.finalized) return;
    this.finalized = true;

    // Release microphone
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;

    // Emit final accumulated text
    if (this.accumulatedText.length > 0 && this.callbacks) {
      const fullText = this.accumulatedText.join(" ").trim();
      if (fullText) {
        this.callbacks.onTranscript(fullText, true);
      }
    }

    this.callbacks?.onStatusChange("idle");
  }

  private async transcribeChunk(
    blob: Blob,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipeline: any,
    lang: string,
    callbacks: STTCallbacks
  ): Promise<void> {
    callbacks.onStatusChange("processing");

    try {
      const audioData = await blobToFloat32Array(blob, 16000);

      // Skip very short or silent chunks
      if (audioData.length < 1600) return; // less than 0.1s

      const result = await pipeline(audioData, {
        language: normalizeLanguageCode(lang),
        task: "transcribe",
      });

      const text = (result?.text ?? "").trim();

      // Whisper sometimes hallucinates on silence — filter common hallucinations
      if (text && !isHallucination(text)) {
        this.accumulatedText.push(text);
        const fullText = this.accumulatedText.join(" ").trim();
        callbacks.onTranscript(fullText, true);
      }
    } catch (err) {
      console.warn("[Whisper] Transcription error for chunk:", err);
      callbacks.onError("Speech wasn't captured. Try speaking louder or closer to the mic.");
    } finally {
      if (this.isActive) {
        callbacks.onStatusChange("listening");
      }
    }
  }
}

/** Common Whisper hallucinations on silence/noise */
function isHallucination(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  const hallucinations = [
    "you",
    "thank you.",
    "thanks for watching.",
    "thank you for watching.",
    "subscribe",
    "like and subscribe",
    "(silence)",
    "[silence]",
    "...",
  ];
  return hallucinations.includes(normalized);
}
