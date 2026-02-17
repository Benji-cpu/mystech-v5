# Feature 13: Reading Flow (Spreads, Card Draw, Animation)

## Overview
Users perform oracle card readings by selecting a deck, choosing a spread layout, and drawing cards with an immersive mystical reveal animation. The card reveal moment is the emotional centerpiece of the app — it needs to feel genuinely mystical, not like a UI interaction. This feature handles the reading setup and card draw — AI interpretation comes in Feature 14.

**Key decisions:**
- Person cards (Feature 12) are **deferred** — reading flow uses deck cards only for now. `personCardId` column included in schema as nullable for future integration.
- Animation R&D happens **first** via standalone HTML mocks before the feature is built.
- All 4 spread types built in first pass (including Celtic Cross).
- Single-page wizard at `/readings/new` (steps transition within one page, no separate routes).

## User Stories
- As a user, I want to select which deck to use for a reading
- As a user, I want to choose a spread layout (single, 3-card, 5-card, Celtic cross)
- As a user, I want to enter a question or intention before my reading
- As a user, I want an immersive, mystical card reveal experience that feels like real divination
- As a user, I want to view my completed reading with all cards in their spread positions

## Requirements

### Must Have
- [ ] New reading page with single-page step-by-step wizard
- [ ] Deck selection (from user's completed decks only)
- [ ] Spread selection: single (1), three-card (3), five-card (5), Celtic cross (10)
- [ ] Optional question/intention text input (max 500 chars)
- [ ] Immersive card reveal animation (concept chosen from mocks)
- [ ] Sequential card reveal with atmospheric delays between cards
- [ ] Cards placed in spread-appropriate positions with labels
- [ ] Reading saved to database
- [ ] Free tier limited to 3-card spread only
- [ ] Monthly reading limit enforcement (free: 5/mo)
- [ ] Card count validation (deck must have enough cards for spread)
- [ ] Reading view page at `/readings/[readingId]`
- [ ] Readings list page at `/readings`

### Nice to Have
- [ ] Pre-reveal atmosphere (ambient particles, pulsing glow)
- [ ] Sound design cues (optional future enhancement)
- [ ] Shuffle animation before draw

---

## Implementation Plan

### Phase 1: Card Reveal Animation R&D (Mocks — Build First)

Build 5 standalone HTML mocks in `docs/mocks/immersive/card-reveal-*/` using the Mock Lab pattern (self-contained HTML, `shared/base.css` + `shared/controls.js`, `MockControls` for live tweaking). All use Canvas 2D + CSS — no build process.

#### Research Inspirations
- [Codrops: Dissolve Effect with Shaders + Particles](https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/) — Perlin noise dissolution with glowing edges, particle emission from formation boundary
- [Codrops: Dreamy Particle Effect with GPGPU](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/) — Thousands of particles assembling into shape, additive blending for dreamlike halos
- [Codrops: WebGL Shader Transitions](https://tympanus.net/codrops/2025/01/22/webgl-shader-techniques-for-dynamic-image-transitions/) — Organic noise-based image reveals
- [Tarot-o-bot (Awwwards SOTD)](https://illo.tv/tarot-o-bot) — Multi-technique layers: JS particles + CSS transforms + Lottie
- [Mystic Draw](https://github.com/datturbomoon/Mystic-Draw) — Open-source tarot with particle effects, card scatter, flip animations
- [Codrops: Interactive Particles with Three.js](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/) — Image-to-particle systems
- [GL Transitions](https://gl-transitions.com/) — Library of shader-based transition effects

#### Mock 1: Particle Assembly (Magical)
**File:** `docs/mocks/immersive/card-reveal-assembly/index.html`

Card position starts as a cloud of scattered golden particles drifting lazily. When triggered, particles accelerate inward like iron filings to a magnet — swirling, orbiting, compressing toward the card rectangle. Particles lock into position and card image resolves (additive blending makes overlapping particles glow brighter). Final pulse of light ripples outward. Post-reveal: particles drift slowly around card edges as a living aura.

**Technique:** Canvas 2D, hundreds of particles with position/velocity/target. Attraction force physics toward card grid positions. Additive composite for glow.

**Controls:** Particle count (200-800), attraction strength, swirl amount, glow intensity, post-reveal aura, color palette (gold/white vs purple/blue vs prismatic).

#### Mock 2: Emissive Materialize (Ritualistic)
**File:** `docs/mocks/immersive/card-reveal-materialize/index.html`

Perlin noise wave radiates outward from center of card position. Where the wave passes, the card materializes. Leading edge glows with bright emissive light (gold fire), sparks/embers fly off formation boundary. Card written into existence by magical fire. Between cards, center point glows and pulses in a "charging" phase.

**Technique:** Canvas 2D with Perlin noise. Card drawn with noise-threshold mask. Edge detection for glow. Particle emitter along edge.

**Controls:** Wave speed, pattern (center-radial vs diagonal vs spiral), edge glow color, ember count, charging pulse duration, noise scale.

#### Mock 3: Cosmic Emergence (Ethereal)
**File:** `docs/mocks/immersive/card-reveal-cosmic/index.html`

Entire spread area is animated starfield (tiny twinkling dots with parallax depth). Stars near card position brighten and drift closer. Luminous threads connect them, tracing card outline like a constellation. Outline pulses. Soft nebula cloud (layered radial gradients with noise) blooms within boundary, shifting through aurora colors. Card image fades in within nebula. Slowest, most contemplative reveal.

**Technique:** Canvas for starfield layers. SVG path animation for constellation lines. CSS gradients with hue-rotate for nebula. Opacity transition for card.

**Controls:** Starfield density, constellation complexity, nebula palette, reveal speed, parallax intensity, star twinkle rate.

#### Mock 4: Sacred Seal Break (Dramatic)
**File:** `docs/mocks/immersive/card-reveal-seal/index.html`

Each unrevealed position shows a glowing mystical seal — animated SVG sigil with sacred geometry drawing itself continuously. Seal pulses with contained energy. When triggered, cracks of light fracture across surface. Seal shatters — fragments fly with physics (gravity, rotation, fade), revealing card beneath. Shockwave ripple spreads. Fragments dissolve into golden dust.

**Technique:** SVG for animated seal (stroke-dashoffset). Canvas for Voronoi shatter physics. CSS for shockwave ring.

**Controls:** Seal complexity (simple circle vs mandala), crack pattern, shatter force, fragment count, shockwave intensity, seal rotation speed.

#### Mock 5: Elemental Convergence (Theatrical)
**File:** `docs/mocks/immersive/card-reveal-convergence/index.html`

Four elemental energy streams (particle trails with distinct colors) from viewport corners arc toward card position. They spiral faster and faster creating a vortex of light. At peak: collision flash, subtle screen shake (CSS transform), radial blur clears to reveal card. Card wreathed in residual energy that dissipates. Between cards, streams redirect to next position.

**Technique:** Canvas for particle trail streams. CSS transform for screen shake. Radial gradient overlay for flash.

**Controls:** Stream count (2 vs 4), trail length, spiral tightness, flash intensity, screen shake, vortex duration, stream colors.

#### All Mocks Include:
- 3-card spread layout (Past | Present | Future) for sequenced reveal testing
- Pre-reveal atmosphere: ambient background particles, pulsing glow at unrevealed positions
- "Begin Reading" trigger button
- Configurable delay between cards (0.5s-3s) and reveal duration
- Mobile-responsive layout
- Sound design placeholder markers

#### Mock Hub Update
**File:** `docs/mocks/index.html` — Add "Card Reveal Experiments" section linking to all 5 mocks.

#### Deliverable
User evaluates all 5 mocks and picks the winner (or hybrid). That drives animation implementation in Phase 2.

### Phase 2: Feature Build (After Animation Choice)

#### Step 1: Database Schema + Push
**Files:** `src/lib/db/schema.ts`

Add `readings` and `readingCards` tables (see Data Model below). Run `npm run db:push`.

#### Step 2: Query Helpers + Shuffle Utility
**Files:** `src/lib/db/queries.ts`, `src/lib/shuffle.ts`, `src/lib/shuffle.test.ts`

Query helpers: `getUserCompletedDecks`, `getReadingByIdForUser`, `getReadingCardsWithData`, `getUserReadingCountThisMonth`, `getUserReadingsWithDeck`.
Fisher-Yates shuffle utility + unit tests.

#### Step 3: API Routes + Tests
**Files:** `src/app/api/readings/route.ts`, `src/app/api/readings/[readingId]/route.ts`, tests

POST /api/readings (create), GET /api/readings (list), GET /api/readings/[readingId] (single). See API Routes below.

#### Step 4: Card Animation (Based on Chosen Mock)
**Files:** `src/app/globals.css`, `src/hooks/use-card-reveal.ts`, `src/components/readings/face-down-card.tsx`, `src/components/readings/reading-oracle-card.tsx`

Translate winning mock concept into React. `useCardReveal` hook for sequencing. `FaceDownCard` for atmospheric pre-reveal state. `ReadingOracleCard` wraps existing `OracleCard` with controlled reveal.

#### Step 5: Spread Layout Components (All 4)
**Files:** `src/components/readings/spread-layout.tsx` + individual spread components

Single, Three Card, Five Card, Celtic Cross. Celtic Cross has mobile fallback to vertical list.

#### Step 6: Reading Flow Page (Single-Page Wizard)
**Files:** `src/components/readings/reading-flow.tsx`, `deck-selector.tsx`, `spread-selector.tsx`, `intention-input.tsx`, `card-draw-scene.tsx`, `src/app/(app)/readings/new/page.tsx`

4-step wizard: Select Deck → Choose Spread → Set Intention → Draw Cards.

#### Step 7: Reading View + List Pages
**Files:** `src/app/(app)/readings/[readingId]/page.tsx`, `src/app/(app)/readings/page.tsx`

Reading view (spread layout, all cards revealed, interpretation placeholder). Readings list (past readings with "New Reading" button).

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

## Resolved Questions
1. ~~Should card draw be instant or one-at-a-time?~~ **Sequential with configurable delay (0.5-3s). Animation concept chosen from mocks.**
2. ~~Should we show a "shuffle" animation?~~ **Deferred — focus on the reveal animation as the primary experience.**
3. ~~If pool includes person cards, should they be weighted differently?~~ **Equal chance. Person cards deferred to Feature 12 integration.**
4. ~~Single page wizard or separate routes?~~ **Single page wizard — steps transition within `/readings/new`.**
5. ~~Build all 4 spread types at once?~~ **Yes, including Celtic Cross.**
6. ~~Simple flip animation or something richer?~~ **Rich immersive reveal — 5 concepts prototyped as mocks first, user picks.**

## New Files Summary

### Phase 1 (Mocks)
| File | Purpose |
|------|---------|
| `docs/mocks/immersive/card-reveal-assembly/index.html` | Particle assembly concept |
| `docs/mocks/immersive/card-reveal-materialize/index.html` | Emissive materialize concept |
| `docs/mocks/immersive/card-reveal-cosmic/index.html` | Cosmic emergence concept |
| `docs/mocks/immersive/card-reveal-seal/index.html` | Sacred seal break concept |
| `docs/mocks/immersive/card-reveal-convergence/index.html` | Elemental convergence concept |

### Phase 2 (Feature)
| File | Purpose |
|------|---------|
| `src/lib/shuffle.ts` | Fisher-Yates shuffle |
| `src/lib/shuffle.test.ts` | Shuffle tests |
| `src/app/api/readings/route.ts` | POST + GET readings |
| `src/app/api/readings/[readingId]/route.ts` | GET single reading |
| `src/app/api/readings/route.test.ts` | API tests |
| `src/hooks/use-card-reveal.ts` | Reveal animation hook |
| `src/components/readings/reading-flow.tsx` | Wizard orchestrator |
| `src/components/readings/deck-selector.tsx` | Step 1 |
| `src/components/readings/spread-selector.tsx` | Step 2 |
| `src/components/readings/intention-input.tsx` | Step 3 |
| `src/components/readings/card-draw-scene.tsx` | Step 4 |
| `src/components/readings/spread-layout.tsx` | Layout switcher |
| `src/components/readings/single-spread.tsx` | 1-card layout |
| `src/components/readings/three-card-spread.tsx` | 3-card layout |
| `src/components/readings/five-card-spread.tsx` | 5-card layout |
| `src/components/readings/celtic-cross-spread.tsx` | 10-card layout |
| `src/components/readings/face-down-card.tsx` | Pre-reveal atmosphere |
| `src/components/readings/reading-oracle-card.tsx` | Controlled reveal wrapper |
| `src/app/(app)/readings/[readingId]/page.tsx` | Reading view |

### Modified Files
| File | Change |
|------|--------|
| `docs/mocks/index.html` | Add Card Reveal section |
| `src/lib/db/schema.ts` | Add readings + readingCards tables |
| `src/lib/db/queries.ts` | Add 5 reading query helpers |
| `src/types/index.ts` | Add ReadingWithCards type |
| `src/app/globals.css` | Add chosen animation CSS |
| `src/app/(app)/readings/page.tsx` | Replace ComingSoon |
| `src/app/(app)/readings/new/page.tsx` | Replace ComingSoon |

### Reuse Existing
- `OracleCard` (`src/components/cards/oracle-card.tsx`) — wrap for display
- `SPREAD_POSITIONS` (`src/lib/constants.ts:26`) — spread logic
- `PLAN_LIMITS` (`src/lib/constants.ts:4`) — tier checking
- `getCurrentUser()` (`src/lib/auth/helpers.ts`) — auth
- `getCardsForDeck()` (`src/lib/db/queries.ts:26`) — load cards
- `ApiResponse<T>` (`src/types/index.ts:123`) — typed responses
- Mock Lab shared utils (`docs/mocks/shared/`) — mock infrastructure
