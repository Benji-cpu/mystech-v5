import { describe, it, expect } from "vitest";
import { getCelestialEvents, eclipticLongitudeToSign } from "./celestial-events";

describe("eclipticLongitudeToSign", () => {
  it("maps 0 degrees to Aries", () => {
    expect(eclipticLongitudeToSign(0)).toBe("Aries");
  });

  it("maps 45 degrees to Taurus", () => {
    expect(eclipticLongitudeToSign(45)).toBe("Taurus");
  });

  it("maps 359 degrees to Pisces", () => {
    expect(eclipticLongitudeToSign(359)).toBe("Pisces");
  });

  it("handles negative values via modular arithmetic", () => {
    expect(eclipticLongitudeToSign(-10)).toBe("Pisces");
  });

  it("maps each 30-degree segment correctly", () => {
    const expected = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];
    for (let i = 0; i < 12; i++) {
      expect(eclipticLongitudeToSign(i * 30 + 15)).toBe(expected[i]);
    }
  });
});

describe("getCelestialEvents", () => {
  it("returns moon phases for a 45-day range", () => {
    const start = new Date("2026-02-01");
    const end = new Date("2026-03-17");
    const events = getCelestialEvents(start, end);

    const moonEvents = events.filter((e) =>
      ["new_moon", "first_quarter", "full_moon", "last_quarter"].includes(e.type)
    );
    // ~45 days should contain roughly 6 quarter phases (one every ~7.4 days)
    expect(moonEvents.length).toBeGreaterThanOrEqual(5);
    expect(moonEvents.length).toBeLessThanOrEqual(8);

    // Every moon event has required fields
    for (const evt of moonEvents) {
      expect(evt.date).toBeInstanceOf(Date);
      expect(evt.title).toBeTruthy();
      expect(evt.description).toBeTruthy();
      expect(evt.zodiacSign).toBeTruthy();
    }
  });

  it("detects spring equinox in March 2026", () => {
    const start = new Date("2026-03-01");
    const end = new Date("2026-03-31");
    const events = getCelestialEvents(start, end);

    const equinox = events.find((e) => e.type === "spring_equinox");
    expect(equinox).toBeDefined();
    expect(equinox!.date.getMonth()).toBe(2); // March
    expect(equinox!.title).toBe("Spring Equinox");
  });

  it("detects summer solstice in June 2026", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-30");
    const events = getCelestialEvents(start, end);

    const solstice = events.find((e) => e.type === "summer_solstice");
    expect(solstice).toBeDefined();
    expect(solstice!.date.getMonth()).toBe(5); // June
  });

  it("returns sorted events", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-06-30");
    const events = getCelestialEvents(start, end);

    for (let i = 1; i < events.length; i++) {
      expect(events[i].date.getTime()).toBeGreaterThanOrEqual(events[i - 1].date.getTime());
    }
  });

  it("returns empty array for zero-length range", () => {
    const date = new Date("2026-02-15");
    // Start after end
    const events = getCelestialEvents(new Date("2026-02-16"), new Date("2026-02-15"));
    expect(events).toEqual([]);
  });

  it("all events have required fields", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-12-31");
    const events = getCelestialEvents(start, end);

    expect(events.length).toBeGreaterThan(0);
    for (const evt of events) {
      expect(evt.type).toBeTruthy();
      expect(evt.date).toBeInstanceOf(Date);
      expect(evt.title).toBeTruthy();
      expect(evt.description).toBeTruthy();
    }
  });

  it("detects retrograde periods over a year", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-12-31");
    const events = getCelestialEvents(start, end);

    const retroStarts = events.filter((e) => e.type === "retrograde_start");
    const retroEnds = events.filter((e) => e.type === "retrograde_end");

    // Mercury retrogrades ~3 times/year, plus other planets
    expect(retroStarts.length).toBeGreaterThanOrEqual(2);
    expect(retroEnds.length).toBeGreaterThanOrEqual(2);

    for (const evt of retroStarts) {
      expect(evt.planet).toBeTruthy();
      expect(evt.zodiacSign).toBeTruthy();
    }
  });
});
