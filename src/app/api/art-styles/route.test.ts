import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Hoisted state (accessible inside vi.mock factories) ---

const { mockGetCurrentUser, mockOwnStyles, mockSharedRows, mockInsertResult, selectCallCounter } =
  vi.hoisted(() => ({
    mockGetCurrentUser: vi.fn(),
    mockOwnStyles: [] as unknown[],
    mockSharedRows: [] as unknown[],
    mockInsertResult: [] as unknown[],
    selectCallCounter: { count: 0 },
  }));

// --- Mocks ---

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockImplementation(() => {
      selectCallCounter.count++;
      if (selectCallCounter.count % 2 === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockOwnStyles),
          }),
        };
      } else {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockSharedRows),
            }),
          }),
        };
      }
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(mockInsertResult),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  artStyles: { isPreset: "is_preset", createdBy: "created_by", id: "id" },
  artStyleShares: {
    styleId: "style_id",
    sharedWithUserId: "shared_with_user_id",
    accepted: "accepted",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  or: vi.fn(),
  and: vi.fn(),
}));

// Import route handlers after mocks
import { GET, POST } from "./route";

// --- Helpers ---

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/art-styles", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const PRESET_STYLE = {
  id: "tarot-classic",
  name: "Tarot Classic",
  description: "Traditional tarot",
  stylePrompt: "classical tarot art",
  previewImages: [],
  isPreset: true,
  createdBy: null,
  isPublic: true,
  shareToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// --- Tests ---

describe("GET /api/art-styles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOwnStyles.length = 0;
    mockSharedRows.length = 0;
    selectCallCounter.count = 0;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns presets and user styles", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockOwnStyles.push(PRESET_STYLE);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("POST /api/art-styles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertResult.length = 0;
    selectCallCounter.count = 0;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST(
      makePostRequest({ name: "Custom", description: "My style" })
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 400 when name is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(makePostRequest({ description: "My style" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("required");
  });

  it("returns 400 when description is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

    const res = await POST(makePostRequest({ name: "Custom" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("required");
  });

  it("returns 201 on successful creation", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockInsertResult.push({
      id: "custom-1",
      name: "Custom Style",
      description: "My custom style",
      stylePrompt: "My custom style",
      previewImages: [],
      isPreset: false,
      createdBy: "user-1",
      isPublic: false,
      shareToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(
      makePostRequest({ name: "Custom Style", description: "My custom style" })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Custom Style");
    expect(json.data.isPreset).toBe(false);
  });
});
