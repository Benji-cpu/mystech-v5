export interface TTSOptions {
  voiceId: string;
  speed: number;
  format?: 'mp3' | 'wav';
}

export interface TTSProvider {
  synthesize(text: string, options: TTSOptions): Promise<ArrayBuffer>;
}
