# Chronicle → Reading Image Gating Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the chronicle "Forge today's card" → reading handoff from firing before the freshly-forged card image has been generated and persisted, so the reading no longer renders the title-only placeholder for the chronicle card.

**Architecture:** Two layers of defense.
1. **Client gate** (`chronicle-flow.tsx`): the 7-second `card_reveal` auto-transition timer only starts once `card.imageStatus === 'completed'`. While we're still waiting on the image we show a subtle "Preparing your card…" notice and keep polling. A 25-second backstop forces the transition anyway so the user can never get stuck.
2. **Server backstop** (`POST /api/readings`): when `chronicleCardId` is supplied and the card's `imageStatus === 'generating'`, the route polls the DB briefly (500 ms × up to 20 attempts ≈ 10 s) for the image to land before snapshotting it into the reading. This catches races the client gate can't see (e.g. polling misfire, slightly delayed DB write).

**Tech Stack:** Next.js 16 App Router, React 19, Drizzle ORM (Neon Postgres), Framer Motion. No new dependencies.

---

## Pre-requisite reading

Before touching code, read these files end-to-end:

- `src/components/chronicle/chronicle-flow.tsx` — full file (the persistent shell)
- `src/components/chronicle/use-chronicle-state.ts` — full file (the reducer)
- `src/app/api/chronicle/today/forge/route.ts` — full file (forge handler)
- `src/app/api/readings/route.ts` lines 240–360 (chronicle card snapshot section)
- `src/lib/ai/image-generation.ts` — full file (the background image task)
- `src/components/readings/reading-flip-card.tsx` — front-face fallback rendering

Also read the rules at `.claude/rules/flow-patterns.md` and `.claude/rules/animation.md`.

---

## File Structure

| File | Role | Change |
|---|---|---|
| `src/components/chronicle/chronicle-flow.tsx` | Chronicle persistent shell + reveal timer | Modify reveal-timer effect + add waiting-state UI |
| `src/lib/db/queries.ts` | Drizzle query helpers | Add `getCardImageState(cardId)` helper |
| `src/app/api/readings/route.ts` | POST /api/readings handler | Add `waitForChronicleCardImage()` before snapshotting chronicle card |
| `src/lib/db/queries.test.ts` | Vitest unit tests for queries | Add a test for `getCardImageState` (only if file exists; else skip) |

---

## Chunk 1: Server backstop — wait for chronicle card image

### Task 1: Add `getCardImageState` helper

**Files:**
- Modify: `src/lib/db/queries.ts`

- [ ] **Step 1: Add the helper near the other card queries**

Open `src/lib/db/queries.ts` and find the existing card queries (search for `cardsTable` or `getCardsForDeck`). Append the following helper alongside them:

```ts
/**
 * Read just the image-progress fields for a single card.
 * Used by the readings API to wait for a chronicle card image to land
 * before snapshotting it into the reading.
 */
export async function getCardImageState(cardId: string): Promise<{
  imageStatus: string;
  imageUrl: string | null;
  imageBlurData: string | null;
} | null> {
  const [row] = await db
    .select({
      imageStatus: cards.imageStatus,
      imageUrl: cards.imageUrl,
      imageBlurData: cards.imageBlurData,
    })
    .from(cards)
    .where(eq(cards.id, cardId));
  return row ?? null;
}
```

Make sure `cards`, `db`, and `eq` are already imported at the top of the file. If not, add the missing imports (mirror what nearby helpers use).

- [ ] **Step 2: Verify the file still typechecks**

```bash
npx tsc --noEmit
```
Expected: no new errors. If errors mention missing imports, add them.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/queries.ts
git commit -m "feat(db): add getCardImageState helper for image-progress polling"
```

### Task 2: Wait for chronicle image inside POST /api/readings

**Files:**
- Modify: `src/app/api/readings/route.ts` (around lines 268–285)

- [ ] **Step 1: Import the helper**

In `src/app/api/readings/route.ts`, find the existing import from `@/lib/db/queries` and add `getCardImageState`. If there is no existing import block, add a new one matching the project's import style.

- [ ] **Step 2: Add a `waitForCompletedImage` helper at module scope**

Place this **above** the `POST` handler (after the imports / type defs, before `export async function POST`):

```ts
/**
 * Poll a card's image-progress fields until the background image task
 * either completes, fails, or we hit the cap. Returns the most recent state.
 *
 * Cap: 20 attempts × 500ms = 10s. The Vercel function maxDuration on this
 * route already accounts for the existing AI work; 10s extra still fits.
 */
async function waitForCompletedImage(cardId: string) {
  const MAX_ATTEMPTS = 20;
  const DELAY_MS = 500;
  let state = await getCardImageState(cardId);
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (!state || state.imageStatus !== "generating") return state;
    await new Promise((r) => setTimeout(r, DELAY_MS));
    state = await getCardImageState(cardId);
  }
  return state;
}
```

- [ ] **Step 3: Wait before snapshotting the chronicle card**

Find the chronicle-card snapshot block (currently around lines 268–285, the `if (chronicleCardId) { const [chronicleRow] = await db.select(…)…` section). Replace it so it waits **first**, then re-fetches:

```ts
if (chronicleCardId) {
  // Wait briefly if the background image task is still in flight so we
  // snapshot the completed image into the reading rather than the empty
  // "generating" placeholder.
  await waitForCompletedImage(chronicleCardId);

  // Validate the card exists and belongs to the user (via its deck)
  const [chronicleRow] = await db
    .select({
      id: cardsTable.id,
      deckId: cardsTable.deckId,
      cardNumber: cardsTable.cardNumber,
      title: cardsTable.title,
      meaning: cardsTable.meaning,
      guidance: cardsTable.guidance,
      imageUrl: cardsTable.imageUrl,
      imageBlurData: cardsTable.imageBlurData,
      imagePrompt: cardsTable.imagePrompt,
      imageStatus: cardsTable.imageStatus,
      createdAt: cardsTable.createdAt,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.id, chronicleCardId), eq(decksTable.userId, user.id)));

  // …existing logic continues unchanged…
```

Note: this also adds `imageBlurData` to the SELECT (it was missing). The `Card` type expects this field; including it removes a silent type drift.

- [ ] **Step 4: Verify the route still typechecks and the existing tests pass**

```bash
npx tsc --noEmit
npm test -- src/app/api/readings 2>&1 | tail -40
```
Expected: typecheck clean. Any existing readings tests still pass (or report "no test files found" if none exist for that path).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/readings/route.ts
git commit -m "fix(readings): wait for chronicle card image before snapshotting"
```

---

## Chunk 2: Client gate — defer reveal timer until image lands

### Task 3: Gate the `card_reveal` 7-second auto-timer on image readiness

**Files:**
- Modify: `src/components/chronicle/chronicle-flow.tsx` (the `card_reveal` timer effect, currently around lines 880–888)

- [ ] **Step 1: Locate the existing reveal timer effect**

In `src/components/chronicle/chronicle-flow.tsx`, find:

```ts
// 7-second pausable auto-timer during card_reveal
useEffect(() => {
  if (phase !== 'card_reveal') return;
  remainingMsRef.current = 7000;
  setProgressDuration(7);
  setProgressKey((k) => k + 1);
  timerStartedAtRef.current = Date.now();
  revealTimerRef.current = setTimeout(transitionToReading, 7000);
  return () => { if (revealTimerRef.current) clearTimeout(revealTimerRef.current); };
}, [phase, transitionToReading]);
```

- [ ] **Step 2: Replace with a gated version**

Swap the body for:

```ts
// 7-second pausable auto-timer during card_reveal — but only once the image
// has finished generating. While we're still waiting on the background image
// task, hold the timer so the readings API has something to snapshot.
useEffect(() => {
  if (phase !== 'card_reveal') return;
  if (card?.imageStatus === 'generating') return; // re-runs when status flips
  remainingMsRef.current = 7000;
  setProgressDuration(7);
  setProgressKey((k) => k + 1);
  timerStartedAtRef.current = Date.now();
  revealTimerRef.current = setTimeout(transitionToReading, 7000);
  return () => { if (revealTimerRef.current) clearTimeout(revealTimerRef.current); };
}, [phase, transitionToReading, card?.imageStatus]);
```

The dependency array now includes `card?.imageStatus`, so the effect re-runs when the polling effect dispatches `UPDATE_CARD_IMAGE`.

- [ ] **Step 3: Add a backstop so the user is never stuck**

Immediately after the gated timer effect, add a second effect:

```ts
// Backstop: if we've been sitting in card_reveal waiting on the image for
// more than 25s (e.g. Stability outage, retry exhaustion), force the
// transition anyway. The reading will fall back to the placeholder UI;
// degraded > stuck.
useEffect(() => {
  if (phase !== 'card_reveal') return;
  if (card?.imageStatus !== 'generating') return;
  const id = setTimeout(transitionToReading, 25000);
  return () => clearTimeout(id);
}, [phase, card?.imageStatus, transitionToReading]);
```

- [ ] **Step 4: Verify typecheck**

```bash
npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/chronicle/chronicle-flow.tsx
git commit -m "fix(chronicle): hold reveal timer until card image is ready"
```

### Task 4: Show a subtle "Preparing your card…" notice while gated

**Files:**
- Modify: `src/components/chronicle/chronicle-flow.tsx` (the `card_reveal` JSX inside the persistent shell)

- [ ] **Step 1: Find the reveal JSX**

In `chronicle-flow.tsx`, search for the `card_reveal` UI — the section that renders `OracleCard` (or similar) and the progress indicator during reveal. Identify the element where the existing reveal copy (timer / progress / position label) lives.

- [ ] **Step 2: Add a conditional waiting indicator**

Inside that section, add:

```tsx
{phase === 'card_reveal' && card?.imageStatus === 'generating' && (
  <motion.p
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={CONTENT_SPRING}
    className="mt-3 text-center text-xs uppercase tracking-[0.18em]"
    style={{ color: 'var(--ink-mute)' }}
  >
    Preparing your card…
  </motion.p>
)}
```

Place it adjacent to / replacing the spot where the reveal-progress element renders, so it doesn't shift other layout. If a sibling progress bar / countdown renders during reveal, hide it while `imageStatus === 'generating'` (it's misleading otherwise — the timer hasn't started yet). Wrap that existing element with:

```tsx
{card?.imageStatus !== 'generating' && (
  /* existing progress / countdown JSX */
)}
```

- [ ] **Step 3: Local sanity check in the browser**

Start the dev server and verify the new state renders without layout jump:

```bash
lsof -ti :3000 || npm run dev &
```

Use Playwright MCP (per CLAUDE.md "Front-End Verification" rules):
1. `POST /api/auth/test-login` to authenticate
2. Navigate to `/chronicle`
3. Have a quick conversation, click "Forge today's card"
4. Take a mobile-width (390px) screenshot during reveal
5. Confirm "Preparing your card…" appears if the image is still generating, and disappears once it lands

- [ ] **Step 4: Commit**

```bash
git add src/components/chronicle/chronicle-flow.tsx
git commit -m "feat(chronicle): show 'Preparing your card' while reveal waits on image"
```

---

## Chunk 3: End-to-end verification

### Task 5: Manual smoke test in production-like conditions

- [ ] **Step 1: Run the full chronicle → reading happy path**

With dev server running and authenticated via Playwright MCP:
1. Navigate to `/chronicle`, have a 2-message conversation with Lyra
2. Click "Forge today's card"
3. Watch the reveal phase — confirm reveal does **not** auto-advance until the image is in `card.imageStatus === 'completed'`
4. Wait for image, then observe the 7-second reveal timer start
5. Land on `/readings/new?source=chronicle`, watch the reading render
6. Take a desktop screenshot and a 390px mobile screenshot of the reading
7. Confirm the chronicle (Present) card shows the actual generated image — not the title-only fallback in `reading-flip-card.tsx:91-134`

- [ ] **Step 2: Simulate slow image generation (optional but recommended)**

Temporarily edit `src/lib/ai/image-generation.ts` to add `await new Promise(r => setTimeout(r, 12000))` at the top of `generateCardImage`. Re-run the flow and confirm:
- Reveal holds with the "Preparing your card…" notice
- Once the 12s elapses + image uploads, reveal timer starts
- Reading still gets the image

**Revert that edit before committing anything.**

- [ ] **Step 3: Simulate failure**

Temporarily change the same function to `throw new Error('test')` on first attempt. Confirm:
- After ~30s the existing client-side `card_forging` safety timer flips status to `'failed'`
- Reveal proceeds with the placeholder
- Reading also shows the placeholder + retry button (existing behavior — acceptable degraded UX)

**Revert that edit.**

- [ ] **Step 4: Final commit (only if revert produced changes)**

```bash
git status
# if clean, no commit needed
```

### Task 6: Push to production

- [ ] **Step 1: Auto-push per the user's standing preference**

Per memory `feedback_auto_push_to_prod.md`, routine work auto-pushes after a successful commit:

```bash
git push origin main
```

- [ ] **Step 2: Watch the Vercel deploy**

Use the Vercel MCP to confirm the deploy succeeds and check runtime logs for a few minutes after release for any errors from `[chronicle/today/forge]` or `[readings]` log lines.

---

## Out of scope

- Reading-display polling for chronicle cards still in `generating` once the user has already arrived at the reading. The two-layer gate above should make this unnecessary; if it still happens in production, file a follow-up.
- Replacing fire-and-forget image generation with a queued/durable job (worth doing eventually, but a separate effort).
- Stability API health monitoring / alerting.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Server `waitForCompletedImage` adds up to 10s to the readings POST | The chronicle handoff will almost always have a `'completed'` status by the time it reaches this endpoint thanks to the client gate, so the wait short-circuits immediately. Worst case (failure path) is one DB read + 10s. Vercel `maxDuration: 60` on this route accommodates it. |
| Client gate could leave the user staring at a static reveal | The 25s backstop guarantees forward progress; the "Preparing your card…" copy keeps it visually alive. |
| Adding `imageBlurData` to the chronicle SELECT changes the response shape | The frontend `Card` type already declares this field as `string \| null`; the snapshot was previously dropping it (silent `undefined`). Including it brings the runtime shape in line with the type. |
