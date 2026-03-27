# Chronicle Greeting Fix

**Date:** 2026-03-27
**Problem:** The Chronicle greeting feels generic, jargon-heavy, and confusing — referencing card titles, waypoint names, and mood labels that users don't understand.
**Approach:** Approach B — fix the AI prompt + minimal honest fallback.

## Root Cause

Two systems generate the Chronicle greeting:

1. **AI-streamed greeting** (primary) — `buildChronicleGreetingPrompt` in `src/lib/ai/prompts/chronicle.ts` sends context signals to Gemini, which writes a natural greeting. Works most of the time.
2. **Template fallback** — `buildChronicleGreeting` in the same file stitches together canned fragments when the AI fails. Produces output like: "A fresh page awaits. Yesterday you drew The Embodied Flame. Three days of reflective now — there's something here worth sitting with. Today we walk with Shadow Integration."

The template fallback fires silently (no logging) when the AI call fails, producing a jarring, jargon-filled greeting. The AI prompt itself also passes raw data labels (card titles, waypoint names) that the AI tends to name-drop without explanation.

## Changes

### 1. Transform context signals in `buildChronicleGreetingPrompt`

Instead of passing raw signal data to the AI, pass interpreted context:

| Signal | Before | After |
|--------|--------|-------|
| Yesterday's card | `Yesterday's card: "The Embodied Flame"` | `Yesterday's reflection explored themes of embodiment and creative passion` (derive from card meaning, not title) |
| Active waypoint | `Active waypoint: "Shadow Integration" — explore the parts of yourself...` | `Current practice focus: exploring the parts of yourself you normally avoid or reject` (use waypoint lens only, drop the name) |
| Mood streak | `Recent moods: reflective, reflective, reflective` | `The seeker has been in a reflective state for several days` |
| Recurring pattern | No change needed — already human-readable |

This requires the greeting route to also fetch card meanings (not just titles) for recent entries, and to strip waypoint/path names from the context.

Add these rules to the prompt:
- Never use card titles, waypoint names, or path names in the greeting — these are internal vocabulary the user may not recognize
- Reference what the card or waypoint means in plain, grounded language
- The seeker may not remember yesterday's card by name — reference the feeling or theme instead
- If you don't have enough context to say something meaningful, just ask a good opening question

### 2. Replace template fallback with minimal openers

Replace `buildChronicleGreeting` (the ~90-line template function) with a simple time-aware fallback that doesn't attempt personalization:

- Morning: "What's alive for you this morning?"
- Afternoon: "What's been on your mind today?"
- Evening: "What stayed with you from today?"
- Night: "What's surfacing in the quiet?"

No card references, no waypoint names, no streak counts, no mood labels. Just a clean invitation.

### 3. Add error logging on client fallback

In `chronicle-flow.tsx`, the `.catch()` block that triggers the fallback should log why:
- `console.warn("[Chronicle] AI greeting failed, using fallback:", error.message)`

This enables diagnosis of why the AI greeting intermittently fails (rate limits, timeouts, etc.).

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/ai/prompts/chronicle.ts` | Rewrite `buildChronicleGreetingPrompt` to use interpreted signals. Replace `buildChronicleGreeting` with minimal fallback. |
| `src/app/api/chronicle/today/greeting/route.ts` | Fetch card meanings (not just titles) for recent entries. Pass interpreted waypoint context. |
| `src/components/chronicle/chronicle-flow.tsx` | Add `console.warn` in the fallback `.catch()` block. |

## Out of Scope

- Retry logic or caching for the AI greeting
- Changes to the Chronicle conversation prompts (separate concern)
- Changes to the emergence greeting (already has its own flow)
