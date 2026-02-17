import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Hoisted state ---

const { mockGetCurrentUser, mockGetAllUserImageUrls, mockDeleteUser, mockDel } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetAllUserImageUrls: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockDel: vi.fn(),
}));

// --- Mocks ---

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db/queries", () => ({
  getAllUserImageUrls: (userId: string) => mockGetAllUserImageUrls(userId),
  deleteUser: (userId: string) => mockDeleteUser(userId),
}));

vi.mock("@vercel/blob", () => ({
  del: (...args: unknown[]) => mockDel(...args),
}));

// Import route handler after mocks
import { DELETE } from "./route";

// --- Helpers ---

function makeDeleteRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/user/account", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// --- Tests ---

describe("DELETE /api/user/account", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await DELETE(makeDeleteRequest({ confirmation: "DELETE" }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 400 with wrong confirmation text", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const res = await DELETE(makeDeleteRequest({ confirmation: "delete" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("DELETE");
  });

  it("returns 400 with missing confirmation", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const res = await DELETE(makeDeleteRequest({}));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("DELETE");
  });

  it("deletes user successfully", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetAllUserImageUrls.mockResolvedValue(["https://blob.example.com/img1.png"]);
    mockDel.mockResolvedValue(undefined);
    mockDeleteUser.mockResolvedValue(undefined);

    const res = await DELETE(makeDeleteRequest({ confirmation: "DELETE" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deleted).toBe(true);
    expect(mockDel).toHaveBeenCalledWith(["https://blob.example.com/img1.png"]);
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
  });

  it("still succeeds if blob cleanup fails", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetAllUserImageUrls.mockResolvedValue(["https://blob.example.com/img1.png"]);
    mockDel.mockRejectedValue(new Error("Blob error"));
    mockDeleteUser.mockResolvedValue(undefined);

    const res = await DELETE(makeDeleteRequest({ confirmation: "DELETE" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deleted).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
  });
});
