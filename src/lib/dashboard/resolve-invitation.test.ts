import { describe, it, expect } from "vitest";
import {
  resolveInvitation,
  type InvitationContext,
} from "./resolve-invitation";

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
    lastChronicleCardTitle: null,
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

  it("includes contextual subtitle for chronicle with last card title", () => {
    const result = resolveInvitation(
      makeCtx({
        hasChronicle: true,
        completedChronicleToday: false,
        streakCount: 12,
        lastChronicleCardTitle: "The Mirror",
      })
    );
    expect(result.type).toBe("chronicle");
    expect(result.subtitle).toBe(
      "Last time, The Mirror guided your thread."
    );
  });

  it("omits subtitle for chronicle when no last card title", () => {
    const result = resolveInvitation(
      makeCtx({
        hasChronicle: true,
        completedChronicleToday: false,
        streakCount: 12,
        lastChronicleCardTitle: null,
      })
    );
    expect(result.type).toBe("chronicle");
    expect(result.subtitle).toBeUndefined();
  });

  it("returns continue-path when user has active path", () => {
    const result = resolveInvitation(
      makeCtx({
        pathPosition: {
          pathId: "path-1",
          pathName: "The Inner Mirror",
          waypointName: "Shadow Work",
        },
      })
    );
    expect(result.type).toBe("continue-path");
    expect(result.subtitle).toBe("The Inner Mirror");
    expect(result.ctaHref).toBe("/paths/path-1");
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
            pathId: "path-1",
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
            pathId: "path-1",
            pathName: "The Inner Mirror",
            waypointName: "Shadow Work",
          },
        })
      );
      expect(result.type).toBe("continue-path");
    });
  });
});

