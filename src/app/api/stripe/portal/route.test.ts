import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetCurrentUser, mockGetUserSubscription, mockStripe } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetUserSubscription: vi.fn(),
  mockStripe: {
    billingPortal: {
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

vi.mock("@/lib/stripe/client", () => ({
  stripe: mockStripe,
}));

import { POST } from "./route";

describe("POST /api/stripe/portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when no subscription exists", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserSubscription.mockResolvedValue(null);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain("No subscription");
  });

  it("returns portal URL on success", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetUserSubscription.mockResolvedValue({
      id: "sub-1",
      stripeCustomerId: "cus_123",
    });

    mockStripe.billingPortal.sessions.create.mockResolvedValue({
      url: "https://billing.stripe.com/portal_123",
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe("https://billing.stripe.com/portal_123");
  });
});
