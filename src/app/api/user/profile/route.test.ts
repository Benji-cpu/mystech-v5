import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Hoisted state ---

const { mockGetCurrentUser, mockGetUserProfile, mockUpdateUserProfile } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetUserProfile: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
}));

// --- Mocks ---

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db/queries", () => ({
  getUserProfile: (userId: string) => mockGetUserProfile(userId),
  updateUserProfile: (userId: string, data: Record<string, unknown>) =>
    mockUpdateUserProfile(userId, data),
}));

// Import route handlers after mocks
import { GET, PATCH } from "./route";

// --- Helpers ---

function makePatchRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const mockProfile = {
  id: "user-1",
  name: "Test User",
  displayName: null,
  email: "test@example.com",
  image: "https://example.com/avatar.jpg",
  bio: null,
  role: "user",
  createdAt: new Date("2024-01-15"),
};

// --- Tests ---

describe("GET /api/user/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 404 when user not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserProfile.mockResolvedValue(null);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it("returns 200 with profile data", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserProfile.mockResolvedValue(mockProfile);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Test User");
    expect(json.data.email).toBe("test@example.com");
  });
});

describe("PATCH /api/user/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest({ displayName: "New Name" }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 400 when bio exceeds 500 characters", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const longBio = "a".repeat(501);
    const res = await PATCH(makePatchRequest({ bio: longBio }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("500");
  });

  it("returns 400 when displayName exceeds 100 characters", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const longName = "a".repeat(101);
    const res = await PATCH(makePatchRequest({ displayName: longName }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("100");
  });

  it("updates displayName successfully", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const updated = { ...mockProfile, displayName: "New Name" };
    mockUpdateUserProfile.mockResolvedValue(updated);

    const res = await PATCH(makePatchRequest({ displayName: "New Name" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.displayName).toBe("New Name");
    expect(mockUpdateUserProfile).toHaveBeenCalledWith("user-1", {
      displayName: "New Name",
    });
  });

  it("updates bio successfully", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const updated = { ...mockProfile, bio: "My bio" };
    mockUpdateUserProfile.mockResolvedValue(updated);

    const res = await PATCH(makePatchRequest({ bio: "My bio" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.bio).toBe("My bio");
  });

  it("stores empty displayName as null", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const updated = { ...mockProfile, displayName: null };
    mockUpdateUserProfile.mockResolvedValue(updated);

    const res = await PATCH(makePatchRequest({ displayName: "" }));
    await res.json();

    expect(mockUpdateUserProfile).toHaveBeenCalledWith("user-1", {
      displayName: null,
    });
  });

  it("trims and collapses spaces in displayName", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const updated = { ...mockProfile, displayName: "John Doe" };
    mockUpdateUserProfile.mockResolvedValue(updated);

    const res = await PATCH(makePatchRequest({ displayName: "  John   Doe  " }));
    await res.json();

    expect(mockUpdateUserProfile).toHaveBeenCalledWith("user-1", {
      displayName: "John Doe",
    });
  });
});
