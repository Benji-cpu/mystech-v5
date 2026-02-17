import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the route
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getReadingByIdForUser: vi.fn(),
  getReadingCardsWithData: vi.fn(),
  getUserReadingContext: vi.fn(() => ({
    contextSummary: null,
    recentReadings: [],
    deckThemes: [],
  })),
  getUserReadingLength: vi.fn(() => "brief"),
}));

vi.mock("@/lib/ai/context-compression", () => ({
  maybeCompressUserContext: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  readings: {},
}));

vi.mock("@/lib/ai/gemini", () => ({
  geminiFreeModel: "mock-model",
}));

const mockStreamResult = {
  toTextStreamResponse: vi.fn(() => new Response("streamed", { status: 200 })),
};

vi.mock("ai", () => ({
  streamText: vi.fn(() => mockStreamResult),
}));

import { POST } from "./route";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
} from "@/lib/db/queries";
import { streamText } from "ai";
import { NextRequest } from "next/server";

const mockUser = { id: "user-1", name: "Test User", email: "test@test.com", role: "user" };

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/ai/reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/ai/reading", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(makeRequest({ readingId: "r1" }));
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toMatch(/unauthorized/i);
  });

  it("returns 400 if readingId is missing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    const response = await POST(makeRequest({}));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/readingId/i);
  });

  it("returns 404 if reading not found", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getReadingByIdForUser).mockResolvedValue(null as never);
    const response = await POST(makeRequest({ readingId: "r1" }));
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });

  it("returns 400 if reading has no cards", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getReadingByIdForUser).mockResolvedValue({
      id: "r1",
      userId: "user-1",
      deckId: "d1",
      spreadType: "three_card",
      question: "test?",
      interpretation: null,
      shareToken: null,
      feedback: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getReadingCardsWithData).mockResolvedValue([]);
    const response = await POST(makeRequest({ readingId: "r1" }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/no cards/i);
  });

  it("streams response for valid request", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getReadingByIdForUser).mockResolvedValue({
      id: "r1",
      userId: "user-1",
      deckId: "d1",
      spreadType: "three_card",
      question: "What should I focus on?",
      interpretation: null,
      shareToken: null,
      feedback: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getReadingCardsWithData).mockResolvedValue([
      {
        id: "rc1",
        readingId: "r1",
        position: 0,
        positionName: "Past",
        cardId: "c1",
        personCardId: null,
        createdAt: new Date(),
        card: {
          id: "c1",
          deckId: "d1",
          cardNumber: 1,
          title: "The River",
          meaning: "Change and flow",
          guidance: "Let go",
          imageUrl: null,
          imagePrompt: null,
          imageStatus: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "rc2",
        readingId: "r1",
        position: 1,
        positionName: "Present",
        cardId: "c2",
        personCardId: null,
        createdAt: new Date(),
        card: {
          id: "c2",
          deckId: "d1",
          cardNumber: 2,
          title: "The Hearth",
          meaning: "Warmth",
          guidance: "Find comfort",
          imageUrl: null,
          imagePrompt: null,
          imageStatus: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "rc3",
        readingId: "r1",
        position: 2,
        positionName: "Future",
        cardId: "c3",
        personCardId: null,
        createdAt: new Date(),
        card: {
          id: "c3",
          deckId: "d1",
          cardNumber: 3,
          title: "The Star",
          meaning: "Hope",
          guidance: "Trust the light",
          imageUrl: null,
          imagePrompt: null,
          imageStatus: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]);

    const response = await POST(makeRequest({ readingId: "r1" }));

    expect(response.status).toBe(200);
    expect(streamText).toHaveBeenCalledOnce();
    expect(mockStreamResult.toTextStreamResponse).toHaveBeenCalledOnce();

    // Verify streamText was called with correct params
    const streamCall = vi.mocked(streamText).mock.calls[0][0];
    expect(streamCall.system).toBeDefined();
    expect(streamCall.prompt).toContain("The River");
    expect(streamCall.prompt).toContain("What should I focus on?");
    expect(streamCall.onFinish).toBeDefined();
  });
});
