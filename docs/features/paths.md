# Paths — Spiritual Journey Framework

## Status: In Progress

## Overview

"Paths" evolve the dead `spiritualInterests` database field into a structured **spiritual journey system**. A Path is a spiritual or philosophical lens (e.g., Archetypal, Mindfulness, Mysticism) that shapes how the AI interprets readings. Each Path contains **Retreats** (chapters) and **Waypoints** (milestones), turning readings into connected data points on a journey that unfolds over weeks or months.

## Core Concepts

- **Path**: A named framework with themes, symbolic vocabulary, and an interpretive lens. Contains 3-5 Retreats.
- **Retreat**: A chapter within a Path focused on a specific theme. Contains 3-5 Waypoints. Completing a Retreat generates an **Artifact** — an AI-generated reflection summarizing the journey through that chapter.
- **Waypoint**: A milestone within a Retreat. Each Waypoint suggests an intention (auto-fills reading question) and has a lens that further focuses the AI interpretation. Completing 1+ reading at a Waypoint advances the user to the next.
- **One active Path per user** — set globally on their profile. Progress is preserved when switching Paths.
- **A Path taking months is a feature, not a bug** — this is a deep, slow spiritual practice.

## "Cards Remember" Engine

The signature feature: when a card appears in a reading during a Path, the AI remembers every previous time that card appeared during the same Retreat. This creates a sense of continuity and deepening.

**How it works:** At interpretation time, for each drawn card, query past readings where that card (by cardId) appeared during a Retreat. This is a read-time join, not a separate stored table.

**Prompt injection:**
```
Cards with journey memory:
- "The Turning Tide" appeared during your Shadow Dance retreat (waypoint: Shadow as Teacher).
  At that time you asked: "What am I afraid to face?"
When interpreting these cards, honor their journey history. Notice continuity, growth, or
recurring patterns. Only weave this in where it deepens the reading naturally.
```

## The 3 Starting Paths

### 1. Archetypal (Jungian Psychology)
Universal appeal — shadow work, inner archetypes, individuation. Connects powerfully to oracle cards which are themselves archetypal symbols.

| Retreat | Theme | Waypoints |
|---------|-------|-----------|
| The Threshold | Self-awareness and the call to inner work | Acknowledging the Call, Meeting Your Persona, The Mirror's Edge |
| Shadow Dance | Integrating the shadow self | What You Reject, Shadow as Teacher, The Gift in the Dark, Shadow Integration |
| The Inner Council | Meeting your archetypes | The Inner Child, The Warrior, The Sage, The Lover, The Sovereign |
| The Descent | The dark night of the soul | Letting Go, The Depths, The Treasure, The Return |
| Individuation | Becoming whole | Gathering the Fragments, The Sacred Marriage, The Integrated Self |

### 2. Mindfulness (Present-Moment Awareness)
Most practical and immediately applicable. Progressive deepening from basic awareness to advanced states.

| Retreat | Theme | Waypoints |
|---------|-------|-----------|
| Arriving Here | Cultivating presence | The Pause, Anchoring in Breath, Body as Home |
| The Witnessing Eye | Developing the observer | Watching Thoughts, Emotional Weather, Non-Judgment, Spacious Awareness |
| Impermanence | Sitting with change | What Is Passing, Grief and Release, The Beauty of Transience, Finding Stillness in Flow |
| Compassion's Gate | Opening the heart | Self-Compassion, Empathy as Practice, Forgiveness, Loving-Kindness |
| Beginner's Mind | Returning to wonder | Unknowing, Fresh Eyes, The Ordinary Sacred |

### 3. Mysticism (Direct Experience of the Transcendent)
The most "mystical" — aligns perfectly with the app's atmosphere. Covers contemplative traditions across cultures.

| Retreat | Theme | Waypoints |
|---------|-------|-----------|
| The Veil | Sensing what lies beyond | Thin Places, Signs and Synchronicities, The Sacred Question |
| Contemplation | Practices of inner seeing | Silence as Language, The Inner Light, Sacred Darkness, Prayer Without Words |
| The Dark Night | Purification through unknowing | Loss of Certainty, The Void, Surrender, Grace in Absence |
| Sacred Union | Dissolving boundaries | Self and Other, Above and Below, The Beloved, Unio Mystica |
| The Return | Bringing vision into the world | Integration, Embodied Wisdom, Service as Path |

## Data Model

### New Tables (7)

**`paths`** — Path definitions (3 presets initially)
- id, name, description, themes[], symbolicVocabulary[], interpretiveLens, isPreset, createdBy, isPublic, shareToken, followerCount, iconKey, sortOrder, timestamps
- Follows the `artStyles` table pattern

**`retreats`** — Chapters within a Path (3-5 per Path)
- id, pathId (FK), name, description, theme, sortOrder, retreatLens (paragraph for AI prompt injection), estimatedReadings, timestamps

**`waypoints`** — Milestones within a Retreat (3-5 per Retreat)
- id, retreatId (FK), name, description, sortOrder, suggestedIntention (auto-fills reading question), waypointLens (AI prompt context), requiredReadings (default 1), timestamps

**`userPathProgress`** — Tracks user's active Path + position
- id, userId, pathId, status ("active"/"completed"/"paused"), currentRetreatId, currentWaypointId, startedAt, completedAt
- Unique on (userId, pathId) — progress preserved when switching Paths

**`userRetreatProgress`** — Tracks Retreat completion + stores Artifact
- id, userId, retreatId, pathProgressId, status, readingCount, startedAt, completedAt, artifactSummary, artifactThemes[], artifactImageUrl

**`userWaypointProgress`** — Tracks Waypoint completion
- id, userId, waypointId, retreatProgressId, status, readingCount, startedAt, completedAt

**`readingJourneyContext`** — Snapshots Path/Retreat/Waypoint lens at reading time
- readingId (PK, FK), pathId, retreatId, waypointId, pathLensSnapshot, retreatLensSnapshot, waypointLensSnapshot, waypointIntentionSnapshot
- Snapshots prevent future edits from retroactively changing past readings

### Schema Modifications (2 existing tables)

- `readings` — add `pathId` (FK, nullable) for quick filtering
- `userProfiles` — add `activePathId` (FK, nullable)

## Integration Points

### Reading Interpretation

When a user has an active Path + Waypoint, inject journey context into the AI interpretation prompt:

```
The seeker is on the {pathName} path, currently in the "{retreatName}" retreat
at the "{waypointName}" waypoint.

Path lens: {pathLens}
Retreat focus: {retreatLens}
Waypoint intention: {waypointLens}

{cardsRemember section if any}

Interpret through the lens of their current journey. The journey context is seasoning,
not the main course — the cards and their personal symbolism remain the focus.
```

### Reading Setup UI

- New `JourneyContextBanner` component in the setup zone
- Shows current Retreat + Waypoint when user has an active Path
- Offers `suggestedIntention` as one-tap fill for the question field
- Can be dismissed (user does a freeform reading outside journey)

### Reading Creation

- Accept optional `pathId`, `retreatId`, `waypointId` in request body
- Create `readingJourneyContext` row with lens snapshots
- Increment `readingCount` on `userWaypointProgress`
- Auto-advance: if `readingCount >= requiredReadings`, mark Waypoint complete, activate next Waypoint (or complete Retreat if last)

### Retreat Artifact Generation

When all Waypoints in a Retreat complete:
1. Fetch all readings for this user + Retreat
2. AI generates: 2-3 paragraph reflection, 3-5 extracted themes, image prompt
3. Optionally generate image via Imagen 4
4. Save to `userRetreatProgress` (artifactSummary, artifactThemes, artifactImageUrl)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/paths` | GET | List all paths |
| `/api/paths/[pathId]` | GET | Path detail with retreats + waypoints |
| `/api/paths/activate` | POST | Set active path for user |
| `/api/paths/progress` | GET | User's journey progress |
| `/api/paths/retreats/[retreatId]/artifact` | POST | Generate retreat artifact |

## UI Pages

### `/paths` hub page
- Browse 3 preset Paths as cards
- Show active Path with progress indicator
- Start/switch/pause Path actions

### `/paths/[pathId]` detail page
- Path description and lens
- Retreat map showing progression (visual, not a list)
- Current position highlighted, completed Retreats dimmed with Artifact preview
- Waypoint progress within current Retreat

### Path Badge
- Compact indicator on profile page and sidebar
- Shows Path icon + name + current Retreat

## Custom Path Creation (Phase 2)

AI-guided interview with Lyra (3-5 turns) to create custom Paths with custom Retreats/Waypoints.

## Sharing (Phase 2)

Same pattern as art style sharing: share tokens, follow/unfollow model, explore tab.

## Phased Rollout

### MVP (Phase 1) — Current
- 3 preset Paths with Retreats + Waypoints seeded in database
- Path selector + activation
- Journey context injected into reading interpretation
- "Cards Remember" engine
- Auto-advance through Waypoints/Retreats
- `/paths` hub page + detail page
- Retreat Artifact generation

### Phase 2
- Custom Path creation via AI interview
- Path sharing (share tokens, public pages)
- Follow/unfollow model
- Paths in Explore tab

### Phase 3
- Path analytics
- Path recommendations
- Path evolution (Lyra suggests refinements)
- Path blending (hybrid paths)

## Open Questions

- Should path selection be required or optional? **Decision: optional — no path = generic interpretation**
- Should changing your active path retroactively affect past readings? **Decision: no — lens snapshotted at reading time via readingJourneyContext**
- Should preset paths be editable/forkable? **Decision: Phase 3**

## Testing Checklist

- [ ] All 3 preset paths seeded with retreats + waypoints
- [ ] Active path persists on user profile
- [ ] Journey context appears in AI interpretation (verify via prompt logging)
- [ ] "Cards Remember" surfaces past card appearances in prompt
- [ ] Path selector works on mobile (390px)
- [ ] No path selected = generic interpretation (no errors)
- [ ] Auto-advance: completing Waypoint moves to next
- [ ] Auto-advance: completing last Waypoint in Retreat marks Retreat complete
- [ ] Retreat Artifact generated on completion
- [ ] `/paths` hub page renders all 3 paths
- [ ] `/paths/[pathId]` shows retreat map with progress
- [ ] Path badge displays on profile
- [ ] readingJourneyContext snapshots preserve historical lens text
