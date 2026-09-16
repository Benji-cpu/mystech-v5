export interface TTSOptions {
  voiceId: string;
  speed: number;
  format?: 'mp3' | 'wav';
}

/**
 * Audio plus the container it is actually in.
 *
 * The content type travels with the bytes because the two providers do not
 * agree on one: Cloud TTS returns MP3, the Gemini fallback returns WAV. The
 * browser decodes both (Web Audio sniffs the container), but the route must not
 * announce `audio/mpeg` over WAV bytes — a caller that trusts the header rather
 * than the bytes would be the one to find out.
 */
export interface TTSClip {
  buffer: ArrayBuffer;
  contentType: 'audio/mpeg' | 'audio/wav';
}

export interface TTSProvider {
  synthesize(text: string, options: TTSOptions): Promise<TTSClip>;
}
