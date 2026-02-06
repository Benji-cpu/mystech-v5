import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks (must be before imports that use them) ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    transaction: (callback: (tx: unknown) => Promise<unknown>) => mockTransaction(callback),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id" },
  cards: {},
  deckMetadata: {},
}));

const mockGetUserDeckCount = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getUserDeckCount: () => mockGetUserDeckCount(),
}));

const mockGenerateObject = vi.fn();
vi.mock("ai", () => ({
  generateObject: (...args: unknown[]) => mockGenerateObject(...args),
}));

vi.mock("@/lib/ai/gemini", () => ({
  geminiModel: "mock-model",
}));

vi.mock("@/lib/ai/schemas", () => ({
  generatedDeckSchema: {},
}));

vi.mock("@/lib/ai/prompts/deck-generation", () => ({
  DECK_GENERATION_SYSTEM_PROMPT: "system prompt",
  buildDeckGenerationUserPrompt: vi.fn().mockReturnValue("user prompt"),
}));

vi.mock("@/lib/constants", () => ({
  PLAN_LIMITS: { free: { maxDecks: 2 } },
}));

// Import route handler after mocks are set up
import { POST } from "./route";

// --- Test helpers ---

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/ai/generate-deck", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function setupTransaction(deckId: string = "deck-1") {
  // Create a mock transaction context that mimics Drizzle's tx object
  const mockTx = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: deckId }]),
    }),
  };

  // Execute the callback with the mock tx and return its result
  mockTransaction.mockImplementation(async (callback) => {
    return await callback(mockTx);
  });

  return mockTx;
}

// --- Tests ---

describe("POST /api/ai/generate-deck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key");
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(makeRequest({ title: "Test", description: "Desc", cardCount: 5 }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 503 when API key is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");

    const res = await POST(makeRequest({ title: "Test", description: "Desc", cardCount: 5 }));
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toContain("AI service is not configured");
  });

  it("returns 400 when required fields are missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(makeRequest({ title: "Test" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("required");
  });

  it("returns 400 when cardCount is out of range", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(makeRequest({ title: "Test", description: "Desc", cardCount: 50 }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("between 1 and 30");
  });

  it("returns 403 when deck limit is reached", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserDeckCount.mockResolvedValue(2);

    const res = await POST(makeRequest({ title: "Test", description: "Desc", cardCount: 5 }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toContain("Deck limit reached");
  });

  it("returns 502 when AI generation fails after retries (no deck created)", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserDeckCount.mockResolvedValue(0);
    mockGenerateObject.mockRejectedValue(new Error("AI unavailable"));

    const res = await POST(makeRequest({ title: "Test", description: "Desc", cardCount: 3 }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toContain("Failed to generate cards");
    expect(mockGenerateObject).toHaveBeenCalledTimes(3);
    // Verify no transaction was started (no deck created on AI failure)
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("returns 201 with deckId on success (atomic transaction)", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserDeckCount.mockResolvedValue(0);
    const mockTx = setupTransaction("deck-1");

    mockGenerateObject.mockResolvedValue({
      object: {
        cards: [
          {
            cardNumber: 1,
            title: "Card 1",
            meaning: "Meaning",
            guidance: "Guidance",
            imagePrompt: "A scene",
          },
        ],
      },
    });

    const res = await POST(makeRequest({ title: "Test", description: "Desc", cardCount: 1 }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.deckId).toBe("deck-1");
    // Verify transaction was used for atomic operation
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // Verify all three inserts happened: deck, cards, metadata
    expect(mockTx.insert).toHaveBeenCalledTimes(3);
  });
});
