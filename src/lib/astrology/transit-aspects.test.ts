import { describe, it, expect } from "vitest";
import { getPersonalTransits } from "./transit-aspects";

describe("getPersonalTransits", () => {
  it("returns empty array for empty natal positions", () => {
    const result = getPersonalTransits({}, new Date("2026-03-01"), new Date("2026-03-31"));
    expect(result).toEqual([]);
  });

  it("returns empty array for null-like input", () => {
    const result = getPersonalTransits(
      null as unknown as Record<string, string>,
      new Date("2026-03-01"),
      new Date("2026-03-31")
    );
    expect(result).toEqual([]);
  });

  it("finds transits for Sun in Aries natal placement", () => {
    // Sun enters Aries around March 20. Over a month, transiting Sun should
    // conjunct natal Sun (at ~15 degrees Aries) around late March/early April
    const natal = { sun: "Aries", moon: "Cancer" };
    const start = new Date("2026-03-01");
    const end = new Date("2026-04-30");

    const transits = getPersonalTransits(natal, start, end);
    expect(transits.length).toBeGreaterThan(0);

    // Check required fields
    for (const t of transits) {
      expect(t.date).toBeInstanceOf(Date);
      expect(t.transitPlanet).toBeTruthy();
      expect(t.natalPlanet).toBeTruthy();
      expect(t.aspect).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(["major", "minor"]).toContain(t.significance);
    }
  });

  it("marks Sun and Moon natal planets as major significance", () => {
    const natal = { sun: "Leo", moon: "Scorpio", mercury: "Virgo" };
    const start = new Date("2026-01-01");
    const end = new Date("2026-12-31");

    const transits = getPersonalTransits(natal, start, end);
    const sunTransits = transits.filter((t) => t.natalPlanet.toLowerCase() === "sun");
    const moonTransits = transits.filter((t) => t.natalPlanet.toLowerCase() === "moon");
    const mercuryTransits = transits.filter((t) => t.natalPlanet.toLowerCase() === "mercury");

    // All Sun/Moon natal transits should be "major"
    for (const t of sunTransits) expect(t.significance).toBe("major");
    for (const t of moonTransits) expect(t.significance).toBe("major");
    // Mercury transits should be "minor"
    for (const t of mercuryTransits) expect(t.significance).toBe("minor");
  });

  it("returns sorted results by date", () => {
    const natal = { sun: "Aries", moon: "Cancer", venus: "Libra" };
    const start = new Date("2026-01-01");
    const end = new Date("2026-06-30");

    const transits = getPersonalTransits(natal, start, end);
    for (let i = 1; i < transits.length; i++) {
      expect(transits[i].date.getTime()).toBeGreaterThanOrEqual(transits[i - 1].date.getTime());
    }
  });

  it("does not compare a planet to itself", () => {
    const natal = { sun: "Leo", mercury: "Virgo" };
    const start = new Date("2026-01-01");
    const end = new Date("2026-12-31");

    const transits = getPersonalTransits(natal, start, end);
    // No transit where transitPlanet === natalPlanet (case-insensitive)
    for (const t of transits) {
      expect(t.transitPlanet.toLowerCase()).not.toBe(t.natalPlanet.toLowerCase());
    }
  });

  it("respects aspect orbs — only emits closest approach", () => {
    const natal = { sun: "Aries" };
    const start = new Date("2026-03-20");
    const end = new Date("2026-04-10");

    const transits = getPersonalTransits(natal, start, end);
    // Should have at most one conjunction from each transit planet
    const conjunctions = transits.filter(
      (t) => t.natalPlanet.toLowerCase() === "sun" && t.aspect === "conjunction"
    );
    const uniqueTransitPlanets = new Set(conjunctions.map((t) => t.transitPlanet));
    expect(conjunctions.length).toBe(uniqueTransitPlanets.size);
  });
});
