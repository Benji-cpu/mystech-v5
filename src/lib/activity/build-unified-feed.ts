import { getCelestialEvents } from "@/lib/astrology/celestial-events";
import { getPersonalTransits } from "@/lib/astrology/transit-aspects";
import type { ActivityItem, ActivityItemWithTemporal, AstrologyProfile } from "@/types";

type FeedOptions = {
  pastDays?: number;
  futureDays?: number;
  limit?: number;
  maxCelestialEvents?: number;
  maxPersonalTransits?: number;
};

// Significance order for celestial events — lower = more significant
const CELESTIAL_SIGNIFICANCE: Record<string, number> = {
  solar_eclipse: 0,
  lunar_eclipse: 0,
  retrograde_start: 1,
  retrograde_end: 1,
  full_moon: 2,
  new_moon: 2,
  equinox: 3,
  solstice: 3,
  spring_equinox: 3,
  summer_solstice: 3,
  autumn_equinox: 3,
  winter_solstice: 3,
  first_quarter: 4,
  last_quarter: 4,
};

export function buildUnifiedFeed(
  userItems: ActivityItem[],
  astroProfile: AstrologyProfile | null,
  options?: FeedOptions
): ActivityItemWithTemporal[] {
  const {
    pastDays = 30,
    futureDays = 14,
    limit = 25,
    maxCelestialEvents,
    maxPersonalTransits,
  } = options ?? {};

  const now = new Date();
  const rangeStart = new Date(now.getTime() - pastDays * 86_400_000);
  const rangeEnd = new Date(now.getTime() + futureDays * 86_400_000);

  // 1. Celestial events (universal)
  const celestialEvents = getCelestialEvents(rangeStart, rangeEnd);
  let celestialItems: ActivityItem[] = celestialEvents.map((evt) => {
    const dateStr = evt.date.toISOString().slice(0, 10);
    return {
      id: `celestial-${evt.type}-${dateStr}`,
      timestamp: evt.date,
      type: "celestial_event" as const,
      eventType: evt.type,
      title: evt.title,
      description: evt.description,
      zodiacSign: evt.zodiacSign,
      planet: evt.planet,
    };
  });

  // Limit celestial events by significance
  if (maxCelestialEvents != null && celestialItems.length > maxCelestialEvents) {
    celestialItems = celestialItems
      .sort((a, b) => {
        const sigA = CELESTIAL_SIGNIFICANCE[(a as { eventType: string }).eventType] ?? 5;
        const sigB = CELESTIAL_SIGNIFICANCE[(b as { eventType: string }).eventType] ?? 5;
        return sigA - sigB;
      })
      .slice(0, maxCelestialEvents)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // 2. Personal transits (only if user has astrology profile with positions)
  let transitItems: ActivityItem[] = [];
  if (astroProfile?.planetaryPositions) {
    const transits = getPersonalTransits(
      astroProfile.planetaryPositions,
      rangeStart,
      rangeEnd
    );
    transitItems = transits.map((t) => {
      const dateStr = t.date.toISOString().slice(0, 10);
      return {
        id: `transit-${t.transitPlanet}-${t.natalPlanet}-${t.aspect}-${dateStr}`,
        timestamp: t.date,
        type: "personal_transit" as const,
        transitPlanet: t.transitPlanet,
        natalPlanet: t.natalPlanet,
        aspect: t.aspect,
        title: t.title,
        description: t.description,
        significance: t.significance,
      };
    });

    if (maxPersonalTransits != null && transitItems.length > maxPersonalTransits) {
      transitItems = transitItems.slice(0, maxPersonalTransits);
    }
  }

  // 3. Merge all items
  const allItems: ActivityItem[] = [...userItems, ...celestialItems, ...transitItems];

  // 4. Tag with isFuture and split
  const nowMs = now.getTime();
  const tagged: ActivityItemWithTemporal[] = allItems.map((item) => ({
    ...item,
    isFuture: item.timestamp.getTime() > nowMs,
  }));

  // 5. Sort: future items ascending (soonest first), past items descending (most recent first)
  const futureItems = tagged
    .filter((i) => i.isFuture)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const pastItems = tagged
    .filter((i) => !i.isFuture)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Future first (soonest at top), then past (most recent at top)
  const merged = [...futureItems, ...pastItems];

  return merged.slice(0, limit);
}

/**
 * Split feed items into celestial events and user activities.
 */
export function splitFeedByCategory(items: ActivityItemWithTemporal[]): {
  celestial: ActivityItemWithTemporal[];
  activities: ActivityItemWithTemporal[];
} {
  const celestial: ActivityItemWithTemporal[] = [];
  const activities: ActivityItemWithTemporal[] = [];

  for (const item of items) {
    if (item.type === "celestial_event" || item.type === "personal_transit") {
      celestial.push(item);
    } else {
      activities.push(item);
    }
  }

  return { celestial, activities };
}
