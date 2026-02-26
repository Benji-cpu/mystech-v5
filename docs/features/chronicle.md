# The Chronicle - Feature Design & Implementation Plan

## Context

MysTech currently has a basic "Living Deck" feature (textarea reflection -> card generation). The Chronicle evolves this into a **daily companion experience** that transforms the app from an occasional oracle tool into something users engage with every day. Users dialogue with Lyra daily, share what's happening in their lives, receive a personally-generated oracle card + mini-reading, and build a deeply personal deck over time. The AI learns more about the user with each conversation, enriching the entire app experience.

The Chronicle is also a **core revenue driver** - free daily dialogue keeps engagement high, while card generation and readings consume credits, creating natural upgrade pressure.

## Feature Name: **The Chronicle**

- Nav: "Chronicle" (ScrollText icon)
- Dashboard CTA: "Chronicle your day"
- Deck label: "Your Chronicle"
- Lyra voice: "Shall we chronicle what's alive for you today?"

## Existing Code to Evolve

| Existing | Path | Evolves Into |
|----------|------|-------------|
| `livingDeckSettings` table | `src/lib/db/schema.ts:216` | `chronicle_settings` (add streak, gamification, etc.) |
| `deckType: 'living'` on decks | `src/lib/db/schema.ts:128` | `deckType: 'chronicle'` |
| Living deck prompts | `src/lib/ai/prompts/living-deck.ts` | Chronicle conversation + card prompts |
| Card generator component | `src/components/decks/living-deck-card-generator.tsx` | Chronicle dialogue flow |
| Living deck view | `src/components/decks/living-deck-view.tsx` | Chronicle timeline view |
| Living deck page | `src/app/(app)/decks/living/page.tsx` | `/chronicle` route |
| API routes | `src/app/api/decks/living/` | `/api/chronicle/` routes |
| Living deck setup | `src/components/decks/living-deck-setup.tsx` | Chronicle onboarding |
| Deck selector (readings) | `src/components/readings/deck-selector.tsx` | Multi-deck selector |
| Reading API | `src/app/api/readings/route.ts` | Multi-deck + Chronicle card support |
| Card feedback | `src/lib/db/schema.ts` (`cardFeedback` table) | Feeds into future card generation quality |

---

## Part 1: Chronicle Onboarding

When a user first enables Chronicle (default on for new users, opt-in for existing), they go through a setup flow:

### Step 1: Art Style Selection
- Same art style picker grid used in deck creation (`src/components/art-styles/style-picker-grid.tsx`)
- This determines the visual style for all Chronicle cards

### Step 2: Interests Selection (Multi-select chips)
Two sections presented as tappable chips:

**Spiritual Interests:**
- Astrology / Zodiac
- Tarot & Divination
- Numerology
- I Ching / Chinese Traditions
- Kabbalah / Mysticism
- Chakras / Energy Work
- Crystals / Herbalism
- Shamanism / Nature Spirits

**Life Domains:**
- Relationships & Love
- Career & Purpose
- Health & Wellness
- Creativity & Expression
- Spiritual Growth
- Personal Development
- Family & Home
- Finances & Abundance

These selections seed `chronicle_knowledge` and shape Lyra's daily approach.

### Step 3: Lyra Conversation (2-3 exchanges)
After art style + interests, Lyra opens a brief dialogue:
- "Now that I know what draws you, tell me — what's alive in your life right now?"
- 2-3 exchanges to understand the user's current life context
- This seeds the knowledge system for personalized daily dialogue from day one

### Step 4: First Chronicle Entry
Flows directly into the first daily check-in at `/chronicle/today`.

---

## Part 2: Core Daily Flow

### Phase State Machine
```
idle -> greeting -> dialogue -> reflecting -> card_forging -> card_reveal -> reading -> complete
```

### Full Flow (has card credits, ~2-3 minutes)

1. **Greeting** (auto, ~2s): Lyra greets contextually - references yesterday's card, noticed patterns, time of day
2. **Dialogue** (2-4 exchanges): Back-and-forth conversation. Lyra asks what's alive, follows up on emotional/thematic threads, keeps it brief. Dialogue only — no textarea.
3. **Reflecting** (auto, ~3s): "I see the threads..." - Lyra synthesizes before card creation
4. **Card Forging** (auto, ~3-5s): Visual animation (golden particles coalescing) while AI generates card
5. **Card Reveal**: Dramatic reveal with title, meaning, guidance
6. **Mini-Reading** (streamed): 2-5 sentence reflection connecting today's card to the broader Chronicle journey
7. **Complete**: Card saved, streak updated, gamification check, "come back tomorrow"

### Dialogue-Only Flow (no card credits)

1. **Greeting** -> 2. **Dialogue** -> 3. **Reflecting** -> 7. **Complete**
- Conversation saved to `chronicle_entries`, knowledge extraction still runs
- Streak still counts (showing up matters)
- Lyra: "Our conversation today is held safely. When your credits renew, these reflections will become cards."
- Data is preserved and feeds into future card generation context (forward-facing, not batch-retroactive)

### Shell Zone Layout (Persistent Shell Pattern)
```
+-----------------------------+
| Status Zone (shrink-0)      |  Phase dots, streak, gamification badges
+-----------------------------+
|                             |
| Primary Zone (flex)         |  Card area (forging animation, reveal)
|                             |
+-----------------------------+
|                             |
| Dialogue Zone (flex)        |  Chat messages, mini-reading text
|                             |
+-----------------------------+
| Action Zone (shrink-0)      |  Input bar / CTA button
+-----------------------------+
```

Zones resize per phase - nothing unmounts. Follows the mandatory persistent shell pattern (`useReducer` state machine).

---

## Part 3: Reading Flow Enhancements

> **NOTE**: Multi-deck selection is ALREADY IMPLEMENTED. The recent refactor added:
> - `DeckSelector` with `selectedDeckIds[]` + `onToggle` (multi-select, collapsible, compact)
> - `reading-flow-state.ts` with `TOGGLE_DECK`, `RESTORE_DEFAULTS`, accordion setup phase
> - `POST /api/readings` accepting `deckIds[]` with combined card pool
> - `SpreadSelector` with collapsible mode + SVG previews
> - localStorage defaults persistence
> - `CeremonySpreadLayout` + responsive card sizing
>
> **DO NOT rebuild any of the above.** The Chronicle feature only needs to add:

### 3a. Chronicle Card Auto-Include (NEW)

When a user has generated a Chronicle card today and starts a reading:
- Today's Chronicle card shown as a special chip/badge above the deck grid in the setup zone
- Auto-included by default: "Today's Card: [title] x" (can be dismissed)
- This card is **guaranteed** to appear in the spread regardless of deck selection

Changes to `src/components/readings/reading-flow.tsx`:
- Add Chronicle card chip component above `DeckSelector`
- Pass `chronicleCardId` through state to the API call

### 3b. AI-Determined Position for Chronicle Card (NEW)

When creating a reading with today's Chronicle card pinned:
- Single structured output AI call determines the best spread position
- Input: Chronicle card details + spread type + all position names + user's question
- Output: `{ chroniclePosition: number }` — which position the Chronicle card takes
- Bundled into reading creation step — one quick Gemini call

Changes to `src/app/api/readings/route.ts`:
- Accept new `chronicleCardId` parameter
- If provided: AI call for position, then place Chronicle card at that position
- Remaining positions filled from combined pool (existing logic)

### 3c. Enhanced Interpretation (NEW)

When Chronicle deck is included in a reading:
- Interpretation prompt includes Chronicle knowledge context
- Lyra references card origins: "This card emerged from your reflection about [X]..."

File to modify: `src/lib/ai/prompts/reading-interpretation.ts`

---

## Part 4: Gamification

Full gamification around streaks and Chronicle engagement.

### Streak System
- Tracked in `chronicle_settings`: `streak_count`, `longest_streak`, `last_entry_date`
- Streak increments if `today - 1 day === last_entry_date`
- Streak resets if a day is missed
- Calculated on read (no cron needed)
- Both dialogue-only and full entries count toward streak

### Milestones & Badges

| Milestone | Badge | Lyra Message |
|-----------|-------|-------------|
| 3 days | "First Flame" | "Three days running. A rhythm is forming." |
| 7 days | "Week Weaver" | "A full week. Your Chronicle is taking shape." |
| 14 days | "Fortnight Keeper" | "Two weeks of daily reflection. The patterns are becoming clear." |
| 30 days | "Moon Cycle" | "A month of chronicling. Your deck holds a whole chapter now." |
| 60 days | "Season Walker" | "Two months. The tapestry of your story grows rich." |
| 100 days | "Centurion" | "A hundred days. Your Chronicle is a treasure." |
| 365 days | "Year Oracle" | "A full year chronicled. You carry a year of wisdom." |

### Visual Rewards
- Badge icons displayed on dashboard Chronicle card
- Streak counter with flame icon
- At 30 days: unlock special card border style for Chronicle cards
- At 100 days: unlock exclusive art style variant
- Badges visible on profile

### Storage
New table `chronicle_badges` or JSONB field on `chronicle_settings`:
```
badges_earned    JSONB [] (e.g., [{ id: "week_weaver", earned_at: "2026-02-24" }])
```

---

## Part 5: App Integration

### Dashboard/Profile (Primary touchpoint)
At top of profile page, above stats:

**Not done today:**
```
+-------------------------------------------+
|  Your Chronicle          [badges row]      |
|  [Lyra sigil] "The cards are waiting       |
|                to hear from you today."     |
|  [====== Chronicle Your Day ========]      |
|  7 day streak  |  23 cards                 |
+-------------------------------------------+
```

**Done today:**
```
+-------------------------------------------+
|  Today's Card            [badges row]      |
|  [Card thumb]  "The Turning Tide"          |
|                 [card meaning excerpt]      |
|  Come back tomorrow                        |
|  8 day streak  |  24 cards                 |
+-------------------------------------------+
```

Files: `src/app/(app)/profile/page.tsx`, new `src/components/chronicle/chronicle-dashboard-card.tsx`

### Navigation
- Replace "Living Deck" sidebar entry with "Chronicle"
- Add to home radio nav nodes
- Add to floating orb / radial nav

Files: `src/components/layout/app-sidebar.tsx`, `src/components/home/radio-nav-nodes.tsx`

### Deck List
- Chronicle deck pinned to top with golden border
- Clicking navigates to `/chronicle` (timeline view)
- Cannot be deleted or made public
- Does NOT count against the 2-deck free tier limit

### Sharing
- Chronicle cards and readings are shareable via link (same mechanism as standard readings)
- Share token on readings, individual card sharing via existing patterns
- The dialogue that created a Chronicle card is NOT shared — only the card itself

### Settings
- Enable/disable Chronicle toggle
- Art style selector
- Interest preferences (edit the chips from onboarding)
- Entry history depth (free: 7 days, pro: all)

---

## Part 6: Database Changes

### New Tables

**`chronicle_entries`** — Daily check-in records
```
id              TEXT PK
user_id         TEXT FK -> users.id
deck_id         TEXT FK -> decks.id
card_id         TEXT FK -> cards.id (null until forged, null for dialogue-only entries)
entry_date      DATE NOT NULL
conversation    JSONB [{role, content, timestamp}]
mood            TEXT (AI-extracted)
themes          JSONB (themes from this entry)
mini_reading    TEXT
status          TEXT DEFAULT 'in_progress' ('in_progress'|'completed'|'abandoned')
created_at      TIMESTAMP
completed_at    TIMESTAMP
UNIQUE(user_id, entry_date)
```

**`chronicle_knowledge`** — Accumulated user understanding
```
user_id                TEXT PK FK -> users.id
themes                 JSONB {}
life_areas             JSONB {}
recurring_symbols      JSONB []
key_events             JSONB []
emotional_patterns     JSONB []
personality_notes      TEXT
interests              JSONB {} (from onboarding selection)
summary                TEXT (<500 tokens compressed)
version                INT DEFAULT 0
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

### Modified Tables

- `decks.deckType`: Migrate `'living'` -> `'chronicle'`
- `livingDeckSettings` -> `chronicle_settings`: Add `chronicle_enabled`, `streak_count`, `longest_streak`, `total_entries`, `last_entry_date`, `badges_earned` (JSONB)
- `cards`: Add optional `chronicle_entry_id` FK for linking cards to source entries
- `readings`: Currently has single `deckId` — keep as primary deck, the multi-deck info is captured via `readingCards` which link to individual cards (and cards link to their decks)

Schema file: `src/lib/db/schema.ts`

---

## Part 7: AI System

### New Prompts (`src/lib/ai/prompts/chronicle.ts`)

1. **Conversation system prompt** — Lyra as daily companion. Warm, brief, seeks the emotional/symbolic core. Knowledge context injected.
2. **Greeting builder** — Time-aware, references recent entries, patterns, milestones
3. **Card generation** — Creates card from conversation + knowledge + avoids recent themes. Card feedback ("loved" cards) influences generation style.
4. **Mini-reading** — Connects today's card to broader Chronicle journey
5. **Knowledge extraction** — Structured output: themes, emotions, symbols, life areas from each entry
6. **Chronicle position assignment** — When Chronicle card is in a reading spread, determines optimal position via structured output
7. **Onboarding conversation** — Initial Lyra dialogue to learn about the user

### Knowledge Pipeline
1. After each completed entry: extract themes/emotions/symbols (structured output)
2. Merge into `chronicle_knowledge` (increment counts, update timestamps)
3. Every 10 entries: regenerate compressed `summary`
4. Knowledge feeds into ALL AI prompts app-wide (readings, deck creation, daily greetings)

### Context Management
- `chronicle_knowledge.summary` stays under 500 tokens
- Last 3-5 recent entries provide immediate context
- Older entries compressed into knowledge graph
- Reuses patterns from existing `src/lib/ai/context-compression.ts`

---

## Part 8: Usage & Billing

| Aspect | Free | Pro |
|--------|------|-----|
| Daily dialogue | Unlimited | Unlimited |
| Card generation (text + image) | 1 card + 1 image credit | 1 card + 1 image credit |
| Chronicle reading (mini) | Included with card gen | Included with card gen |
| Full reading with Chronicle | 1 reading credit | 1 reading credit |
| Chronicle deck | 1, outside deck limit | 1, outside deck limit |
| AI model | Flash-Lite | Flash |
| Knowledge depth | Basic (last 5 entries) | Full (all + knowledge graph) |
| Mini-reading depth | Brief (1-2 sentences) | Deep (3-5 sentences + patterns) |
| Entry history | Last 7 entries | All entries |
| Gamification | Full | Full |

### Upgrade Pressure
- Free: 10 cards/mo -> ~10 days of Chronicle cards, then dialogue-only mode
- Dialogue data preserved, feeds forward into future card generation
- Upgrade hook: "You've chronicled 14 days this month. Upgrade to Pro to keep building your deck."

---

## Part 9: Routes & API

### Pages
- `/chronicle` — Timeline view of all Chronicle cards + entries
- `/chronicle/today` — Daily check-in flow (persistent shell)
- `/chronicle/setup` — Onboarding flow (art style + interests + Lyra conversation)

### API Routes
- `GET /api/chronicle/today` — Today's entry status + can generate
- `POST /api/chronicle/today/message` — Dialogue exchange (streaming)
- `POST /api/chronicle/today/forge` — Generate card from conversation
- `POST /api/chronicle/today/reading` — Mini-reading (streaming)
- `POST /api/chronicle/today/complete` — Finalize entry + knowledge extraction
- `GET /api/chronicle` — Chronicle deck + settings + stats
- `POST /api/chronicle` — Create Chronicle deck (onboarding)
- `PATCH /api/chronicle/settings` — Update preferences
- `GET /api/chronicle/entries` — Paginated entry history
- Modified: `POST /api/readings` — Accept `deckIds[]` + `chronicleCardId`

---

## Implementation Phases

### Phase 1: Schema & Data Layer
- New tables: `chronicle_entries`, `chronicle_knowledge`
- Modify: `chronicle_settings` (from `livingDeckSettings`), `cards`, `decks`
- DB migration: rename `living` -> `chronicle`
- Query helpers in `src/lib/db/queries.ts`
- TypeScript types in `src/types/index.ts`

### Phase 2: AI Prompts & Knowledge System
- Chronicle prompts (`src/lib/ai/prompts/chronicle.ts`)
- Knowledge extraction pipeline (`src/lib/ai/chronicle-knowledge.ts`)
- Chronicle position assignment structured output
- Register in prompt registry

### Phase 3: Chronicle API Routes
- All `/api/chronicle/` endpoints
- Streaming dialogue + reading endpoints
- Chronicle deck CRUD + settings

### Phase 4: Chronicle Onboarding UI
- Art style picker step
- Interests multi-select chips (spiritual + life domains)
- Lyra onboarding conversation
- Route: `/chronicle/setup`

### Phase 5: Chronicle Daily Flow UI
- State machine (`useChronicleState` reducer)
- Persistent shell at `/chronicle/today`
- Dialogue component (chat bubbles, streaming, input)
- Card forging animation
- Card reveal + mini-reading display
- Dialogue-only mode (no credits)

### Phase 6: Reading Flow — Chronicle Integration Only
> Multi-deck selection, accordion setup, combined card pool, and localStorage defaults are ALREADY DONE.
- Today's Chronicle card auto-include chip in setup UI
- `chronicleCardId` parameter in reading API + AI position assignment
- Enhanced interpretation prompts with Chronicle knowledge context

### Phase 7: App Integration
- Dashboard Chronicle card on profile page
- Navigation updates (sidebar, home, orb)
- Chronicle timeline view at `/chronicle`
- Deck list special treatment
- Settings section
- Sharing (same as reading sharing)

### Phase 8: Gamification
- Streak system implementation
- Badge definitions + earning logic
- Milestone Lyra messages
- Visual rewards (badge display, special borders)
- Dashboard badge row

### Phase 9: Migration & Cleanup
- Rename all Living Deck references -> Chronicle
- Redirect old routes
- Remove deprecated components

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db/schema.ts` | New tables, modify existing |
| `src/lib/db/queries.ts` | Chronicle query helpers |
| `src/types/index.ts` | Chronicle types |
| `src/lib/ai/prompts/living-deck.ts` | Evolve into chronicle.ts |
| `src/lib/ai/prompts/reading-interpretation.ts` | Add Chronicle knowledge context |
| `src/components/readings/reading-flow.tsx` | Add Chronicle card auto-include chip (multi-deck already done) |
| `src/components/readings/reading-flow-state.ts` | Add `chronicleCardId` to state (multi-deck already done) |
| `src/app/api/readings/route.ts` | Add `chronicleCardId` + AI position call (multi-deck already done) |
| `src/app/(app)/profile/page.tsx` | Chronicle dashboard card |
| `src/components/layout/app-sidebar.tsx` | Nav update |
| `src/components/home/radio-nav-nodes.tsx` | Nav update |
| `src/components/guide/lyra-constants.ts` | Chronicle Lyra messages |

## New Files

| File | Purpose |
|------|---------|
| `src/app/(app)/chronicle/today/page.tsx` | Daily check-in page |
| `src/app/(app)/chronicle/page.tsx` | Timeline view |
| `src/app/(app)/chronicle/setup/page.tsx` | Onboarding |
| `src/components/chronicle/chronicle-flow.tsx` | Daily flow persistent shell |
| `src/components/chronicle/chronicle-dialogue.tsx` | Chat component |
| `src/components/chronicle/chronicle-dashboard-card.tsx` | Dashboard widget |
| `src/components/chronicle/chronicle-timeline.tsx` | Card timeline view |
| `src/components/chronicle/chronicle-interests.tsx` | Interest chips selector |
| `src/components/chronicle/card-forging-animation.tsx` | Forging visual |
| `src/components/chronicle/use-chronicle-state.ts` | State machine |
| `src/lib/ai/prompts/chronicle.ts` | All Chronicle prompts |
| `src/lib/ai/chronicle-knowledge.ts` | Knowledge extraction |
| `src/app/api/chronicle/*/` | All Chronicle API routes |

---

## Verification

- [ ] Chronicle onboarding: art style + interests + Lyra conversation works end-to-end
- [ ] Daily flow: greeting -> dialogue -> forge -> reveal -> reading -> complete
- [ ] Dialogue-only mode works when out of credits (no card generation, conversation still saved)
- [ ] Entry persists and card appears in Chronicle deck
- [ ] Streak calculates correctly (consecutive days, resets on miss)
- [ ] Gamification badges earned at milestones with Lyra messages
- [ ] Chronicle appears on dashboard with correct state (done/not done) + badges
- [ ] Chronicle deck pinned at top of deck list with golden treatment
- [ ] Multi-deck selection works in reading flow (ALREADY DONE — verify no regressions)
- [ ] Today's Chronicle card auto-included in readings (new chip UI)
- [ ] AI assigns optimal spread position for Chronicle card (new structured output)
- [ ] Combined card pool draws correctly from multiple decks (ALREADY DONE — verify)
- [ ] Chronicle knowledge feeds into reading interpretations
- [ ] Sharing works for Chronicle readings (same as standard)
- [ ] Free tier: dialogue always works, card gen costs credits, upgrade prompts appear
- [ ] Mobile: all flows work at 390px viewport
- [ ] Abandoned entries can be resumed or restarted
- [ ] Knowledge extraction runs after each completed entry
