# Feature 18: Usage Tracking & Limit Enforcement

## Overview
Credit-based usage tracking system that enforces limits based on user plan (free/pro/admin). Uses a single "credits" currency for card creation and image generation, with separate daily reading allowances.

## Credit Model

### Single Currency: "Credits"
| Action | Cost |
|--------|------|
| Create new card (text + image bundled) | 1 credit |
| Regenerate card image (refresh) | 1 credit |
| Regenerate card text only | Free |
| Perform a reading | Not credit-based (daily limit) |

### Tier Limits
| Resource | Free | Pro ($4.99/mo) | Admin |
|----------|------|-----------------|-------|
| Credits | 11 **lifetime** (one-time) | 50/month (resets monthly) | Unlimited |
| Readings | 1/day | 5/day | Unlimited |
| Max decks | No limit | No limit | No limit |
| Spread types | single, three_card | All | All |
| AI model | Standard (Gemini 2.0 Flash-Lite) | Master Oracle (Gemini 2.5 Flash) | Master Oracle |
| First reading ever | Free (doesn't count toward daily limit) | N/A | N/A |

### Free Tier Strategy
11 credits covers the intended onboarding funnel:
- 3 credits → Simple deck (3 cards) → First reading (free, doesn't count)
- 7 credits → Journey deck (7 cards) → Second reading (1st daily reading)
- 1 credit → One image refresh
- After that: daily readings only, no more card creation without upgrading

## Data Model

### `usage_tracking` Table
```
usage_tracking
├── id                  text (PK, cuid)
├── userId              text (FK → users, cascade delete)
├── periodStart         timestamp (not null)
├── periodEnd           timestamp (not null)
├── creditsUsed         integer (default 0)
├── createdAt           timestamp (default now)
├── updatedAt           timestamp (default now)
UNIQUE(userId, periodStart)
INDEX on userId
```

**Period logic:**
- **Free users:** Single lifetime record. `periodStart` = 2020-01-01, `periodEnd` = 2099-12-31
- **Pro users:** Monthly records. Calendar month period (later: aligned to Stripe billing)
- **Admin:** No record needed (unlimited)

## Implementation

### Core Utilities (`src/lib/usage/`)
- `plans.ts` — `getUserPlanFromRole(role)`: admin → "admin", else → "free" (pluggable for Stripe pro detection)
- `usage.ts` — `getOrCreateUsageRecord()`, `checkCredits()`, `incrementCredits()`, `checkDailyReadings()`, `isFirstReadingEver()`
- `stubs.ts` — Future feature limit placeholders (person cards, collaboration, reading history)
- `index.ts` — Barrel exports

### API Endpoint
- `GET /api/usage` — Returns plan, credits (used/limit/remaining), daily readings, period info

### Limit Enforcement
| Route | Resource | Enforcement |
|-------|----------|-------------|
| `/api/ai/generate-deck` | credits (N cards) | Check upfront, increment after creation |
| `/api/decks/[deckId]/confirm` | credits (kept cards) | Check upfront, increment after insert |
| `/api/ai/generate-image` | credits (1 regen) | Check 1, increment after success |
| `/api/ai/generate-images-batch` | credits (N images) | Check N upfront, block if insufficient |
| `/api/readings` | daily readings | Check daily limit (with first-reading exemption) |
| `/api/decks` | — | No deck limit (credits-only constraint) |

### UI Components
- `UsageMeter` — Reusable color-coded progress bar (green >50%, yellow 20-50%, red <20%)
- `UsageIndicator` — Sidebar widget showing credits + daily readings
- `UpgradePrompt` — AlertDialog with resource-specific messaging + Pro benefits
- `useUsage` hook — Client-side usage data fetching + credit warning

### 80% Warning Toast
After successful billable operations, checks remaining credits. If <=20% remaining, shows a toast once per browser session via `sessionStorage`.

## Files

### New
| File | Purpose |
|------|---------|
| `src/lib/usage/plans.ts` | Central `getUserPlanFromRole()` |
| `src/lib/usage/usage.ts` | checkCredits, incrementCredits, checkDailyReadings |
| `src/lib/usage/stubs.ts` | Future feature limit stubs |
| `src/lib/usage/index.ts` | Barrel exports |
| `src/lib/usage/plans.test.ts` | Plan detection tests |
| `src/lib/usage/usage.test.ts` | Usage utility tests |
| `src/app/api/usage/route.ts` | GET /api/usage endpoint |
| `src/app/api/usage/route.test.ts` | API endpoint tests |
| `src/components/shared/usage-meter.tsx` | Reusable progress bar |
| `src/components/shared/usage-indicator.tsx` | Sidebar credit widget |
| `src/components/shared/upgrade-prompt.tsx` | Limit-reached modal |
| `src/hooks/use-usage.ts` | Client-side usage hook |

### Modified
| File | Change |
|------|--------|
| `src/lib/constants.ts` | Restructured to credit model |
| `src/lib/db/schema.ts` | Added `usageTracking` table |
| `src/types/index.ts` | Updated types for credit model |
| `src/app/api/decks/route.ts` | Removed deck limit check |
| `src/app/api/ai/generate-deck/route.ts` | Credit check + increment |
| `src/app/api/decks/[deckId]/confirm/route.ts` | Credit check + increment |
| `src/app/api/ai/generate-image/route.ts` | Credit check + increment |
| `src/app/api/ai/generate-images-batch/route.ts` | Credit check + increment |
| `src/app/api/readings/route.ts` | Daily reading limit + first-reading exemption |
| `src/components/layout/app-sidebar.tsx` | Added UsageIndicator |
| `src/app/(app)/dashboard/page.tsx` | Centralized credit data |
| `src/components/dashboard/dashboard-stats.tsx` | Credits + daily readings |
| `src/app/(app)/settings/billing/page.tsx` | Real usage display |
| `src/components/billing/billing-page-client.tsx` | Credit model UI |
| `src/components/marketing/pricing-cards.tsx` | Updated features list |
| `src/app/(app)/decks/new/simple/page.tsx` | Removed deck limit check |
| `src/app/(app)/decks/new/journey/page.tsx` | Removed deck limit check |

## Testing Checklist
- [x] Usage indicator shows in sidebar with correct values
- [x] Usage updates after creating cards/readings/images
- [x] Free tier blocked from exceeding credit limit
- [x] Free tier blocked when daily reading limit reached
- [x] Free tier limited to single and three_card spreads
- [x] First reading ever is free (doesn't count toward daily limit)
- [x] Upgrade prompt displays when limit hit
- [x] Admin bypass — unlimited everything
- [x] Sidebar indicator — credits meter + readings today visible
- [x] Billing page — shows credits, daily readings, plan info, upgrade CTA
- [x] 80% warning toast (once per session)
- [x] No deck limit (credits constrain card creation)
- [x] Unit tests pass for usage utilities
- [x] API route tests pass with credit model

## Future Considerations (NOT in this feature)
- **Feature 17:** Stripe billing, Pro plan detection, credit boosters
- **Feature 21:** Life Deck concept
- **Pro period alignment:** When Stripe is added, pro credits reset with billing cycle
