# Practices Feature — Design Spec

Audio-guided meditation practices tied to path waypoints. Users hear short speech segments interspersed with timed silence, creating structured meditation experiences within their path progression.

## Context

MysTech v5 has a Paths feature where users follow structured sequences (Path > Retreat > Waypoint). Each waypoint currently requires readings to advance. Practices add a second requirement: a guided audio meditation that must be completed before waypoint progression.

The existing TTS infrastructure (Google Chirp3-HD-Leda voice, `useTextToSpeech` hook, `AudioQueue`, `/api/voice/tts` route) handles speech synthesis. What's missing is the sequencing layer: alternating speech and silence segments into a cohesive meditation experience.

## Core Concept: Segment Timeline

A practice is an ordered list of **segments**, each typed as `speech` or `pause`:

```
Practice = [
  { type: "speech", text: "Welcome. Close your eyes...", order: 1 },
  { type: "pause",  durationMs: 60000, order: 2 },
  { type: "speech", text: "Now bring to mind...", order: 3 },
  { type: "pause",  durationMs: 120000, order: 4 },
  { type: "speech", text: "Gently return...", order: 5 },
]
```

A **PracticePlayer** walks through segments sequentially: for speech, it calls TTS and plays audio; for pauses, it runs a countdown timer. Target practice durations are 10, 15, 20, or 30 minutes. Speech content totals 3-5 minutes across 3-5 segments; pauses fill the remaining time.

## Tiering

- **Free**: Pre-authored template practices (shared across all users at a given waypoint)
- **Pro**: AI-personalized practices — same structure/pauses as the template, but Gemini generates speech text tailored to the user's path context, card history, and personal themes

## Data Model

### `practices` table

| Column | Drizzle Type | DB Column | Notes |
|--------|-------------|-----------|-------|
| id | text | id | PK, CUID2 via `createId()` |
| waypointId | text, nullable | waypoint_id | FK to `waypoints`. Nullable for future standalone practices |
| userId | text, nullable | user_id | null = shared template; set = AI-personalized for specific user |
| title | text | title | e.g. "Grounding in the Present" |
| description | text | description | Shown before starting |
| targetDurationMin | integer | target_duration_min | 10, 15, 20, or 30 |
| sortOrder | integer | sort_order | Unique constraint on (waypoint_id, user_id, sort_order) |
| createdAt | timestamp | created_at | Default now() |

### `practiceSegments` table

| Column | Drizzle Type | DB Column | Notes |
|--------|-------------|-----------|-------|
| id | text | id | PK, CUID2 |
| practiceId | text | practice_id | FK to `practices` |
| segmentType | text | segment_type | `'speech'` or `'pause'` |
| text | text, nullable | text | Speech content. Null for pause segments |
| durationMs | integer, nullable | duration_ms | Pause duration in ms. Null for speech segments (duration determined by TTS output) |
| sortOrder | integer | sort_order | Playback order within the practice |

### `userPracticeProgress` table

| Column | Drizzle Type | DB Column | Notes |
|--------|-------------|-----------|-------|
| id | text | id | PK, CUID2 |
| userId | text | user_id | FK |
| practiceId | text | practice_id | FK to `practices` |
| completedAt | timestamp, nullable | completed_at | When first completed |
| lastPlayedAt | timestamp, nullable | last_played_at | Updated on every play (including replays) |
| playCount | integer | play_count | Default 0, incremented on each completion |

## Player Architecture

### State Machine

```
idle -> loading -> playing -> paused -> completed
                     ^           |
                     |           v
                     +-----------+
```

- **idle**: Practice loaded, description + "Begin Practice" shown
- **loading**: Pre-fetching TTS audio for the first speech segment
- **playing**: Playing a speech segment's audio OR counting down a pause timer
- **paused**: User paused — audio stops or timer freezes
- **completed**: All segments done — marks progress, checks waypoint advancement

### `usePracticePlayer` Hook

```typescript
interface UsePracticePlayerReturn {
  state: 'idle' | 'loading' | 'playing' | 'paused' | 'completed'
  currentSegment: PracticeSegment | null
  currentSegmentIndex: number
  totalSegments: number
  // Pause segment countdown:
  remainingMs: number
  // Controls:
  play: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  // Overall progress:
  elapsedMs: number
  estimatedTotalMs: number
}
```

Internally composes the existing `useTextToSpeech` hook for TTS playback, adding segment sequencing and pause timer logic.

### Pre-Caching Strategy

While the current segment plays (speech or pause), fetch TTS audio for the next speech segment in the background. Each speech chunk is short (~200-500 characters), well within the 2000-character TTS limit and fast to synthesize.

### Error Handling

If a TTS call fails: retry once, then skip the speech segment and show the text on-screen as a visual fallback. Continue to the next segment. Practice is never aborted due to a single segment failure. Pause segments are pure timers with no failure mode.

## UI Design

### Entry Point

Waypoint detail view shows a "Begin Practice" button alongside the reading action. Visually prominent if the practice hasn't been completed (required for progression). Styled as a replay option if already completed.

### Practice Screen (Full-Screen Immersive)

Three zones within a persistent shell:

**Header zone** (compact): Practice title, elapsed/total time, thin progress bar showing segment position.

**Visual zone** (dominant): Dark background with thematic imagery from the waypoint/retreat — archetype icons with removed backgrounds, gently animated (slow float/pulse). During pause segments, a breathing animation or timer ring appears. During speech, imagery is visible but static.

**Controls zone** (bottom): Large centered play/pause button (min 64px). During pauses, remaining time shown. Stop/exit in corner with confirmation dialog.

### Segment Transitions

1-second crossfade between segments. Speech-to-pause: imagery dims slightly, timer ring fades in. Pause-to-speech: imagery brightens. All spring-based physics (Framer Motion), never linear easing.

### Completion Flow

1. Last segment finishes
2. Gentle completion animation (glow/pulse)
3. "Practice Complete" with brief Lyra closing message
4. `userPracticeProgress` marked complete
5. If waypoint now fully done (readings + practice) — auto-advance notification
6. "Return to Path" button

### Mobile-First

- Full viewport (`100dvh`), no scrolling
- Touch targets 44px minimum, play/pause button 64px
- Controls positioned for thumb reach (bottom)
- Reduced animation complexity on mobile

## AI Personalization (Pro Tier)

### Generation Flow

1. Pro user starts a practice for the first time at a waypoint
2. Check for existing personalized version (`practices` row with user's `userId` + same `waypointId`)
3. If none: take the template practice's structure (segment count, pause durations, target duration) and call Gemini to generate personalized speech text
4. Save as a new `practices` row with user's `userId`
5. Play from personalized version

### Prompt Design

Follows the existing composable prompt pattern in `src/lib/ai/prompts/`. The generation prompt receives:

- Waypoint context (name, intention, lens text)
- Retreat context (theme, lens)
- User's card history relevant to this path section
- Template structure as constraint: number of speech segments, approximate word count per segment, topic/intention for each segment

AI outputs structured JSON: array of `{ text: string }` for each speech slot. Pause durations carry over from the template unchanged.

### Caching

Generated personalized practices are stored permanently. No re-generation on replay.

### Fallback

If AI generation fails, fall back to the template version with a subtle "standard version" indicator.

## Path Progression Integration

### Updated Waypoint Completion Rule

Current: waypoint advances when `readingsCompleted >= requiredReadings`.

New: waypoint advances when `readingsCompleted >= requiredReadings` **AND** waypoint's practice is marked complete in `userPracticeProgress`.

`recordPathReading()` in `queries-paths.ts` must be updated to check practice completion when evaluating waypoint advancement.

### Seeding

`scripts/seed-paths.ts` extended to seed practices and segments for each waypoint. Initial scope: first retreat of each path (~12-15 practices total). Each practice uses one of several standard templates (e.g., "3-segment 10-minute", "5-segment 20-minute") with waypoint-specific speech text.

## Scope & Phasing

### Phase 1 (MVP)
- Schema: `practices`, `practiceSegments`, `userPracticeProgress` tables
- `usePracticePlayer` hook with segment sequencing and pause timers
- Practice screen UI (persistent shell, three zones)
- Pre-authored practices for first retreat of each path (~12-15)
- Waypoint progression gate (practice required)
- API routes: GET practice by waypoint, POST mark complete

### Phase 2
- AI personalization for Pro users
- Practice generation prompt and Gemini integration
- Full practice seeding for all waypoints (~60)

### Phase 3 (Future)
- Standalone practices (waypointId = null, browseable library)
- Practice recommendations on dashboard
- Background ambient audio layers (nature sounds, singing bowls)
- ElevenLabs voice option for Pro tier

## Files Affected

### New Files
- `src/lib/db/schema.ts` — Add 3 new tables
- `src/hooks/use-practice-player.ts` — Segment timeline player hook
- `src/components/practices/practice-screen.tsx` — Full-screen practice UI
- `src/components/practices/practice-controls.tsx` — Play/pause/stop controls
- `src/components/practices/pause-timer.tsx` — Visual countdown for pause segments
- `src/app/api/practices/[waypointId]/route.ts` — GET practice data
- `src/app/api/practices/complete/route.ts` — POST mark practice complete
- `src/lib/ai/prompts/practice-generation.ts` — AI personalization prompt (Phase 2)
- `scripts/seed-practices.ts` — Seed practice content

### Modified Files
- `src/lib/db/queries-paths.ts` — Update waypoint completion check
- `src/app/(app)/paths/[pathId]/page.tsx` — Add practice entry point to waypoint view
- `src/components/paths/retreat-map.tsx` — Show practice completion state
- `scripts/seed-paths.ts` — Integrate practice seeding
