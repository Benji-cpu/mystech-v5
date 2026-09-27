import { describe, it, expect } from "vitest";
import {
  resolveInvitation,
  type InvitationContext,
} from "./resolve-invitation";

function makeCtx(overrides: Partial<InvitationContext> = {}): InvitationContext {
  return {
    deckCount: 3,
    readingCount: 5,
    dailyCardDrawn: false,
    isPostInitiation: false,
    ...overrides,
  };
}

describe("resolveInvitation", () => {
  it("invites a deck when the user has none", () => {
    expect(resolveInvitation(makeCtx({ deckCount: 0 })).type).toBe("create-deck");
  });

  it("invites the first reading when a deck has never been read", () => {
    expect(resolveInvitation(makeCtx({ readingCount: 0 })).type).toBe("first-reading");
  });

  it("points a deck owner at today's card", () => {
    expect(resolveInvitation(makeCtx()).type).toBe("daily-card");
  });

  it("acknowledges a card already drawn today", () => {
    expect(resolveInvitation(makeCtx({ dailyCardDrawn: true })).type).toBe("daily-card-drawn");
  });

  it("create-deck beats everything", () => {
    expect(
      resolveInvitation(makeCtx({ deckCount: 0, readingCount: 0, dailyCardDrawn: true })).type
    ).toBe("create-deck");
  });

  it("prepends the post-initiation welcome", () => {
    const plain = resolveInvitation(makeCtx());
    const welcomed = resolveInvitation(makeCtx({ isPostInitiation: true }));
    expect(welcomed.greeting.length).toBeGreaterThan(plain.greeting.length);
    expect(welcomed.greeting.endsWith(plain.greeting)).toBe(true);
  });
});
