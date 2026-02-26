import {
  SearchMoonQuarter,
  NextMoonQuarter,
  Seasons,
  SearchLunarEclipse,
  NextLunarEclipse,
  SearchGlobalSolarEclipse,
  NextGlobalSolarEclipse,
  EclipticLongitude,
  SunPosition,
  GeoVector,
  Ecliptic,
  Body,
  MakeTime,
  type FlexibleDateTime,
} from "astronomy-engine";
import { ZODIAC_SIGNS, type ZodiacSign } from "./birth-chart";

// ── Types ────────────────────────────────────────────────────────────────

export type CelestialEventType =
  | "new_moon"
  | "first_quarter"
  | "full_moon"
  | "last_quarter"
  | "spring_equinox"
  | "summer_solstice"
  | "autumn_equinox"
  | "winter_solstice"
  | "lunar_eclipse"
  | "solar_eclipse"
  | "retrograde_start"
  | "retrograde_end";

export type CelestialEvent = {
  type: CelestialEventType;
  date: Date;
  title: string;
  description: string;
  planet?: string;
  zodiacSign?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────

/** Get ecliptic longitude for any body, including the Sun (heliocentric for planets). */
function getEclipticLongitude(body: Body, date: FlexibleDateTime): number {
  if (body === Body.Sun) {
    return SunPosition(date).elon;
  }
  return EclipticLongitude(body, date);
}

/** Get geocentric ecliptic longitude (as seen from Earth). Required for retrograde detection. */
export function getGeocentricLongitude(body: Body, date: FlexibleDateTime): number {
  if (body === Body.Sun) {
    return SunPosition(date).elon;
  }
  const vec = GeoVector(body, date, true);
  return Ecliptic(vec).elon;
}

/** Map ecliptic longitude (0-360 degrees) to zodiac sign. */
export function eclipticLongitudeToSign(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
}

const MOON_QUARTER_TYPES: CelestialEventType[] = [
  "new_moon",
  "first_quarter",
  "full_moon",
  "last_quarter",
];

const MOON_QUARTER_LABELS = [
  "New Moon",
  "First Quarter Moon",
  "Full Moon",
  "Last Quarter Moon",
] as const;

const MOON_DESCRIPTIONS: Record<CelestialEventType, (sign: string) => string> = {
  new_moon: (sign) => `A new cycle begins under ${sign} \u2014 plant seeds of intention.`,
  first_quarter: (sign) => `Momentum builds in ${sign} \u2014 take decisive action.`,
  full_moon: (sign) => `Illumination arrives in ${sign} \u2014 release what no longer serves.`,
  last_quarter: (sign) => `Reflect and integrate under ${sign} \u2014 the cycle winds down.`,
  spring_equinox: () => "Balance returns \u2014 the world awakens and new growth stirs.",
  summer_solstice: () => "The longest light \u2014 celebrate vitality and the fullness of creation.",
  autumn_equinox: () => "Harvest what you've sown \u2014 gratitude and release walk together.",
  winter_solstice: () => "The longest night \u2014 turn inward, honor rest, await the returning light.",
  lunar_eclipse: (sign) => `A portal of transformation opens in ${sign} \u2014 deep truths surface.`,
  solar_eclipse: (sign) => `Destiny's hand reaches through ${sign} \u2014 beginnings eclipse endings.`,
  retrograde_start: () => "",
  retrograde_end: () => "",
};

const RETROGRADE_START_DESC: Record<string, string> = {
  Mercury: "Communication and travel slow \u2014 review, revise, reconnect.",
  Venus: "Love and values turn inward \u2014 past relationships may resurface.",
  Mars: "Action stalls \u2014 redirect energy inward rather than forcing outcomes.",
  Jupiter: "Expansion pauses \u2014 reflect on what growth truly means to you.",
  Saturn: "Structure loosens \u2014 question the rules you\u2019ve been living by.",
};

const RETROGRADE_END_DESC: Record<string, string> = {
  Mercury: "Clarity returns \u2014 sign contracts, send messages, move forward.",
  Venus: "The heart finds its compass again \u2014 new connections flow freely.",
  Mars: "Drive reignites \u2014 the path clears for bold action.",
  Jupiter: "Vision broadens once more \u2014 opportunities resume their expansion.",
  Saturn: "Foundations solidify \u2014 lessons from the pause now become structure.",
};

// ── Moon phases ──────────────────────────────────────────────────────────

function getMoonPhases(start: Date, end: Date): CelestialEvent[] {
  const events: CelestialEvent[] = [];
  let mq = SearchMoonQuarter(start);

  while (mq.time.date <= end) {
    if (mq.time.date >= start) {
      const type = MOON_QUARTER_TYPES[mq.quarter];
      const moonLon = getEclipticLongitude(Body.Moon, mq.time);
      const sign = eclipticLongitudeToSign(moonLon);
      events.push({
        type,
        date: mq.time.date,
        title: `${MOON_QUARTER_LABELS[mq.quarter]} in ${sign}`,
        description: MOON_DESCRIPTIONS[type](sign),
        zodiacSign: sign,
      });
    }
    mq = NextMoonQuarter(mq);
  }

  return events;
}

// ── Equinoxes & solstices ────────────────────────────────────────────────

function getSeasonalEvents(start: Date, end: Date): CelestialEvent[] {
  const events: CelestialEvent[] = [];
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    const seasons = Seasons(year);
    const seasonMap: [CelestialEventType, string, Date][] = [
      ["spring_equinox", "Spring Equinox", seasons.mar_equinox.date],
      ["summer_solstice", "Summer Solstice", seasons.jun_solstice.date],
      ["autumn_equinox", "Autumn Equinox", seasons.sep_equinox.date],
      ["winter_solstice", "Winter Solstice", seasons.dec_solstice.date],
    ];

    for (const [type, title, date] of seasonMap) {
      if (date >= start && date <= end) {
        events.push({
          type,
          date,
          title,
          description: MOON_DESCRIPTIONS[type](""),
        });
      }
    }
  }

  return events;
}

// ── Eclipses ─────────────────────────────────────────────────────────────

function getLunarEclipses(start: Date, end: Date): CelestialEvent[] {
  const events: CelestialEvent[] = [];
  let eclipse = SearchLunarEclipse(start);

  while (eclipse.peak.date <= end) {
    if (eclipse.peak.date >= start) {
      const moonLon = getEclipticLongitude(Body.Moon, eclipse.peak);
      const sign = eclipticLongitudeToSign(moonLon);
      const kindLabel = eclipse.kind.charAt(0).toUpperCase() + eclipse.kind.slice(1);
      events.push({
        type: "lunar_eclipse",
        date: eclipse.peak.date,
        title: `${kindLabel} Lunar Eclipse in ${sign}`,
        description: MOON_DESCRIPTIONS.lunar_eclipse(sign),
        zodiacSign: sign,
      });
    }
    eclipse = NextLunarEclipse(eclipse.peak);
  }

  return events;
}

function getSolarEclipses(start: Date, end: Date): CelestialEvent[] {
  const events: CelestialEvent[] = [];
  let eclipse = SearchGlobalSolarEclipse(start);

  while (eclipse.peak.date <= end) {
    if (eclipse.peak.date >= start) {
      const sunLon = getEclipticLongitude(Body.Sun, eclipse.peak);
      const sign = eclipticLongitudeToSign(sunLon);
      const kindLabel = eclipse.kind.charAt(0).toUpperCase() + eclipse.kind.slice(1);
      events.push({
        type: "solar_eclipse",
        date: eclipse.peak.date,
        title: `${kindLabel} Solar Eclipse in ${sign}`,
        description: MOON_DESCRIPTIONS.solar_eclipse(sign),
        zodiacSign: sign,
      });
    }
    eclipse = NextGlobalSolarEclipse(eclipse.peak);
  }

  return events;
}

// ── Retrograde detection ─────────────────────────────────────────────────

const RETROGRADE_PLANETS = [
  { body: Body.Mercury, name: "Mercury" },
  { body: Body.Venus, name: "Venus" },
  { body: Body.Mars, name: "Mars" },
  { body: Body.Jupiter, name: "Jupiter" },
  { body: Body.Saturn, name: "Saturn" },
];

function getRetrogrades(start: Date, end: Date): CelestialEvent[] {
  const events: CelestialEvent[] = [];
  const dayMs = 86_400_000;

  for (const { body, name } of RETROGRADE_PLANETS) {
    // Sample days before start to detect initial retrograde state
    const twoDaysBefore = new Date(start.getTime() - 2 * dayMs);
    const oneDayBefore = new Date(start.getTime() - dayMs);

    const prevPrevLon = getGeocentricLongitude(body, twoDaysBefore);
    let prevLon = getGeocentricLongitude(body, oneDayBefore);

    let diff = prevLon - prevPrevLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    let wasRetrograde = diff < 0;

    const current = new Date(start.getTime());
    while (current <= end) {
      const lon = getGeocentricLongitude(body, current);
      let delta = lon - prevLon;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const isRetrograde = delta < 0;

      if (isRetrograde && !wasRetrograde) {
        const sign = eclipticLongitudeToSign(lon);
        events.push({
          type: "retrograde_start",
          date: new Date(current),
          title: `${name} Retrograde Begins`,
          description: RETROGRADE_START_DESC[name] ?? `${name} stations retrograde \u2014 a time for inner reflection.`,
          planet: name,
          zodiacSign: sign,
        });
      } else if (!isRetrograde && wasRetrograde) {
        const sign = eclipticLongitudeToSign(lon);
        events.push({
          type: "retrograde_end",
          date: new Date(current),
          title: `${name} Goes Direct`,
          description: RETROGRADE_END_DESC[name] ?? `${name} stations direct \u2014 forward motion resumes.`,
          planet: name,
          zodiacSign: sign,
        });
      }

      wasRetrograde = isRetrograde;
      prevLon = lon;
      current.setTime(current.getTime() + dayMs);
    }
  }

  return events;
}

// ── Main export ──────────────────────────────────────────────────────────

export function getCelestialEvents(startDate: Date, endDate: Date): CelestialEvent[] {
  const events: CelestialEvent[] = [
    ...getMoonPhases(startDate, endDate),
    ...getSeasonalEvents(startDate, endDate),
    ...getLunarEclipses(startDate, endDate),
    ...getSolarEclipses(startDate, endDate),
    ...getRetrogrades(startDate, endDate),
  ];

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
