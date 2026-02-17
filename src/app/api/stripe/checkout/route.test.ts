import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetCurrentUser, mockGetUserSubscription, mockInsertResult, mockStripe } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetUserSubscription: vi.fn(),
  mockInsertResult: [] as unknown[],
  mockStripe: {
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db/queries", () => ({
  getUserSubscription: () => mockGetUserSubscription(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockImplementation(() => Promise.resolve(mockInsertResult)),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  subscriptions: {},
}));

vi.mock("@/lib/stripe/client", () => ({
  stripe: mockStripe,
}));

vi.mock("@/lib/stripe/plans", () => ({
  STRIPE_PRO_PRICE_ID: "price_test_123",
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

import { POST } from "./route";

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertResult.length = 0;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("creates customer and returns checkout URL for new user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    mockGetUserSubscription.mockResolvedValue(null);
    mockStripe.customers.create.mockResolvedValue({ id: "cus_123" });

    const newSub = {
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      plan: "free",
      status: "active",
    };
    mockInsertResult.push(newSub);

    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe("https://checkout.stripe.com/session_123");
    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: "test@test.com",
      metadata: { userId: "user-1" },
    });
  });

  it("uses existing subscription record for returning user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    mockGetUserSubscription.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_existing",
      plan: "free",
      status: "active",
    });

    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session_456",
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe("https://checkout.stripe.com/session_456");
    expect(mockStripe.customers.create).not.toHaveBeenCalled();
  });

  it("returns 400 if already pro", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    mockGetUserSubscription.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_existing",
      plan: "pro",
      status: "active",
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Already subscribed");
  });
});
