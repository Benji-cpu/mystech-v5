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
      { id: "c1", deckId: "d1", cardNumber: 1, title: "A", meaning: "m", guidance: "g", imageUrl: null, imagePrompt: null, imageStatus: "pending", createdAt: new Date(), updatedAt: new Date() },
      { id: "c2", deckId: "d1", cardNumber: 2, title: "B", meaning: "m", guidance: "g", imageUrl: null, imagePrompt: null, imageStatus: "pending", createdAt: new Date(), updatedAt: new Date() },
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
      imagePrompt: null,
      imageStatus: "completed" as const,
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
});
