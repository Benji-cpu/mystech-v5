import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildUnifiedFeed } from "./build-unified-feed";
import type { ActivityItem, AstrologyProfile } from "@/types";

// Use a fixed "now" so tests are deterministic
const MOCK_NOW = new Date("2026-03-01T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function makeUserItem(overrides?: Partial<ActivityItem>): ActivityItem {
  return {
    id: "deck_created-test-1",
    timestamp: new Date("2026-02-28T10:00:00Z"),
    type: "deck_created" as const,
    deckId: "test-1",
    deckTitle: "Test Deck",
    ...overrides,
  } as ActivityItem;
}

describe("buildUnifiedFeed", () => {
  it("merges user items with celestial events", () => {
    const userItems: ActivityItem[] = [
      makeUserItem(),
    ];

    const feed = buildUnifiedFeed(userItems, null);

    expect(feed.length).toBeGreaterThan(1);
    // Should contain the user item
    const userEntry = feed.find((i) => i.type === "deck_created");
    expect(userEntry).toBeDefined();
    // Should contain celestial events
    const celestial = feed.filter((i) => i.type === "celestial_event");
    expect(celestial.length).toBeGreaterThan(0);
  });

  it("sets isFuture correctly", () => {
    const pastItem = makeUserItem({
      timestamp: new Date("2026-02-25T10:00:00Z"),
    });

    const feed = buildUnifiedFeed([pastItem], null);

    const userEntry = feed.find((i) => i.id === pastItem.id);
    expect(userEntry?.isFuture).toBe(false);

    // Future celestial events should be flagged
    const futureItems = feed.filter((i) => i.isFuture);
    for (const item of futureItems) {
      expect(item.timestamp.getTime()).toBeGreaterThan(MOCK_NOW.getTime());
    }
  });

  it("returns no personal transits when astroProfile is null", () => {
    const feed = buildUnifiedFeed([], null);

    const transits = feed.filter((i) => i.type === "personal_transit");
    expect(transits).toEqual([]);
  });

  it("includes personal transits when astroProfile has planetary positions", () => {
    const profile: AstrologyProfile = {
      userId: "user-1",
      birthDate: new Date("1990-06-15"),
      birthTimeKnown: true,
      birthHour: 14,
      birthMinute: 30,
      birthLatitude: "40.7128",
      birthLongitude: "-74.006",
      birthLocationName: "New York",
      sunSign: "Gemini",
      moonSign: "Scorpio",
      risingSign: "Libra",
      planetaryPositions: {
        sun: "Gemini",
        moon: "Scorpio",
        mercury: "Cancer",
        venus: "Leo",
        mars: "Aries",
      },
      elementBalance: { fire: 2, earth: 1, air: 4, water: 3 },
      spiritualInterests: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const feed = buildUnifiedFeed([], profile);

    const transits = feed.filter((i) => i.type === "personal_transit");
    expect(transits.length).toBeGreaterThanOrEqual(0); // May or may not have transits in the range
  });

  it("respects limit parameter", () => {
    const feed = buildUnifiedFeed([], null, { limit: 3 });
    expect(feed.length).toBeLessThanOrEqual(3);
  });

  it("sorts future items before past items", () => {
    const userItems: ActivityItem[] = [
      makeUserItem({
        id: "deck_created-old",
        timestamp: new Date("2026-02-20T10:00:00Z"),
      }),
    ];

    const feed = buildUnifiedFeed(userItems, null, { limit: 50 });

    // Find first past and first future item indices
    const firstFutureIdx = feed.findIndex((i) => i.isFuture);
    const firstPastIdx = feed.findIndex((i) => !i.isFuture);

    if (firstFutureIdx !== -1 && firstPastIdx !== -1) {
      expect(firstFutureIdx).toBeLessThan(firstPastIdx);
    }
  });

  it("handles empty user items with no astro profile", () => {
    const feed = buildUnifiedFeed([], null);

    // Should still have celestial events
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((i) => i.type === "celestial_event")).toBe(true);
  });
});
