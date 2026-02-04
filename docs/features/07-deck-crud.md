# Feature 07: Deck CRUD

> **Combined build**: This feature is being built together with Features 08 (Simple Mode AI Text) and 10 (AI Image Generation) on branch `feature/07-deck-crud`. See [`07-08-10-simple-deck-creation-plan.md`](07-08-10-simple-deck-creation-plan.md) for the combined implementation plan.

## Overview
Core deck and card data management. Users can create, list, view, edit, and delete decks. Each deck contains cards with title, meaning, guidance, and optional image. This feature provides the data layer — AI-powered creation comes in features 08 and 09.

## User Stories
- As a user, I want to see all my decks in a grid so I can find one quickly
- As a user, I want to create a new deck and choose between Simple or Journey mode
- As a user, I want to view a deck and see all its cards
- As a user, I want to edit a deck's title, description, and theme
- As a user, I want to delete a deck I no longer want

## Requirements

### Must Have
- [ ] Deck list page with grid layout, status badges
- [ ] New deck page with mode selection (Simple vs Journey)
- [ ] Deck view page showing all cards in a grid
- [ ] Deck edit page (metadata editing)
- [ ] Deck delete with confirmation
- [ ] Card display component (oracle card with flip)
- [ ] API routes for deck and card CRUD
- [ ] Enforce max deck limit (free: 2, pro: unlimited)

### Nice to Have
- [ ] Search/filter decks by title or status
- [ ] Sort decks by date, name, card count
- [ ] Deck cover image (first card's image or custom)

## UI/UX

### Deck List Page (`/decks`)
- Grid of deck cards (3 columns desktop, 2 tablet, 1 mobile)
- Each deck card shows: cover image/placeholder, title, card count, status badge, date
- "New Deck" button (prominent, top right)
- Empty state for no decks: "Create your first oracle deck"

### New Deck Page (`/decks/new`)
- Choice between two creation modes:
  - **Quick Create** — "Describe your deck and we'll create it instantly"
  - **Guided Journey** — "We'll guide you through a conversation to craft your perfect deck"
- Each option is a large clickable card with icon, title, description
- Quick Create → navigates to `/decks/new/simple` (Feature 08)
- Guided Journey → navigates to `/decks/new/journey` (Feature 09)

### Deck View Page (`/decks/[deckId]`)
- Deck header: title, description, status badge, card count, art style name
- Action buttons: Edit, Delete, Add Card, Share (if applicable)
- Card grid: all cards displayed as oracle card components
- Cards show: image (or placeholder), title, brief meaning preview
- Click card → expand to see full meaning + guidance

### Deck Edit Page (`/decks/[deckId]/edit`)
- Form: title, description, theme
- Cannot change art style after creation (images already generated in that style)
- Save/Cancel buttons

### Oracle Card Component
- Tarot-proportioned rectangle (2:3 ratio)
- Front: image, title at bottom
- Back: decorative pattern (consistent across deck)
- Click to flip: shows meaning and guidance text
- Status indicator if image is generating/failed

## Data Model

### New Tables

```
decks
├── id              text (PK, cuid)
├── userId          text (FK → users, cascade delete)
├── title           text (not null)
├── description     text
├── theme           text
├── status          text (default 'draft') — 'draft' | 'generating' | 'completed'
├── cardCount       integer (default 0)
├── isPublic        boolean (default false)
├── coverImageUrl   text (nullable)
├── artStyleId      text (FK → art_styles, nullable)
├── createdAt       timestamp (default now)
└── updatedAt       timestamp (default now)
INDEX on userId

cards
├── id              text (PK, cuid)
├── deckId          text (FK → decks, cascade delete)
├── cardNumber      integer (not null)
├── title           text (not null)
├── meaning         text
├── guidance        text
├── imageUrl        text (nullable)
├── imagePrompt     text (nullable)
├── imageStatus     text (default 'pending') — 'pending' | 'generating' | 'completed' | 'failed'
├── createdAt       timestamp (default now)
└── updatedAt       timestamp (default now)
INDEX on deckId
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/decks` | List user's decks (paginated) |
| POST | `/api/decks` | Create new deck |
| GET | `/api/decks/[deckId]` | Get deck with card count |
| PATCH | `/api/decks/[deckId]` | Update deck metadata |
| DELETE | `/api/decks/[deckId]` | Delete deck (cascades to cards) |
| GET | `/api/decks/[deckId]/cards` | List cards in deck |
| POST | `/api/decks/[deckId]/cards` | Add card to deck |
| PATCH | `/api/decks/[deckId]/cards/[cardId]` | Update card |
| DELETE | `/api/decks/[deckId]/cards/[cardId]` | Delete card |

### Authorization
- All deck routes require auth
- User can only access their own decks
- Collaborators handled in Feature 16 (not here)

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User tries to create deck beyond free limit (2) | Return 403 with "upgrade to Pro" message |
| Delete deck with cards | CASCADE delete handles it |
| Deck with no cards | Show empty state "No cards yet" |
| Deck in 'generating' status | Show progress indicator, disable edit |
| Card with failed image | Show placeholder with retry button |
| Very long deck title | Truncate in grid view, full in detail view |

## Testing Checklist
- [ ] Deck list shows all user's decks
- [ ] Can create a new deck (basic metadata)
- [ ] New deck page shows Simple vs Journey choice
- [ ] Deck view shows all cards in grid
- [ ] Can click card to see full meaning/guidance
- [ ] Can edit deck title and description
- [ ] Can delete deck with confirmation
- [ ] Deleted deck disappears from list
- [ ] Deck limit enforced for free tier
- [ ] Empty state shows when no decks exist
- [ ] Status badges display correctly (draft/generating/completed)
- [ ] Mobile responsive grid

## Open Questions
1. Should we show decks shared with the user (via collaboration) in this list? **Default: Yes, with a "Shared" badge. But collaboration API comes in Feature 16.**
2. Card expand — modal or separate page? **Default: Modal overlay on click. Keeps user in context of the deck view.**
