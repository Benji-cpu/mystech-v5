/**
 * Timezone helpers for the Daily Card cron.
 *
 * Uses native Intl.DateTimeFormat with `timeZone` — no extra dependency.
 * If a user's timezone string is invalid, the helpers fall back to UTC so the
 * cron never crashes; the caller can decide whether to skip or warn.
 */

const isValidTimeZone = (tz: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/** Returns the local hour (0-23) for the given UTC instant in the user's tz. */
export function localHourFor(tz: string, at: Date = new Date()): number {
  const safe = isValidTimeZone(tz) ? tz : "UTC";
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: safe,
    hour: "numeric",
    hour12: false,
  });
  const part = fmt.formatToParts(at).find((p) => p.type === "hour");
  // Intl returns "24" for midnight in some locales — normalize to 0.
  const h = part ? parseInt(part.value, 10) : 0;
  return h === 24 ? 0 : h;
}

/** Returns YYYY-MM-DD for the given UTC instant in the user's tz. */
export function localDateFor(tz: string, at: Date = new Date()): string {
  const safe = isValidTimeZone(tz) ? tz : "UTC";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: safe,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA produces YYYY-MM-DD natively.
  return fmt.format(at);
}

/** Auto-detect a timezone in the browser. Server callers must pass it through. */
export function detectClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** True iff `tz` parses as an IANA zone Intl recognises. Use for validation at boundaries. */
export function isKnownTimeZone(tz: string): boolean {
  return isValidTimeZone(tz);
}
