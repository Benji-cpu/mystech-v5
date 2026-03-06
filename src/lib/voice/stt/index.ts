export type {
  STTProvider,
  STTProviderType,
  STTStatus,
  STTCallbacks,
  STTModelProgress,
} from "./provider";

export { detectSTTProvider } from "./detect";
export { WebSpeechProvider } from "./web-speech-provider";

/**
 * Factory to create the appropriate STT provider.
 * Whisper provider is dynamically imported to avoid bundling it for Chrome/Edge users.
 */
export async function createSTTProvider(
  type: "web-speech" | "whisper"
): Promise<import("./provider").STTProvider> {
  if (type === "web-speech") {
    const { WebSpeechProvider } = await import("./web-speech-provider");
    return new WebSpeechProvider();
  }

  // Dynamic import — Whisper code only loaded when needed
  const { WhisperProvider } = await import("./whisper-provider");
  return new WhisperProvider();
}
