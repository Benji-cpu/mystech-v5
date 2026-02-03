# Feature 17: Stripe Billing

## Overview
Stripe integration for subscription management. Users can upgrade from Free to Pro ($4.99/mo) via Stripe Checkout, manage their subscription via Stripe Billing Portal, and the app handles webhook events for subscription lifecycle changes.

## User Stories
- As a free user, I want to upgrade to Pro when I hit a limit
- As a pro user, I want to manage my subscription (cancel, update payment)
- As a user, I want my plan to change immediately when I subscribe or cancel
- As the app, I need to track subscription status for limit enforcement

## Requirements

### Must Have
- [ ] Stripe client setup with test keys (live keys stored separately)
- [ ] Stripe Checkout session creation for Pro upgrade
- [ ] Stripe Billing Portal redirect for subscription management
- [ ] Webhook handler for subscription events
- [ ] Subscription record in database tracking plan status
- [ ] Plan detection: check user's current plan (free or pro)
- [ ] Stripe product + price created for Pro plan

### Nice to Have
- [ ] Trial period (7-day free trial of Pro)
- [ ] Annual billing option
- [ ] Promo codes / coupon support

## UI/UX

### Upgrade Flow
1. User hits a limit (e.g., "You've used all 5 readings this month")
2. Upgrade prompt shows Pro benefits and price
3. Clicks "Upgrade to Pro" → redirected to Stripe Checkout
4. Completes payment → redirected back to app
5. App recognizes Pro status immediately (webhook + redirect callback)

### Billing Page (`/settings/billing`)
```
┌────────────────────────────────────────────┐
│ Subscription & Billing                     │
│                                            │
│ Current Plan: Pro ✨                       │
│ Status: Active                             │
│ Next billing: March 3, 2026               │
│ Price: $4.99/month                         │
│                                            │
│ [Manage Subscription]                      │
│ Opens Stripe Billing Portal for:           │
│ • Update payment method                    │
│ • Cancel subscription                      │
│ • View invoices                            │
│                                            │
│ ─── Usage This Month ───                   │
│ Cards:    45 / 100                         │
│ Readings: 12 / 50                          │
│ Images:   23 / 100                         │
│ Decks:    5 / ∞                            │
└────────────────────────────────────────────┘
```

For free users:
```
┌────────────────────────────────────────────┐
│ Current Plan: Free                         │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Upgrade to Pro — $4.99/month           │ │
│ │                                        │ │
│ │ • 100 cards/month (you have 10)       │ │
│ │ • 50 readings/month (you have 5)      │ │
│ │ • All spread types                    │ │
│ │ • Unlimited decks                     │ │
│ │ • Full collaboration access           │ │
│ │                                        │ │
│ │ [✨ Upgrade Now]                       │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Data Model

### New Tables

```
subscriptions
├── id                      text (PK, cuid)
├── userId                  text (FK → users, unique)
├── stripeCustomerId        text (unique)
├── stripeSubscriptionId    text (unique, nullable)
├── plan                    text (default 'free') — 'free' | 'pro'
├── status                  text (default 'active') — 'active' | 'canceled' | 'past_due' | 'trialing'
├── currentPeriodStart      timestamp (nullable)
├── currentPeriodEnd        timestamp (nullable)
├── cancelAtPeriodEnd       boolean (default false)
├── createdAt               timestamp (default now)
└── updatedAt               timestamp (default now)
INDEX on userId
INDEX on stripeCustomerId
```

Note: Every user gets a subscription record (default plan='free'). Created on first sign-in or first plan check.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/stripe/checkout` | Create Stripe Checkout session |
| POST | `/api/stripe/portal` | Create Billing Portal session |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |
| GET | `/api/subscription` | Get current user's plan + status |

### POST `/api/stripe/checkout`
**Process:**
1. Get or create Stripe customer for user
2. Create Checkout Session with Pro price
3. Return session URL for redirect

### POST `/api/stripe/portal`
**Process:**
1. Get Stripe customer ID for user
2. Create Billing Portal session
3. Return portal URL for redirect

### POST `/api/webhooks/stripe`
**Events handled:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/update subscription to pro |
| `customer.subscription.updated` | Update plan/status |
| `customer.subscription.deleted` | Downgrade to free |
| `invoice.payment_failed` | Set status to past_due |
| `invoice.paid` | Set status to active |

## Files to Create

| File | Description |
|------|-------------|
| `src/lib/stripe/client.ts` | Stripe SDK initialization |
| `src/lib/stripe/plans.ts` | Plan definitions, pricing, Stripe price IDs |
| `src/app/api/stripe/checkout/route.ts` | Checkout session creation |
| `src/app/api/stripe/portal/route.ts` | Portal session creation |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler |
| `src/app/api/subscription/route.ts` | Get subscription status |

## Stripe Setup Required
1. Create a Product in Stripe: "MysTech Pro"
2. Create a Price: $4.99/month recurring
3. Set up webhook endpoint: `{APP_URL}/api/webhooks/stripe`
4. Configure webhook events: checkout.session.completed, customer.subscription.*, invoice.*
5. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET

## Dependencies
- `stripe` (Stripe Node.js SDK)

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Webhook arrives before redirect callback | Subscription updated via webhook, redirect just confirms |
| User cancels and resubscribes | Update existing subscription record |
| Payment fails | Set status to past_due, show warning in app, still allow access for grace period |
| Subscription ends (cancel at period end) | Plan reverts to free when currentPeriodEnd passes |
| User has no Stripe customer | Create on first checkout attempt |
| Webhook signature verification fails | Return 400, log error |
| Duplicate webhook events | Idempotent handling — check current state before updating |
| STRIPE_WEBHOOK_SECRET not set | Log warning, skip signature verification in dev only |

## Testing Checklist
- [ ] Free user can click "Upgrade" and reach Stripe Checkout
- [ ] Stripe Checkout shows correct price ($4.99/mo)
- [ ] After payment, user's plan shows as Pro
- [ ] Pro user can access Billing Portal
- [ ] Cancel subscription in portal → plan reverts to free at period end
- [ ] Webhook correctly processes subscription events
- [ ] Subscription status reflects in app immediately
- [ ] Usage meters on billing page show correct values
- [ ] Past due status shown when payment fails
- [ ] Works with Stripe test mode (test card: 4242 4242 4242 4242)

## Open Questions
1. Should we create the Stripe product/price programmatically or manually? **Default: Manually in Stripe dashboard, store price ID as env var or constant.**
2. Grace period for failed payments? **Default: Stripe's default dunning behavior (3 retry attempts over ~2 weeks). During this time, status = past_due but features still work.**
3. Should cancelled Pro users keep data above free limits? **Default: Yes, data is preserved. They just can't create new items above free limits. Existing decks/readings remain accessible.**
