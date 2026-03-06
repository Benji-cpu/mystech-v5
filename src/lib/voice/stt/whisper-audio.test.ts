import { describe, it, expect, vi, beforeEach } from "vitest";

// We can't fully test audio decoding in jsdom (no real OfflineAudioContext),
// so we test the function's contract with mocked browser APIs.

describe("blobToFloat32Array", () => {
  const mockChannelData = new Float32Array([0.1, 0.2, 0.3, -0.1, -0.2]);
  const mockAudioBuffer = {
    getChannelData: vi.fn().mockReturnValue(mockChannelData),
    sampleRate: 16000,
    duration: 0.3125,
  };

  const constructorSpy = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    constructorSpy.mockClear();

    // Must use a real class so `new OfflineAudioContext(...)` works
    class MockOfflineAudioContext {
      constructor(...args: unknown[]) {
        constructorSpy(...args);
      }
      decodeAudioData = vi.fn().mockResolvedValue(mockAudioBuffer);
      destination = {};
      createBufferSource = vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
      });
      startRendering = vi.fn().mockResolvedValue(mockAudioBuffer);
    }

    vi.stubGlobal("OfflineAudioContext", MockOfflineAudioContext);
  });

  /** Create a blob-like object with arrayBuffer() that jsdom supports */
  function createMockBlob(): Blob {
    const data = new Uint8Array([0, 1, 2, 3]);
    const blob = new Blob([data], { type: "audio/webm" });
    // jsdom Blob may not have arrayBuffer — polyfill it
    if (typeof blob.arrayBuffer !== "function") {
      (blob as unknown as Record<string, unknown>).arrayBuffer = () =>
        Promise.resolve(data.buffer);
    }
    return blob;
  }

  it("converts a blob to Float32Array at target sample rate", async () => {
    const { blobToFloat32Array } = await import("./whisper-audio");

    const blob = createMockBlob();
    const result = await blobToFloat32Array(blob, 16000);

    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(5);
    expect(result[0]).toBeCloseTo(0.1);
  });

  it("uses 16000 as default sample rate", async () => {
    const { blobToFloat32Array } = await import("./whisper-audio");

    const blob = createMockBlob();
    await blobToFloat32Array(blob);

    expect(constructorSpy).toHaveBeenCalledWith(1, 1, 16000);
  });
});
