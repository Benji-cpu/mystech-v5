# Visual Pass + Red-Team Audit — 2026-06-12

Full interactive walk of every feature in headless Chromium at **390×844 (mobile, touch)** with desktop spot-checks, driven by `scripts/audit-walk.mts`. 47 recorded steps as `test-user-e2e` against the local dev server (production DB). Artifacts (screenshots, per-flow video, replayable trace) are local in `.audit/2026-06-12/` — replay with `npx playwright show-trace .audit/2026-06-12/trace-mobile.zip`.

The full chronicle ritual was completed live (greeting → 3 dialogue exchanges → forge → reveal → complete), plus a quick draw, deck/style/path/settings walks, and red-team checks (auth gates, bogus IDs, double-taps, mid-flow reload, redirect table, prod test-login).

## Findings

### P0 — infrastructure (needs Benji, not code)

| # | Finding | Evidence |
|---|---------|----------|
| 1 | **Vercel Blob store is SUSPENDED** — every image upload fails app-wide: chronicle card art, deck image generation, card refinement, feedback screenshots. Today's forge logged `Vercel Blob: This store has been suspended.` (generation_log). All 5 chronicle cards for the test user are `image_status=failed` (the older ones from the May Stability-credits issue, today's from Blob). | DB: `generation_log` 2026-06-12; cards table. **Action: Vercel dashboard → Storage → Blob (Hobby quota/billing).** |

### P1 — broken or bad mobile UX (fix now)

| # | Finding | Evidence |
|---|---------|----------|
| 2 | **Ritual complete phase renders badly when the card has no image**: raw broken-image glyph, the card title drawn twice and overlapping itself, and the card floating over the "YOUR READING" panel text. (Deck detail handles the same data gracefully with a gradient + ✦ placeholder.) | `13-ritual-complete.png`, `14-ritual-complete-links.png` |
| 3 | **/story hydration mismatch** — React hydration error on every load (dev overlay "1 Issue"; will cause client re-render flash in prod). Likely locale/timezone-dependent date formatting between server and client. | `45-desktop-story.png`, pageerror log |
| 4 | **/readings/new: focus header overlaps content at 390px** — the "New Reading / Consult the cards" header block sits on top of the astrology banner text. | `18-reading-new-setup.png`, `19-…png` |

### P2 — polish

| # | Finding | Evidence |
|---|---------|----------|
| 5 | Astrology banner on /readings/new says "**Dashboard →**" — stale IA term, links to the old `/dashboard` redirect. | `18-reading-new-setup.png` |
| 6 | **/today greeting phase is ~75% blank** at 390px — the greeting bubble hugs the bottom; as the home screen this reads as an empty page on first paint. (Functional; zone design. Recommend pulling the greeting up / filling the idle card-zone with date+streak.) | `07-today-initial.png` |
| 7 | **Spread/depth picker not visible** on /readings/new before deck selection — "Deep dive" group (and the picker entirely) undiscoverable in the initial viewport. Needs an interactive check of post-deck-selection behavior. | `18/19-…png` |
| 8 | Complete-phase links ("Go deeper", "View your story") exist but sit **below the fold** behind the reading panel on 390px. | `13/14-…png` |
| 9 | Card **refine affordance is desktop-hover-only** in deck grids; on mobile the only path is the card modal's link, which is hidden whenever the card has no completed image (currently always, per #1). | code: `deck-card-grid.tsx` |

### Not bugs (verified, initially suspicious)

- Deck tile taps DO navigate on mobile — the audit's first-pass failures were dev-server on-demand route compilation latency, not the product (verified by repeated probes).
- 404 console errors for bogus routes (`/decks/zzz…`) are the **expected** not-found behavior.
- The "second reading same day" step failed for harness reasons (no deck selected), not a limit-surface bug — re-verify after #7 is understood.

## Clean passes (47 steps)

Landing, pricing, login; unauth gating (`/today`→login); **prod test-login returns 404**; protected APIs 401; full ritual loop incl. **double-tap forge guard** and **mid-ritual reload resume**; Story timeline/themes/streak; quick draw; decks library; deck detail (chronicle view), print gating (0/22 cards); styles gallery/detail/editor/new; paths picker ("Choose your focus") + path detail; settings hub / Daily Reminder / billing / profile; feedback FAB submit (`[audit]` entry); the full overhaul redirect table; admin locked for non-admin; bottom-nav active states (5 items, all ≥40px touch targets); desktop spot-checks.

## Recording index

`01–47` PNGs per step (`*-FAILED.png` for the two harness misfires), `48–51` retest captures, `video/` (webm per context), `trace-mobile.zip`, `findings.json`.
