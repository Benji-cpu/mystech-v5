import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted state (accessible inside vi.mock factories) ---

const { mockGetCurrentUser, mockGetUserPlan, mockGetOrCreateUsageRecord, mockCheckDailyReadings } =
  vi.hoisted(() => ({
    mockGetCurrentUser: vi.fn(),
    mockGetUserPlan: vi.fn(),
    mockGetOrCreateUsageRecord: vi.fn(),
    mockCheckDailyReadings: vi.fn(),
  }));

// --- Mocks ---

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db/queries", () => ({
  getUserPlan: () => mockGetUserPlan(),
}));

vi.mock("@/lib/usage/plans", () => ({
  getUserPlanFromRole: (role: string | undefined) => {
    if (role === "admin") return "admin";
    return "free";
  },
}));

vi.mock("@/lib/usage/usage", () => ({
  getOrCreateUsageRecord: () => mockGetOrCreateUsageRecord(),
  checkDailyReadings: () => mockCheckDailyReadings(),
}));

vi.mock("@/lib/constants", () => ({
  PLAN_LIMITS: {
    free: {
      credits: 11,
      creditsAreLifetime: true,
      readingsPerDay: 1,
      spreads: ["single", "three_card"],
      aiModel: "standard",
    },
    pro: {
      credits: 50,
      creditsAreLifetime: false,
      readingsPerDay: 5,
      spreads: ["single", "three_card", "five_card", "celtic_cross"],
      aiModel: "master_oracle",
    },
    admin: {
      credits: Infinity,
      creditsAreLifetime: false,
      readingsPerDay: Infinity,
      spreads: ["single", "three_card", "five_card", "celtic_cross"],
      aiModel: "master_oracle",
    },
  },
}));

// Import route handler after mocks
import { GET } from "./route";

// --- Tests ---

describe("GET /api/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns usage data for authenticated free user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" });
    mockGetUserPlan.mockResolvedValue("free");
    mockGetOrCreateUsageRecord.mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      periodStart: new Date("2020-01-01"),
      periodEnd: new Date("2099-12-31"),
      creditsUsed: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCheckDailyReadings.mockResolvedValue({
      allowed: true,
      remaining: 1,
      limit: 1,
      performedToday: 0,
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.plan).toBe("free");
    expect(json.data.credits.used).toBe(3);
    expect(json.data.credits.limit).toBe(11);
    expect(json.data.credits.remaining).toBe(8);
    expect(json.data.readings.usedToday).toBe(0);
    expect(json.data.readings.limitPerDay).toBe(1);
    expect(json.data.isLifetimeCredits).toBe(true);
  });

  it("returns admin usage data with unlimited values", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "admin-1", role: "admin" });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.plan).toBe("admin");
    expect(json.data.credits.used).toBe(0);
    expect(json.data.credits.limit).toBe(null); // Infinity serializes to null in JSON
    expect(json.data.credits.remaining).toBe(null); // Infinity serializes to null in JSON
    expect(json.data.readings.limitPerDay).toBe(null); // Infinity serializes to null in JSON
  });

  it("returns pro plan when subscription is active", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-2", role: "user" });
    mockGetUserPlan.mockResolvedValue("pro");
    mockGetOrCreateUsageRecord.mockResolvedValue({
      id: "usage-2",
      userId: "user-2",
      periodStart: new Date("2026-02-01"),
      periodEnd: new Date("2026-02-28"),
      creditsUsed: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCheckDailyReadings.mockResolvedValue({
      allowed: true,
      remaining: 4,
      limit: 5,
      performedToday: 1,
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.plan).toBe("pro");
    expect(json.data.credits.used).toBe(10);
    expect(json.data.credits.limit).toBe(50);
    expect(json.data.credits.remaining).toBe(40);
    expect(json.data.readings.usedToday).toBe(1);
    expect(json.data.readings.limitPerDay).toBe(5);
    expect(json.data.isLifetimeCredits).toBe(false);
  });
});
