# Feature 03: TypeScript Types & Shared Utilities

## Overview
Define shared TypeScript types, utility functions, and constants used across the application. This is a foundational feature that other features import from.

## Requirements

### Must Have
- [ ] Central type definitions for all entities
- [ ] Utility function: `cn()` for Tailwind class merging
- [ ] Subscription plan constants (limits for free/pro)
- [ ] API response type helpers

### Nice to Have
- [ ] Zod schemas mirroring types for runtime validation
- [ ] Type-safe API client helpers

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Create | All shared TypeScript types |
| `src/lib/utils.ts` | Create | Utility functions (cn, formatDate, etc.) |
| `src/lib/constants.ts` | Create | Plan limits, spread definitions, art style presets metadata |

## Type Definitions

### Core Entity Types
```typescript
// Deck
type DeckStatus = 'draft' | 'generating' | 'completed';
type Deck = { id, userId, title, description, theme, status, cardCount, isPublic, coverImageUrl, artStyleId, createdAt, updatedAt }

// Card
type CardImageStatus = 'pending' | 'generating' | 'completed' | 'failed';
type Card = { id, deckId, cardNumber, title, meaning, guidance, imageUrl, imagePrompt, imageStatus, createdAt }

// Person Card
type PersonCard = { id, userId, name, relationship, description, photoUrl, photoBlobKey, meaning, guidance, createdAt, updatedAt }

// Art Style
type ArtStyle = { id, name, description, stylePrompt, previewImages, isPreset, createdBy, isPublic, shareToken, createdAt }

// Reading
type SpreadType = 'single' | 'three_card' | 'five_card' | 'celtic_cross';
type Reading = { id, userId, deckId, spreadType, question, interpretation, shareToken, createdAt }
type ReadingCard = { id, readingId, position, positionName, cardId?, personCardId? }

// Subscription
type PlanType = 'free' | 'pro';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
type Subscription = { id, userId, stripeCustomerId, stripeSubscriptionId, plan, status, currentPeriodStart, currentPeriodEnd }

// Usage
type UsageTracking = { id, userId, periodStart, periodEnd, cardsCreated, readingsPerformed, imagesGenerated }
```

### API Response Types
```typescript
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
type PaginatedResponse<T> = { items: T[]; total: number; page: number; pageSize: number };
```

### Plan Constants
```typescript
const PLAN_LIMITS = {
  free: { cardsPerMonth: 10, readingsPerMonth: 5, imagesPerMonth: 5, maxDecks: 2, maxPersonCards: 5, spreads: ['three_card'], readingHistory: 10 },
  pro: { cardsPerMonth: 100, readingsPerMonth: 50, imagesPerMonth: 100, maxDecks: Infinity, maxPersonCards: 50, spreads: ['single', 'three_card', 'five_card', 'celtic_cross'], readingHistory: Infinity }
};
```

## Data Model
No new database tables. This feature is code-only.

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Type imports create circular dependencies | Keep types in central `types/index.ts`, don't import from feature modules |
| Plan limits need updating | Single source of truth in `constants.ts` |

## Testing Checklist
- [ ] `npm run build` passes with no type errors
- [ ] Can import types from `@/types`
- [ ] Can import `cn` from `@/lib/utils`
- [ ] Can import plan limits from `@/lib/constants`
- [ ] All type definitions align with database schema

## Open Questions
1. Should we use Zod schemas alongside TypeScript types? **Default: Yes for API input validation, use Zod. Types for internal use.** Will add Zod schemas as features are built, not all upfront.
