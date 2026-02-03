# Feature 11: Ad-hoc Card Management

## Overview
After a deck is created and completed, users can manage individual cards: add new ones (manual or AI-generated), edit text, regenerate images, delete cards, and reorder them.

## User Stories
- As a user, I want to add a new card to my completed deck
- As a user, I want to write my own card from scratch
- As a user, I want the AI to suggest a new card that fits my deck
- As a user, I want to edit a card's title, meaning, or guidance
- As a user, I want to regenerate a card's image with a different prompt
- As a user, I want to reorder my cards
- As a user, I want to delete a card I no longer want

## Requirements

### Must Have
- [ ] "Add Card" button on deck view with two options: manual or AI-suggested
- [ ] Manual card creation form (title, meaning, guidance, image prompt)
- [ ] AI single card generation using deck context
- [ ] Edit card text (title, meaning, guidance)
- [ ] Edit image prompt and regenerate image
- [ ] Delete card with confirmation
- [ ] Reorder cards (drag or up/down buttons)
- [ ] Usage credit check before AI operations

### Nice to Have
- [ ] Duplicate a card as starting point for a new one
- [ ] Batch delete selected cards
- [ ] Undo last action

## UI/UX

### Add Card Flow
1. On deck view, click "Add Card" button
2. Choose: "Write My Own" or "AI Suggest"
3. **Write My Own**: Form with title, meaning, guidance, image prompt fields → save
4. **AI Suggest**: AI generates a card that complements existing cards → user reviews → save or regenerate

### AI Card Suggestion Dialog
```
┌────────────────────────────────────────┐
│ AI Suggested Card                      │
│                                        │
│ Title: "The Hidden Spring"             │
│ Meaning: "Beneath the surface..."      │
│ Guidance: "Trust what flows unseen..." │
│                                        │
│ [Edit Before Saving] [Regenerate]      │
│ [Save to Deck]       [Cancel]          │
└────────────────────────────────────────┘
```

### Card Edit Dialog
- Opens as modal over deck view
- Fields: title, meaning, guidance, image prompt
- "Save" updates text immediately
- "Regenerate Image" button (if image prompt changed)

### Reorder
- Drag handles on cards in deck edit mode
- Or up/down arrow buttons per card
- Save reorder persists new cardNumber values

## Data Model
No new tables. Uses existing `cards` table. Updates `cardNumber` for reorder.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/decks/[deckId]/cards` | Add card (manual) |
| POST | `/api/ai/suggest-card` | AI generates a card for deck context |
| PATCH | `/api/decks/[deckId]/cards/[cardId]` | Update card text/prompt |
| DELETE | `/api/decks/[deckId]/cards/[cardId]` | Delete card |
| PATCH | `/api/decks/[deckId]/cards/reorder` | Update card order |

### POST `/api/ai/suggest-card`
**Input:**
```json
{
  "deckId": "abc123"
}
```

**Process:**
1. Load deck + existing cards
2. Generate a single card that complements existing ones (avoids duplicate themes)
3. Return card draft (not saved to DB yet)

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Add card to deck at max count | Show warning but allow (soft limit) |
| Delete last card in deck | Allow, deck becomes empty (status stays completed) |
| AI suggests duplicate of existing card | Prompt instructs to avoid existing themes. User can regenerate. |
| Reorder with concurrent users (collaboration) | Last write wins for card order |
| Edit card that has a generating image | Allow text edit, but block image regeneration until current generation completes |

## Testing Checklist
- [ ] Can add a manual card with all fields
- [ ] Can request AI-suggested card
- [ ] AI suggestion is contextually relevant to existing deck
- [ ] Can edit card title, meaning, guidance
- [ ] Can edit image prompt and regenerate image
- [ ] Can delete card with confirmation
- [ ] Can reorder cards via drag or buttons
- [ ] New card order persists after page refresh
- [ ] Usage credits checked before AI operations
- [ ] Card count on deck updates after add/delete

## Open Questions
1. Should AI card suggestion cost a card credit? **Default: Yes, each AI-suggested card costs 1 card credit + 1 image credit if image generated.**
2. Can users add cards to a deck that's still generating? **Default: No, wait for generation to complete first.**
