import { Body, MakeTime } from "astronomy-engine";
import { getGeocentricLongitude } from "./celestial-events";
import { ZODIAC_SIGNS } from "./birth-chart";

// ── Types ────────────────────────────────────────────────────────────────

export type TransitAspect =
  | "conjunction"
  | "opposition"
  | "trine"
  | "square"
  | "sextile";

export type PersonalTransit = {
  date: Date;
  transitPlanet: string;
  natalPlanet: string;
  aspect: TransitAspect;
  title: string;
  description: string;
  significance: "major" | "minor";
};

// ── Constants ────────────────────────────────────────────────────────────

const ASPECT_ANGLES: { aspect: TransitAspect; angle: number; orb: number }[] = [
  { aspect: "conjunction", angle: 0, orb: 8 },
  { aspect: "opposition", angle: 180, orb: 8 },
  { aspect: "trine", angle: 120, orb: 6 },
  { aspect: "square", angle: 90, orb: 6 },
  { aspect: "sextile", angle: 60, orb: 4 },
];

const TRANSIT_BODIES = [
  { body: Body.Sun, name: "Sun" },
  { body: Body.Moon, name: "Moon" },
  { body: Body.Mercury, name: "Mercury" },
  { body: Body.Venus, name: "Venus" },
  { body: Body.Mars, name: "Mars" },
  { body: Body.Jupiter, name: "Jupiter" },
  { body: Body.Saturn, name: "Saturn" },
];

const MAJOR_NATAL_PLANETS = new Set(["sun", "moon"]);

const ASPECT_LABELS: Record<TransitAspect, string> = {
  conjunction: "conjuncts",
  opposition: "opposes",
  trine: "trines",
  square: "squares",
  sextile: "sextiles",
};

const ASPECT_DESCRIPTIONS: Record<TransitAspect, (transit: string, natal: string) => string> = {
  conjunction: (t, n) => `${t} merges energy with your natal ${n} \u2014 amplified presence and new beginnings.`,
  opposition: (t, n) => `${t} faces your natal ${n} across the sky \u2014 seek balance in tension.`,
  trine: (t, n) => `${t} flows harmoniously with your natal ${n} \u2014 grace and ease arrive.`,
  square: (t, n) => `${t} challenges your natal ${n} \u2014 friction that catalyzes growth.`,
  sextile: (t, n) => `${t} offers opportunity to your natal ${n} \u2014 a door opens if you reach for it.`,
};

// ── Helpers ──────────────────────────────────────────────────────────────

/** Convert zodiac sign name to midpoint ecliptic longitude. */
function signToMidpointLongitude(signName: string): number | null {
  const index = ZODIAC_SIGNS.findIndex(
    (s) => s.toLowerCase() === signName.toLowerCase()
  );
  if (index === -1) return null;
  return index * 30 + 15;
}

/** Angular difference on a circle, result in [0, 180]. */
function angularDifference(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Main function ────────────────────────────────────────────────────────

export function getPersonalTransits(
  natalPositions: Record<string, string>,
  startDate: Date,
  endDate: Date
): PersonalTransit[] {
  if (!natalPositions || Object.keys(natalPositions).length === 0) return [];

  // Convert natal positions to longitude midpoints
  const natalLongitudes: { planet: string; longitude: number }[] = [];
  for (const [planet, signName] of Object.entries(natalPositions)) {
    const lon = signToMidpointLongitude(signName);
    if (lon !== null) {
      natalLongitudes.push({ planet, longitude: lon });
    }
  }

  if (natalLongitudes.length === 0) return [];

  const dayMs = 86_400_000;
  // Track closest approach per (transit, natal, aspect) combination
  type AspectKey = string;
  const candidates = new Map<
    AspectKey,
    { date: Date; separation: number; transit: typeof TRANSIT_BODIES[number]; natal: typeof natalLongitudes[number]; aspect: typeof ASPECT_ANGLES[number] }
  >();

  const current = new Date(startDate);
  while (current <= endDate) {
    const astroTime = MakeTime(current);

    for (const transit of TRANSIT_BODIES) {
      const transitLon = getGeocentricLongitude(transit.body, astroTime);

      for (const natal of natalLongitudes) {
        // Don't compare a planet to itself
        if (transit.name.toLowerCase() === natal.planet.toLowerCase()) continue;

        const diff = angularDifference(transitLon, natal.longitude);

        for (const aspectDef of ASPECT_ANGLES) {
          const separation = Math.abs(diff - aspectDef.angle);
          if (separation <= aspectDef.orb) {
            const key = `${transit.name}-${natal.planet}-${aspectDef.aspect}`;
            const existing = candidates.get(key);
            if (!existing || separation < existing.separation) {
              candidates.set(key, {
                date: new Date(current),
                separation,
                transit,
                natal,
                aspect: aspectDef,
              });
            }
          }
        }
      }
    }

    current.setTime(current.getTime() + dayMs);
  }

  // Convert candidates to PersonalTransit events
  const events: PersonalTransit[] = [];
  for (const candidate of candidates.values()) {
    const { transit, natal, aspect, date } = candidate;
    const natalLabel = capitalizeFirst(natal.planet);
    const isMajor = MAJOR_NATAL_PLANETS.has(natal.planet.toLowerCase());

    events.push({
      date,
      transitPlanet: transit.name,
      natalPlanet: natalLabel,
      aspect: aspect.aspect,
      title: `${transit.name} ${ASPECT_LABELS[aspect.aspect]} your natal ${natalLabel}`,
      description: ASPECT_DESCRIPTIONS[aspect.aspect](transit.name, natalLabel),
      significance: isMajor ? "major" : "minor",
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
