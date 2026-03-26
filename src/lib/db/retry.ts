/**
 * Retry wrapper for transient Neon serverless DB errors (ETIMEDOUT, fetch failures, connection resets).
 * Does NOT retry on query/schema errors — only network-level transient failures.
 */

const TRANSIENT_PATTERNS = [
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "fetch failed",
  "network error",
  "socket hang up",
  "Connection terminated unexpectedly",
];

function isTransientError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error);
  return TRANSIENT_PATTERNS.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

interface RetryOptions {
  /** Max number of retries (default: 2) */
  retries?: number;
  /** Initial delay in ms before first retry (default: 200) */
  initialDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions
): Promise<T> {
  const retries = opts?.retries ?? 2;
  const initialDelayMs = opts?.initialDelayMs ?? 200;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries && isTransientError(error)) {
        const delay = initialDelayMs * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  // Unreachable, but satisfies TypeScript
  throw lastError;
}
