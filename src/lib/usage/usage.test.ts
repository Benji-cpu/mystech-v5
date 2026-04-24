import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted state (accessible inside vi.mock factories) ---

const { mockSelectResult, mockInsertResult } = vi.hoisted(() => ({
  mockSelectResult: [] as unknown[],
  mockInsertResult: [] as unknown[],
}));

// --- Mocks ---

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => Promise.resolve(mockSelectResult)),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockImplementation(() => Promise.resolve(mockInsertResult)),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  usageTracking: {
    userId: "user_id",
    periodStart: "period_start",
    periodEnd: "period_end",
    creditsUsed: "credits_used",
    id: "id",
  },
  readings: {
    userId: "user_id",
    createdAt: "created_at",
  },
  users: {
    id: "id",
    createdAt: "created_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  gte: vi.fn(),
  sql: vi.fn(),
  count: vi.fn(() => "count_fn"),
}));

// Import functions after mocks
import { checkCredits, checkDailyReadings, isFirstReadingEver } from "./usage";

// --- Tests ---

describe("checkCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectResult.length = 0;
    mockInsertResult.length = 0;
  });

  it("returns allowed=true when credits are available", async () => {
    // Mock getOrCreateUsageRecord: existing record with 3 credits used
    mockSelectResult.push({
      id: "usage-1",
      userId: "user-1",
      periodStart: new Date("2020-01-01"),
      periodEnd: new Date("2099-12-31"),
      creditsUsed: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkCredits("user-1", "free", 1);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(8); // 11 - 3
    expect(result.limit).toBe(11);
    expect(result.current).toBe(3);
  });

  it("returns allowed=false when insufficient credits", async () => {
    // Mock getOrCreateUsageRecord: existing record with 11 credits used (at limit)
    mockSelectResult.push({
      id: "usage-1",
      userId: "user-1",
      periodStart: new Date("2020-01-01"),
      periodEnd: new Date("2099-12-31"),
      creditsUsed: 11,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkCredits("user-1", "free", 1);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(11);
    expect(result.current).toBe(11);
  });

  it("admin always returns allowed=true with Infinity", async () => {
    const result = await checkCredits("admin-1", "admin", 100);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(Infinity);
    expect(result.limit).toBe(Infinity);
    expect(result.current).toBe(0);
  });

  it("returns allowed=false when requesting more than remaining", async () => {
    // 9 used out of 11 => 2 remaining, but requesting 3
    mockSelectResult.push({
      id: "usage-1",
      userId: "user-1",
      periodStart: new Date("2020-01-01"),
      periodEnd: new Date("2099-12-31"),
      creditsUsed: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkCredits("user-1", "free", 3);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(2);
    expect(result.limit).toBe(11);
    expect(result.current).toBe(9);
  });
});

describe("checkDailyReadings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectResult.length = 0;
    mockInsertResult.length = 0;
  });

  // Helper: user created long ago (outside welcome window)
  const oldUser = () => ({ createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
  // Helper: user created recently (inside welcome window)
  const newUser = () => ({ createdAt: new Date(Date.now() - 60 * 60 * 1000) });

  it("returns allowed when readings are available", async () => {
    const { db } = await import("@/lib/db");
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve([{ count: 3 }]); // isFirstReadingEver: not first
          if (callCount === 2) return Promise.resolve([oldUser()]); // user lookup: outside welcome window
          return Promise.resolve([{ count: 0 }]); // today's reading count
        }),
      }),
    }) as ReturnType<typeof db.select>);

    const result = await checkDailyReadings("user-1", "free");

    expect(result.allowed).toBe(true);
    expect(result.performedToday).toBe(0);
    expect(result.limit).toBe(1);
    expect(result.remaining).toBe(1);
    expect(result.inWelcomeWindow).toBe(false);
  });

  it("returns not allowed when daily limit reached", async () => {
    const { db } = await import("@/lib/db");
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve([{ count: 5 }]); // isFirstReadingEver: not first
          if (callCount === 2) return Promise.resolve([oldUser()]); // user lookup: outside welcome window
          return Promise.resolve([{ count: 1 }]); // performed 1 today (free limit = 1)
        }),
      }),
    }) as ReturnType<typeof db.select>);

    const result = await checkDailyReadings("user-1", "free");

    expect(result.allowed).toBe(false);
    expect(result.performedToday).toBe(1);
    expect(result.limit).toBe(1);
    expect(result.remaining).toBe(0);
  });

  it("welcome grant: free user within 24h of signup can perform 3 readings total", async () => {
    const { db } = await import("@/lib/db");
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve([{ count: 2 }]); // has 2 readings, not first ever
          if (callCount === 2) return Promise.resolve([newUser()]); // inside welcome window
          if (callCount === 3) return Promise.resolve([{ count: 2 }]); // 2 readings since signup
          return Promise.resolve([{ count: 2 }]); // today count for payload
        }),
      }),
    }) as ReturnType<typeof db.select>);

    const result = await checkDailyReadings("user-1", "free");

    expect(result.inWelcomeWindow).toBe(true);
    expect(result.limit).toBe(3);
    expect(result.remaining).toBe(1); // 3 - 2 = 1 left in welcome grant
    expect(result.allowed).toBe(true);
  });

  it("welcome grant exhausted: user did 3 readings in first 24h, further readings blocked in window", async () => {
    const { db } = await import("@/lib/db");
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve([{ count: 3 }]);
          if (callCount === 2) return Promise.resolve([newUser()]);
          if (callCount === 3) return Promise.resolve([{ count: 3 }]); // already used grant
          return Promise.resolve([{ count: 3 }]);
        }),
      }),
    }) as ReturnType<typeof db.select>);

    const result = await checkDailyReadings("user-1", "free");

    expect(result.inWelcomeWindow).toBe(true);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("admin always returns allowed with Infinity", async () => {
    const result = await checkDailyReadings("admin-1", "admin");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(Infinity);
    expect(result.limit).toBe(Infinity);
    expect(result.performedToday).toBe(0);
  });

  it("returns allowed when it is first reading ever (exemption)", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          // isFirstReadingEver: no readings at all
          return Promise.resolve([{ count: 0 }]);
        }),
      }),
    }) as ReturnType<typeof db.select>);

    const result = await checkDailyReadings("user-1", "free");

    expect(result.allowed).toBe(true);
    expect(result.performedToday).toBe(0);
    expect(result.limit).toBe(1);
    expect(result.remaining).toBe(1);
  });
});

describe("isFirstReadingEver", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSelectResult.length = 0;

    // Restore the default db.select mock (may have been overridden by checkDailyReadings tests)
    const { db } = await import("@/lib/db");
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => Promise.resolve(mockSelectResult)),
      }),
    } as ReturnType<typeof db.select>);
  });

  it("returns true when no readings exist", async () => {
    mockSelectResult.push({ count: 0 });

    const result = await isFirstReadingEver("user-1");

    expect(result).toBe(true);
  });

  it("returns false when readings exist", async () => {
    mockSelectResult.push({ count: 5 });

    const result = await isFirstReadingEver("user-1");

    expect(result).toBe(false);
  });
});
