# Practices Feature — Design Spec

Audio-guided meditation practices tied to path waypoints. Users hear short speech segments interspersed with timed silence, creating structured meditation experiences within their path progression.

## Context

MysTech v5 has a Paths feature where users follow structured sequences (Path > Retreat > Waypoint). Each waypoint currently requires readings to advance. Practices add a second requirement: a guided audio meditation that must be completed before waypoint progression.

The existing TTS infrastructure (Google Chirp3-HD-Leda voice, `AudioQueue`, `/api/voice/tts` route) handles speech synthesis. What's missing is the sequencing layer: alternating speech and silence segments into a cohesive meditation experience.

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
| waypointId | text, nullable | waypoint_id | FK to `waypoints` (`onDelete: "cascade"`). Nullable for future standalone practices |
| userId | text, nullable | user_id | FK to `users` (`onDelete: "cascade"`). null = shared template; set = AI-personalized for specific user |
| title | text | title | e.g. "Grounding in the Present" |
| description | text | description | Shown before starting |
| targetDurationMin | integer | target_duration_min | 10, 15, 20, or 30 |
| sortOrder | integer | sort_order | Default 0. Ordering handled in application code (no DB unique constraint, since NULL userId complicates SQL UNIQUE) |
| createdAt | timestamp | created_at | Default now() |

**Indexes:** `practice_waypoint_id_idx` on `waypointId`, `practice_user_id_idx` on `userId`.

### `practiceSegments` table

| Column | Drizzle Type | DB Column | Notes |
|--------|-------------|-----------|-------|
| id | text | id | PK, CUID2 |
| practiceId | text | practice_id | FK to `practices` (`onDelete: "cascade"`) |
| segmentType | text | segment_type | `'speech'` or `'pause'` |
| text | text, nullable | text | Speech content. Null for pause segments |
| durationMs | integer, nullable | duration_ms | Pause duration in ms. Null for speech segments (duration determined by TTS output) |
| estimatedDurationMs | integer, nullable | estimated_duration_ms | For speech segments: estimated TTS audio duration (word count * ~400ms/word). Used for progress bar calculation before playback. Null for pause segments. |
| sortOrder | integer | sort_order | Playback order within the practice |

**Indexes:** `practice_segment_practice_id_idx` on `practiceId`.

### `userPracticeProgress` table

| Column | Drizzle Type | DB Column | Notes |
|--------|-------------|-----------|-------|
| id | text | id | PK, CUID2 |
| userId | text | user_id | FK to `users` (`onDelete: "cascade"`) |
| practiceId | text | practice_id | FK to `practices` (`onDelete: "cascade"`) |
| completedAt | timestamp, nullable | completed_at | When first completed |
| lastPlayedAt | timestamp, nullable | last_played_at | Updated on every play (including replays) |
| playCount | integer | play_count | Default 0. Set to 1 on first completion, incremented on subsequent completions |

**Constraints:** `unique().on(t.userId, t.practiceId)` — one progress row per user per practice.
**Indexes:** `user_practice_progress_user_id_idx` on `userId`.

### Design Decisions

**One practice per waypoint (Phase 1):** Each waypoint has exactly one template practice. The `sortOrder` column exists for future extensibility (multiple practices per waypoint), but Phase 1 assumes one-to-one.

**Practice TTS is exempt from voice character billing.** Practice speech is curated content integral to the path experience, not an optional reading enhancement. Implementation: a dedicated `POST /api/practices/tts` route calls the TTS provider directly (same `GoogleTTSProvider`), bypassing the billing checks in `/api/voice/tts`. This route is auth-protected and only accepts `practiceId` + `segmentId` as parameters (server-side lookup of text), preventing misuse as a general TTS bypass.

**Voice selection:** Practices always use the default Leda voice (`DEFAULT_VOICE_ID`) at speed `1.0`, ignoring user voice preferences and speed settings. This ensures consistent guide persona and predictable `estimatedDurationMs` calculations (word count * ~400ms/word at 1.0x speed).

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

**Composes `AudioQueue` directly** (not `useTextToSpeech`). The `useTextToSpeech` hook is designed for streaming token-by-token synthesis with a `SentenceBuffer`, which practices don't need. Building directly on `AudioQueue` gives cleaner control over segment-by-segment playback and avoids `AbortController` conflicts with the pre-caching strategy.

**Single-buffer-per-segment constraint:** The hook enqueues exactly one audio buffer per speech segment into `AudioQueue`. It does NOT pre-enqueue the next speech buffer. Instead, the next speech audio is pre-fetched and held in memory, then enqueued only after the current segment finishes. The hook detects segment completion by observing `AudioQueue`'s state transition from `playing` to `idle` via the `onStateChange` callback. This ensures the pause segment runs between speech segments rather than being skipped by chained audio playback.

### Pre-Caching Strategy

While the current segment plays (speech or pause), fetch TTS audio for the next speech segment in the background. Each speech chunk is short (~200-500 characters), well within the 2000-character TTS limit and fast to synthesize.

### Error Handling

If a TTS call fails: retry once, then skip the speech segment and show the text on-screen as a visual fallback. Continue to the next segment. Practice is never aborted due to a single segment failure. Pause segments are pure timers with no failure mode.

### Screen Wake Lock

Acquire a Wake Lock (`navigator.wakeLock.request('screen')`) when a practice starts playing. Release on completion or stop. This prevents the device from sleeping during a 10-30 minute meditation. Falls back gracefully on unsupported browsers (no lock, practice still works).

### Navigation Away

If the user navigates away mid-practice, the practice resets to the beginning. No mid-practice resume capability in Phase 1. On desktop, a `beforeunload` warning is shown if the practice is in `playing` or `paused` state. **Known limitation:** `beforeunload` is unreliable on iOS Safari and some mobile browsers. As a supplementary approach, intercept in-app navigation via Next.js router events to show an in-app "Leave practice?" confirmation dialog for navigation within the app. External navigation (closing the browser) on mobile may bypass the warning — this is acceptable since the practice simply resets on next visit.

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

## API Routes

### `GET /api/practices/[waypointId]`

Returns the practice for a waypoint, including segments and the current user's progress. For Pro users, returns their personalized version if one exists, otherwise the template.

```typescript
// Response shape
{
  data: {
    practice: {
      id: string
      title: string
      description: string
      targetDurationMin: number
      isPersonalized: boolean // true if this is the user's AI-generated version
      segments: {
        id: string
        segmentType: 'speech' | 'pause'
        text: string | null
        durationMs: number | null
        estimatedDurationMs: number | null
        sortOrder: number
      }[]
    } | null  // null if no practice exists for this waypoint
    progress: {
      completedAt: string | null
      lastPlayedAt: string | null
      playCount: number
    } | null  // null if user has never started this practice
  }
}
```

### `POST /api/practices/complete`

Marks a practice as completed. Creates or updates the `userPracticeProgress` row.

```typescript
// Request body
{ practiceId: string }

// Behavior:
// - If no progress row exists: create with completedAt = now, lastPlayedAt = now, playCount = 1
// - If progress row exists but completedAt is null: set completedAt = now, lastPlayedAt = now, playCount = 1
// - If progress row exists and completedAt is set (replay): update lastPlayedAt = now, increment playCount
// - After updating progress: call checkAndAdvanceWaypoint()
```

### `POST /api/practices/tts`

Practice-specific TTS endpoint that bypasses voice character billing.

```typescript
// Request body
{ practiceId: string, segmentId: string }

// Behavior:
// - Auth required
// - Server-side lookup: fetch segment text from DB using practiceId + segmentId
// - Verify the segment belongs to the given practice (prevents tampering)
// - Synthesize with GoogleTTSProvider using DEFAULT_VOICE_ID at speed 1.0
// - Returns audio/mpeg binary (same format as /api/voice/tts)
// - Does NOT increment voiceCharactersUsed
```

## Path Progression Integration

### Updated Waypoint Completion Rule

Current: waypoint advances when `readingsCompleted >= requiredReadings`.

New: waypoint advances when `readingsCompleted >= requiredReadings` **AND** waypoint's practice is marked complete in `userPracticeProgress`.

### Waypoint Completion Query

Both `recordPathReading()` and the practice completion endpoint must check the full waypoint completion condition. The check:

1. Query `practices` for the template practice at this waypoint (`waypointId = X AND userId IS NULL`)
2. If no practice exists for this waypoint, treat the practice requirement as auto-satisfied (avoids deadlocking users at unseeded waypoints)
3. If a practice exists, check `userPracticeProgress` for a row with `completedAt IS NOT NULL` for either the template practice or a personalized version at the same waypoint
4. Combine with reading count check: `readingsCompleted >= requiredReadings AND (no practice exists OR practice completed)`

Whichever event happens last (final reading or practice completion) triggers the waypoint advancement. Both handlers call the same shared `checkAndAdvanceWaypoint()` function to prevent double-advancement. This function wraps its read-check-write in `db.transaction(async (tx) => { ... })` to atomically verify the completion conditions and update status, preventing the race condition where simultaneous reading + practice completion could both pass the check before either writes.

### Seeding

`scripts/seed-paths.ts` extended to seed practices and segments for each waypoint. Initial scope: first retreat of each path (~12-15 practices total). Each practice uses one of several standard templates (e.g., "3-segment 10-minute", "5-segment 20-minute") with waypoint-specific speech text.

## Scope & Phasing

### Phase 1 (MVP)
- Schema: `practices`, `practiceSegments`, `userPracticeProgress` tables
- `usePracticePlayer` hook with segment sequencing and pause timers (composes `AudioQueue` directly)
- Practice screen UI (persistent shell, three zones)
- Pre-authored practices for first retreat of each path (~12-15)
- Waypoint progression gate (practice required, with graceful fallback for unseeded waypoints)
- API routes: GET practice by waypoint (includes progress), POST mark complete
- Screen wake lock during playback
- Navigation-away warning

### Phase 2
- AI personalization for Pro users
- Practice generation prompt and Gemini integration
- Full practice seeding for all waypoints (~60)

### Phase 3 (Future)
- Standalone practices (waypointId = null, browseable library)
- Practice recommendations on dashboard
- Background ambient audio layers (nature sounds, singing bowls)
- ElevenLabs voice option for Pro tier
- Audio blob caching for replays (reduces TTS costs on replay)
- Mid-practice resume capability

## Files Affected

### New Files
- `src/hooks/use-practice-player.ts` — Segment timeline player hook (composes AudioQueue)
- `src/components/practices/practice-screen.tsx` — Full-screen practice UI
- `src/components/practices/practice-controls.tsx` — Play/pause/stop controls
- `src/components/practices/pause-timer.tsx` — Visual countdown for pause segments
- `src/app/api/practices/[waypointId]/route.ts` — GET practice data + progress
- `src/app/api/practices/complete/route.ts` — POST mark practice complete
- `src/app/api/practices/tts/route.ts` — Practice-specific TTS (billing-exempt)
- `src/lib/ai/prompts/practice-generation.ts` — AI personalization prompt (Phase 2)
- `scripts/seed-practices.ts` — Seed practice content (independent script, reads waypointIds from DB after path seeding)

### Modified Files
- `src/lib/db/schema.ts` — Add 3 new tables (practices, practiceSegments, userPracticeProgress)
- `src/lib/db/queries-paths.ts` — Add `checkAndAdvanceWaypoint()`, update waypoint completion check
- `src/app/(app)/paths/[pathId]/page.tsx` — Add practice entry point to waypoint view
- `src/components/paths/retreat-map.tsx` — Show practice completion state
- `scripts/seed-paths.ts` — Integrate practice seeding
