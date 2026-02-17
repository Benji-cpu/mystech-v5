# Feature 16: Deck Adoption

## Overview
Users can add shared public decks to their collection for use in readings. This creates a live reference to the original deck — adopters see updates if the owner edits the deck.

## Model
- **Live reference**: Adopted decks are NOT copies. They reference the original deck.
- **Read-only**: Adopters can use the deck for readings but cannot edit cards. Only the original owner can edit.
- **Limits**: Adopted decks do NOT count against the user's deck limit.
- **Updates**: If the owner edits cards, adopters see the changes automatically.

## Schema

### `deckAdoptions` table
```sql
CREATE TABLE deck_adoption (
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  deck_id TEXT NOT NULL REFERENCES deck(id) ON DELETE CASCADE,
  adopted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, deck_id)
);
```

Drizzle schema:
```ts
export const deckAdoptions = pgTable("deck_adoption", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deckId: text("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
  adoptedAt: timestamp("adopted_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.deckId] }),
]);
```

## API

### POST `/api/decks/[deckId]/adopt`
- Auth required
- Verify deck exists and has a `shareToken` (is publicly shared)
- Prevent self-adoption (can't adopt your own deck)
- Create `deckAdoptions` row
- Return success

### DELETE `/api/decks/[deckId]/adopt`
- Auth required
- Remove the adoption record
- Return success

## UI

### Shared Deck Page (`/shared/deck/[token]`)
- Replace the current "Coming soon" toast with actual adoption logic:
  - **Not logged in**: "Sign up to add this deck" → link to `/login`
  - **Logged in, not adopted**: "Add to My Collection" → POST adopt
  - **Logged in, already adopted**: "Added to Collection" (disabled/checked state)
  - **Own deck**: Don't show button

### Deck List Page (`/decks`)
- Adopted decks appear in the user's deck list with a "Shared" badge
- Query: union of own decks + adopted decks
- Adopted decks link to the regular deck view page (read-only mode)

### Deck View Page (`/decks/[deckId]`)
- If user is adopter (not owner): hide Edit/Delete buttons, show "Remove from Collection" instead
- All card viewing functionality works normally

### Reading Flow (`/readings/new`)
- Deck selector includes both owned and adopted decks
- Adopted decks shown with "Shared" indicator

## Edge Cases
- **Owner deletes deck**: Cascade delete removes all `deckAdoptions` rows automatically
- **Owner revokes sharing** (sets `shareToken` to null): Existing adoptions remain functional (deck still exists, just not publicly shareable anymore). New adoptions cannot be created.
- **Owner makes deck private** (future feature): Same as revoking sharing — existing adoptions persist
- **Adopter tries to edit**: API rejects with 403, UI hides edit controls

## Queries

```ts
// Get user's adopted decks
async function getAdoptedDecks(userId: string) { ... }

// Check if user has adopted a deck
async function hasAdoptedDeck(userId: string, deckId: string) { ... }

// Get combined deck list (owned + adopted)
async function getUserDecksWithAdopted(userId: string) { ... }
```

## Testing Checklist
- [ ] Adopt a shared deck from public page
- [ ] Adopted deck appears in deck list with "Shared" badge
- [ ] Can use adopted deck for readings
- [ ] Cannot edit adopted deck cards
- [ ] Removing adoption removes from list
- [ ] Owner deleting deck removes adoption
- [ ] Cannot adopt own deck
- [ ] Cannot adopt without auth
