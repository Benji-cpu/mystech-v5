import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockDbUpdate, mockStripe } = vi.hoisted(() => {
  const mockSetWhere = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn().mockReturnValue({ where: mockSetWhere });
  const mockDbUpdate = vi.fn().mockReturnValue({ set: mockSet });

  return {
    mockDbUpdate,
    mockStripe: {
      webhooks: {
        constructEvent: vi.fn(),
      },
      subscriptions: {
        retrieve: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    update: mockDbUpdate,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  subscriptions: {},
}));

vi.mock("@/lib/db/queries", () => ({
  getSubscriptionByStripeCustomerId: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  stripe: mockStripe,
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

import { POST } from "./route";

function makeWebhookRequest(event: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    body: JSON.stringify(event),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // No STRIPE_WEBHOOK_SECRET in test env, so signature verification is skipped
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("handles checkout.session.completed", async () => {
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [
          { current_period_start: 1700000000, current_period_end: 1702592000 },
        ],
      },
      cancel_at_period_end: false,
    });

    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    };

    const res = await POST(makeWebhookRequest(event));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("handles customer.subscription.updated", async () => {
    const event = {
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          items: {
            data: [
              { current_period_start: 1700000000, current_period_end: 1702592000 },
            ],
          },
          cancel_at_period_end: false,
        },
      },
    };

    const res = await POST(makeWebhookRequest(event));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("handles customer.subscription.deleted", async () => {
    const event = {
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "canceled",
          cancel_at_period_end: false,
        },
      },
    };

    const res = await POST(makeWebhookRequest(event));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("handles invoice.payment_failed", async () => {
    const event = {
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_123",
        },
      },
    };

    const res = await POST(makeWebhookRequest(event));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("handles invoice.paid", async () => {
    const event = {
      type: "invoice.paid",
      data: {
        object: {
          customer: "cus_123",
        },
      },
    };

    const res = await POST(makeWebhookRequest(event));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("returns 200 for unhandled event types", async () => {
    const event = {
      type: "some.other.event",
      data: { object: {} },
    };

    const res = await POST(makeWebhookRequest(event));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
  });
});
