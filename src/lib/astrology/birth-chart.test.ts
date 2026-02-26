import { describe, it, expect } from "vitest";
import {
  calculateBirthChart,
  getCurrentCelestialContext,
  ZODIAC_SIGNS,
  ZODIAC_ELEMENTS,
  ZODIAC_GLYPHS,
  ZODIAC_RULERS,
} from "./birth-chart";

describe("calculateBirthChart", () => {
  it("calculates sun sign from birth date only", () => {
    // Jan 1 = Capricorn
    const result = calculateBirthChart({
      year: 2000,
      month: 0, // January
      day: 1,
    });
    expect(result.sunSign).toBe("Capricorn");
    expect(result.moonSign).toBeNull();
    expect(result.risingSign).toBeNull();
  });

  it("calculates sun and moon sign with birth time", () => {
    const result = calculateBirthChart({
      year: 2000,
      month: 0, // January
      day: 1,
      hour: 12,
      minute: 0,
    });
    expect(result.sunSign).toBe("Capricorn");
    expect(result.moonSign).not.toBeNull();
    expect(ZODIAC_SIGNS).toContain(result.moonSign);
    expect(result.risingSign).toBeNull(); // no location
  });

  it("calculates all three with birth time and location", () => {
    // NYC: 40.7128, -74.0060
    const result = calculateBirthChart({
      year: 2000,
      month: 0,
      day: 1,
      hour: 12,
      minute: 0,
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.sunSign).toBe("Capricorn");
    expect(result.moonSign).not.toBeNull();
    expect(result.risingSign).not.toBeNull();
    expect(ZODIAC_SIGNS).toContain(result.risingSign);
  });

  it("returns planetary positions for all major planets", () => {
    const result = calculateBirthChart({
      year: 2000,
      month: 0,
      day: 1,
      hour: 12,
      minute: 0,
      latitude: 40.7128,
      longitude: -74.006,
    });

    expect(result.planetaryPositions).toHaveProperty("sun");
    expect(result.planetaryPositions).toHaveProperty("moon");
    expect(result.planetaryPositions).toHaveProperty("mercury");
    expect(result.planetaryPositions).toHaveProperty("venus");
    expect(result.planetaryPositions).toHaveProperty("mars");

    // Each should be a valid zodiac sign
    for (const sign of Object.values(result.planetaryPositions)) {
      expect(ZODIAC_SIGNS).toContain(sign);
    }
  });

  it("returns element balance that sums to planet count", () => {
    const result = calculateBirthChart({
      year: 2000,
      month: 0,
      day: 1,
      hour: 12,
      minute: 0,
    });

    const { fire, earth, air, water } = result.elementBalance;
    const totalPlanets = Object.keys(result.planetaryPositions).length;
    expect(fire + earth + air + water).toBe(totalPlanets);
  });

  it("handles different zodiac signs correctly", () => {
    // July 4 = Cancer
    const cancer = calculateBirthChart({ year: 1990, month: 6, day: 4 });
    expect(cancer.sunSign).toBe("Cancer");

    // March 21 = Aries
    const aries = calculateBirthChart({ year: 1990, month: 2, day: 25 });
    expect(aries.sunSign).toBe("Aries");

    // August 15 = Leo
    const leo = calculateBirthChart({ year: 1990, month: 7, day: 15 });
    expect(leo.sunSign).toBe("Leo");
  });
});

describe("getCurrentCelestialContext", () => {
  it("returns moon phase name", () => {
    const result = getCurrentCelestialContext(new Date());
    expect(result.moonPhase).toBeTruthy();
    expect(typeof result.moonPhase).toBe("string");
  });

  it("returns moon phase fraction between 0 and 1", () => {
    const result = getCurrentCelestialContext(new Date());
    expect(result.moonPhaseFraction).toBeGreaterThanOrEqual(0);
    expect(result.moonPhaseFraction).toBeLessThanOrEqual(1);
  });

  it("returns transiting moon sign", () => {
    const result = getCurrentCelestialContext(new Date());
    expect(result.moonSign).toBeTruthy();
    expect(ZODIAC_SIGNS).toContain(result.moonSign);
  });

  it("works with specific dates", () => {
    // Known full moon: Jan 13, 2025
    const result = getCurrentCelestialContext(new Date("2025-01-13T12:00:00Z"));
    expect(result.moonPhase).toBeTruthy();
    expect(typeof result.moonSign).toBe("string");
  });
});

describe("zodiac constants", () => {
  it("has 12 zodiac signs", () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
  });

  it("has elements for all signs", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(ZODIAC_ELEMENTS[sign]).toBeDefined();
      expect(["fire", "earth", "air", "water"]).toContain(ZODIAC_ELEMENTS[sign]);
    }
  });

  it("has glyphs for all signs", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(ZODIAC_GLYPHS[sign]).toBeDefined();
      expect(ZODIAC_GLYPHS[sign].length).toBeGreaterThan(0);
    }
  });

  it("has rulers for all signs", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(ZODIAC_RULERS[sign]).toBeDefined();
    }
  });

  it("has 3 signs per element", () => {
    const counts = { fire: 0, earth: 0, air: 0, water: 0 };
    for (const sign of ZODIAC_SIGNS) {
      counts[ZODIAC_ELEMENTS[sign]]++;
    }
    expect(counts.fire).toBe(3);
    expect(counts.earth).toBe(3);
    expect(counts.air).toBe(3);
    expect(counts.water).toBe(3);
  });
});
