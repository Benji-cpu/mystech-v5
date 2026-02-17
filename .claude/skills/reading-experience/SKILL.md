---
name: reading-experience
description: Use when building any part of the reading flow — spread selection, card drawing, card reveal animations, AI interpretation display. The reading is the emotional climax of the app.
---

# Reading Experience Flow

The reading is the emotional centerpiece of MysTech. Every interaction should feel ceremonial and meaningful. The full spec is in `docs/features/13-reading-flow.md`.

## Architecture

The reading flow lives at `/readings/new` as a single-page wizard with internal state transitions:

```
setup (select deck + spread + intention) → card_draw → card_reveal → interpretation
```

This uses local React state within the page component, NOT global routing.

## Phase Sequence

### 1. Setup
User selects deck, spread type, and optional intention question.
- Spread options: single (1), three-card (3), five-card (5), Celtic cross (10)
- Free tier limited to 3-card spread max
- Deck must have enough cards for selected spread
- Steps transition with AnimatePresence within the page

### 2. Card Draw
API call creates the reading. Cards appear face-down in spread positions.
- Each spread has a specific layout component (see `src/components/readings/`)
- Face-down cards have atmospheric pre-reveal state (pulsing glow, subtle movement)
- Background deepens to midnight blue, particles slow

### 3. Card Reveal
Cards flip one-by-one with staggered timing. This is the climax.
- Use `useCardReveal` hook from `src/hooks/use-card-reveal.ts`
- Default timing: 2s reveal per card, 1.5s delay between cards
- States per card: `hidden → revealing → revealed`
- Each reveal triggers visual feedback (glow pulse, particle burst)
- Card images should be preloaded before this phase begins
- Reveal must be interruptible (user can tap to skip ahead)

### 4. Interpretation
AI interpretation streams in via Vercel AI SDK.
- Cards compress/shift to make room for text
- Text streams with typewriter-like appearance
- Key phrases highlighted in gold
- Overall reading first, then per-card meanings
- Save button appears after stream completes

## Card Reveal Animation

The reveal animation concept was chosen from 5 HTML mock prototypes in `docs/mocks/immersive/`. The chosen concept is implemented in React.

### Reveal Hook Usage
```tsx
import { useCardReveal } from '@/hooks/use-card-reveal';

const { cardStates, isRevealing, allRevealed, startReveal, reset } = useCardReveal({
  cardCount: spreadPositions.length,
  revealDuration: 2000,
  delayBetween: 1500,
  onAllRevealed: () => { /* show interpretation button */ },
});
```

### Card State Rendering
```tsx
{spreadPositions.map((pos, i) => (
  <div key={pos.position}>
    {cardStates[i] === 'hidden' && <FaceDownCard position={pos} />}
    {cardStates[i] === 'revealing' && <RevealingCard card={drawnCards[i]} />}
    {cardStates[i] === 'revealed' && <ReadingOracleCard card={drawnCards[i]} position={pos} />}
  </div>
))}
```

## Spread Layouts

Spread position definitions are in `src/lib/constants.ts` (`SPREAD_POSITIONS`).

Layout components:
- `SingleSpread` — centered single card
- `ThreeCardSpread` — horizontal row (Past, Present, Future)
- `FiveCardSpread` — cross formation
- `CelticCrossSpread` — traditional 10-card layout, vertical fallback on mobile

## Background Response

During the reading, the persistent background should shift:
- Setup phase: default ambient purple
- Card draw: deeper midnight blue, slower particles
- Reveal: warm golden undertone, particles pause during flip
- Interpretation: calm, stable, gentle movement returns

## Data Flow

1. POST `/api/readings` with `{ deckId, spreadType, question }`
2. API shuffles deck cards, draws N, creates reading + reading_cards records
3. Returns reading with drawn cards (card data, positions, names)
4. Client receives and drives the reveal sequence
5. After reveal: POST to interpretation API (Feature 14) for streaming AI response
6. Interpretation saved to reading record on completion
