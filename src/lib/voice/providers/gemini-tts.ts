import type { TTSProvider, TTSOptions, TTSClip } from '../provider';

const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
/** Warm, unhurried. Lyra reads interpretations, not train announcements. */
const GEMINI_VOICE = 'Kore';

/**
 * The voice that speaks when Google Cloud TTS cannot be reached.
 *
 * Cloud TTS is billing-gated, and billing on that project (473497770902) has
 * never been enabled — every runtime call has 403'd with BILLING_DISABLED, so
 * MysTech's read-aloud has been silent for as long as it has existed. WordZoo
 * hit the identical wall on the identical project and solved it this way; this
 * is the same fix, ported.
 *
 * Gemini's TTS model needs no billing and runs on the Gemini key the app
 * already uses for every card and reading. Cloud TTS is still tried first, so
 * if the billing account is ever reopened the better voice returns with no code
 * change and no redeploy.
 */
export class GeminiTTSProvider implements TTSProvider {
  async synthesize(text: string, options: TTSOptions): Promise<TTSClip> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('No TTS voice available: GOOGLE_GENERATIVE_AI_API_KEY is not set');
    }

    // Gemini has no speakingRate parameter — pace is asked for in words.
    const pace =
      options.speed <= 0.85
        ? 'slowly and deliberately'
        : options.speed >= 1.25
          ? 'briskly'
          : 'at a calm, natural pace';
    const prompt =
      `Read the following aloud ${pace}, in a warm and grounded voice. ` +
      `Read only the text itself, and nothing else:\n\n${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(20_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini TTS error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part?.data) throw new Error('Gemini TTS returned no audio');

    // Raw 16-bit mono PCM, sample rate declared in the mime type.
    const rateHz = Number(/rate=(\d+)/.exec(part.mimeType ?? '')?.[1] ?? 24000);
    const pcm = Buffer.from(part.data, 'base64');
    return { buffer: pcmToWav(pcm, rateHz), contentType: 'audio/wav' };
  }
}

/** Wrap raw 16-bit mono PCM in the 44-byte RIFF header browsers expect. */
function pcmToWav(pcm: Buffer, sampleRate: number): ArrayBuffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * 2;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // format: PCM
  header.writeUInt16LE(1, 22); // channels: mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  const wav = Buffer.concat([header, pcm]);
  return wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) as ArrayBuffer;
}
