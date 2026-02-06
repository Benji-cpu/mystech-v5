import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockSelect = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id", userId: "user_id" },
  deckMetadata: { deckId: "deck_id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

const mockGenerateObject = vi.fn();
vi.mock("ai", () => ({
  generateObject: (...args: unknown[]) => mockGenerateObject(...args),
}));

vi.mock("@/lib/ai/gemini", () => ({
  geminiModel: "mock-model",
}));

vi.mock("@/lib/ai/schemas", () => ({
  generatedCardSchema: {},
}));

const mockBuildCardRegenerationPrompt = vi
  .fn()
  .mockReturnValue("regen prompt");
vi.mock("@/lib/ai/prompts/journey-card-generation", () => ({
  buildCardRegenerationPrompt: (...args: unknown[]) =>
    mockBuildCardRegenerationPrompt(...args),
}));

import { POST } from "./route";

// --- Helpers ---

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest(
    "http://localhost:3000/api/decks/deck-1/drafts/replace",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
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

const TEST_ANCHORS = [
  { theme: "transitions", emotion: "bittersweet", symbol: "bridge" },
];

function setupDeckAndMetadata() {
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
                theme: "transitions",
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
              draftCards: TEST_DRAFT_CARDS,
              extractedAnchors: TEST_ANCHORS,
              conversationSummary: "A discussion about life",
            },
          ]),
        }),
      }),
    };
  });

  mockUpdate.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });
}

// --- Tests ---

describe("POST /api/decks/[deckId]/drafts/replace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(
      makeRequest({ cardNumber: 1 }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when cardNumber is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(makeRequest({}), makeParams("deck-1"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("cardNumber is required");
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

    const res = await POST(
      makeRequest({ cardNumber: 1 }),
      makeParams("deck-999")
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
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
                { id: "deck-1", userId: "user-1" },
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

    const res = await POST(
      makeRequest({ cardNumber: 1 }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck metadata not found");
  });

  it("returns 404 when cardNumber does not exist in drafts", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckAndMetadata();

    const res = await POST(
      makeRequest({ cardNumber: 99 }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Card not found");
  });

  it("returns 200 on success with regenerated card and previousVersion", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckAndMetadata();

    mockGenerateObject.mockResolvedValue({
      object: {
        cardNumber: 1,
        title: "The New Dawn",
        meaning: "Fresh starts",
        guidance: "Welcome the new",
        imagePrompt: "A sunrise over mountains",
      },
    });

    const res = await POST(
      makeRequest({ cardNumber: 1 }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.draftCards[0].title).toBe("The New Dawn");
    expect(json.data.draftCards[0].previousVersion).toEqual({
      title: "The First Frost",
      meaning: "New beginnings",
      guidance: "Embrace change",
      imagePrompt: "A frost-covered landscape",
    });
    // Card 2 should remain unchanged
    expect(json.data.draftCards[1].title).toBe("Summer's Peak");
    expect(mockBuildCardRegenerationPrompt).toHaveBeenCalled();
  });

  it("returns 502 when AI regeneration fails", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDeckAndMetadata();

    mockGenerateObject.mockRejectedValue(new Error("AI unavailable"));

    const res = await POST(
      makeRequest({ cardNumber: 1 }),
      makeParams("deck-1")
    );
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toContain("Failed to regenerate card");
  });
});
