import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioQueue } from "./audio-queue";

// ── Mock AudioContext ──────────────────────────────────────────────────

function createMockAudioContext(
  overrides: {
    state?: AudioContextState;
    decodeAudioData?: () => Promise<AudioBuffer>;
  } = {}
) {
  const mockBuffer = { duration: 1, length: 44100 } as AudioBuffer;
  const mockSource = {
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };

  const ctx = {
    state: overrides.state ?? ("running" as AudioContextState),
    currentTime: 0,
    destination: {} as AudioDestinationNode,
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    decodeAudioData:
      overrides.decodeAudioData ??
      vi.fn().mockResolvedValue(mockBuffer),
    createBufferSource: vi.fn().mockReturnValue(mockSource),
  };

  return { ctx, mockSource, mockBuffer };
}

// Helper: replace globalThis.AudioContext with a constructor that returns our mock
function installMockAudioContext(
  factory: () => ReturnType<typeof createMockAudioContext>["ctx"]
) {
  const original = globalThis.AudioContext;
  // Must use `function` keyword — arrow functions can't be called with `new`
  globalThis.AudioContext = function MockAudioContext(
    this: unknown
  ) {
    const mock = factory();
    Object.assign(this as Record<string, unknown>, mock);
    return this;
  } as unknown as typeof AudioContext;
  return () => {
    globalThis.AudioContext = original;
  };
}

function dummyAudioData(): ArrayBuffer {
  return new ArrayBuffer(16);
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("AudioQueue", () => {
  let restore: () => void;

  afterEach(() => {
    restore?.();
  });

  it("recreates AudioContext when state is 'closed'", async () => {
    let callCount = 0;
    const { mockBuffer, mockSource } = createMockAudioContext();

    restore = installMockAudioContext(() => {
      callCount++;
      if (callCount === 1) {
        // First context is "closed" — should trigger recreation
        return createMockAudioContext({ state: "closed" as AudioContextState }).ctx;
      }
      // Second context is running and can decode
      const { ctx } = createMockAudioContext();
      ctx.decodeAudioData = vi.fn().mockResolvedValue(mockBuffer);
      ctx.createBufferSource = vi.fn().mockReturnValue(mockSource);
      return ctx;
    });

    const onStateChange = vi.fn();
    const queue = new AudioQueue({ onStateChange });

    queue.enqueue(dummyAudioData());

    await vi.waitFor(() => {
      expect(callCount).toBeGreaterThanOrEqual(2);
    });

    await queue.stop();
  });

  it("retries on transient decode error then succeeds", async () => {
    let decodeCallCount = 0;
    const { ctx, mockSource, mockBuffer } = createMockAudioContext();
    ctx.decodeAudioData = vi.fn().mockImplementation(() => {
      decodeCallCount++;
      if (decodeCallCount === 1) {
        return Promise.reject(new Error("transient decode failure"));
      }
      return Promise.resolve(mockBuffer);
    });

    restore = installMockAudioContext(() => ctx);

    const onStateChange = vi.fn();
    const queue = new AudioQueue({ onStateChange });

    queue.enqueue(dummyAudioData());

    await vi.waitFor(() => {
      expect(onStateChange).toHaveBeenCalledWith("playing");
    });

    expect(decodeCallCount).toBe(2);
    await queue.stop();
  });

  it("fires onError and halts after 3 consecutive failures", async () => {
    const { ctx } = createMockAudioContext();
    ctx.decodeAudioData = vi
      .fn()
      .mockRejectedValue(new Error("persistent failure"));

    restore = installMockAudioContext(() => ctx);

    const onError = vi.fn();
    const onStateChange = vi.fn();
    const queue = new AudioQueue({ onStateChange, onError });

    queue.enqueue(dummyAudioData());
    queue.enqueue(dummyAudioData());
    queue.enqueue(dummyAudioData());

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });

    expect(onError).toHaveBeenCalledWith(
      "Audio playback failed after multiple attempts."
    );
    expect(queue.getState()).toBe("idle");
    await queue.stop();
  });

  it("resets consecutiveErrors on successful playback", async () => {
    let decodeCallCount = 0;
    const { ctx, mockSource, mockBuffer } = createMockAudioContext();
    ctx.decodeAudioData = vi.fn().mockImplementation(() => {
      decodeCallCount++;
      if (decodeCallCount === 1) {
        return Promise.reject(new Error("transient"));
      }
      return Promise.resolve(mockBuffer);
    });

    restore = installMockAudioContext(() => ctx);

    const onError = vi.fn();
    const onStateChange = vi.fn();
    const queue = new AudioQueue({ onStateChange, onError });

    queue.enqueue(dummyAudioData());

    await vi.waitFor(() => {
      expect(onStateChange).toHaveBeenCalledWith("playing");
    });

    // Simulate playback ending to trigger next item processing
    mockSource.onended?.();

    // Enqueue second item — should succeed since counter was reset
    queue.enqueue(dummyAudioData());

    await vi.waitFor(() => {
      expect(decodeCallCount).toBeGreaterThanOrEqual(3);
    });

    expect(onError).not.toHaveBeenCalled();
    await queue.stop();
  });

  it("stop() resets error counter", async () => {
    const { ctx, mockBuffer, mockSource } = createMockAudioContext();
    let callCount = 0;
    ctx.decodeAudioData = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.reject(new Error("fail"));
      }
      return Promise.resolve(mockBuffer);
    });
    ctx.createBufferSource = vi.fn().mockReturnValue(mockSource);

    restore = installMockAudioContext(() => ctx);

    const onError = vi.fn();
    const queue = new AudioQueue({ onError });

    queue.enqueue(dummyAudioData());

    // Wait for at least one retry
    await vi.waitFor(() => {
      expect(callCount).toBeGreaterThanOrEqual(2);
    });

    // Stop resets everything including error counter
    await queue.stop();

    // New item should get a fresh error budget — callCount 3 will succeed
    queue.enqueue(dummyAudioData());

    await vi.waitFor(() => {
      expect(callCount).toBeGreaterThanOrEqual(3);
    });

    expect(onError).not.toHaveBeenCalled();
    await queue.stop();
  });
});
