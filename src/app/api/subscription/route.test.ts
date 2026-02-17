import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetCurrentUser, mockGetUserPlan, mockGetUserSubscription } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetUserPlan: vi.fn(),
  mockGetUserSubscription: vi.fn(),
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  isAdmin: (user: { role?: string }) => user.role === "admin",
}));

vi.mock("@/lib/db/queries", () => ({
  getUserPlan: () => mockGetUserPlan(),
  getUserSubscription: () => mockGetUserSubscription(),
}));

import { GET } from "./route";

describe("GET /api/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns admin plan for admin users", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "admin" });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.plan).toBe("admin");
  });

  it("returns free plan for user without subscription", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetUserPlan.mockResolvedValue("free");
    mockGetUserSubscription.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.plan).toBe("free");
    expect(json.status).toBe("active");
  });

  it("returns pro plan for subscribed user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetUserPlan.mockResolvedValue("pro");
    mockGetUserSubscription.mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date("2025-02-01"),
      cancelAtPeriodEnd: false,
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.plan).toBe("pro");
    expect(json.status).toBe("active");
    expect(json.cancelAtPeriodEnd).toBe(false);
  });
});
