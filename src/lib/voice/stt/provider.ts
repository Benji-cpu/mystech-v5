export type STTProviderType = "web-speech" | "whisper";

export type STTStatus =
  | "idle"
  | "loading-model"
  | "listening"
  | "processing"
  | "error";

export interface STTModelProgress {
  progress: number;
  file?: string;
}

export interface STTCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onStatusChange: (status: STTStatus) => void;
  onError: (message: string) => void;
  onModelProgress?: (progress: STTModelProgress) => void;
}

export interface STTProvider {
  type: STTProviderType;
  start(callbacks: STTCallbacks, lang?: string): void;
  stop(): void;
  dispose(): void;
}
