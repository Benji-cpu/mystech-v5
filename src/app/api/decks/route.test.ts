import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted state (accessible inside vi.mock factories) ---

const { mockGetCurrentUser, mockSelectResult } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockSelectResult: [] as unknown[],
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
  },
}));

vi.mock("@/lib/db/schema", () => ({
  decks: { userId: "user_id", updatedAt: "updated_at" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  desc: vi.fn(),
}));

// Import route handlers after mocks
import { GET } from "./route";

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
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
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
