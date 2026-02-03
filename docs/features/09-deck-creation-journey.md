# Feature 09: Deck Creation — Journey Mode (Conversation)

## Overview
The deep deck creation flow. An AI guide (wise mystic personality) leads the user through a multi-turn conversation, extracting themes, memories, and emotions. The conversation produces text-only card drafts that the user reviews in 3 view modes before confirming and triggering image generation.

## User Stories
- As a user, I want to have a guided conversation to create a deeply personal deck
- As a user, I want to see how ready my deck is as the conversation progresses
- As a user, I want to review draft cards before they're finalized
- As a user, I want to remove cards I don't like and get replacements
- As a user, I want to edit card text before images are generated

## Requirements

### Must Have
- [ ] Step 1: Deck setup (title, theme, card count, art style)
- [ ] Step 2: Streaming AI conversation with wise mystic guide personality
- [ ] Conversation stored in database for context
- [ ] Readiness indicator showing extraction progress
- [ ] Step 3: AI generates card drafts (text-only, structured output)
- [ ] Step 4: Draft review with 3 view modes (list, swipe, grid)
- [ ] Ability to remove cards and generate replacements
- [ ] Inline text editing of card drafts
- [ ] Credit tracking during review
- [ ] Step 5: Confirm → trigger image generation

### Nice to Have
- [ ] "Save conversation and continue later" (resume journey)
- [ ] Anchor visualization (what themes have been extracted)
- [ ] Drag-to-reorder cards in grid view

## UI/UX

### Step 1: Setup (`/decks/new/journey`)
Same form as simple mode: title, theme, card count, art style picker. Plus a "Begin Journey" button.

### Step 2: Conversation (`/decks/new/journey/[deckId]/chat`)
```
┌─────────────────────────────────────────┐
│ Creating: "Seasons of My Life"    [75%] │ ← readiness meter
├─────────────────────────────────────────┤
│                                         │
│ 🔮 Welcome, seeker. Let us explore the │
│    threads of your story together.      │
│    Tell me — what does "seasons"        │
│    mean to you personally?              │
│                                         │
│ 👤 For me, seasons represent the big    │
│    transitions in my life. Moving       │
│    cities, changing careers...          │
│                                         │
│ 🔮 Beautiful. Those transitions carry   │
│    profound energy. Let's explore the   │
│    emotions of each season...           │
│                                         │
├─────────────────────────────────────────┤
│ [Type your response...]         [Send]  │
│                                         │
│ [✨ I'm Ready — Generate Cards]         │ ← appears when readiness ≥ 70%
└─────────────────────────────────────────┘
```

### Step 3: Generation Progress
- Brief loading state: "Crafting your cards from our conversation..."
- Show cards appearing one at a time as they're generated

### Step 4: Draft Review (`/decks/new/journey/[deckId]/review`)

**Three view modes, switchable via tabs:**

#### List View
```
┌─────────────────────────────────────────┐
│ [List] [Swipe] [Grid]     10/12 kept   │
├─────────────────────────────────────────┤
│ ☑ 1. The First Frost                    │
│   "New beginnings emerge from cold..."   │
│   [Edit]                                │
│                                         │
│ ☐ 2. The Wanderer's Path    [REMOVED]   │
│                                         │
│ ☑ 3. Summer's Peak                      │
│   "The fullness of accomplishment..."    │
│   [Edit]                                │
├─────────────────────────────────────────┤
│ 2 cards removed                         │
│ [🔄 Generate 2 Replacements]            │
│                                         │
│ Credits: 10 of 100 cards used           │
│ [✅ Finalize Deck (10 cards)]           │
└─────────────────────────────────────────┘
```

#### Swipe View (mobile-optimized)
```
┌─────────────────────────────────────────┐
│ [List] [Swipe] [Grid]       3 of 12    │
├─────────────────────────────────────────┤
│                                         │
│    ┌─────────────────────┐              │
│    │                     │              │
│    │   The First Frost   │              │
│    │                     │              │
│    │ "New beginnings..." │              │
│    │                     │              │
│    │     [Tap to Edit]   │              │
│    └─────────────────────┘              │
│                                         │
│    ← Discard    Keep →                  │
│                                         │
└─────────────────────────────────────────┘
```

#### Grid View
```
┌─────────────────────────────────────────┐
│ [List] [Swipe] [Grid]                   │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Card1│ │Card2│ │ ✕   │ │Card4│       │
│ │  ✓  │ │  ✓  │ │removed│ │  ✓  │      │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Card5│ │Card6│ │Card7│ │Card8│       │
│ │  ✓  │ │  ✓  │ │  ✓  │ │  ✓  │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│ Click card to expand/edit               │
│ [Select All] [Deselect All]             │
│ [🔄 Generate Replacements for Removed]  │
└─────────────────────────────────────────┘
```

## Data Model

### Tables Used (from previous features)
- `decks` — status tracks flow progress
- `cards` — final confirmed cards
- `deck_metadata` — stores conversation context and drafts

### New Table

```
conversations
├── id          text (PK, cuid)
├── deckId      text (FK → decks)
├── role        text — 'user' | 'assistant' | 'system'
├── content     text (not null)
└── createdAt   timestamp (default now)
INDEX on deckId
```

### deck_metadata Usage
- `extractedAnchors`: jsonb array of `{ theme: string, emotion: string, symbol: string }` — populated by AI during conversation
- `conversationSummary`: text summary of conversation for card generation context
- `draftCards`: jsonb array of card drafts during review phase
- `generationPrompt`: the full prompt used to generate card drafts
- `isReady`: boolean — true when AI assesses enough anchors collected

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/conversation` | Stream conversation message (returns AI response) |
| GET | `/api/decks/[deckId]/conversation` | Get conversation history |
| POST | `/api/ai/generate-deck` | Generate card drafts from conversation (shared with Feature 08) |
| PATCH | `/api/decks/[deckId]/drafts` | Update draft cards (keep/remove/edit) |
| POST | `/api/decks/[deckId]/drafts/replace` | Generate replacement cards for removed ones |
| POST | `/api/decks/[deckId]/confirm` | Finalize deck from drafts → create card records + trigger images |

### POST `/api/ai/conversation`
**Input:**
```json
{
  "deckId": "abc123",
  "message": "For me, seasons represent transitions..."
}
```

**Process:**
1. Load conversation history from DB
2. Stream response from Gemini (wise mystic personality)
3. Save both user message and AI response to conversations table
4. AI also extracts anchors (themes/emotions/symbols) and updates deck_metadata
5. AI assesses readiness (enough material for card generation)
6. Return streamed response + readiness percentage

## AI Prompt Design

### System Prompt (Conversation)
```
You are a wise mystic guide helping someone create a personalized oracle card deck. Your tone is warm, reverent, and gently probing — like a compassionate spiritual counselor.

Your role:
1. Ask thoughtful questions about the user's chosen theme
2. Listen deeply and reflect back what you hear
3. Extract anchors: key themes, emotions, symbols, and memories
4. Guide the conversation toward having enough material for {cardCount} unique cards

After each response, output a JSON block (hidden from user) with:
- extracted_anchors: new themes/emotions/symbols from this exchange
- readiness_score: 0-100 (how ready the material is for card generation)
- suggested_next_question: what to explore next

Begin by warmly greeting the user and asking about their chosen theme.
```

### System Prompt (Card Generation from Conversation)
```
Based on the following conversation about "{deckTitle}" (theme: {theme}), create {cardCount} oracle cards.

Conversation summary: {conversationSummary}
Extracted anchors: {extractedAnchors}

Each card should:
- Draw directly from the themes, emotions, and symbols discussed
- Feel personally meaningful to the user
- Have a unique perspective within the deck
- Form a cohesive narrative arc
```

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User closes browser during conversation | Conversation saved to DB, can resume |
| AI response fails mid-stream | Show error, allow retry |
| User clicks "Generate" before readiness threshold | Allow it but show warning: "We recommend continuing the conversation for better results" |
| All cards removed during review | Show "You've removed all cards. Generate a fresh set?" |
| User edits card to empty text | Validation prevents empty title/meaning |
| Conversation becomes very long (>50 messages) | Summarize older messages, keep recent ones in context |
| User wants to go back to conversation from review | Allow navigation back, conversation preserved |
| Replacement generation produces duplicates | System prompt instructs AI to avoid themes already covered |

## Testing Checklist
- [ ] Setup form collects title, theme, card count, art style
- [ ] Conversation streams AI responses in real-time
- [ ] AI responds in "wise mystic" personality
- [ ] Readiness meter updates during conversation
- [ ] "Generate Cards" button appears when ready
- [ ] Card drafts generated match requested count
- [ ] List view: checkboxes toggle cards, inline edit works
- [ ] Swipe view: swipe gestures keep/discard cards
- [ ] Grid view: click to expand, visual keep/remove state
- [ ] Can switch between 3 view modes
- [ ] Removed cards show "Generate Replacements" option
- [ ] Replacement cards are generated and added to drafts
- [ ] Credit count updates during review
- [ ] Confirm creates actual card records in database
- [ ] Image generation triggered after confirmation
- [ ] Redirects to deck view after confirmation

## Open Questions
1. Should the AI use tool calling to extract anchors, or parse them from a structured block in the response? **Default: Use a hidden JSON block at the end of each AI message, parsed server-side before displaying to user.**
2. How should "readiness" be calculated? **Default: readiness = (extracted_anchors.length / cardCount) * 100, capped at 100. AI also provides its own assessment.**
3. Should swipe view use actual touch gestures or buttons? **Default: Both — touch gestures on mobile, left/right arrow buttons on desktop.**
