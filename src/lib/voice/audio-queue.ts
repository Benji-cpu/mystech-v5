/**
 * Ordered audio playback queue using Web Audio API.
 * Plays audio chunks sequentially, auto-advances.
 */

export type AudioQueueState = 'idle' | 'loading' | 'playing' | 'paused';

export interface AudioQueueCallbacks {
  onStateChange?: (state: AudioQueueState) => void;
}

export class AudioQueue {
  private queue: ArrayBuffer[] = [];
  private currentSource: AudioBufferSourceNode | null = null;
  private audioContext: AudioContext | null = null;
  private state: AudioQueueState = 'idle';
  private callbacks: AudioQueueCallbacks;
  private isProcessing = false;
  private pausedAt = 0;
  private startedAt = 0;
  private currentBuffer: AudioBuffer | null = null;

  constructor(callbacks: AudioQueueCallbacks = {}) {
    this.callbacks = callbacks;
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private setState(state: AudioQueueState): void {
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  getState(): AudioQueueState {
    return this.state;
  }

  enqueue(audioData: ArrayBuffer): void {
    this.queue.push(audioData);
    if (!this.isProcessing && this.state !== 'paused') {
      this.processNext();
    }
  }

  async stop(): Promise<void> {
    this.queue = [];
    this.isProcessing = false;
    this.pausedAt = 0;
    this.currentBuffer = null;
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch {
        // Already stopped
      }
      this.currentSource = null;
    }
    this.setState('idle');
  }

  pause(): void {
    if (this.state === 'playing' && this.currentSource) {
      this.pausedAt = this.getContext().currentTime - this.startedAt;
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch {
        // Already stopped
      }
      this.currentSource = null;
      this.setState('paused');
    }
  }

  resume(): void {
    if (this.state === 'paused' && this.currentBuffer) {
      this.playBuffer(this.currentBuffer, this.pausedAt);
    }
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      this.setState('idle');
      return;
    }

    this.isProcessing = true;
    this.setState('loading');

    const data = this.queue.shift()!;
    try {
      const ctx = this.getContext();
      // Resume context if suspended (mobile autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const audioBuffer = await ctx.decodeAudioData(data.slice(0));
      this.currentBuffer = audioBuffer;
      this.pausedAt = 0;
      this.playBuffer(audioBuffer, 0);
    } catch (err) {
      console.error('AudioQueue: decode error', err);
      this.processNext();
    }
  }

  private playBuffer(buffer: AudioBuffer, offset: number): void {
    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      if (this.state === 'playing') {
        this.currentSource = null;
        this.currentBuffer = null;
        this.processNext();
      }
    };

    this.currentSource = source;
    this.startedAt = ctx.currentTime - offset;
    source.start(0, offset);
    this.setState('playing');
  }

  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
