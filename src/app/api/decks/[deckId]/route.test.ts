import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockGetDeckByIdForUser = vi.fn();
const mockGetCardsForDeck = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getDeckByIdForUser: (...args: unknown[]) => mockGetDeckByIdForUser(...args),
  getCardsForDeck: (...args: unknown[]) => mockGetCardsForDeck(...args),
}));

const mockUpdateReturning = vi.fn();
const mockDeleteWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: (...args: unknown[]) => mockUpdateReturning(...args),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: (...args: unknown[]) => mockDeleteWhere(...args),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id" },
  cards: {},
}));

const mockDel = vi.fn();
vi.mock("@vercel/blob", () => ({
  del: (...args: unknown[]) => mockDel(...args),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

// Import route handlers after mocks
import { GET, PATCH, DELETE } from "./route";

// --- Helpers ---

const TEST_DECK = {
  id: "deck-1",
  userId: "user-1",
  title: "Test Deck",
  description: "Desc",
  theme: null,
  status: "completed",
  cardCount: 2,
  isPublic: false,
  coverImageUrl: null,
  artStyleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const TEST_CARDS = [
  {
    id: "card-1",
    deckId: "deck-1",
    cardNumber: 1,
    title: "Card 1",
    meaning: "Meaning 1",
    guidance: "Guidance 1",
    imageUrl: "https://blob.vercel-storage.com/img1.png",
    imagePrompt: "prompt 1",
    imageStatus: "completed",
    createdAt: new Date(),
  },
];

function makeParams(deckId: string) {
  return { params: Promise.resolve({ deckId }) };
}

function makeRequest(method: string, body?: Record<string, unknown>) {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new NextRequest(`http://localhost:3000/api/decks/deck-1`, init);
}

// --- Tests ---

describe("GET /api/decks/[deckId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET(makeRequest("GET"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(null);

    const res = await GET(makeRequest("GET"), makeParams("nonexistent"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("returns deck with cards on success", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockGetCardsForDeck.mockResolvedValue(TEST_CARDS);

    const res = await GET(makeRequest("GET"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("Test Deck");
    expect(json.data.cards).toHaveLength(1);
  });
});

describe("PATCH /api/decks/[deckId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await PATCH(
      makeRequest("PATCH", { title: "Updated" }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(null);

    const res = await PATCH(
      makeRequest("PATCH", { title: "Updated" }),
      makeParams("nonexistent")
    );
    const json = await res.json();

    expect(res.status).toBe(404);
  });

  it("returns updated deck on success", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockUpdateReturning.mockResolvedValue([
      { ...TEST_DECK, title: "Updated Title" },
    ]);

    const res = await PATCH(
      makeRequest("PATCH", { title: "Updated Title" }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe("Updated Title");
  });
});

describe("DELETE /api/decks/[deckId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await DELETE(makeRequest("DELETE"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(null);

    const res = await DELETE(makeRequest("DELETE"), makeParams("nonexistent"));
    const json = await res.json();

    expect(res.status).toBe(404);
  });

  it("deletes deck and cleans up blob images", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockGetCardsForDeck.mockResolvedValue(TEST_CARDS);
    mockDel.mockResolvedValue(undefined);
    mockDeleteWhere.mockResolvedValue(undefined);

    const res = await DELETE(makeRequest("DELETE"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.deleted).toBe(true);
    expect(mockDel).toHaveBeenCalledWith([
      "https://blob.vercel-storage.com/img1.png",
    ]);
  });

  it("still deletes deck if blob cleanup fails", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockGetCardsForDeck.mockResolvedValue(TEST_CARDS);
    mockDel.mockRejectedValue(new Error("Blob error"));
    mockDeleteWhere.mockResolvedValue(undefined);

    const res = await DELETE(makeRequest("DELETE"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.deleted).toBe(true);
  });
});
