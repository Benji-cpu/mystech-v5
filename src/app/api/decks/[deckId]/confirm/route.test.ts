import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id", userId: "user_id" },
  cards: {},
  deckMetadata: { deckId: "deck_id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

import { POST } from "./route";

// --- Helpers ---

function makeRequest(body: Record<string, unknown> = {}) {
  return new NextRequest("http://localhost:3000/api/decks/deck-1/confirm", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeParams(deckId: string) {
  return { params: Promise.resolve({ deckId }) };
}

const TEST_DRAFT_CARDS = [
  {
    cardNumber: 1,
    title: "The First Frost",
    meaning: "New beginnings",
    guidance: "Embrace change",
    imagePrompt: "A frost-covered landscape",
  },
  {
    cardNumber: 2,
    title: "Summer's Peak",
    meaning: "The fullness of life",
    guidance: "Savor this moment",
    imagePrompt: "A sun-drenched meadow",
  },
];

function setupDeckMetadataAndDb(overrides?: {
  deckStatus?: string;
  draftCards?: unknown[];
}) {
  let selectCallCount = 0;
  mockSelect.mockImplementation(() => {
    selectCallCount++;

    if (selectCallCount === 1) {
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "deck-1",
                userId: "user-1",
                title: "Test Deck",
                status: overrides?.deckStatus ?? "draft",
                artStyleId: "style-1",
              },
            ]),
          }),
        }),
      };
    }

    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              deckId: "deck-1",
              draftCards: overrides?.draftCards ?? TEST_DRAFT_CARDS,
            },
          ]),
        }),
      }),
    };
  });

  mockInsert.mockReturnValue({
    values: vi.fn().mockResolvedValue(undefined),
  });

  mockUpdate.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });
}

// --- Tests ---

describe("POST /api/decks/[deckId]/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global fetch for fire-and-forget image generation trigger
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("ok"))
    );
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await POST(makeRequest(), makeParams("deck-999"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("returns 400 when deck status is not draft", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckMetadataAndDb({ deckStatus: "completed" });

    const res = await POST(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("not in draft status");
  });

  it("returns 404 when metadata not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: "deck-1",
                  userId: "user-1",
                  status: "draft",
                  artStyleId: "style-1",
                },
              ]),
            }),
          }),
        };
      }

      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
    });

    const res = await POST(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck metadata not found");
  });

  it("returns 400 when draftCards is empty", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckMetadataAndDb({ draftCards: [] });

    const res = await POST(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("No draft cards to finalize");
  });

  it("returns 200 on success — inserts cards, updates deck status, clears drafts", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckMetadataAndDb();

    const res = await POST(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deckId).toBe("deck-1");

    // Verify card insert was called
    expect(mockInsert).toHaveBeenCalledTimes(1);

    // Verify deck status update and metadata update
    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });

  it("triggers image generation via fetch on success", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckMetadataAndDb();

    await POST(makeRequest(), makeParams("deck-1"));

    // Verify fire-and-forget fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/ai/generate-images-batch"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ deckId: "deck-1" }),
      })
    );
  });

  it("returns 500 when database insert fails", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: "deck-1",
                  userId: "user-1",
                  status: "draft",
                  artStyleId: "style-1",
                },
              ]),
            }),
          }),
        };
      }

      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { deckId: "deck-1", draftCards: TEST_DRAFT_CARDS },
            ]),
          }),
        }),
      };
    });

    mockInsert.mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error("DB error")),
    });

    const res = await POST(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain("Failed to finalize deck");
  });
});
