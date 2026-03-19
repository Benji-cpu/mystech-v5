import { describe, it, expect } from "vitest";
import {
  resolveInvitation,
  type InvitationContext,
} from "./resolve-invitation";
import { resolveBelowFoldCards, type BelowFoldContext } from "./resolve-below-fold";

// ── Helpers ──────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<InvitationContext> = {}): InvitationContext {
  return {
    userName: "Benji",
    deckCount: 3,
    readingCount: 5,
    hasChronicle: true,
    completedChronicleToday: true,
    streakCount: 7,
    pathPosition: null,
    isPostInitiation: false,
    ...overrides,
  };
}

// ── resolveInvitation ────────────────────────────────────────────────

describe("resolveInvitation", () => {
  it("returns create-deck when user has no decks", () => {
    const result = resolveInvitation(makeCtx({ deckCount: 0 }));
    expect(result.type).toBe("create-deck");
    expect(result.ctaHref).toBe("/onboarding");
    expect(result.ctaLabel).toBe("Create Your Deck");
  });

  it("returns first-reading when user has decks but no readings", () => {
    const result = resolveInvitation(
      makeCtx({ deckCount: 2, readingCount: 0 })
    );
    expect(result.type).toBe("first-reading");
    expect(result.ctaHref).toBe("/readings/new");
    expect(result.ctaLabel).toBe("Draw the Cards");
  });

  it("returns chronicle when chronicle exists and not completed today", () => {
    const result = resolveInvitation(
      makeCtx({ hasChronicle: true, completedChronicleToday: false })
    );
    expect(result.type).toBe("chronicle");
    expect(result.ctaHref).toBe("/chronicle/today");
    expect(result.ctaLabel).toBe("Open Chronicle");
  });

  it("includes streak subtitle for chronicle with streak", () => {
    const result = resolveInvitation(
      makeCtx({
        hasChronicle: true,
        completedChronicleToday: false,
        streakCount: 12,
      })
    );
    expect(result.type).toBe("chronicle");
    expect(result.subtitle).toBe("12-day streak");
  });

  it("returns continue-path when user has active path", () => {
    const result = resolveInvitation(
      makeCtx({
        pathPosition: {
          pathName: "The Inner Mirror",
          waypointName: "Shadow Work",
        },
      })
    );
    expect(result.type).toBe("continue-path");
    expect(result.subtitle).toBe("The Inner Mirror");
    expect(result.ctaHref).toBe("/paths");
  });

  it("returns reflective as fallback", () => {
    const result = resolveInvitation(
      makeCtx({
        hasChronicle: true,
        completedChronicleToday: true,
        pathPosition: null,
      })
    );
    expect(result.type).toBe("reflective");
    expect(result.ctaHref).toBe("/readings/new");
  });

  it("prepends postInitiation greeting", () => {
    const result = resolveInvitation(
      makeCtx({ readingCount: 0, isPostInitiation: true })
    );
    expect(result.type).toBe("first-reading");
    // Should have longer greeting than the non-postInitiation version
    expect(result.greeting.length).toBeGreaterThan(20);
  });

  describe("priority cascade order", () => {
    it("create-deck beats first-reading", () => {
      const result = resolveInvitation(
        makeCtx({ deckCount: 0, readingCount: 0 })
      );
      expect(result.type).toBe("create-deck");
    });

    it("first-reading beats chronicle", () => {
      const result = resolveInvitation(
        makeCtx({
          readingCount: 0,
          hasChronicle: true,
          completedChronicleToday: false,
        })
      );
      expect(result.type).toBe("first-reading");
    });

    it("chronicle beats continue-path", () => {
      const result = resolveInvitation(
        makeCtx({
          hasChronicle: true,
          completedChronicleToday: false,
          pathPosition: {
            pathName: "The Inner Mirror",
            waypointName: "Shadow Work",
          },
        })
      );
      expect(result.type).toBe("chronicle");
    });

    it("continue-path beats reflective", () => {
      const result = resolveInvitation(
        makeCtx({
          pathPosition: {
            pathName: "The Inner Mirror",
            waypointName: "Shadow Work",
          },
        })
      );
      expect(result.type).toBe("continue-path");
    });
  });
});

// ── resolveBelowFoldCards ────────────────────────────────────────────

describe("resolveBelowFoldCards", () => {
  function makeBelowCtx(
    overrides: Partial<BelowFoldContext> = {}
  ): BelowFoldContext {
    return {
      draftDecks: [],
      pathPosition: null,
      completedChronicleToday: false,
      streakCount: 0,
      deckCount: 0,
      ...overrides,
    };
  }

  it("returns empty array when no context", () => {
    const result = resolveBelowFoldCards(makeBelowCtx());
    expect(result).toHaveLength(0);
  });

  it("includes draft-deck card", () => {
    const result = resolveBelowFoldCards(
      makeBelowCtx({
        draftDecks: [{ id: "d1", name: "My Draft" }],
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("draft-deck");
    expect(result[0].title).toBe("My Draft");
  });

  it("includes path-progress card", () => {
    const result = resolveBelowFoldCards(
      makeBelowCtx({
        pathPosition: {
          pathName: "The Inner Mirror",
          waypointName: "Shadow Work",
          retreatName: "Self-Reflection",
        },
      })
    );
    expect(result[0].type).toBe("path-progress");
  });

  it("includes chronicle-streak card when completed today", () => {
    const result = resolveBelowFoldCards(
      makeBelowCtx({
        completedChronicleToday: true,
        streakCount: 5,
      })
    );
    expect(result[0].type).toBe("chronicle-streak");
    expect(result[0].subtitle).toBe("5-day streak");
  });

  it("does not include chronicle-streak if not completed today", () => {
    const result = resolveBelowFoldCards(
      makeBelowCtx({
        completedChronicleToday: false,
        streakCount: 5,
      })
    );
    expect(result.find((c) => c.type === "chronicle-streak")).toBeUndefined();
  });

  it("caps at 3 cards maximum", () => {
    const result = resolveBelowFoldCards(
      makeBelowCtx({
        draftDecks: [{ id: "d1", name: "Draft" }],
        pathPosition: {
          pathName: "Path",
          waypointName: "WP",
          retreatName: "R",
        },
        completedChronicleToday: true,
        streakCount: 3,
        deckCount: 5,
      })
    );
    expect(result).toHaveLength(3);
  });

  it("prioritizes draft-deck over deck-overview", () => {
    const result = resolveBelowFoldCards(
      makeBelowCtx({
        draftDecks: [{ id: "d1", name: "Draft" }],
        pathPosition: {
          pathName: "Path",
          waypointName: "WP",
          retreatName: "R",
        },
        completedChronicleToday: true,
        streakCount: 3,
        deckCount: 5,
      })
    );
    // draft-deck, path-progress, chronicle-streak — deck-overview trimmed
    expect(result.map((c) => c.type)).toEqual([
      "draft-deck",
      "path-progress",
      "chronicle-streak",
    ]);
  });
});
