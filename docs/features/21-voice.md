# Feature 21: Voice — Lyra Speaks & Listens

## Overview

Give Lyra a voice and let users speak to her. Text-to-Speech (TTS) narrates reading interpretations, card reveals, and conversation responses. Speech-to-Text (STT) lets users speak their intentions and converse by voice during journey deck creation.

**Key decisions:**
- **Tiering**: Free = Google Cloud TTS (good quality), Pro = ElevenLabs (premium Lyra voice). Both tiers get TTS.
- **STT scope**: Mic button on intention input AND journey conversation chat.
- **Speech-to-Speech**: Deferred to future — doesn't fit core flows.
- **Auto-play**: Voice OFF by default. User enables via toggle. Once enabled, narration auto-plays.
- **Architecture**: Sentence-level chunking pipeline syncs streaming AI text with audio playback.

## User Stories

- As a user, I want to hear Lyra narrate my reading interpretation so the experience feels more mystical and personal
- As a user, I want to hear card reveal narration spoken aloud during the draw sequence
- As a user, I want to hear Lyra's conversation responses spoken during journey deck creation
- As a user, I want to speak my reading intention instead of typing it
- As a user, I want to speak to Lyra by voice during journey conversations
- As a user, I want to toggle voice on/off globally with one tap
- As a user, I want to control voice settings (speed, auto-play) in settings
- As a Pro user, I want a higher-quality premium Lyra voice

## Requirements

### Must Have
- [ ] Global voice toggle in app header (persisted to user profile)
- [ ] Voice settings section on settings page (enabled, auto-play, speed)
- [ ] TTS for reading interpretations (sentence-level streaming sync with `useCompletion`)
- [ ] TTS for card reveal narration (pre-cached deterministic strings)
- [ ] TTS for conversation chat responses (sentence-level streaming sync with `useChat`)
- [ ] STT microphone button on intention input
- [ ] STT microphone button on conversation chat input
- [ ] Provider abstraction layer (swap Google/ElevenLabs via config)
- [ ] Google Cloud TTS provider (Phase 1)
- [ ] Voice character usage tracking + plan limits
- [ ] Graceful degradation (text continues if TTS fails, mic button hidden if unsupported)
- [ ] Mobile audio autoplay handling (AudioContext unlock on first user gesture)

### Nice to Have (Phase 2)
- [ ] ElevenLabs TTS provider (premium Lyra voice for Pro)
- [ ] ElevenLabs STT provider (better accuracy for Pro)
- [ ] ElevenLabs WebSocket streaming TTS (bypass sentence chunking)
- [ ] Voice selection dropdown in settings (multiple Lyra voices)
- [ ] Audio waveform visualization on LyraSigil when speaking
- [ ] Pre-cache card narration audio during reading setup
- [ ] TTS response caching (LRU or Vercel KV)

### Future (Phase 3)
- [ ] ElevenLabs Speech-to-Speech ("Speak as Lyra" novelty feature)
- [ ] Sound design cues (ambient audio, card flip sounds)
- [ ] Voice conversation mode (auto-activate mic after Lyra finishes speaking)

---

## Architecture

### The Core Challenge: Streaming Text → Audio

AI text arrives as a token stream via the Vercel AI SDK (`useCompletion`/`useChat`). We need real-time audio without waiting for the full response or sending individual tokens.

**Solution: Sentence-Level Chunking Pipeline**

```
[Gemini streaming tokens]
        ↓
  useCompletion() / useChat()
        ↓
  Token accumulator (diff previous completion)
        ↓
  SentenceBuffer (detects sentence boundaries)
        ↓ (complete sentence)
  POST /api/voice/tts
        ↓ (audio ArrayBuffer)
  AudioQueue (plays chunks in sequence)
        ↓
  Web Audio API playback
```

First audio plays ~1.5-3.5s after stream starts. User sees text appearing immediately; audio follows shortly after. Text acts as a "preview" of what they're about to hear.

### Provider Abstraction

```typescript
// src/lib/voice/provider.ts
interface TTSProvider {
  name: string;
  synthesize(text: string, options: TTSOptions): Promise<ArrayBuffer>;
  supportsStreaming: boolean;
}

interface TTSOptions {
  voiceId: string;
  speed?: number;      // 0.75 - 1.5
  format?: 'mp3' | 'ogg';
}
```

| Tier | TTS Provider | STT Provider | Voice Quality |
|------|-------------|-------------|---------------|
| Free | Google Cloud TTS (Chirp 3 HD) | Web Speech API (browser) | Good |
| Pro | ElevenLabs (custom Lyra voice) | ElevenLabs WebSocket STT | Premium |
| Admin | ElevenLabs | ElevenLabs | Premium |

### Provider Resolution

```typescript
// src/lib/voice/index.ts
function getTTSProvider(plan: PlanType): TTSProvider {
  if (plan === 'pro' || plan === 'admin') {
    return new ElevenLabsTTSProvider(); // Phase 2
  }
  return new GoogleTTSProvider();       // Phase 1
}
```

---

## Integration Points

### 1. Reading Interpretation (Primary — Highest Impact)

**Component:** `src/components/readings/reading-interpretation.tsx`
**Current:** Uses `useCompletion()` streaming from `/api/ai/reading`

Add `useTextToSpeech()` hook alongside existing `useCompletion()`. Diff previous/current `completion` string to extract token deltas, feed to SentenceBuffer, which fires TTS requests per sentence.

```typescript
// Composition pattern
const { completion, isLoading } = useCompletion({ api: "/api/ai/reading", body: { readingId } });
const tts = useTextToSpeech({ enabled: voiceEnabled, autoplay: voiceAutoplay });

// Feed streaming tokens
const prevCompletion = useRef('');
useEffect(() => {
  const delta = completion.slice(prevCompletion.current.length);
  if (delta) tts.pushToken(delta);
  prevCompletion.current = completion;
}, [completion]);

// Flush when done
useEffect(() => {
  if (!isLoading && completion) tts.flush();
}, [isLoading]);
```

### 2. Card Reveal Narration (Pre-cached)

**Component:** `src/components/readings/card-draw-scene.tsx`
**Current:** Displays narration text from `lyra-constants.ts` (`CARD_REVEAL_NARRATION`)

Card reveal narration strings are deterministic (not AI-generated). Pre-fetch all audio clips via `/api/voice/tts-batch` when reading starts. Play pre-cached audio on each card flip. Zero latency on reveal.

### 3. Journey Conversation Responses

**Component:** `src/components/decks/conversation-chat.tsx`
**Current:** Uses `useChat()` streaming from `/api/ai/conversation`

Same `useTextToSpeech()` pattern. Extract deltas from the latest assistant message as it streams. Add a `SpeakButton` on each assistant message for replay.

### 4. Intention Input (STT)

**Component:** `src/components/readings/intention-input.tsx`
**Current:** Simple textarea

Add `MicrophoneButton` to the right of the textarea. When user speaks, interim transcription updates the textarea live. Final transcription replaces text. Free tier uses browser Web Speech API.

### 5. Conversation Chat Input (STT)

**Component:** `src/components/decks/conversation-chat.tsx`
**Current:** Textarea + Send button

Add `MicrophoneButton` next to the Send button. When user speaks, transcription fills the input. User can review and send, or auto-send on silence detection.

---

## UI Components

### VoiceToggle (Global — App Header)

**File:** `src/components/voice/voice-toggle.tsx`

Compact button in the app header next to user menu. States:
- **Off**: Muted speaker icon, muted color
- **On**: Speaker icon with subtle pulse, gold accent

Clicking toggles voice globally. Persisted via PATCH `/api/user/preferences`. On first enable, unlocks AudioContext (satisfies browser autoplay restrictions).

### SpeakButton (Per-Content)

**File:** `src/components/voice/speak-button.tsx`

Inline button next to content that can be spoken. Used on:
- Reading interpretation header (play/pause narration)
- Individual assistant chat messages (replay that message)

States: idle → loading (fetching audio) → playing (animated waveform) → paused

### MicrophoneButton

**File:** `src/components/voice/microphone-button.tsx`

Button that activates STT. Positioned right of text inputs. States:
- **Idle**: Mic icon
- **Listening**: Pulsing red ring, animated mic icon
- **Processing**: Spinner (cloud STT finalization)
- **Error**: Red mic with tooltip

Min touch target: 44x44px. Requests mic permission only on first tap (not page load).

### VoicePreferences (Settings Section)

**File:** `src/components/settings/voice-preferences.tsx`

Follows `ReadingPreferences` pattern exactly. Card with options, saves via PATCH `/api/user/preferences`.

Settings:
- **Voice Narration**: Off / On (toggle)
- **Auto-play**: Off / On (whether narration starts automatically when voice is enabled)
- **Playback Speed**: 0.75x / 1.0x / 1.25x / 1.5x (radio buttons)
- **Voice Selection** (Pro only, Phase 2): Dropdown of available voices

### LyraSpeakingIndicator

**File:** `src/components/voice/lyra-speaking-indicator.tsx`

Wraps existing `LyraSigil` to respond to audio playback state. When Lyra is speaking:
- Larger star pulsation radius
- Intensified golden glow
- Optional: subtle waveform visualization (Phase 2)

---

## Data Model

### Schema Changes (userProfiles table)

Add to existing `userProfiles` table in `src/lib/db/schema.ts`:

```typescript
voiceEnabled: boolean("voice_enabled").default(false).notNull(),
voiceAutoplay: boolean("voice_autoplay").default(true).notNull(),
voiceSpeed: text("voice_speed").notNull().default("1.0"), // "0.75" | "1.0" | "1.25" | "1.5"
voiceId: text("voice_id"), // null = default voice for their tier
```

### Usage Tracking (usageTracking table)

Add to existing `usageTracking` table:

```typescript
voiceCharactersUsed: integer("voice_characters_used").notNull().default(0),
```

### Plan Limits (constants.ts)

```typescript
// Add to PLAN_LIMITS
free: {
  // ...existing
  voiceCharactersPerMonth: 50_000,  // ~30 readings of narration
  voiceProvider: 'google' as const,
},
pro: {
  // ...existing
  voiceCharactersPerMonth: 500_000, // ~300 readings
  voiceProvider: 'elevenlabs' as const,
},
admin: {
  // ...existing
  voiceCharactersPerMonth: Infinity,
  voiceProvider: 'elevenlabs' as const,
},
```

### Cost Estimation

| Content Type | Avg Characters | Monthly Active User Est |
|-------------|---------------|------------------------|
| Brief reading (single) | 200 | 6,000 |
| Standard reading (3-card) | 600 | 18,000 |
| Card reveal narration | 50/card x 3 | 4,500 |
| Conversation message | 300 | 12,000 |
| **Total** | | **~40,000/mo** |

Google Cloud TTS (Chirp 3 HD): ~$1.20/user/month
ElevenLabs (Scale plan): ~$12/user/month → justifies Pro-gating

---

## API Routes

### POST `/api/voice/tts`

**File:** `src/app/api/voice/tts/route.ts`

Convert text to speech audio. Main TTS endpoint.

**Request:**
```json
{
  "text": "Looking back... The Wanderer. This is where the thread begins.",
  "voiceId": "en-US-Chirp3-HD-Leda",
  "speed": 1.0
}
```

**Response:** Audio binary with `Content-Type: audio/mpeg`

**Logic:**
1. Authenticate user
2. Check voice character usage against plan limit
3. Resolve TTS provider based on user plan
4. Call provider `synthesize()`
5. Increment `voiceCharactersUsed` by `text.length`
6. Return audio binary

**Limit exceeded:** Return 429 with message: "We've used all our voice for this cycle. The written word still holds power — let's continue in text."

### POST `/api/voice/tts-batch`

**File:** `src/app/api/voice/tts-batch/route.ts`

Pre-generate audio for multiple texts. Used for card reveal narration pre-caching.

**Request:**
```json
{
  "texts": ["Looking back... The Wanderer.", "Here and now... The Bridge.", "What's ahead... The Lantern."]
}
```

**Response:** Array of base64-encoded audio chunks in JSON.

### GET/PATCH `/api/user/preferences` (Extend Existing)

Extend existing route to handle voice fields:

```json
{ "voiceEnabled": true, "voiceAutoplay": true, "voiceSpeed": "1.0", "voiceId": null }
```

### GET `/api/voice/voices` (Phase 2)

**File:** `src/app/api/voice/voices/route.ts`

Returns available voices for user's tier. Pro users see ElevenLabs voices; free users see Google voices.

---

## Hooks

### `useTextToSpeech()`

**File:** `src/hooks/use-text-to-speech.ts`

Primary TTS hook. Integrates with streaming text.

```typescript
interface UseTextToSpeechOptions {
  enabled: boolean;
  autoplay: boolean;
  speed?: number;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
}

interface UseTextToSpeechReturn {
  pushToken: (token: string) => void;    // Feed streaming tokens
  flush: () => void;                      // Signal stream complete
  play: () => void;
  pause: () => void;
  stop: () => void;
  speak: (text: string) => Promise<void>; // One-shot (non-streaming)
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
}
```

### `useSpeechToText()`

**File:** `src/hooks/use-speech-to-text.ts`

STT hook wrapping Web Speech API (free) or ElevenLabs (Pro Phase 2).

```typescript
interface UseSpeechToTextOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseSpeechToTextReturn {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}
```

### `useVoicePreferences()`

**File:** `src/hooks/use-voice-preferences.ts`

Fetches and provides voice preference state.

```typescript
interface VoicePreferences {
  enabled: boolean;
  autoplay: boolean;
  speed: number;
  voiceId: string | null;
}

function useVoicePreferences(): {
  preferences: VoicePreferences | null;
  loading: boolean;
  update: (prefs: Partial<VoicePreferences>) => Promise<void>;
}
```

---

## Core Library Classes

### SentenceBuffer

**File:** `src/lib/voice/sentence-buffer.ts`

Accumulates streaming tokens and emits complete sentences.

```typescript
class SentenceBuffer {
  private buffer: string;
  private onSentence: (sentence: string) => void;

  push(token: string): void;  // Accumulate, detect boundaries
  flush(): void;               // Emit remaining buffer
}
```

Sentence boundaries: `.` `!` `?` followed by whitespace or end-of-stream. Handles edge cases: abbreviations ("Dr."), ellipsis ("..."), numbers ("3.14").

### AudioQueue

**File:** `src/lib/voice/audio-queue.ts`

Manages ordered playback of audio chunks via Web Audio API.

```typescript
class AudioQueue {
  enqueue(audioData: ArrayBuffer): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  readonly isPlaying: boolean;
  onStateChange?: (state: 'playing' | 'paused' | 'idle') => void;
}
```

Features:
- Plays chunks in order, next starts immediately when current finishes
- AudioContext created lazily on first enqueue
- Handles AudioContext unlock for mobile autoplay restrictions
- Graceful error handling (skip failed chunks, continue)

---

## Mobile Considerations

### Microphone Permissions
- Request only on first mic button tap (not page load)
- Show explanation before browser permission prompt
- Handle denied: hide mic button, show "Mic unavailable" tooltip
- iOS Safari: button tap satisfies user gesture requirement

### Audio Autoplay Restrictions
- Create AudioContext on first user interaction (voice toggle enable or speak button tap)
- Play silent buffer to unlock AudioContext for session
- Fallback: "Tap to listen" button if autoplay blocked

### Touch Targets
- All voice controls: min 44x44px
- Voice toggle, mic button, speak button all meet this

### Performance
- Sentence-level requests are lightweight (~50-200 chars each)
- Card reveal audio pre-cached (zero latency on reveal)
- Text always displays immediately; audio is progressive enhancement
- On slow connections, gracefully falls back to text-only

---

## Implementation Plan

### Phase 1a: Infrastructure (No UI Changes)

| # | Task | Files |
|---|------|-------|
| 1 | Provider interfaces | `src/lib/voice/provider.ts` |
| 2 | Google Cloud TTS provider | `src/lib/voice/providers/google-tts.ts` |
| 3 | SentenceBuffer + tests | `src/lib/voice/sentence-buffer.ts`, `.test.ts` |
| 4 | AudioQueue + tests | `src/lib/voice/audio-queue.ts`, `.test.ts` |
| 5 | Voice constants (voice IDs, defaults) | `src/lib/voice/constants.ts` |
| 6 | Provider resolution | `src/lib/voice/index.ts` |
| 7 | TTS API route | `src/app/api/voice/tts/route.ts` |
| 8 | TTS batch API route | `src/app/api/voice/tts-batch/route.ts` |
| 9 | DB schema: voice columns on userProfiles | `src/lib/db/schema.ts` |
| 10 | DB schema: voiceCharactersUsed on usageTracking | `src/lib/db/schema.ts` |
| 11 | Voice usage helpers | `src/lib/usage/usage.ts` |
| 12 | Plan limits extension | `src/lib/constants.ts` |
| 13 | Voice types | `src/types/index.ts` |

### Phase 1b: Hooks

| # | Task | Files |
|---|------|-------|
| 14 | useVoicePreferences hook | `src/hooks/use-voice-preferences.ts` |
| 15 | useTextToSpeech hook | `src/hooks/use-text-to-speech.ts` |
| 16 | useSpeechToText hook (Web Speech API) | `src/hooks/use-speech-to-text.ts` |

### Phase 1c: UI Components

| # | Task | Files |
|---|------|-------|
| 17 | VoiceToggle (header) | `src/components/voice/voice-toggle.tsx` |
| 18 | SpeakButton (inline play/pause) | `src/components/voice/speak-button.tsx` |
| 19 | MicrophoneButton (STT input) | `src/components/voice/microphone-button.tsx` |
| 20 | LyraSpeakingIndicator | `src/components/voice/lyra-speaking-indicator.tsx` |
| 21 | VoicePreferences (settings) | `src/components/settings/voice-preferences.tsx` |

### Phase 1d: Integration

| # | Task | Files |
|---|------|-------|
| 22 | TTS in ReadingInterpretation | `src/components/readings/reading-interpretation.tsx` |
| 23 | Card reveal audio pre-caching | `src/components/readings/card-draw-scene.tsx` |
| 24 | TTS in ConversationChat | `src/components/decks/conversation-chat.tsx` |
| 25 | STT mic on IntentionInput | `src/components/readings/intention-input.tsx` |
| 26 | STT mic on ConversationChat | `src/components/decks/conversation-chat.tsx` |
| 27 | VoiceToggle in AppHeader | `src/components/layout/app-header.tsx` |
| 28 | VoicePreferences in Settings | `src/app/(app)/settings/page.tsx` |
| 29 | Extend /api/user/preferences for voice | `src/app/api/user/preferences/route.ts` |

### Phase 2: ElevenLabs Upgrade

| # | Task | Files |
|---|------|-------|
| 30 | ElevenLabs TTS provider | `src/lib/voice/providers/elevenlabs-tts.ts` |
| 31 | ElevenLabs STT provider | `src/lib/voice/providers/elevenlabs-stt.ts` |
| 32 | Update provider resolution for Pro | `src/lib/voice/index.ts` |
| 33 | WebSocket streaming TTS (optional) | `src/app/api/voice/tts-stream/route.ts` |
| 34 | Voice selection in settings | `src/components/settings/voice-preferences.tsx` |
| 35 | Voices API route | `src/app/api/voice/voices/route.ts` |

---

## File Structure

```
src/
├── lib/
│   └── voice/
│       ├── index.ts                    # Provider resolution, exports
│       ├── provider.ts                 # TTSProvider / STTProvider interfaces
│       ├── sentence-buffer.ts          # Token → sentence chunking
│       ├── sentence-buffer.test.ts     # Sentence boundary tests
│       ├── audio-queue.ts              # Ordered audio playback queue
│       ├── audio-queue.test.ts         # Queue lifecycle tests
│       ├── constants.ts                # Voice IDs, default options
│       └── providers/
│           ├── google-tts.ts           # Google Cloud TTS (Phase 1)
│           ├── elevenlabs-tts.ts       # ElevenLabs TTS (Phase 2)
│           └── elevenlabs-stt.ts       # ElevenLabs STT (Phase 2)
├── hooks/
│   ├── use-text-to-speech.ts           # TTS hook (streaming + one-shot)
│   ├── use-speech-to-text.ts           # STT hook (browser + cloud)
│   └── use-voice-preferences.ts        # Voice preference state
├── components/
│   └── voice/
│       ├── voice-toggle.tsx            # Global on/off (header)
│       ├── speak-button.tsx            # Per-content play/pause
│       ├── microphone-button.tsx       # STT input button
│       └── lyra-speaking-indicator.tsx  # Audio-reactive Lyra sigil
├── app/
│   └── api/
│       └── voice/
│           ├── tts/route.ts            # Single text → audio
│           ├── tts-batch/route.ts      # Batch text → audio
│           └── voices/route.ts         # Available voices (Phase 2)
```

### Modified Files

| File | Change |
|------|--------|
| `src/lib/db/schema.ts` | Add voice columns to userProfiles, voiceCharactersUsed to usageTracking |
| `src/lib/constants.ts` | Add voice limits to PLAN_LIMITS |
| `src/types/index.ts` | Add VoicePreferences, VoiceSpeed types |
| `src/lib/usage/usage.ts` | Add checkVoiceCharacters(), incrementVoiceCharacters() |
| `src/app/api/user/preferences/route.ts` | Handle voice preference fields |
| `src/components/readings/reading-interpretation.tsx` | Add useTextToSpeech integration |
| `src/components/readings/card-draw-scene.tsx` | Add pre-cached card reveal audio |
| `src/components/readings/intention-input.tsx` | Add MicrophoneButton |
| `src/components/decks/conversation-chat.tsx` | Add TTS + MicrophoneButton |
| `src/components/layout/app-header.tsx` | Add VoiceToggle |
| `src/app/(app)/settings/page.tsx` | Add VoicePreferences section |

---

## Key Architectural Decisions

### 1. Server-Side TTS (not browser `speechSynthesis`)
API keys stay on server. Consistent voice quality across browsers. Branded Lyra voice (not system voice). Usage metering enforceable.

### 2. Sentence-Level Chunking (not token or full-response)
Sentences balance latency (first audio in ~2s) with quality (complete thoughts produce natural prosody). Token-level = robotic. Full-response = too slow.

### 3. Voice as Opt-In (OFF by default)
Respects silent readers, mobile data limits, accessibility preferences, and API costs. First enable unlocks AudioContext.

### 4. Separate Voice Character Budget
Voice characters tracked independently from card/image credits. Prevents voice from consuming card generation budget. Makes cost transparent.

### 5. Free STT via Web Speech API
Browser-native STT is free and good enough for English intent/conversation input. Avoids cloud STT costs for free tier. Pro upgrades to ElevenLabs STT for better accuracy.

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Browser doesn't support Web Speech API | Hide mic button, no error shown |
| Microphone permission denied | Hide mic button, show tooltip "Mic unavailable" |
| TTS API fails mid-narration | Skip failed sentence, continue with next. Text always visible. |
| Voice character limit reached | Return 429, disable TTS for rest of period, show toast with Lyra message |
| Mobile autoplay blocked | Show "Tap to listen" button. AudioContext unlocked on tap. |
| User stops reading mid-narration | `tts.stop()` clears audio queue immediately |
| User regenerates interpretation while audio playing | Stop current audio, restart with new stream |
| Slow connection | Text appears immediately (existing behavior). Audio loads progressively. |
| Multiple tabs open | Each tab has its own AudioContext. No cross-tab conflicts. |
| User navigates away mid-narration | Component unmount triggers `tts.stop()` cleanup |

---

## Testing Checklist

### Unit Tests (Vitest)
- [ ] SentenceBuffer: accumulates tokens, detects `.` `!` `?` boundaries
- [ ] SentenceBuffer: handles ellipsis, abbreviations, numbers
- [ ] SentenceBuffer: flush emits remaining buffer
- [ ] AudioQueue: enqueues and plays in order
- [ ] AudioQueue: stop clears queue and stops current
- [ ] AudioQueue: pause/resume lifecycle
- [ ] Google TTS provider: formats request, parses response
- [ ] Voice character limit checking
- [ ] Voice character increment (atomic)

### Integration Tests (Vitest)
- [ ] `/api/voice/tts`: auth required
- [ ] `/api/voice/tts`: returns audio for valid text
- [ ] `/api/voice/tts`: 429 when character limit exceeded
- [ ] `/api/voice/tts`: validates input (empty text, too long)
- [ ] `/api/user/preferences`: PATCH voice fields
- [ ] `/api/user/preferences`: GET returns voice fields

### E2E Tests (Playwright)
- [ ] Enable voice in settings, verify toggle state persists
- [ ] Voice toggle in header enables/disables narration
- [ ] Mic button appears on intention input
- [ ] Voice speed selection in settings
- [ ] Reading with voice enabled produces audio (mock AudioContext)

---

## Environment Variables

```bash
# Phase 1 — Google Cloud TTS
GOOGLE_CLOUD_TTS_API_KEY=...     # Google Cloud TTS API key

# Phase 2 — ElevenLabs
ELEVENLABS_API_KEY=...           # ElevenLabs API key
ELEVENLABS_LYRA_VOICE_ID=...    # Custom Lyra voice ID (created on ElevenLabs)
```

---

## Open Questions

1. ~~Should voice be free or Pro-only?~~ **Both tiers get TTS. Free = Google, Pro = ElevenLabs.**
2. ~~What about Speech-to-Speech?~~ **Deferred. Doesn't fit core flows.**
3. ~~Auto-play or manual?~~ **Opt-in toggle, then auto-play.**
4. **Which Google Cloud TTS voice for Lyra?** Need to test Chirp 3 HD voices to find the best "wise companion" match. Candidates: Leda, Zephyr, or others. To be decided during Phase 1 implementation.
5. **Should we support multiple languages for TTS?** English only for MVP. Language selection deferred.
6. **Audio caching strategy?** Start without caching. Add LRU/KV cache if TTS latency or cost becomes an issue.
