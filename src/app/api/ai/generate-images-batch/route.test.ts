import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Hoisted state ---

const {
  mockGetCurrentUser,
  mockGetDeckByIdForUser,
  mockGetArtStyleById,
  mockGetUserPlan,
  mockGenerateCardImage,
  mockCheckCredits,
  mockIncrementCredits,
  mockLogGeneration,
  selectCallCounter,
  pendingCards,
  failedCards,
  staleCards,
  allCards,
} = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetDeckByIdForUser: vi.fn(),
  mockGetArtStyleById: vi.fn(),
  mockGetUserPlan: vi.fn().mockResolvedValue("free"),
  mockGenerateCardImage: vi.fn(),
  mockCheckCredits: vi.fn(),
  mockIncrementCredits: vi.fn(),
  mockLogGeneration: vi.fn(),
  selectCallCounter: { count: 0 },
  pendingCards: [] as unknown[],
  failedCards: [] as unknown[],
  staleCards: [] as unknown[],
  allCards: [] as unknown[],
}));

// --- Mocks ---

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db/queries", () => ({
  getDeckByIdForUser: (...args: unknown[]) => mockGetDeckByIdForUser(...args),
  getArtStyleById: (...args: unknown[]) => mockGetArtStyleById(...args),
  getUserPlan: () => mockGetUserPlan(),
}));

const mockUpdateSet = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockImplementation(() => {
      selectCallCounter.count++;
      const count = selectCallCounter.count;
      // Calls 1-3 have .from().where().orderBy() chain
      if (count <= 3) {
        const resultSet =
          count === 1 ? pendingCards : count === 2 ? failedCards : staleCards;
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(resultSet),
            }),
          }),
        };
      }
      // Call 4: .from().where() only (allCards check)
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(allCards),
        }),
      };
    }),
    update: vi.fn().mockImplementation(() => ({
      set: (...args: unknown[]) => {
        mockUpdateSet(...args);
        return {
          where: (...wArgs: unknown[]) => {
            mockUpdateWhere(...wArgs);
            return Promise.resolve();
          },
        };
      },
    })),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  cards: {
    id: "id",
    deckId: "deck_id",
    imageStatus: "image_status",
    imageUrl: "image_url",
    cardNumber: "card_number",
    updatedAt: "updated_at",
    imagePrompt: "image_prompt",
  },
  decks: { id: "id", status: "status" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  lt: vi.fn(),
  asc: vi.fn(),
}));

vi.mock("@/lib/ai/image-generation", () => ({
  generateCardImage: (...args: unknown[]) => mockGenerateCardImage(...args),
}));

vi.mock("@/lib/ai/logging", () => ({
  logGeneration: (...args: unknown[]) => mockLogGeneration(...args),
}));

vi.mock("@/lib/usage", () => ({
  getUserPlanFromRole: (role: string) => (role === "admin" ? "admin" : "free"),
  checkCredits: (...args: unknown[]) => mockCheckCredits(...args),
  incrementCredits: (...args: unknown[]) => mockIncrementCredits(...args),
}));

vi.mock("@/lib/constants", () => ({
  STALE_GENERATION_TIMEOUT_MS: 2 * 60 * 1000,
  ART_STYLE_PRESETS: [],
}));

// Import route handler after mocks
import { POST } from "./route";
import { db } from "@/lib/db";

// --- Helpers ---

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest(
    "http://localhost:3000/api/ai/generate-images-batch",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
}

const TEST_DECK = {
  id: "deck-1",
  userId: "user-1",
  title: "Test Deck",
  status: "generating",
  cardCount: 3,
  coverImageUrl: null,
  artStyleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeCard(
  id: string,
  cardNumber: number,
  imageStatus: string,
  imageUrl: string | null = null
) {
  return {
    id,
    deckId: "deck-1",
    cardNumber,
    title: `Card ${cardNumber}`,
    meaning: "Meaning",
    guidance: "Guidance",
    imagePrompt: `prompt for card ${cardNumber}`,
    imageStatus,
    imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// --- Tests ---

describe("POST /api/ai/generate-images-batch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STABILITY_AI_API_KEY", "test-key");
    selectCallCounter.count = 0;
    pendingCards.length = 0;
    failedCards.length = 0;
    staleCards.length = 0;
    allCards.length = 0;
    mockCheckCredits.mockResolvedValue({
      allowed: true,
      remaining: 50,
      limit: 50,
      current: 0,
    });
    mockIncrementCredits.mockResolvedValue(undefined);
    mockLogGeneration.mockResolvedValue(undefined);
    mockGetArtStyleById.mockResolvedValue(null);
  });

  // --- Guard tests ---

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 503 when STABILITY_AI_API_KEY is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    vi.stubEnv("STABILITY_AI_API_KEY", "");

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toContain("not configured");
  });

  it("returns 400 when deckId missing from body", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });

    const res = await POST(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("deckId");
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(null);

    const res = await POST(makeRequest({ deckId: "nonexistent" }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("returns 403 when insufficient credits", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    pendingCards.push(makeCard("c1", 1, "pending"));
    mockCheckCredits.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 5,
      current: 5,
    });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toContain("credits");
  });

  // --- Core stale recovery ---

  it("returns processed:0 when no cards need processing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    // All three selects return empty

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.processed).toBe(0);
    expect(mockGenerateCardImage).not.toHaveBeenCalled();
  });

  it("includes stale generating cards in processing batch", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    // pending and failed empty, stale has 1 card
    staleCards.push(makeCard("c1", 1, "generating"));
    // allCards for final resolution check
    allCards.push(makeCard("c1", 1, "completed", "url1"));

    mockGenerateCardImage.mockResolvedValue({
      success: true,
      imageUrl: "url1",
    });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.processed).toBe(1);
    expect(mockGenerateCardImage).toHaveBeenCalledTimes(1);
  });

  it("combines pending, failed, and stale cards into one batch", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    pendingCards.push(makeCard("c1", 1, "pending"));
    failedCards.push(makeCard("c2", 2, "failed"));
    staleCards.push(makeCard("c3", 3, "generating"));
    allCards.push(
      makeCard("c1", 1, "completed", "url1"),
      makeCard("c2", 2, "completed", "url2"),
      makeCard("c3", 3, "completed", "url3")
    );

    mockGenerateCardImage.mockResolvedValue({
      success: true,
      imageUrl: "url",
    });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(mockGenerateCardImage).toHaveBeenCalledTimes(3);
    expect(json.data.processed).toBe(3);
  });

  // --- Processing results ---

  it("counts failed image generations separately", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    pendingCards.push(makeCard("c1", 1, "pending"), makeCard("c2", 2, "pending"));
    allCards.push(
      makeCard("c1", 1, "completed", "url1"),
      makeCard("c2", 2, "failed")
    );

    mockGenerateCardImage
      .mockResolvedValueOnce({ success: true, imageUrl: "url1" })
      .mockResolvedValueOnce({ success: false, error: "Generation failed" });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(json.data.processed).toBe(1);
    expect(json.data.failed).toBe(1);
  });

  it("marks deck completed when all cards resolved", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    pendingCards.push(makeCard("c1", 1, "pending"));
    allCards.push(
      makeCard("c1", 1, "completed", "url1"),
      makeCard("c2", 2, "completed", "url2")
    );

    mockGenerateCardImage.mockResolvedValue({
      success: true,
      imageUrl: "url1",
    });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(json.success).toBe(true);
    // Deck completion update
    expect(db.update).toHaveBeenCalled();
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
      })
    );
  });

  it("increments credits only for successful images", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    pendingCards.push(
      makeCard("c1", 1, "pending"),
      makeCard("c2", 2, "pending"),
      makeCard("c3", 3, "pending")
    );
    allCards.push(
      makeCard("c1", 1, "completed", "url1"),
      makeCard("c2", 2, "completed", "url2"),
      makeCard("c3", 3, "failed")
    );

    mockGenerateCardImage
      .mockResolvedValueOnce({ success: true, imageUrl: "url1" })
      .mockResolvedValueOnce({ success: true, imageUrl: "url2" })
      .mockResolvedValueOnce({ success: false, error: "Failed" });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    await res.json();

    // Only 2 succeeded
    expect(mockIncrementCredits).toHaveBeenCalledWith("user-1", "free", 2);
  });

  it("logs generation with correct status and counts", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    pendingCards.push(makeCard("c1", 1, "pending"));
    allCards.push(makeCard("c1", 1, "completed", "url1"));

    mockGenerateCardImage.mockResolvedValue({
      success: true,
      imageUrl: "url1",
    });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    await res.json();

    expect(mockLogGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        deckId: "deck-1",
        operationType: "image_generation",
        modelUsed: "imagen",
        status: "success",
      })
    );
    // Duration should be a number
    const logCall = mockLogGeneration.mock.calls[0][0];
    expect(typeof logCall.durationMs).toBe("number");
  });
});
