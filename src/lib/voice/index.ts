import type { TTSProvider } from './provider';
import { GoogleTTSProvider } from './providers/google-tts';
import type { PlanType } from '@/types';

let googleProvider: GoogleTTSProvider | null = null;

export function getTTSProvider(_plan: PlanType): TTSProvider {
  // Phase 1: Google TTS for all tiers
  // Phase 2: ElevenLabs for Pro users
  if (!googleProvider) {
    googleProvider = new GoogleTTSProvider();
  }
  return googleProvider;
}

export { type TTSProvider, type TTSOptions } from './provider';
export { DEFAULT_VOICE_ID, VOICE_SPEED_VALUES, MAX_TTS_TEXT_LENGTH, MAX_TTS_BATCH_SIZE } from './constants';
