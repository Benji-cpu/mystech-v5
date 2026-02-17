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
  readings: { id: "id", shareToken: "share_token" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  generateShareToken: () => "test-token-123",
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

function makeRequest(method: string) {
  return new NextRequest(
    `http://localhost:3000/api/readings/reading-1/share`,
    { method }
  );
}

// --- Tests ---

describe("POST /api/readings/[readingId]/share", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(makeRequest("POST"), makeParams("reading-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when reading not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(null);

    const res = await POST(makeRequest("POST"), makeParams("nonexistent"));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Reading not found");
  });

  it("generates share token and returns URL", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(TEST_READING);
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await POST(makeRequest("POST"), makeParams("reading-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.shareToken).toBe("test-token-123");
    expect(json.data.shareUrl).toContain("/shared/reading/test-token-123");
  });

  it("returns existing token if already shared", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue({
      ...TEST_READING,
      shareToken: "existing-token",
    });

    const res = await POST(makeRequest("POST"), makeParams("reading-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.shareToken).toBe("existing-token");
    expect(mockUpdateWhere).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/readings/[readingId]/share", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await DELETE(makeRequest("DELETE"), makeParams("reading-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("revokes share token", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetReadingByIdForUser.mockResolvedValue(TEST_READING);
    mockUpdateWhere.mockResolvedValue(undefined);

    const res = await DELETE(makeRequest("DELETE"), makeParams("reading-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.revoked).toBe(true);
  });
});
