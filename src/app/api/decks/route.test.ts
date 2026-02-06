import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Hoisted state (accessible inside vi.mock factories) ---

const { mockGetCurrentUser, mockSelectResult, mockInsertResult, mockGetUserDeckCount } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockSelectResult: [] as unknown[],
  mockInsertResult: [] as unknown[],
  mockGetUserDeckCount: vi.fn(),
}));

// --- Mocks ---

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockImplementation(() => Promise.resolve(mockSelectResult)),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockImplementation(() => Promise.resolve(mockInsertResult)),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { userId: "user_id", updatedAt: "updated_at" },
}));

vi.mock("@/lib/db/queries", () => ({
  getUserDeckCount: () => mockGetUserDeckCount(),
}));

vi.mock("@/lib/constants", () => ({
  PLAN_LIMITS: { free: { maxDecks: 2 } },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  desc: vi.fn(),
}));

// Import route handlers after mocks
import { GET, POST } from "./route";

// --- Helpers ---

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/decks", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// --- Tests ---

describe("GET /api/decks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectResult.length = 0;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns user decks on success", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockSelectResult.push({
      id: "deck-1",
      userId: "user-1",
      title: "My Deck",
      description: "Desc",
      theme: null,
      status: "completed",
      cardCount: 5,
      isPublic: false,
      coverImageUrl: null,
      artStyleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].title).toBe("My Deck");
  });
});

describe("POST /api/decks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertResult.length = 0;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(makePostRequest({ title: "Test" }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 403 when deck limit reached", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserDeckCount.mockResolvedValue(2);

    const res = await POST(makePostRequest({ title: "Test" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toContain("Deck limit");
  });

  it("returns 400 when title is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserDeckCount.mockResolvedValue(0);

    const res = await POST(makePostRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Title is required");
  });

  it("returns 201 on successful creation", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserDeckCount.mockResolvedValue(0);
    mockInsertResult.push({
      id: "deck-new",
      userId: "user-1",
      title: "New Deck",
      description: null,
      theme: null,
      status: "draft",
      cardCount: 0,
      isPublic: false,
      coverImageUrl: null,
      artStyleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(makePostRequest({ title: "New Deck" }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("New Deck");
  });
});
