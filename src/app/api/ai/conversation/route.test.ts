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
const mockDelete = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { id: "id", userId: "user_id" },
  conversations: {},
  deckMetadata: { deckId: "deck_id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

const mockStreamText = vi.fn();
const mockGenerateObject = vi.fn();
vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
  generateObject: (...args: unknown[]) => mockGenerateObject(...args),
  stepCountIs: vi.fn().mockReturnValue("step-count-mock"),
}));

vi.mock("@/lib/ai/gemini", () => ({
  geminiModel: "mock-model",
}));

vi.mock("@/lib/ai/schemas", () => ({
  extractedAnchorsSchema: {},
}));

vi.mock("@/lib/ai/prompts/conversation", () => ({
  JOURNEY_CONVERSATION_SYSTEM_PROMPT: "You are a wise mystic guide",
  buildAnchorExtractionPrompt: vi.fn().mockReturnValue("extraction prompt"),
  buildReadinessFromAnchors: vi.fn().mockReturnValue("readiness text"),
}));

vi.mock("@/lib/ai/tools/journey-tools", () => ({
  journeyTools: { enter_edit_mode: {}, update_card: {}, restart_journey: {} },
}));

import { POST } from "./route";

// --- Helpers ---

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/ai/conversation", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function setupStreamTextMock() {
  const mockResponse = {
    toUIMessageStreamResponse: vi.fn().mockReturnValue(
      new Response("stream data", { status: 200 })
    ),
  };
  mockStreamText.mockReturnValue(mockResponse);
  return mockResponse;
}

function setupDbMocks() {
  // Deck query
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
                cardCount: 10,
              },
            ]),
          }),
        }),
      };
    }

    // Metadata query
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              deckId: "deck-1",
              draftCards: [],
              conversationSummary: "",
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

  mockDelete.mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });
}

// --- Tests ---

describe("POST /api/ai/conversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key");
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(
      makeRequest({
        deckId: "deck-1",
        messages: [{ role: "user", content: "hello" }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 503 when API key is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");

    const res = await POST(
      makeRequest({
        deckId: "deck-1",
        messages: [{ role: "user", content: "hello" }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toContain("AI service is not configured");
  });

  it("returns 400 when deckId is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "hello" }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("deckId and messages are required");
  });

  it("returns 400 when messages is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(makeRequest({ deckId: "deck-1" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("deckId and messages are required");
  });

  it("returns 404 when deck not found (ownership check)", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await POST(
      makeRequest({
        deckId: "deck-999",
        messages: [{ role: "user", content: "hello" }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Deck not found");
  });

  it("returns 200 and calls streamText with correct parameters", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDbMocks();
    const mockResponse = setupStreamTextMock();

    const messages = [
      { role: "user", content: "I love autumn" },
      { role: "assistant", content: "Tell me more" },
      { role: "user", content: "The colors remind me of change" },
    ];

    const res = await POST(makeRequest({ deckId: "deck-1", messages }));

    expect(res.status).toBe(200);
    expect(mockStreamText).toHaveBeenCalledTimes(1);

    const streamCallArgs = mockStreamText.mock.calls[0][0];
    expect(streamCallArgs.model).toBe("mock-model");
    expect(streamCallArgs.system).toContain("wise mystic guide");
    expect(streamCallArgs.messages).toHaveLength(3);
    expect(streamCallArgs.tools).toBeDefined();
    expect(mockResponse.toUIMessageStreamResponse).toHaveBeenCalled();
  });

  it("invokes onFinish callback to save messages and extract anchors", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    setupDbMocks();

    // Capture the onFinish callback
    let capturedOnFinish: ((result: { text: string; toolCalls?: unknown[] }) => Promise<void>) | undefined;
    mockStreamText.mockImplementation((opts: { onFinish?: (result: { text: string; toolCalls?: unknown[] }) => Promise<void> }) => {
      capturedOnFinish = opts.onFinish;
      return {
        toUIMessageStreamResponse: vi.fn().mockReturnValue(
          new Response("stream data", { status: 200 })
        ),
      };
    });

    mockGenerateObject.mockResolvedValue({
      object: {
        anchors: [
          { theme: "autumn", emotion: "nostalgia", symbol: "falling leaf" },
        ],
        summary: "Explored autumn memories",
        readinessAssessment: "Just beginning",
      },
    });

    const messages = [
      { role: "user", content: "I love autumn" },
    ];

    await POST(makeRequest({ deckId: "deck-1", messages }));

    // Invoke the captured onFinish callback
    expect(capturedOnFinish).toBeDefined();
    await capturedOnFinish!({ text: "Tell me more about autumn.", toolCalls: undefined });

    // Verify user message was saved
    expect(mockInsert).toHaveBeenCalledTimes(2); // user message + assistant message
    // Verify anchor extraction was triggered
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    // Verify metadata was updated with extracted anchors
    expect(mockUpdate).toHaveBeenCalled();
  });
});
