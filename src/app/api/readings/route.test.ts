import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the route
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getUserReadingsWithDeck: vi.fn(),
  getCardsForDeck: vi.fn(),
  getDeckByIdForUser: vi.fn(),
  getUserPlan: vi.fn().mockResolvedValue("free"),
}));

const mockCheckDailyReadings = vi.fn();
vi.mock("@/lib/usage", () => ({
  getUserPlanFromRole: (role: string) => role === "admin" ? "admin" : "free",
  checkDailyReadings: (...args: unknown[]) => mockCheckDailyReadings(...args),
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  readings: {},
  readingCards: {},
}));

import { GET, POST } from "./route";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserReadingsWithDeck,
  getCardsForDeck,
  getDeckByIdForUser,
} from "@/lib/db/queries";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

const mockUser = { id: "user-1", name: "Test User", email: "test@test.com", role: "user" };

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/readings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: daily readings available
  mockCheckDailyReadings.mockResolvedValue({
    allowed: true,
    remaining: 1,
    limit: 1,
    performedToday: 0,
  });
});

describe("GET /api/readings", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it("returns readings list for authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getUserReadingsWithDeck).mockResolvedValue([]);
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });
});

describe("POST /api/readings", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "three_card" }));
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it("returns 400 if deckId or spreadType missing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    const response = await POST(makeRequest({ deckId: "d1" }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 for invalid spread type", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "invalid" }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/invalid spread/i);
  });

  it("returns 403 when daily reading limit reached", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    mockCheckDailyReadings.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 1,
      performedToday: 1,
    });
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "three_card" }));
    const data = await response.json();
    expect(response.status).toBe(403);
    expect(data.error).toMatch(/daily reading/i);
  });

  it("returns 403 for pro-only spread on free tier", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "five_card" }));
    const data = await response.json();
    expect(response.status).toBe(403);
    expect(data.error).toMatch(/pro/i);
  });

  it("returns 404 if deck not found", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getDeckByIdForUser).mockResolvedValue(null as never);
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "three_card" }));
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });

  it("returns 400 if deck is not completed", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getDeckByIdForUser).mockResolvedValue({
      id: "d1",
      userId: "user-1",
      title: "Test",
      description: null,
      theme: null,
      status: "draft",
      deckType: "standard",
      cardCount: 10,
      isPublic: false,
      shareToken: null,
      coverImageUrl: null,
      artStyleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "three_card" }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/not completed/i);
  });

  it("returns 400 if deck has too few cards for spread", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getDeckByIdForUser).mockResolvedValue({
      id: "d1",
      userId: "user-1",
      title: "Test",
      description: null,
      theme: null,
      status: "completed",
      deckType: "standard",
      cardCount: 2,
      isPublic: false,
      shareToken: null,
      coverImageUrl: null,
      artStyleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getCardsForDeck).mockResolvedValue([
      { id: "c1", deckId: "d1", cardNumber: 1, title: "A", meaning: "m", guidance: "g", imageUrl: null, imageBlurData: null, imagePrompt: null, imageStatus: "pending", cardType: "general", originContext: null, chronicleEntryId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "c2", deckId: "d1", cardNumber: 2, title: "B", meaning: "m", guidance: "g", imageUrl: null, imageBlurData: null, imagePrompt: null, imageStatus: "pending", cardType: "general", originContext: null, chronicleEntryId: null, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const response = await POST(makeRequest({ deckId: "d1", spreadType: "three_card" }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/2 cards/);
  });

  it("creates reading successfully with valid input", async () => {
    const mockCards = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      deckId: "d1",
      cardNumber: i + 1,
      title: `Card ${i}`,
      meaning: "meaning",
      guidance: "guidance",
      imageUrl: null,
      imageBlurData: null,
      imagePrompt: null,
      imageStatus: "completed" as const,
      cardType: "general" as const,
      originContext: null,
      chronicleEntryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const mockReading = {
      id: "r1",
      userId: "user-1",
      deckId: "d1",
      spreadType: "three_card",
      question: "test?",
      interpretation: null,
      shareToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockReadingCards = [
      { id: "rc1", readingId: "r1", position: 0, positionName: "Past", cardId: "c0", personCardId: null, createdAt: new Date() },
      { id: "rc2", readingId: "r1", position: 1, positionName: "Present", cardId: "c1", personCardId: null, createdAt: new Date() },
      { id: "rc3", readingId: "r1", position: 2, positionName: "Future", cardId: "c2", personCardId: null, createdAt: new Date() },
    ];

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getDeckByIdForUser).mockResolvedValue({
      id: "d1",
      userId: "user-1",
      title: "Test Deck",
      description: null,
      theme: null,
      status: "completed",
      deckType: "standard",
      cardCount: 5,
      isPublic: false,
      shareToken: null,
      coverImageUrl: null,
      artStyleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getCardsForDeck).mockResolvedValue(mockCards);

    // Mock db.insert chain
    const returningMock1 = vi.fn().mockResolvedValue([mockReading]);
    const valuesMock1 = vi.fn().mockReturnValue({ returning: returningMock1 });
    const returningMock2 = vi.fn().mockResolvedValue(mockReadingCards);
    const valuesMock2 = vi.fn().mockReturnValue({ returning: returningMock2 });
    let callCount = 0;
    vi.mocked(db.insert).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return { values: valuesMock1 } as any;
      return { values: valuesMock2 } as any;
    });

    const response = await POST(
      makeRequest({ deckId: "d1", spreadType: "three_card", question: "test?" })
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.reading.id).toBe("r1");
    expect(data.data.cards).toHaveLength(3);
    expect(data.data.deck.title).toBe("Test Deck");
  });

  describe("multi-deck support (deckIds)", () => {
    const makeDeck = (id: string, title: string, cardCount: number) => ({
      id,
      userId: "user-1",
      title,
      description: null,
      theme: null,
      status: "completed" as const,
      deckType: "standard" as const,
      cardCount,
      isPublic: false,
      shareToken: null,
      coverImageUrl: null,
      artStyleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const makeCards = (deckId: string, count: number, startIndex = 0) =>
      Array.from({ length: count }, (_, i) => ({
        id: `${deckId}-c${startIndex + i}`,
        deckId,
        cardNumber: startIndex + i + 1,
        title: `Card ${startIndex + i}`,
        meaning: "meaning",
        guidance: "guidance",
        imageUrl: null,
        imageBlurData: null,
        imagePrompt: null,
        imageStatus: "completed" as const,
        cardType: "general" as const,
        originContext: null,
        chronicleEntryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    it("accepts deckIds array and merges card pools", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      // Two decks, each with 2 cards — combined pool = 4, enough for three_card
      vi.mocked(getDeckByIdForUser)
        .mockResolvedValueOnce(makeDeck("d1", "Deck 1", 2))
        .mockResolvedValueOnce(makeDeck("d2", "Deck 2", 2));
      vi.mocked(getCardsForDeck)
        .mockResolvedValueOnce(makeCards("d1", 2))
        .mockResolvedValueOnce(makeCards("d2", 2, 2));

      const mockReading = {
        id: "r1",
        userId: "user-1",
        deckId: "d1",
        spreadType: "three_card",
        question: null,
        interpretation: null,
        shareToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockReadingCards = [
        { id: "rc1", readingId: "r1", position: 0, positionName: "Past", cardId: "d1-c0", personCardId: null, createdAt: new Date() },
        { id: "rc2", readingId: "r1", position: 1, positionName: "Present", cardId: "d2-c2", personCardId: null, createdAt: new Date() },
        { id: "rc3", readingId: "r1", position: 2, positionName: "Future", cardId: "d1-c1", personCardId: null, createdAt: new Date() },
      ];

      let callCount = 0;
      vi.mocked(db.insert).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockReading]),
            }),
          } as any;
        }
        return {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(mockReadingCards),
          }),
        } as any;
      });

      const response = await POST(
        makeRequest({ deckIds: ["d1", "d2"], spreadType: "three_card" })
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.cards).toHaveLength(3);
      // getDeckByIdForUser called for each deck
      expect(getDeckByIdForUser).toHaveBeenCalledTimes(2);
      // getCardsForDeck called for each deck
      expect(getCardsForDeck).toHaveBeenCalledTimes(2);
    });

    it("returns 400 when no deckId or deckIds provided", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      const response = await POST(makeRequest({ spreadType: "three_card" }));
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toMatch(/required/i);
    });

    it("backward compat: single deckId still works", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getDeckByIdForUser).mockResolvedValue(makeDeck("d1", "Test", 5));
      vi.mocked(getCardsForDeck).mockResolvedValue(makeCards("d1", 5));

      const mockReading = {
        id: "r1",
        userId: "user-1",
        deckId: "d1",
        spreadType: "three_card",
        question: null,
        interpretation: null,
        shareToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockReadingCards = [
        { id: "rc1", readingId: "r1", position: 0, positionName: "Past", cardId: "d1-c0", personCardId: null, createdAt: new Date() },
        { id: "rc2", readingId: "r1", position: 1, positionName: "Present", cardId: "d1-c1", personCardId: null, createdAt: new Date() },
        { id: "rc3", readingId: "r1", position: 2, positionName: "Future", cardId: "d1-c2", personCardId: null, createdAt: new Date() },
      ];

      let callCount = 0;
      vi.mocked(db.insert).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockReading]),
            }),
          } as any;
        }
        return {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(mockReadingCards),
          }),
        } as any;
      });

      const response = await POST(
        makeRequest({ deckId: "d1", spreadType: "three_card" })
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it("returns 404 when one of multiple decks not found", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getDeckByIdForUser)
        .mockResolvedValueOnce(makeDeck("d1", "Deck 1", 5))
        .mockResolvedValueOnce(null as never);

      vi.mocked(getCardsForDeck).mockResolvedValue(makeCards("d1", 5));

      const response = await POST(
        makeRequest({ deckIds: ["d1", "d2"], spreadType: "three_card" })
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toMatch(/not found/i);
    });

    it("returns 400 when combined pool has too few cards", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getDeckByIdForUser)
        .mockResolvedValueOnce(makeDeck("d1", "Deck 1", 1))
        .mockResolvedValueOnce(makeDeck("d2", "Deck 2", 1));
      vi.mocked(getCardsForDeck)
        .mockResolvedValueOnce(makeCards("d1", 1))
        .mockResolvedValueOnce(makeCards("d2", 1, 1));

      const response = await POST(
        makeRequest({ deckIds: ["d1", "d2"], spreadType: "three_card" })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/2 cards/);
    });

    it("returns 400 when one deck is not completed", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getDeckByIdForUser)
        .mockResolvedValueOnce(makeDeck("d1", "Deck 1", 5))
        .mockResolvedValueOnce({
          ...makeDeck("d2", "Deck 2", 5),
          status: "draft" as const,
        });
      vi.mocked(getCardsForDeck).mockResolvedValue(makeCards("d1", 5));

      const response = await POST(
        makeRequest({ deckIds: ["d1", "d2"], spreadType: "three_card" })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/not completed/i);
    });
  });
});
