# Feature 15: Reading History & Sharing

## Overview
Users can browse their past readings and share individual readings via a public link. The reading history page shows a list of past readings. Individual readings are shareable — the history page itself is not. Public shared readings are viewable without authentication.

## User Stories
- As a user, I want to see all my past readings in one place
- As a user, I want to re-read a previous reading's interpretation
- As a user, I want to share an individual reading with someone via a link
- As a recipient, I want to view a shared reading without creating an account
- As a free user, I can only see my last 10 readings

## Requirements

### Must Have
- [ ] Reading history page with list of past readings
- [ ] Each entry shows: date, spread type, question preview, deck name
- [ ] Click to view full reading (spread + interpretation)
- [ ] Share button generates a unique public link for individual readings
- [ ] Public shared reading page (no auth required)
- [ ] Free tier: last 10 readings visible. Pro: unlimited
- [ ] Delete reading from history

### Nice to Have
- [ ] Search/filter readings by question or date
- [ ] "CTA: Create your own deck" on shared reading page
- [ ] Reading statistics (total readings, most used deck, etc.)

## UI/UX

### Reading History Page (`/readings`)
```
┌────────────────────────────────────────────┐
│ Your Readings                    [Filter ▼]│
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Feb 2, 2026 • Three Card Spread       │ │
│ │ "What should I focus on this week?"    │ │
│ │ Deck: Seasons of My Life              │ │
│ │ [View] [Share] [Delete]               │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Jan 28, 2026 • Single Card            │ │
│ │ No question — general guidance         │ │
│ │ Deck: Inner Garden                    │ │
│ │ [View] [Share] [Delete]               │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Showing 10 of 10 readings (Free tier)      │
│ [Upgrade to Pro for unlimited history]     │
└────────────────────────────────────────────┘
```

### Individual Reading View (`/readings/[readingId]`)
- Full spread layout with cards in positions
- Complete interpretation text
- Reading metadata: date, spread type, question, deck name
- Share button: generates link, shows copy-to-clipboard
- Delete button

### Share Dialog
```
┌────────────────────────────────────┐
│ Share This Reading                 │
│                                    │
│ Anyone with this link can view     │
│ your reading (no account needed):  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ mystech.app/shared/reading/  │  │
│ │ abc123def456                 │  │
│ └──────────────────────────────┘  │
│ [📋 Copy Link]                    │
│                                    │
│ [Revoke Sharing]  [Close]         │
└────────────────────────────────────┘
```

### Public Shared Reading (`/shared/reading/[token]`)
```
┌────────────────────────────────────────────┐
│ [MysTech Logo]              [Create Yours] │
├────────────────────────────────────────────┤
│ Three Card Reading                         │
│ "What should I focus on this week?"        │
│ Feb 2, 2026                                │
│                                            │
│ [Card spread displayed]                    │
│                                            │
│ ✨ Interpretation                          │
│ The cards have spoken...                   │
│                                            │
├────────────────────────────────────────────┤
│ Want to create your own oracle deck?       │
│ [Get Started Free — Create Your Deck]      │
└────────────────────────────────────────────┘
```

## Data Model
No new tables. Uses existing fields:
- `readings.shareToken` — unique token generated when user shares (null until shared)

### Share Token Generation
```typescript
import { nanoid } from 'nanoid';
const shareToken = nanoid(16); // URL-safe, 16 chars
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/readings` | List user's readings (paginated, respects tier limits) |
| GET | `/api/readings/[readingId]` | Get full reading (auth required) |
| DELETE | `/api/readings/[readingId]` | Delete reading |
| POST | `/api/readings/[readingId]/share` | Generate share token |
| DELETE | `/api/readings/[readingId]/share` | Revoke share token |
| GET | `/api/shared/reading/[token]` | Get shared reading (public, no auth) |

### GET `/api/readings` — Tier-Limited
```typescript
// Free tier: last 10 readings
// Pro tier: all readings, paginated
const limit = userPlan === 'pro' ? pageSize : Math.min(pageSize, 10);
const readings = await db.query.readings.findMany({
  where: eq(readings.userId, userId),
  orderBy: desc(readings.createdAt),
  limit,
});
```

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/readings` | Required | Reading history list |
| `/readings/[readingId]` | Required | Full reading view (owner only) |
| `/shared/reading/[token]` | None | Public shared reading |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Reading with no interpretation yet | Show cards only, "Interpretation pending" message |
| Share link for deleted reading | Show "This reading is no longer available" |
| Revoke sharing while someone is viewing | Page still shows (already loaded), future visits show unavailable |
| Free user tries to view reading beyond last 10 | Show "Upgrade to see older readings" |
| Free user shares a reading, then it falls outside last 10 | Shared link still works (public view not tier-limited) |
| Delete a shared reading | Also removes share token, shared link stops working |

## Testing Checklist
- [ ] Reading history shows past readings in chronological order
- [ ] Each entry shows date, spread type, question, deck name
- [ ] Click "View" opens full reading with spread + interpretation
- [ ] Free tier sees only last 10 readings
- [ ] Pro tier sees all readings
- [ ] Share button generates a unique link
- [ ] Copy link works
- [ ] Shared link viewable in incognito (no auth)
- [ ] Shared page shows cards + interpretation + CTA
- [ ] Revoke sharing removes public access
- [ ] Delete reading removes from history
- [ ] Delete reading invalidates share link
- [ ] Empty state for no readings
- [ ] Mobile responsive

## Open Questions
1. Should shared readings include the user's name/avatar? **Default: No — share reading content only, not user identity. Privacy-first.**
2. Should share tokens expire? **Default: No, permanent until revoked or reading deleted.**
3. Should the "Create your own deck" CTA on shared pages link to signup or landing page? **Default: Landing page (`/`) — let the landing page handle conversion.**
