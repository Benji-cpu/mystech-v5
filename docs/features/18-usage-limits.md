# Feature 18: Usage Tracking & Limit Enforcement

## Overview
Track usage of billable resources (card creations, readings, image generations) per billing period. Enforce limits based on the user's plan (free/pro). Show remaining credits in the UI and prompt upgrades when limits are reached.

## User Stories
- As a user, I want to see how many credits I have remaining
- As a free user, I want to know when I've hit a limit
- As a free user, I want to be prompted to upgrade when I can't create more
- As a pro user, I want to see my usage but rarely be blocked

## Requirements

### Must Have
- [ ] Usage tracking table: cards_created, readings_performed, images_generated per period
- [ ] Usage check function called before every billable operation
- [ ] Limit enforcement returning clear error when exceeded
- [ ] Usage indicator component in sidebar showing remaining credits
- [ ] Upgrade prompt component shown when limit reached
- [ ] Automatic period reset (monthly, aligned with subscription billing)

### Nice to Have
- [ ] Usage history (see past months)
- [ ] Usage alerts when approaching limits (80% threshold)
- [ ] Admin dashboard for usage overview

## UI/UX

### Usage Indicator (Sidebar Widget)
```
┌─────────────────────┐
│ Credits Remaining    │
│ 🃏 Cards:   3 / 10  │
│ 🔮 Readings: 2 / 5  │
│ 🖼 Images:  1 / 5   │
│                     │
│ Resets Feb 15       │
└─────────────────────┘
```
- Color coded: green (>50%), yellow (20-50%), red (<20%)
- Compact mode for collapsed sidebar: just progress rings

### Upgrade Prompt (shown when limit hit)
```
┌────────────────────────────────────────────┐
│ ⚡ You've used all your free readings      │
│                                            │
│ Upgrade to Pro for:                        │
│ • 50 readings per month                   │
│ • All spread types                        │
│ • And much more...                        │
│                                            │
│ Only $4.99/month                           │
│                                            │
│ [✨ Upgrade to Pro]    [Maybe Later]       │
└────────────────────────────────────────────┘
```

### Limit Warning (approaching limit)
- Toast notification: "You have 1 reading remaining this month"
- Non-blocking, just informational

## Data Model

### New Table

```
usage_tracking
├── id                  text (PK, cuid)
├── userId              text (FK → users)
├── periodStart         timestamp (not null)
├── periodEnd           timestamp (not null)
├── cardsCreated        integer (default 0)
├── readingsPerformed   integer (default 0)
├── imagesGenerated     integer (default 0)
├── updatedAt           timestamp (default now)
└── createdAt           timestamp (default now)
UNIQUE(userId, periodStart)
INDEX on userId
```

### Period Alignment
- For Pro users: period aligns with Stripe billing cycle (currentPeriodStart/End)
- For Free users: calendar month (1st to last day)

## Usage Check Logic

```typescript
async function checkUsage(userId: string, resource: 'cards' | 'readings' | 'images', count: number = 1): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];
  const usage = await getCurrentPeriodUsage(userId);

  const current = usage[resourceField(resource)];
  const limit = limits[limitField(resource)];
  const remaining = limit - current;

  return {
    allowed: remaining >= count,
    remaining: Math.max(0, remaining),
    limit,
  };
}
```

### Where Limits Are Checked
| Operation | Resource | Where |
|-----------|----------|-------|
| Create deck (simple mode) | cards + images | `/api/ai/generate-deck` |
| Create deck (journey mode) | cards | `/api/decks/[deckId]/confirm` |
| Generate images | images | `/api/ai/generate-image`, `/api/ai/generate-images-batch` |
| Add card (manual or AI) | cards | `/api/decks/[deckId]/cards`, `/api/ai/suggest-card` |
| Perform reading | readings | `/api/readings` |
| Create custom art style previews | images | `/api/art-styles` (if generating previews) |

### Additional Non-Usage Limits
| Limit | Free | Pro | Check Location |
|-------|------|-----|----------------|
| Max decks | 2 | ∞ | `/api/decks` POST |
| Max person cards | 5 | 50 | `/api/person-cards` POST |
| Spread types | three_card only | all | `/api/readings` POST |
| Reading history | last 10 | ∞ | `/api/readings` GET |
| Collaboration edit access | view only | full | Card edit routes |

## Components to Build

| Component | Path | Description |
|-----------|------|-------------|
| UsageIndicator | `src/components/shared/usage-indicator.tsx` | Sidebar credit display |
| UpgradePrompt | `src/components/shared/upgrade-prompt.tsx` | Modal/card shown at limit |
| UsageMeter | `src/components/shared/usage-meter.tsx` | Progress bar for billing page |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/usage` | Get current period usage + limits |

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/stripe/usage.ts` | Create | Usage check + increment functions |
| `src/lib/stripe/plans.ts` | Modify | Add limit constants (if not already) |
| `src/components/shared/usage-indicator.tsx` | Create | Sidebar widget |
| `src/components/shared/upgrade-prompt.tsx` | Create | Limit-reached modal |
| `src/components/shared/usage-meter.tsx` | Create | Progress bar |
| `src/app/api/usage/route.ts` | Create | Usage endpoint |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User creates deck with 10 cards but only has 8 card credits left | Block operation: "You need 10 credits but have 8 remaining" |
| User upgrades mid-month | Usage counters persist, new limits apply immediately |
| User downgrades mid-month | Existing usage preserved, new (lower) limits apply |
| Usage period changes (Pro billing date changes) | Align with new Stripe period |
| Concurrent requests both checking limits | Race condition possible — use DB transaction for check+increment |
| Usage record doesn't exist for current period | Create one with zero counts |

## Testing Checklist
- [ ] Usage indicator shows in sidebar with correct values
- [ ] Usage updates after creating cards/readings/images
- [ ] Free tier blocked from exceeding card limit
- [ ] Free tier blocked from exceeding reading limit
- [ ] Free tier blocked from exceeding image limit
- [ ] Free tier limited to 2 decks
- [ ] Free tier limited to 3-card spread
- [ ] Upgrade prompt displays when limit hit
- [ ] Upgrade prompt links to Stripe checkout
- [ ] Pro tier has higher limits
- [ ] Usage resets at start of new billing period
- [ ] Billing page shows usage meters with correct values
- [ ] Warning toast at 80% usage

## Open Questions
1. Should usage increment atomically (in same DB transaction as the create operation)? **Default: Yes — use a transaction so usage is only incremented if the operation succeeds.**
2. Should we show usage in the header or sidebar? **Default: Sidebar, below navigation links. Compact format.**
3. What happens if Stripe webhook is delayed and we can't determine the billing period? **Default: Fall back to calendar month.**
