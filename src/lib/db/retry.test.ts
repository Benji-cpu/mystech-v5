import { describe, it, expect, vi } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  it("returns the result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on transient ETIMEDOUT and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("connect ETIMEDOUT 1.2.3.4:443"))
      .mockResolvedValue("recovered");

    const result = await withRetry(fn, { initialDelayMs: 1 });
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on fetch failed errors", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { retries: 2, initialDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does NOT retry on non-transient errors", async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new Error('relation "users" does not exist'));

    await expect(withRetry(fn, { initialDelayMs: 1 })).rejects.toThrow(
      'relation "users" does not exist'
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting retries on transient errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("connect ETIMEDOUT"));

    await expect(
      withRetry(fn, { retries: 2, initialDelayMs: 1 })
    ).rejects.toThrow("connect ETIMEDOUT");
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("uses exponential backoff", async () => {
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, "setTimeout").mockImplementation(((
      cb: () => void,
      ms: number
    ) => {
      delays.push(ms);
      return originalSetTimeout(cb, 1); // actually resolve fast
    }) as typeof setTimeout);

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("ETIMEDOUT"))
      .mockRejectedValueOnce(new Error("ETIMEDOUT"))
      .mockResolvedValue("ok");

    await withRetry(fn, { retries: 2, initialDelayMs: 100 });
    expect(delays).toEqual([100, 200]); // 100 * 2^0, 100 * 2^1

    vi.restoreAllMocks();
  });

  it("retries on ECONNRESET", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("read ECONNRESET"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { initialDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on Connection terminated unexpectedly", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("Connection terminated unexpectedly")
      )
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { initialDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
