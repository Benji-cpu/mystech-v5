# Astrology Integration: From Mock to Production

## Context

The Lyra Journey mock (`/mock/approved/lyra-journey/`) demonstrates a beautiful zodiac-aware onboarding experience: users select their sign, see an animated constellation, have a conversational gathering with Lyra, and receive a 3-card reading. But it's entirely hardcoded — no real birth chart data, no AI-generated content, and no connection to the production app.

The goal is to make astrology a **first-class feature** of MysTech by:
1. Understanding each user's spiritual interests during onboarding (astrology as a primary path)
2. Capturing real birth data and computing the Big Three (Sun, Moon, Rising)
3. Enriching reading interpretations with astrological context
4. Building a streaming UI where astrological aspects highlight as the AI discusses them

---

## 1. Onboarding: Interest Discovery + Zodiac Capture

### The Problem
Currently onboarding (`lyra-onboarding.tsx`) is a lightweight overlay with generic greeting messages. It doesn't learn what the user cares about — astrology, personal oracle, general spirituality — so every user gets the same experience.

### The Design
The Lyra Journey mock becomes the **production onboarding ceremony**. But instead of jumping straight to zodiac selection, it starts with **interest discovery**:

```
Phase 1: Welcome
  Lyra greets, establishes mystical tone

Phase 2: Interest Discovery (NEW)
  "What draws you to the mystical?"
  Options: Astrology / Personal Oracle / Spiritual Growth / Curiosity
  (Multi-select allowed, influences rest of onboarding + app personalization)

Phase 3: Birth Sky (existing mock flow, enhanced)
  IF astrology interest → full birth data capture:
    - Birth date (required) → instant Sun sign reveal + constellation
    - Birth time (optional, gently encouraged) → Moon sign calculation
    - Birth location (optional, with birth time) → Rising sign calculation
    - Big Three revealed with constellation animation
  IF not astrology → abbreviated zodiac picker (sign only, no birth time/location)

Phase 4: Gathering (existing mock flow, now with real AI)
  Lyra conversation tailored to user's interests
  Anchors gathered for first deck suggestion

Phase 5: First Reading or Deck Suggestion
  Route to appropriate next step based on interests
```

### Key Changes from Mock to Production
- Replace hardcoded `MOCK_CONVERSATION` with real AI streaming via `/api/ai/conversation`
- Replace zodiac picker with a birth data form (date picker + optional time + location autocomplete)
- Compute Big Three server-side via ephemeris library
- Store interests + astrological profile in database
- Move from `/mock/approved/lyra-journey/` to `/app/(app)/onboarding/` (gated on first login)

---

## 2. Astrological Data Model

### What We Need (The Big Three)

| Placement | What it represents | Data required | Accuracy |
|-----------|-------------------|---------------|----------|
| **Sun Sign** | Core identity, ego, life purpose | Birth date only | Exact (30-day windows) |
| **Moon Sign** | Emotions, inner self, instincts | Birth date + approximate time | ~2.5 day windows |
| **Rising Sign** | How you present to the world | Birth date + exact time + location | ~2 hour windows |

### Additional Data Points (computed, stored for richer readings)
- **Planetary positions**: Mercury, Venus, Mars, Jupiter, Saturn signs
- **Element balance**: Fire/Earth/Air/Water distribution across placements
- **Current transits at reading time**: Moon phase, transiting moon sign

### Birth Chart Library: `circular-natal-horoscope-js`
- **Pure JavaScript** (works on Vercel serverless, no native compilation)
- Uses Moshier's ephemeris (accurate for zodiac sign determination)
- Calculates Sun, Moon, Ascendant, all planets, house cusps
- Auto-derives timezone from lat/lng
- Install: `npm install circular-natal-horoscope-js`

For moon phase at reading time: `suncalc` (tiny pure-JS library)

### New File: `src/lib/astrology/birth-chart.ts`
```typescript
import { Origin, Horoscope } from 'circular-natal-horoscope-js';

export function calculateBirthChart(params: {
  year: number; month: number; day: number;
  hour?: number; minute?: number;
  latitude?: number; longitude?: number;
}) {
  const origin = new Origin({
    year: params.year, month: params.month, date: params.day,
    hour: params.hour ?? 12, minute: params.minute ?? 0,
    latitude: params.latitude ?? 0, longitude: params.longitude ?? 0,
  });
  const horoscope = new Horoscope({
    origin, houseSystem: 'placidus', zodiac: 'tropical', language: 'en',
  });
  return {
    sunSign: horoscope.SunSign.label,
    moonSign: params.hour != null ? horoscope.CelestialBodies.moon.Sign.label : null,
    risingSign: (params.hour != null && params.latitude != null)
      ? horoscope.Ascendant.Sign.label : null,
    planetaryPositions: Object.fromEntries(
      Object.entries(horoscope.CelestialBodies).map(([k, v]) => [k, v.Sign.label])
    ),
  };
}
```

---

## 3. Database Schema

### New table: `astrology_profiles` (1:1 with users)
```
src/lib/db/schema.ts
```

```typescript
export const astrologyProfiles = pgTable("astrology_profile", {
  userId: text("user_id").primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // Raw birth data
  birthDate: timestamp("birth_date", { mode: "date" }).notNull(),
  birthTimeKnown: boolean("birth_time_known").default(false).notNull(),
  birthHour: integer("birth_hour"),        // 0-23, null if unknown
  birthMinute: integer("birth_minute"),    // 0-59, null if unknown
  birthLatitude: text("birth_latitude"),   // decimal string
  birthLongitude: text("birth_longitude"), // decimal string
  birthLocationName: text("birth_location_name"),

  // Calculated Big Three
  sunSign: text("sun_sign").notNull(),
  moonSign: text("moon_sign"),             // null if no birth time
  risingSign: text("rising_sign"),         // null if no birth time + location

  // Extended (JSONB)
  planetaryPositions: jsonb("planetary_positions"),
  elementBalance: jsonb("element_balance"),

  // Spiritual interests (from onboarding)
  spiritualInterests: jsonb("spiritual_interests").$type<string[]>(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
```

### New table: `reading_astrology` (1:1 with readings, snapshot at reading time)
```typescript
export const readingAstrology = pgTable("reading_astrology", {
  readingId: text("reading_id").primaryKey()
    .references(() => readings.id, { onDelete: "cascade" }),

  moonPhase: text("moon_phase").notNull(),
  moonSign: text("moon_sign"),
  cardAssociations: jsonb("card_associations").$type<{
    cardTitle: string;
    positionName: string;
    rulingSign: string;
    rulingPlanet: string;
    elementHarmony: 'aligned' | 'complementary' | 'challenging';
    relevantPlacement: 'sun' | 'moon' | 'rising' | 'general';
    astroNote: string;
  }[]>(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
```

---

## 4. AI Integration: Astrology-Enriched Readings

### Strategy: Extend Existing `streamObject` Schema

The reading system already uses `streamObject` with `ReadingInterpretationSchema` (structured output: `{cardSections, synthesis, reflectiveQuestion}`) and `useObject` on the frontend. This is ideal — we extend the schema with optional astrology fields that stream alongside the interpretation.

**No text markers. No parallel fetch. No separate `generateObject` call.** Astrology data arrives as part of the same structured stream.

### Schema Extension

**File: `src/lib/ai/prompts/reading-interpretation.ts`**

Extend `ReadingInterpretationSchema` with optional astrology fields:

```typescript
export const ReadingInterpretationSchema = z.object({
  cardSections: z.array(
    z.object({
      positionName: z.string(),
      text: z.string(),
      // NEW: per-card astrological resonance
      astroResonance: z.object({
        relevantPlacement: z.enum(["sun", "moon", "rising", "general"]),
        rulingSign: z.string(),
        rulingPlanet: z.string(),
        elementHarmony: z.enum(["aligned", "complementary", "challenging"]),
      }).optional(),
    })
  ),
  synthesis: z.string(),
  reflectiveQuestion: z.string(),
  // NEW: overall astrological context for this reading
  astroContext: z.object({
    dominantInfluence: z.enum(["sun", "moon", "rising"]),
    celestialNote: z.string().describe("Brief note on current moon phase or notable transit"),
  }).optional(),
});
```

The `.optional()` means non-astrology readings (users without birth data) work identically to today. The AI only fills these fields when `astroContext` is present in the prompt.

### Prompt Changes

**File: `src/lib/ai/prompts/reading-interpretation.ts`**

Add an optional `astroContext` parameter to `buildReadingInterpretationPrompt`:

```typescript
export type AstrologicalReadingContext = {
  sunSign: string;
  moonSign: string | null;
  risingSign: string | null;
  elementBalance: { fire: number; earth: number; air: number; water: number } | null;
  currentMoonPhase: string;
  currentMoonSign: string;
};
```

When present, append to the prompt:
```
Astrological context for this seeker:
- Birth chart: Sun in Scorpio, Moon in Pisces, Leo Rising
- Element balance: Fire 2, Earth 1, Air 3, Water 4
- Current moon: Waxing Crescent in Gemini

Weave astrological insights naturally into the interpretation. Reference placements
where they illuminate card meanings — keep astrology as seasoning, not the main course.
The cards remain the focus.

For each card section, fill the astroResonance field indicating which of the seeker's
placements (sun, moon, rising) resonates most with that card.
Also fill astroContext with the dominant astrological influence across the full reading.
```

### Frontend: Derive Highlights from Streaming Object

**File: `src/components/readings/reading-interpretation.tsx`**

The component already derives `activeCardIndex` from `object?.cardSections`. We add astrology highlighting with the same pattern:

```typescript
// Derive which astrological placement is currently being discussed
const activeAstroPlacement = useMemo(() => {
  if (!object?.cardSections || activeCardIndex === null) return null;
  return object.cardSections[activeCardIndex]?.astroResonance?.relevantPlacement ?? null;
}, [object, activeCardIndex]);

// Notify parent component of astro placement changes
useEffect(() => {
  onActiveAstroPlacement?.(activeAstroPlacement);
}, [activeAstroPlacement, onActiveAstroPlacement]);
```

### API Route Changes

**File: `src/app/api/ai/reading/route.ts`**

```
1. Fetch user's astrology profile (if exists)
2. Compute current celestial context (suncalc: moon phase + sign)
3. Pass astroContext to buildReadingInterpretationPrompt
4. streamObject with extended schema (astro fields filled by AI when context provided)
5. In onFinish: save interpretation + save readingAstrology snapshot from object
```

No new endpoints needed — everything flows through the existing `streamObject` response.

---

## 5. Frontend: Streaming UI with Astrology Highlighting

### How It Works (No Text Parsing Needed)

Since the reading uses `streamObject` + `useObject`, astrology data arrives as structured fields on the partial object. The frontend simply reads `object.cardSections[i].astroResonance` and `object.astroContext` — no regex, no text manipulation.

The existing `activeCardIndex` derivation already tracks which card section is streaming. We add `activeAstroPlacement` derived from the same data.

### Reading Interpretation Changes

**File: `src/components/readings/reading-interpretation.tsx`**

- Add `onActiveAstroPlacement?: (placement: string | null) => void` prop
- Derive placement from `object?.cardSections[activeCardIndex]?.astroResonance`
- Pass per-card `astroResonance` data to parent for display
- TTS unaffected — it only reads `section.text`, astro fields are separate

### New Component: `AstrologyBar`

**File: `src/components/readings/astrology-bar.tsx`**

A horizontal strip that sits between the card zone and text zone in the reading flow:

```
Mobile (fits in persistent shell):
+---------------------+
| Card Spread         |  <- Zone 2 (existing)
+---------------------+
| Sun Scorpio  Moon Pisces |  <- NEW: AstrologyBar (thin strip, badges pulse when active)
| Rising Leo   Waxing     |
+---------------------+
| Interpretation Text |  <- Zone 3 (existing, now with per-card astro notes inline)
+---------------------+
```

- Shows Big Three as compact badges with zodiac glyphs
- Active placement badge pulses/glows gold when the AI is discussing it
- Moon phase shown as small icon
- Collapses to a single row on small mobile
- Only renders when user has astrology profile

### Reading Flow Shell Changes

**File: `src/components/readings/reading-flow.tsx`**

- Add a thin zone between card zone and text zone for `AstrologyBar`
- Fetch user's astrology profile (simple `useSWR` or `useEffect` fetch)
- Pass `activeAstroPlacement` from `ReadingInterpretation` to `AstrologyBar`
- Zone height: `shrink-0` (fixed thin bar, not flex-growing)

---

## 6. Implementation Phases

### Phase 1: Foundation (astrology library + schema + types)
- Install `circular-natal-horoscope-js` and `suncalc`
- Create `src/lib/astrology/birth-chart.ts` — `calculateBirthChart()`, `getCurrentCelestialContext()`
- Add `astrologyProfiles` and `readingAstrology` tables to `src/lib/db/schema.ts`
- Add TypeScript types to `src/types/index.ts`
- Run `npm run db:push`
- **Files**: `src/lib/astrology/birth-chart.ts` (new), `src/lib/db/schema.ts`, `src/types/index.ts`, `package.json`

### Phase 2: API Layer
- Create `POST/GET /api/astrology/profile` — save/fetch astrology profile
- Add geocoding utility for birth location (Google Places or city lookup)
- **Files**: `src/app/api/astrology/profile/route.ts` (new)

### Phase 3: AI Prompt + Schema Enhancement
- Extend `ReadingInterpretationSchema` with optional `astroResonance` per card section and `astroContext` at top level
- Add `AstrologicalReadingContext` type and prompt extension to reading-interpretation.ts
- Modify `/api/ai/reading/route.ts` to fetch astro profile, compute current sky, pass to prompt
- Save `readingAstrology` snapshot in `onFinish` from `object.astroContext`
- **Files**: `src/lib/ai/prompts/reading-interpretation.ts`, `src/app/api/ai/reading/route.ts`

### Phase 4: Reading UI Enhancement
- Extend `ReadingInterpretation` to emit `onActiveAstroPlacement` from streaming object
- Create `AstrologyBar` component (compact Big Three badges + moon phase)
- Add thin astrology zone to `ReadingFlow` persistent shell between card and text zones
- Wire up placement highlighting (badge pulses when AI discusses that placement)
- **Files**: `src/components/readings/reading-interpretation.tsx`, `src/components/readings/astrology-bar.tsx` (new), `src/components/readings/reading-flow.tsx`

### Phase 5: Onboarding Ceremony
- Create `/app/(app)/onboarding/page.tsx` — production version of Lyra Journey
- Adapt components from mock: zodiac constellation, conversation chat, anchor strip
- Add interest discovery phase before zodiac
- Add birth data form (date picker + optional time + location autocomplete)
- Connect to real AI for conversation (replace hardcoded `MOCK_CONVERSATION`)
- Gate on first login (check if user has completed onboarding)
- **Files**: `src/app/(app)/onboarding/page.tsx` (new), adapted components from `src/app/mock/approved/lyra-journey/`

### Phase 6: Profile Integration
- Add "Celestial Profile" section to user profile page
- Show Big Three with constellation visualization
- Allow editing birth data (recalculates placements)
- Show spiritual interests with edit capability
- **Files**: `src/app/(app)/profile/page.tsx`, `src/components/profile/celestial-profile.tsx` (new)

---

## 7. Critical Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/astrology/birth-chart.ts` | Create | Ephemeris wrapper, Big Three calculation |
| `src/lib/db/schema.ts` | Edit | Add astrologyProfiles + readingAstrology tables |
| `src/types/index.ts` | Edit | Add astrology types |
| `src/lib/ai/prompts/reading-interpretation.ts` | Edit | Extend schema + add astroContext to prompt |
| `src/app/api/ai/reading/route.ts` | Edit | Fetch astro profile, compute sky, pass to prompt, save snapshot |
| `src/app/api/astrology/profile/route.ts` | Create | CRUD for astrology profile |
| `src/components/readings/reading-interpretation.tsx` | Edit | Emit astro placement from streaming object |
| `src/components/readings/astrology-bar.tsx` | Create | Big Three badges with highlight state |
| `src/components/readings/reading-flow.tsx` | Edit | Add astrology bar zone, fetch profile |
| `src/app/(app)/onboarding/page.tsx` | Create | Production onboarding ceremony |
| `src/components/profile/celestial-profile.tsx` | Create | Zodiac profile display + edit |

---

## 8. Verification

### Unit Tests
- `birth-chart.test.ts` — verify Big Three calculation for known birth data (e.g., Jan 1 2000, 12:00, NYC -> known signs)
- `reading-interpretation.test.ts` — verify prompt includes astro section when context provided, verify schema extension validates

### Integration Tests
- `/api/astrology/profile` — POST birth data, verify calculation + storage
- `/api/ai/reading` — verify astro-enriched prompt, verify `object.cardSections[i].astroResonance` populated in response

### E2E Tests
- Complete onboarding flow: interest selection -> birth data -> zodiac reveal
- Reading with astrology: perform reading -> verify astrology bar appears -> verify badges highlight during streaming

### Manual Testing
- Run dev server, save astrology profile via API
- Perform a reading and verify:
  - Interpretation text weaves astrological references naturally
  - `AstrologyBar` shows Big Three badges
  - Active badge pulses as AI streams that card's section
  - Per-card `astroResonance` data renders correctly
  - Moon phase shown accurately
  - TTS narration unaffected (reads `section.text` only, not astro fields)
  - Without astrology profile: reading works identically to today (optional fields omitted)
