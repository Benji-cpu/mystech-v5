import { Origin, Horoscope } from "circular-natal-horoscope-js";
import SunCalc from "suncalc";

// ── Zodiac signs with metadata ──────────────────────────────────────────

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_ELEMENTS: Record<ZodiacSign, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

export const ZODIAC_RULERS: Record<ZodiacSign, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};

export const ZODIAC_GLYPHS: Record<ZodiacSign, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

// ── Birth chart calculation ──────────────────────────────────────────────

export type BirthChartInput = {
  year: number;
  month: number; // 0-11 (JS convention)
  day: number;
  hour?: number; // 0-23
  minute?: number; // 0-59
  latitude?: number;
  longitude?: number;
};

export type BirthChartResult = {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign | null;
  risingSign: ZodiacSign | null;
  planetaryPositions: Record<string, string>;
  elementBalance: { fire: number; earth: number; air: number; water: number };
};

/**
 * Calculate birth chart from birth data.
 * - Sun sign requires only birth date
 * - Moon sign requires birth date + time
 * - Rising sign requires birth date + time + location
 */
export function calculateBirthChart(params: BirthChartInput): BirthChartResult {
  const hasBirthTime = params.hour != null;
  const hasLocation = params.latitude != null && params.longitude != null;

  const origin = new Origin({
    year: params.year,
    month: params.month,
    date: params.day,
    hour: params.hour ?? 12,
    minute: params.minute ?? 0,
    latitude: params.latitude ?? 0,
    longitude: params.longitude ?? 0,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    language: "en",
  });

  // Extract planetary positions
  const bodies = horoscope.CelestialBodies;
  const planetaryPositions: Record<string, string> = {};

  if (bodies) {
    const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
    for (const key of planetKeys) {
      const body = bodies[key];
      if (body?.Sign?.label) {
        planetaryPositions[key] = body.Sign.label;
      }
    }
  }

  // Calculate element balance from all planetary positions
  const elementBalance = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const sign of Object.values(planetaryPositions)) {
    const element = ZODIAC_ELEMENTS[sign as ZodiacSign];
    if (element) elementBalance[element]++;
  }

  const sunSign = normalizeSignLabel(horoscope.SunSign?.label ?? planetaryPositions.sun);
  const moonSign = hasBirthTime ? normalizeSignLabel(planetaryPositions.moon) : null;
  const risingSign = hasBirthTime && hasLocation
    ? normalizeSignLabel(horoscope.Ascendant?.Sign?.label)
    : null;

  return {
    sunSign,
    moonSign,
    risingSign,
    planetaryPositions,
    elementBalance,
  };
}

// ── Current celestial context (for reading time) ────────────────────────

export type CelestialContext = {
  moonPhase: string;
  moonPhaseFraction: number;
  moonSign: string;
};

const MOON_PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

/**
 * Get current celestial context (moon phase, transiting moon sign).
 * Used to enrich readings with "current sky" data.
 */
export function getCurrentCelestialContext(date: Date = new Date()): CelestialContext {
  const illumination = SunCalc.getMoonIllumination(date);
  const phase = illumination.phase; // 0-1

  // Map phase fraction to named phase (8 phases)
  const phaseIndex = Math.round(phase * 8) % 8;
  const moonPhase = MOON_PHASE_NAMES[phaseIndex];

  // Calculate transiting moon sign using a simplified ephemeris approach
  // The moon completes one zodiac cycle in ~27.3 days
  // We use the horoscope library for accuracy
  const origin = new Origin({
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    latitude: 0,
    longitude: 0,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    language: "en",
  });

  const moonSign = horoscope.CelestialBodies?.moon?.Sign?.label ?? "Unknown";

  return {
    moonPhase,
    moonPhaseFraction: phase,
    moonSign: normalizeSignLabel(moonSign),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Normalize a sign label from the library to our canonical form.
 * The library sometimes returns lowercase or full names.
 */
function normalizeSignLabel(label: string | undefined | null): ZodiacSign {
  if (!label) return "Aries"; // fallback
  const normalized = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  const match = ZODIAC_SIGNS.find(
    (s) => s.toLowerCase() === normalized.toLowerCase()
  );
  return match ?? "Aries";
}
