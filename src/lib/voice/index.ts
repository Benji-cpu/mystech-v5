import type { PlanType } from '@/types';
import type { TTSProvider, TTSOptions, TTSClip } from './provider';
import { GoogleTTSProvider } from './providers/google-tts';
import { GeminiTTSProvider } from './providers/gemini-tts';

/**
 * Cloud TTS first, Gemini when it cannot be reached.
 *
 * Billing on the Cloud TTS project has never been enabled, so in practice every
 * call falls through to Gemini today. Cloud TTS stays first deliberately: it is
 * the better voice, and the day the billing account is reopened it comes back
 * with no code change and no redeploy.
 */
class FallbackTTSProvider implements TTSProvider {
  private cloud: TTSProvider | null;
  private gemini = new GeminiTTSProvider();
  /** Once Cloud TTS has failed, stop paying the round trip on every sentence. */
  private cloudDown = false;

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
    if (this.cloud && !this.cloudDown) {
      try {
        return await this.cloud.synthesize(text, options);
      } catch (err) {
        this.cloudDown = true;
        console.warn(`[tts] Cloud TTS unavailable, falling back to Gemini — ${err}`);
      }
    }
    return this.gemini.synthesize(text, options);
  }
}

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
