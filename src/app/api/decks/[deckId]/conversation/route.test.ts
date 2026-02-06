import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockSelect = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id", userId: "user_id" },
  conversations: { deckId: "deck_id", createdAt: "created_at" },
  deckMetadata: { deckId: "deck_id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  asc: vi.fn(),
}));

const mockBuildReadinessFromAnchors = vi.fn();
vi.mock("@/lib/ai/prompts/conversation", () => ({
  buildReadinessFromAnchors: (...args: unknown[]) =>
    mockBuildReadinessFromAnchors(...args),
}));

import { GET } from "./route";

// --- Helpers ---

function makeRequest() {
  return new NextRequest(
    "http://localhost:3000/api/decks/deck-1/conversation",
    { method: "GET" }
  );
}

function makeParams(deckId: string) {
  return { params: Promise.resolve({ deckId }) };
}

const TEST_ANCHORS = [
  { theme: "transitions", emotion: "bittersweet", symbol: "bridge" },
  { theme: "growth", emotion: "hope", symbol: "seedling" },
];

const TEST_DRAFT_CARDS = [
  {
    cardNumber: 1,
    title: "The First Frost",
    meaning: "New beginnings",
    guidance: "Embrace change",
    imagePrompt: "A frost-covered landscape",
  },
];

// --- Tests ---

describe("GET /api/decks/[deckId]/conversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when deck not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    // Deck query returns empty
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await GET(makeRequest(), makeParams("deck-999"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("returns 200 with empty conversation history for new deck", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockBuildReadinessFromAnchors.mockReturnValue(
      "Let's begin exploring your theme..."
    );

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        // Deck query
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "deck-1", userId: "user-1", cardCount: 10 },
              ]),
            }),
          }),
        };
      }

      if (selectCallCount === 2) {
        // Conversations query
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }

      // Metadata query
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
    });

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.messages).toEqual([]);
    expect(json.data.readiness.anchorsFound).toBe(0);
    expect(json.data.readiness.isReady).toBe(false);
  });

  it("returns 200 with messages, readiness state, and draft cards", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockBuildReadinessFromAnchors.mockReturnValue(
      "Rich material is taking shape."
    );

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "deck-1", userId: "user-1", cardCount: 10 },
              ]),
            }),
          }),
        };
      }

      if (selectCallCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([
                {
                  id: "msg-1",
                  deckId: "deck-1",
                  role: "user",
                  content: "I love autumn",
                  createdAt: new Date("2024-01-01"),
                },
                {
                  id: "msg-2",
                  deckId: "deck-1",
                  role: "assistant",
                  content: "Tell me more",
                  createdAt: new Date("2024-01-01"),
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
                extractedAnchors: TEST_ANCHORS,
                draftCards: TEST_DRAFT_CARDS,
                conversationSummary: "A discussion about transitions",
                isReady: false,
              },
            ]),
          }),
        }),
      };
    });

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.messages).toHaveLength(2);
    expect(json.data.messages[0].content).toBe("I love autumn");
    expect(json.data.readiness.anchorsFound).toBe(2);
    expect(json.data.draftCards).toHaveLength(1);
    expect(json.data.conversationSummary).toBe(
      "A discussion about transitions"
    );
  });

  it("calculates isReady=true when anchors >= 70% of targetCards", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockBuildReadinessFromAnchors.mockReturnValue("Ready!");

    const sevenAnchors = Array.from({ length: 7 }, (_, i) => ({
      theme: `theme-${i}`,
      emotion: `emotion-${i}`,
      symbol: `symbol-${i}`,
    }));

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "deck-1", userId: "user-1", cardCount: 10 },
              ]),
            }),
          }),
        };
      }

      if (selectCallCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
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
                extractedAnchors: sevenAnchors,
                draftCards: [],
                conversationSummary: null,
                isReady: true,
              },
            ]),
          }),
        }),
      };
    });

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.data.readiness.isReady).toBe(true);
    expect(json.data.readiness.anchorsFound).toBe(7);
  });

  it("calculates isReady=false when anchors < 70% of targetCards", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockBuildReadinessFromAnchors.mockReturnValue("Still exploring...");

    const threeAnchors = Array.from({ length: 3 }, (_, i) => ({
      theme: `theme-${i}`,
      emotion: `emotion-${i}`,
      symbol: `symbol-${i}`,
    }));

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "deck-1", userId: "user-1", cardCount: 10 },
              ]),
            }),
          }),
        };
      }

      if (selectCallCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
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
                extractedAnchors: threeAnchors,
                draftCards: [],
                conversationSummary: null,
                isReady: false,
              },
            ]),
          }),
        }),
      };
    });

    const res = await GET(makeRequest(), makeParams("deck-1"));
    const json = await res.json();

    expect(json.data.readiness.isReady).toBe(false);
    expect(json.data.readiness.anchorsFound).toBe(3);
  });
});
