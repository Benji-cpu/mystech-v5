import type { TTSProvider, TTSOptions } from '../provider';

export class GoogleTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor() {
    const key = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_CLOUD_TTS_API_KEY is not set');
    }
    this.apiKey = key;
  }

  async synthesize(text: string, options: TTSOptions): Promise<ArrayBuffer> {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: options.voiceId,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: options.speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent as string;

    // Google returns base64-encoded audio
    const binaryString = atob(audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
