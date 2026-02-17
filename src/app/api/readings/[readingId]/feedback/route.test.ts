import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockGetReadingByIdForUser = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getReadingByIdForUser: (...args: unknown[]) =>
    mockGetReadingByIdForUser(...args),
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
  readings: { id: "id", feedback: "feedback" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

import { POST, DELETE } from "./route";

// --- Helpers ---

const TEST_READING = {
  id: "reading-1",
  userId: "user-1",
  deckId: "deck-1",
  spreadType: "three_card",
  question: "Test?",
  interpretation: "Test interpretation",
  shareToken: null,
  feedback: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeParams(readingId: string) {
  return { params: Promise.resolve({ readingId }) };
}

function makeRequest(method: string, body?: Record<string, unknown>) {
  const init: Record<string, unknown> = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new NextRequest(
    `http://localhost:3000/api/readings/reading-1/feedback`,
    init as never
  );
}

// --- Tests ---

describe("POST /api/readings/[readingId]/feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(
      makeRequest("POST", { feedback: "positive" }),
      makeParams("reading-1")
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when reading not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(null);

    const res = await POST(
      makeRequest("POST", { feedback: "positive" }),
      makeParams("nonexistent")
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Reading not found");
  });

  it("rejects invalid feedback values", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(TEST_READING);

    const res = await POST(
      makeRequest("POST", { feedback: "invalid" }),
      makeParams("reading-1")
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid feedback");
  });

  it("sets positive feedback", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(TEST_READING);
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest("POST", { feedback: "positive" }),
      makeParams("reading-1")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.feedback).toBe("positive");
  });

  it("sets negative feedback", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(TEST_READING);
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest("POST", { feedback: "negative" }),
      makeParams("reading-1")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.feedback).toBe("negative");
  });
});

describe("DELETE /api/readings/[readingId]/feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await DELETE(
      makeRequest("DELETE"),
      makeParams("reading-1")
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("clears feedback", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue({
      ...TEST_READING,
      feedback: "positive",
    });
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await DELETE(
      makeRequest("DELETE"),
      makeParams("reading-1")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.feedback).toBe(null);
  });
});
