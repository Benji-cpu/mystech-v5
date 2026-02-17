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

  it("returns allowed when readings are available", async () => {
    // First call: isFirstReadingEver — count query returns 1 reading (not first ever)
    // Second call: count today's readings — returns 0
    // The mock returns the same array for all select().from().where() calls,
    // so we need to set up mock to return count of 0 for today
    // Since isFirstReadingEver checks count and gets the same mock, we need
    // both calls to work. Use a counter approach.

    const { db } = await import("@/lib/db");
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // isFirstReadingEver: user has readings => not first
            return Promise.resolve([{ count: 3 }]);
          }
          // checkDailyReadings: count today => 0
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

  it("returns not allowed when daily limit reached", async () => {
    const { db } = await import("@/lib/db");
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // isFirstReadingEver: user has readings => not first
            return Promise.resolve([{ count: 5 }]);
          }
          // checkDailyReadings: performed 1 today (free limit = 1)
          return Promise.resolve([{ count: 1 }]);
        }),
      }),
    }) as ReturnType<typeof db.select>);

    const result = await checkDailyReadings("user-1", "free");

    expect(result.allowed).toBe(false);
    expect(result.performedToday).toBe(1);
    expect(result.limit).toBe(1);
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
