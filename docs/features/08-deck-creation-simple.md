# Feature 08: Deck Creation — Simple Mode (One-Shot)

## Overview
The quick deck creation flow. User provides a short text description, selects card count and art style, and the AI generates the entire deck at once — card definitions first, then images.

## User Stories
- As a user, I want to quickly create a deck by just describing a theme
- As a user, I want to choose how many cards my deck will have
- As a user, I want to see how many credits this will cost before generating
- As a user, I want to see progress as my deck generates

## Requirements

### Must Have
- [ ] Simple creation form: description text, card count, art style picker
- [ ] Credit cost preview before generation
- [ ] AI generates all card definitions using structured output (JSON schema)
- [ ] Progress indicator during generation
- [ ] Deck status transitions: draft → generating → completed
- [ ] Auto-trigger image generation for all cards after text generation
- [ ] Redirect to deck view when complete

### Nice to Have
- [ ] Suggested card counts based on theme complexity
- [ ] "Generate more like this" after viewing result
- [ ] Undo/regenerate if user doesn't like the result

## UI/UX

### Simple Creation Page (`/decks/new/simple`)
```
┌────────────────────────────────────────────┐
│ Quick Create a Deck                        │
│                                            │
│ Describe your deck:                        │
│ ┌────────────────────────────────────────┐ │
│ │ "A deck inspired by my grandmother's   │ │
│ │  garden and the seasons of life..."     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Number of cards:                           │
│ [5] [10] [15] [20] [Custom: ___]          │
│                                            │
│ Choose your art style:                     │
│ ┌───┬───┬───┐                             │
│ │ T │ W │ C │  (3x3 art style grid)      │
│ ├───┼───┼───┤                             │
│ │ B │ A │ D │                             │
│ ├───┼───┼───┤                             │
│ │ N │ E │ + │                             │
│ └───┴───┴───┘                             │
│                                            │
│ This will use 10 of your 100 card credits  │
│ and 10 of your 100 image credits.          │
│                                            │
│ [✨ Generate My Deck]                      │
└────────────────────────────────────────────┘
```

### Generation Progress View
```
┌────────────────────────────────────────────┐
│ Creating Your Deck...                      │
│                                            │
│ ✅ Generating card meanings (10/10)        │
│ 🔄 Generating card images (3/10)          │
│ ⬜ Finalizing deck                         │
│                                            │
│ [━━━━━━━━░░░░░░░░] 30%                    │
└────────────────────────────────────────────┘
```

### User Flow
1. User navigates to `/decks/new` → clicks "Quick Create"
2. Fills in description, selects card count, picks art style
3. Sees credit cost preview
4. Clicks "Generate My Deck"
5. Sees progress page (card text generating → images generating)
6. Redirected to deck view when complete
7. If images still generating, deck view shows placeholders that fill in

## Data Model

### New Tables

```
deck_metadata
├── deckId              text (PK, FK → decks)
├── extractedAnchors    jsonb (nullable) — themes/symbols extracted from conversation
├── conversationSummary text (nullable)
├── generationPrompt    text (nullable) — the full prompt used to generate cards
├── draftCards          jsonb (nullable) — card drafts before confirmation
├── isReady             boolean (default false)
└── updatedAt           timestamp (default now)
```

Note: This table is shared with the Journey mode (Feature 09). For simple mode, only `generationPrompt` is used.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/generate-deck` | Generate all card definitions from description |
| GET | `/api/decks/[deckId]/status` | Poll deck generation status |

### POST `/api/ai/generate-deck`
**Input:**
```json
{
  "title": "Grandmother's Garden",
  "description": "A deck inspired by my grandmother's garden and the seasons of life",
  "cardCount": 10,
  "artStyleId": "abc123"
}
```

**Process:**
1. Check usage limits (card credits, image credits)
2. Create deck record (status: 'draft')
3. Create deck_metadata with generationPrompt
4. Call Gemini with structured output schema to generate card definitions
5. Insert card records (status: 'pending' for images)
6. Update deck status to 'generating'
7. Trigger image generation for each card (background)
8. Return deck ID

**Structured Output Schema (Gemini):**
```json
{
  "cards": [
    {
      "cardNumber": 1,
      "title": "The First Bloom",
      "meaning": "New beginnings and tender growth...",
      "guidance": "Nurture what is just starting to emerge...",
      "imagePrompt": "A single delicate flower pushing through spring soil, morning dew..."
    }
  ]
}
```

## AI Prompt Design

### System Prompt
```
You are a mystical oracle deck designer. Given a theme description, create a cohesive set of oracle cards. Each card should:
- Have a evocative, meaningful title
- Carry a distinct meaning that relates to the theme
- Offer guidance that is personal and actionable
- Include an image prompt that captures the card's essence visually

The cards should form a complete narrative arc — from beginning/foundation through challenges to resolution/transcendence. Each card should be unique and contribute to the whole.
```

### User Prompt
```
Create {cardCount} oracle cards for a deck called "{title}".

Theme: {description}

Generate exactly {cardCount} cards with diverse, complementary meanings that tell a complete story.
```

## Dependencies
- Vercel AI SDK (`ai` package)
- `@ai-sdk/google` (Gemini provider)
- Gemini structured output support

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User doesn't have enough card credits | Show error before generation, disable button |
| User doesn't have enough image credits | Generate cards without images, show "Generate images later" |
| AI returns fewer cards than requested | Pad with additional generation call |
| AI returns malformed response | Retry up to 2 times, then show error |
| Generation takes too long (>60s) | Show timeout message, deck stays as draft |
| User navigates away during generation | Generation continues in background, deck status updates |
| Card count = 0 or negative | Form validation prevents submission |

## Testing Checklist
- [ ] Form validates: description required, card count > 0
- [ ] Art style picker shows 3x3 grid and allows selection
- [ ] Credit cost preview shows correct values
- [ ] Button disabled when insufficient credits
- [ ] AI generates correct number of cards
- [ ] Each card has title, meaning, guidance, imagePrompt
- [ ] Cards inserted into database
- [ ] Deck status transitions correctly (draft → generating → completed)
- [ ] Progress indicator shows during generation
- [ ] Redirects to deck view on completion
- [ ] Works with different card counts (5, 10, 15, 20)
- [ ] Usage counters incremented after generation

## Open Questions
1. What's the max card count? **Default: 30 cards per deck for free, 50 for pro.** Prevents abuse and controls costs.
2. Should custom card count input be free-form or predefined options? **Default: Predefined buttons (5, 10, 15, 20) + custom input field for pro users.**
3. What Gemini model for simple generation? **Default: Gemini 2.5 Flash for all users in simple mode (it's a one-shot call, cost is minimal).**
