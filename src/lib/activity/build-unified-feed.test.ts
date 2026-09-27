import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildUnifiedFeed } from "./build-unified-feed";
import type { ActivityItem } from "@/types";

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
  it("returns the user's items, most recent first, flagged as past", () => {
    const older = makeUserItem({ id: "a", timestamp: new Date("2026-02-20T10:00:00Z") });
    const newer = makeUserItem({ id: "b", timestamp: new Date("2026-02-28T10:00:00Z") });

    const feed = buildUnifiedFeed([older, newer]);

    expect(feed.map((i) => i.id)).toEqual(["b", "a"]);
    expect(feed.every((i) => i.isFuture === false)).toBe(true);
  });

  it("respects the limit", () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeUserItem({ id: `d-${i}`, timestamp: new Date(MOCK_NOW.getTime() - i * 60_000) })
    );
    expect(buildUnifiedFeed(items, { limit: 3 })).toHaveLength(3);
  });

  it("handles an empty list", () => {
    expect(buildUnifiedFeed([])).toEqual([]);
  });
});
