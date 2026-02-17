import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Timestamps ---

const THREE_MINUTES_AGO = new Date(Date.now() - 3 * 60 * 1000);
const ONE_MINUTE_AGO = new Date(Date.now() - 1 * 60 * 1000);

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockGetDeckByIdForUser = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getDeckByIdForUser: (...args: unknown[]) => mockGetDeckByIdForUser(...args),
}));

const mockSelectResult: unknown[] = [];
const mockUpdateSet = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => mockSelectResult),
      }),
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
  },
  decks: { id: "id", status: "status" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  lt: vi.fn(),
}));

vi.mock("@/lib/constants", () => ({
  STALE_GENERATION_TIMEOUT_MS: 2 * 60 * 1000,
}));

// Import route handler after mocks
import { GET } from "./route";
import { db } from "@/lib/db";

// --- Helpers ---

function makeParams(deckId: string) {
  return { params: Promise.resolve({ deckId }) };
}

function makeRequest() {
  return new NextRequest(
    "http://localhost:3000/api/decks/deck-1/image-status",
    { method: "GET" }
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

// --- Tests ---

describe("GET /api/decks/[deckId]/image-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectResult.length = 0;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(null);

    const res = await GET(makeRequest(), makeParams("nonexistent"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("returns correct counts when all cards completed", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue({
      ...TEST_DECK,
      status: "completed",
    });
    mockSelectResult.push(
      { id: "c1", imageStatus: "completed", imageUrl: "url1", cardNumber: 1, updatedAt: new Date() },
      { id: "c2", imageStatus: "completed", imageUrl: "url2", cardNumber: 2, updatedAt: new Date() }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual({
      pending: 0,
      generating: 0,
      completed: 2,
      failed: 0,
      total: 2,
    });
    // No stale recovery update should happen
    expect(db.update).not.toHaveBeenCalled();
  });

  it("returns correct counts with mixed statuses, no stale cards", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockSelectResult.push(
      { id: "c1", imageStatus: "completed", imageUrl: "url1", cardNumber: 1, updatedAt: new Date() },
      { id: "c2", imageStatus: "generating", imageUrl: null, cardNumber: 2, updatedAt: ONE_MINUTE_AGO },
      { id: "c3", imageStatus: "pending", imageUrl: null, cardNumber: 3, updatedAt: new Date() }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.data).toEqual({
      pending: 1,
      generating: 1,
      completed: 1,
      failed: 0,
      total: 3,
    });
    // Card is only 1 min old, no recovery
    expect(db.update).not.toHaveBeenCalled();
  });

  it("auto-recovers stale generating cards to failed", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockSelectResult.push(
      { id: "c1", imageStatus: "completed", imageUrl: "url1", cardNumber: 1, updatedAt: new Date() },
      { id: "c2", imageStatus: "generating", imageUrl: null, cardNumber: 2, updatedAt: THREE_MINUTES_AGO },
      { id: "c3", imageStatus: "generating", imageUrl: null, cardNumber: 3, updatedAt: THREE_MINUTES_AGO }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    // Stale cards recovered to failed
    expect(json.data.generating).toBe(0);
    expect(json.data.failed).toBe(2);
    expect(json.data.completed).toBe(1);
    // db.update called for stale recovery + deck completion
    expect(db.update).toHaveBeenCalled();
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ imageStatus: "failed" })
    );
  });

  it("does not recover generating cards within the timeout", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockSelectResult.push(
      { id: "c1", imageStatus: "generating", imageUrl: null, cardNumber: 1, updatedAt: ONE_MINUTE_AGO }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.data.generating).toBe(1);
    expect(json.data.failed).toBe(0);
    // No stale recovery
    expect(mockUpdateSet).not.toHaveBeenCalledWith(
      expect.objectContaining({ imageStatus: "failed" })
    );
  });

  it("marks deck as completed when all cards resolved and deck was generating", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue({
      ...TEST_DECK,
      status: "generating",
    });
    mockSelectResult.push(
      { id: "c1", imageStatus: "completed", imageUrl: "url1", cardNumber: 2, updatedAt: new Date() },
      { id: "c2", imageStatus: "completed", imageUrl: "url2", cardNumber: 1, updatedAt: new Date() },
      { id: "c3", imageStatus: "failed", imageUrl: null, cardNumber: 3, updatedAt: new Date() }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.success).toBe(true);
    // Deck completion update should use cover from lowest cardNumber completed card
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        coverImageUrl: "url2", // cardNumber 1 has lowest number
      })
    );
  });

  it("marks deck completed after stale recovery resolves all remaining cards", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue({
      ...TEST_DECK,
      status: "generating",
    });
    // One completed, one stale generating (will become failed after recovery)
    mockSelectResult.push(
      { id: "c1", imageStatus: "completed", imageUrl: "url1", cardNumber: 1, updatedAt: new Date() },
      { id: "c2", imageStatus: "generating", imageUrl: null, cardNumber: 2, updatedAt: THREE_MINUTES_AGO }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.success).toBe(true);
    // db.update called twice: once for stale cards recovery, once for deck completion
    expect(db.update).toHaveBeenCalledTimes(2);
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ imageStatus: "failed" })
    );
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" })
    );
  });

  it("does not mark deck completed when deck status is already completed", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetDeckByIdForUser.mockResolvedValue({
      ...TEST_DECK,
      status: "completed",
    });
    mockSelectResult.push(
      { id: "c1", imageStatus: "completed", imageUrl: "url1", cardNumber: 1, updatedAt: new Date() },
      { id: "c2", imageStatus: "failed", imageUrl: null, cardNumber: 2, updatedAt: new Date() }
    );

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.success).toBe(true);
    // Deck is already completed, no update should happen
    expect(db.update).not.toHaveBeenCalled();
    expect(mockUpdateSet).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" })
    );
  });
});
