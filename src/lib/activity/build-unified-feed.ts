import { getCelestialEvents } from "@/lib/astrology/celestial-events";
import { getPersonalTransits } from "@/lib/astrology/transit-aspects";
import type { ActivityItem, ActivityItemWithTemporal, AstrologyProfile } from "@/types";

type FeedOptions = {
  pastDays?: number;
  futureDays?: number;
  limit?: number;
};

export function buildUnifiedFeed(
  userItems: ActivityItem[],
  astroProfile: AstrologyProfile | null,
  options?: FeedOptions
): ActivityItemWithTemporal[] {
  const { pastDays = 30, futureDays = 14, limit = 25 } = options ?? {};

  const now = new Date();
  const rangeStart = new Date(now.getTime() - pastDays * 86_400_000);
  const rangeEnd = new Date(now.getTime() + futureDays * 86_400_000);

  // 1. Celestial events (universal)
  const celestialEvents = getCelestialEvents(rangeStart, rangeEnd);
  const celestialItems: ActivityItem[] = celestialEvents.map((evt) => {
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
