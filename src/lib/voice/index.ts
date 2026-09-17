import type { PlanType } from '@/types';
import type { TTSProvider, TTSOptions, TTSClip } from './provider';
import { GoogleTTSProvider } from './providers/google-tts';
import { GeminiTTSProvider } from './providers/gemini-tts';

/**
 * Cloud TTS first, Gemini when it cannot be reached.
 *
 * Cloud TTS is the better voice and far quicker — sub-second against Gemini's
 * ~9s a sentence — so it is always tried first. Gemini needs no billing and runs
 * on the Gemini key the app already has, which is what kept read-aloud alive
 * through the months when billing on the Cloud TTS project was switched off.
 * Billing was reopened 2026-09-17 and Cloud TTS answers again.
 */
class FallbackTTSProvider implements TTSProvider {
  private cloud: TTSProvider | null;
  private gemini = new GeminiTTSProvider();
  /**
   * When Cloud TTS last failed. A failure stops us paying the round trip on
   * every subsequent sentence, but it EXPIRES — the original version latched
   * for the life of the instance, which was right while billing was off and
   * wrong the moment it came back: one transient blip would have pinned a warm
   * instance to the slow voice until it recycled.
   */
  private cloudFailedAt = 0;

  constructor() {
    // The constructor throws when the key is absent; that is a missing voice,
    // not a crash, so it is caught here rather than at the call site.
    try {
      this.cloud = new GoogleTTSProvider();
    } catch {
      this.cloud = null;
    }
  }

  async synthesize(text: string, options: TTSOptions): Promise<TTSClip> {
    const cooling = Date.now() - this.cloudFailedAt < CLOUD_RETRY_AFTER_MS;
    if (this.cloud && !cooling) {
      try {
        const clip = await this.cloud.synthesize(text, options);
        this.cloudFailedAt = 0;
        return clip;
      } catch (err) {
        this.cloudFailedAt = Date.now();
        console.warn(`[tts] Cloud TTS unavailable, falling back to Gemini — ${err}`);
      }
    }
    return this.gemini.synthesize(text, options);
  }
}

/** How long to stay on the fallback before giving Cloud TTS another chance. */
const CLOUD_RETRY_AFTER_MS = 10 * 60 * 1000;

let provider: TTSProvider | null = null;

export function getTTSProvider(_plan: PlanType): TTSProvider {
  // Phase 2 idea: ElevenLabs for Pro users. One provider for every tier today.
  if (!provider) {
    provider = new FallbackTTSProvider();
  }
  return provider;
}

export { type TTSProvider, type TTSOptions, type TTSClip } from './provider';
export { DEFAULT_VOICE_ID, VOICE_SPEED_VALUES, MAX_TTS_TEXT_LENGTH, MAX_TTS_BATCH_SIZE } from './constants';
