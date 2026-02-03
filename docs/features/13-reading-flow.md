# Feature 13: Reading Flow (Spreads, Card Draw, Animation)

## Overview
Users perform oracle card readings by selecting a deck, optionally adding person cards, choosing a spread layout, and drawing cards with flip animation. This feature handles the reading setup and card draw — AI interpretation comes in Feature 14.

## User Stories
- As a user, I want to select which deck to use for a reading
- As a user, I want to add person cards to the draw pool
- As a user, I want to choose a spread layout (3-card, 5-card, etc.)
- As a user, I want to enter a question before my reading
- As a user, I want to see cards drawn with a flip animation

## Requirements

### Must Have
- [ ] New reading page with step-by-step flow
- [ ] Deck selection (from user's completed decks)
- [ ] Optional person card selection
- [ ] Spread selection: single (1), three-card (3), five-card (5), Celtic cross (10)
- [ ] Optional question/intention text input
- [ ] Card draw with flip animation (face-down → face-up)
- [ ] Cards placed in spread-appropriate positions
- [ ] Reading saved to database
- [ ] Free tier limited to 3-card spread only

### Nice to Have
- [ ] Shuffle animation before draw
- [ ] Sequential card reveal (one at a time with delay)
- [ ] Position name labels on each card slot

## UI/UX

### New Reading Flow (`/readings/new`)

**Step 1: Select Deck**
```
┌────────────────────────────────────────┐
│ Choose Your Deck                       │
│                                        │
│ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │ Deck 1 │ │ Deck 2 │ │ Deck 3 │     │
│ │ 12 ♠   │ │ 8 ♠    │ │ 20 ♠   │     │
│ └────────┘ └────────┘ └────────┘     │
│                                        │
│ Include Person Cards? [Toggle]         │
│ ┌────┐ ┌────┐ ┌────┐                 │
│ │Gran│ │Dad │ │Amy │  (if toggled on) │
│ └────┘ └────┘ └────┘                 │
│                                        │
│ [Next: Choose Spread →]                │
└────────────────────────────────────────┘
```

**Step 2: Choose Spread**
```
┌────────────────────────────────────────┐
│ Choose Your Spread                     │
│                                        │
│ ┌──────────┐  ┌──────────┐            │
│ │ ┌─┐      │  │ ┌─┐┌─┐┌─┐│           │
│ │ └─┘      │  │ └─┘└─┘└─┘│           │
│ │ Single   │  │ Three Card│           │
│ │ 1 card   │  │ 3 cards  │           │
│ └──────────┘  └──────────┘           │
│ ┌──────────┐  ┌──────────┐           │
│ │ ┌─┐┌─┐  │  │  Celtic   │ 🔒 PRO   │
│ │┌─┐┌─┐┌─┐│  │  Cross    │           │
│ │ Five Card│  │  10 cards │           │
│ └──────────┘  └──────────┘           │
│                                        │
│ [Next: Set Intention →]                │
└────────────────────────────────────────┘
```

**Step 3: Question/Intention**
```
┌────────────────────────────────────────┐
│ Set Your Intention (optional)          │
│                                        │
│ What question or focus do you bring    │
│ to this reading?                       │
│ ┌────────────────────────────────────┐ │
│ │ "What should I focus on this week?"│ │
│ └────────────────────────────────────┘ │
│                                        │
│ [✨ Draw Cards]                        │
└────────────────────────────────────────┘
```

**Step 4: Card Draw**
- Cards appear face-down in spread positions
- Each card flips with 3D animation (one at a time, 1s delay between)
- After all cards revealed, "Get Interpretation" button appears

### Spread Layouts

**Single Card**
```
    ┌───┐
    │   │
    └───┘
```

**Three Card Spread**
```
┌───┐  ┌───┐  ┌───┐
│   │  │   │  │   │
└───┘  └───┘  └───┘
Past   Present Future
```

**Five Card Spread**
```
       ┌───┐
       │   │
       └───┘
  ┌───┐     ┌───┐
  │   │     │   │
  └───┘     └───┘
  ┌───┐     ┌───┐
  │   │     │   │
  └───┘     └───┘
```
Positions: Situation, Challenge, Foundation, Recent Past, Near Future

**Celtic Cross** (10 cards)
```
              ┌───┐
              │ 5 │
              └───┘
  ┌───┐ ┌───┐     ┌───┐
  │ 4 │ │1/2│     │ 6 │    ┌───┐
  └───┘ └───┘     └───┘    │10 │
              ┌───┐         └───┘
              │ 3 │         ┌───┐
              └───┘         │ 9 │
                            └───┘
                            ┌───┐
                            │ 8 │
                            └───┘
                            ┌───┐
                            │ 7 │
                            └───┘
```

## Data Model

### New Tables

```
readings
├── id          text (PK, cuid)
├── userId      text (FK → users)
├── deckId      text (FK → decks)
├── spreadType  text — 'single' | 'three_card' | 'five_card' | 'celtic_cross'
├── question    text (nullable)
├── interpretation text (nullable — filled by Feature 14)
├── shareToken  text (unique, nullable — generated when user shares)
├── createdAt   timestamp (default now)
└── updatedAt   timestamp (default now)
INDEX on userId

reading_cards
├── id              text (PK, cuid)
├── readingId       text (FK → readings, cascade delete)
├── position        integer (not null) — 0-indexed position in spread
├── positionName    text (not null) — "Past", "Present", "Future", etc.
├── cardId          text (FK → cards, nullable)
├── personCardId    text (FK → person_cards, nullable)
└── createdAt       timestamp (default now)
CHECK: exactly one of cardId or personCardId is NOT NULL
INDEX on readingId
```

### Spread Position Definitions
```typescript
const SPREAD_POSITIONS = {
  single: [{ position: 0, name: 'Focus' }],
  three_card: [
    { position: 0, name: 'Past' },
    { position: 1, name: 'Present' },
    { position: 2, name: 'Future' }
  ],
  five_card: [
    { position: 0, name: 'Situation' },
    { position: 1, name: 'Challenge' },
    { position: 2, name: 'Foundation' },
    { position: 3, name: 'Recent Past' },
    { position: 4, name: 'Near Future' }
  ],
  celtic_cross: [
    { position: 0, name: 'Present' },
    { position: 1, name: 'Challenge' },
    { position: 2, name: 'Foundation' },
    { position: 3, name: 'Recent Past' },
    { position: 4, name: 'Best Outcome' },
    { position: 5, name: 'Near Future' },
    { position: 6, name: 'Self' },
    { position: 7, name: 'Environment' },
    { position: 8, name: 'Hopes & Fears' },
    { position: 9, name: 'Final Outcome' }
  ]
};
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/readings` | Create reading (draw cards, save to DB) |
| GET | `/api/readings/[readingId]` | Get reading with cards |

### POST `/api/readings`
**Input:**
```json
{
  "deckId": "abc123",
  "personCardIds": ["def456", "ghi789"],
  "spreadType": "three_card",
  "question": "What should I focus on?"
}
```

**Process:**
1. Check usage limits (readings count)
2. Load all cards from deck + selected person cards
3. Shuffle combined pool
4. Draw N cards (based on spread type)
5. Create reading record
6. Create reading_cards records with positions
7. Increment usage counter
8. Return reading with drawn cards

### Card Drawing Algorithm
```
1. Combine deck cards + selected person cards into pool
2. Fisher-Yates shuffle the pool
3. Take first N cards (N = spread card count)
4. Assign to spread positions in order
```

## Components to Build

| Component | Description |
|-----------|-------------|
| `spread-layout.tsx` | Dynamic spread renderer (picks correct layout component) |
| `three-card-spread.tsx` | 3-card horizontal layout |
| `five-card-spread.tsx` | 5-card cross layout |
| `celtic-cross-spread.tsx` | 10-card Celtic cross layout |
| `card-draw-animation.tsx` | Flip animation for revealing cards |
| `spread-selector.tsx` | Grid of spread options with lock icons for free tier |
| `deck-selector.tsx` | Grid of user's decks to choose from |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Deck has fewer cards than spread requires | Show warning, suggest different spread or adding more cards |
| Person cards + deck cards still fewer than spread | Block that spread option |
| Free tier user selects 5-card or Celtic cross | Show lock icon, "Upgrade to Pro" prompt |
| User has no completed decks | Show message "Complete a deck first" |
| Same card drawn twice | Can't happen — Fisher-Yates without replacement |
| Reading with person cards from deleted deck | Person cards still valid, deck reference may be null |

## Testing Checklist
- [ ] Can select a deck from user's completed decks
- [ ] Can toggle person cards on/off
- [ ] Spread options display correctly with position counts
- [ ] Free tier locked out of 5-card and Celtic cross
- [ ] Can enter optional question text
- [ ] Cards draw with flip animation
- [ ] Correct number of cards drawn for each spread
- [ ] Cards placed in correct spread positions
- [ ] Position names display on each card slot
- [ ] Reading saved to database
- [ ] Reading viewable at `/readings/[readingId]`
- [ ] Mobile responsive spread layouts

## Open Questions
1. Should card draw be instant or one-at-a-time with delay? **Default: Sequential with 0.8s delay between cards. More theatrical.**
2. Should we show a "shuffle" animation before drawing? **Default: Yes for non-single spreads. Brief 1-2 second shuffle animation.**
3. If pool includes person cards, should they be weighted differently? **Default: No, equal chance for all cards.**
