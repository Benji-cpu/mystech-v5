# Reading Flow Polish

## Status: Implemented

## Overview

UX polish pass on the reading flow to remove tacky/unnecessary UI elements and ensure a clean, immersive experience. The reading is the emotional climax of the app — extra buttons that break the atmosphere are removed.

---

## Changes

### 1. Remove Regenerate Button

**Problem**: A "Regenerate" button on the interpretation makes the reading feel disposable — like a slot machine rather than a mystical consultation. It undermines the oracle fantasy.

**Solution**: Remove the Regenerate button entirely from both:
- `reading-interpretation.tsx` (reading detail page component)
- `use-reading-presentation.ts` (reading flow hook)

**Error retry preserved**: If the AI interpretation fails, a "Retry" button still appears in the error state. This is a recovery mechanism, not a "give me a different answer" button.

### 2. Remove Stop Button

**Problem**: A "Stop" button during streaming interpretation adds visual noise and serves no real user need — interpretations take 5-15 seconds, and stopping mid-stream produces an incomplete reading.

**Solution**: Remove the Stop button from `reading-interpretation.tsx`. The `stop` function remains available in the hook for safety timeouts.

### 3. AstrologyBar Collapsed by Default

**Problem**: The astrology bar takes up vertical space in the reading flow, pushing card content down on mobile.

**Solution**: Already implemented — `useState(false)` ensures it's collapsed by default. Only shown when user has an astrology profile. Users can tap to expand if they want to see their placements. No code changes needed — verified visually.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/readings/reading-interpretation.tsx` | Removed `handleRegenerate`, `handleStop`, `stop` destructure, `Square` import, Stop/Regenerate button block. Error retry uses inline `submit()`. Removed unused `useCallback` import. |
| `src/hooks/use-reading-presentation.ts` | Removed `regenerate` useCallback, removed from return object and useMemo deps. |

## Files Verified (No Changes Needed)

| File | Verification |
|------|-------------|
| `src/components/readings/astrology-bar.tsx` | `useState(false)` on line 99 — collapsed by default |
| `src/components/readings/reading-flow.tsx` | 20s timeout is a keepalive (resets on each chunk), not a total timeout — correct behavior |

---

## Testing Checklist

- [ ] Single Card reading: full flow from setup to completion
- [ ] Celtic Cross reading: all 10 card sections stream correctly
- [ ] No Regenerate or Stop buttons visible during streaming or after completion
- [ ] AstrologyBar collapsed by default (if user has astro profile)
- [ ] "Begin Another Reading" appears at completion and resets to setup
- [ ] Reading detail page (`/readings/[readingId]`) has no Regenerate button
- [ ] Error state shows Retry button that works
