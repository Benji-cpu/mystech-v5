import type { STTProvider, STTCallbacks } from "./provider";
import { blobToFloat32Array } from "./whisper-audio";

const MODEL_ID = "onnx-community/whisper-tiny";
const CHUNK_DURATION_MS = 3000;

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
  private chunkInterval: ReturnType<typeof setInterval> | null = null;

  async start(callbacks: STTCallbacks, lang = "en"): Promise<void> {
    this.callbacks = callbacks;
    this.accumulatedText = [];
    this.isActive = true;

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

    // Record in chunks — each chunk gets transcribed independently
    this.startChunkedRecording(stream, pipeline, lang, callbacks);
  }

  stop(): void {
    this.isActive = false;

    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
      this.chunkInterval = null;
    }

    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }

    // Emit final accumulated text
    if (this.accumulatedText.length > 0 && this.callbacks) {
      const fullText = this.accumulatedText.join(" ").trim();
      if (fullText) {
        this.callbacks.onTranscript(fullText, true);
      }
    }

    this.callbacks?.onStatusChange("idle");
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
      } catch (err) {
        pipelinePromise = null;
        callbacks.onError("Failed to load speech recognition model");
        callbacks.onStatusChange("error");
        return null;
      }
    })();

    return pipelinePromise;
  }

  private startChunkedRecording(
    stream: MediaStream,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipeline: any,
    lang: string,
    callbacks: STTCallbacks
  ): void {
    let chunks: Blob[] = [];

    // Choose a MIME type the browser supports
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

    const recorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      if (chunks.length === 0 || !this.isActive) return;

      const blob = new Blob(chunks, { type: mimeType });
      chunks = [];

      await this.transcribeChunk(blob, pipeline, lang, callbacks);

      // Restart recording if still active
      if (this.isActive && this.stream) {
        try {
          recorder.start();
        } catch {
          // Stream may have been stopped
        }
      }
    };

    recorder.start();

    // Stop and restart the recorder every CHUNK_DURATION_MS to get chunks
    this.chunkInterval = setInterval(() => {
      if (recorder.state === "recording" && this.isActive) {
        recorder.stop();
      }
    }, CHUNK_DURATION_MS);
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
        language: lang,
        task: "transcribe",
      });

      const text = (result?.text ?? "").trim();

      // Whisper sometimes hallucinates on silence — filter common hallucinations
      if (text && !isHallucination(text)) {
        this.accumulatedText.push(text);
        const fullText = this.accumulatedText.join(" ").trim();
        callbacks.onTranscript(fullText, true);
      }
    } catch {
      // Non-fatal: skip this chunk, keep listening
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
