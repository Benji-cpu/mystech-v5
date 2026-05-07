import { describe, it, expect } from "vitest";
import {
  localHourFor,
  localDateFor,
  isKnownTimeZone,
} from "./timezone";

describe("localHourFor", () => {
  it("returns the UTC hour for the UTC zone", () => {
    const noon = new Date("2026-05-07T12:00:00Z");
    expect(localHourFor("UTC", noon)).toBe(12);
  });

  it("rolls back across the dateline for negative offsets", () => {
    // 2026-05-07T08:00Z is 2026-05-07T01:00 in PT (UTC-7 DST)
    const at = new Date("2026-05-07T08:00:00Z");
    expect(localHourFor("America/Los_Angeles", at)).toBe(1);
  });

  it("handles UTC+14 zones (Kiritimati)", () => {
    // 2026-05-07T00:00Z is 2026-05-07T14:00 local in Kiritimati
    const at = new Date("2026-05-07T00:00:00Z");
    expect(localHourFor("Pacific/Kiritimati", at)).toBe(14);
  });

  it("returns 0 for a 24-formatted midnight (no wrap to 24)", () => {
    const at = new Date("2026-05-07T00:00:00Z");
    const h = localHourFor("UTC", at);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(24);
    expect(h).toBe(0);
  });

  it("crosses DST spring-forward correctly (US, March)", () => {
    // DST starts 2026-03-08 at 02:00 local. Before the jump, NY is on EST (UTC-5);
    // after, EDT (UTC-4). 06:30Z = 01:30 EST (pre-jump).
    const before = new Date("2026-03-08T06:30:00Z");
    expect(localHourFor("America/New_York", before)).toBe(1);
    // 08:30Z = 04:30 EDT (post-jump).
    const after = new Date("2026-03-08T08:30:00Z");
    expect(localHourFor("America/New_York", after)).toBe(4);
  });

  it("falls back to UTC for invalid timezones", () => {
    const at = new Date("2026-05-07T10:00:00Z");
    expect(localHourFor("Not/A_Zone", at)).toBe(localHourFor("UTC", at));
  });
});

describe("localDateFor", () => {
  it("returns YYYY-MM-DD in UTC by default", () => {
    expect(localDateFor("UTC", new Date("2026-05-07T12:00:00Z"))).toBe(
      "2026-05-07"
    );
  });

  it("accounts for the local date when crossing midnight", () => {
    // 22:00 UTC on May 7 is May 8 in Sydney (UTC+10)
    const at = new Date("2026-05-07T22:00:00Z");
    expect(localDateFor("Australia/Sydney", at)).toBe("2026-05-08");
  });

  it("accounts for going-back-a-day in westward zones", () => {
    // 02:00 UTC on May 7 is May 6 in Los Angeles (UTC-7)
    const at = new Date("2026-05-07T02:00:00Z");
    expect(localDateFor("America/Los_Angeles", at)).toBe("2026-05-06");
  });
});

describe("isKnownTimeZone", () => {
  it("accepts common IANA zones", () => {
    expect(isKnownTimeZone("UTC")).toBe(true);
    expect(isKnownTimeZone("America/New_York")).toBe(true);
    expect(isKnownTimeZone("Asia/Tokyo")).toBe(true);
    expect(isKnownTimeZone("Australia/Sydney")).toBe(true);
  });

  it("rejects garbage strings", () => {
    expect(isKnownTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(isKnownTimeZone("")).toBe(false);
    expect(isKnownTimeZone("definitely not a zone")).toBe(false);
  });
});
