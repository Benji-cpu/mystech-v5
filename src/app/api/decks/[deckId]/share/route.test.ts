import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockGetDeckByIdForUser = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getDeckByIdForUser: (...args: unknown[]) =>
    mockGetDeckByIdForUser(...args),
}));

const mockUpdateWhere = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: (...args: unknown[]) => mockUpdateWhere(...args),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id", shareToken: "share_token" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  generateShareToken: () => "test-deck-token-456",
}));

import { POST, DELETE } from "./route";

// --- Helpers ---

const TEST_DECK = {
  id: "deck-1",
  userId: "user-1",
  title: "Test Deck",
  description: "Desc",
  theme: null,
  status: "completed",
  cardCount: 5,
  isPublic: false,
  shareToken: null,
  coverImageUrl: null,
  artStyleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeParams(deckId: string) {
  return { params: Promise.resolve({ deckId }) };
}

function makeRequest(method: string) {
  return new NextRequest(
    `http://localhost:3000/api/decks/deck-1/share`,
    { method }
  );
}

// --- Tests ---

describe("POST /api/decks/[deckId]/share", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(makeRequest("POST"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(null);

    const res = await POST(makeRequest("POST"), makeParams("nonexistent"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("rejects non-completed decks", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue({
      ...TEST_DECK,
      status: "draft",
    });

    const res = await POST(makeRequest("POST"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Only completed decks can be shared");
  });

  it("generates share token for completed deck", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await POST(makeRequest("POST"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.shareToken).toBe("test-deck-token-456");
    expect(json.data.shareUrl).toContain("/shared/deck/test-deck-token-456");
  });

  it("returns existing token if already shared", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue({
      ...TEST_DECK,
      shareToken: "existing-token",
    });

    const res = await POST(makeRequest("POST"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.shareToken).toBe("existing-token");
    expect(mockUpdateWhere).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/decks/[deckId]/share", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await DELETE(makeRequest("DELETE"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("revokes share token", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDeckByIdForUser.mockResolvedValue(TEST_DECK);
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await DELETE(makeRequest("DELETE"), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.revoked).toBe(true);
  });
});
