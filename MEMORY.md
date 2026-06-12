# MysTech v5 — Session Memory

Learned-experience notes that don't belong in CLAUDE.md. Keep entries concise (1–2 lines each); consolidate when this file approaches 200 lines.

## Pending one-off migrations

- After deploying the feedback status enum alignment, run once on prod DB: `UPDATE feedback SET status = 'dismissed' WHERE status = 'archived';` — there's no DB-level enum constraint, so existing `archived` rows will display as fallback styling until converted.

## Feedback module

- Two intentional entry points: `FeedbackFab` (marketing/shared, no screenshot) vs `FeedbackProvider` + `FeedbackSheet` (immersive shell, html-to-image screenshot). Don't consolidate — the surfaces have different UX needs.
- `feedback.type` field (bug/suggestion/general) is on the standardisation roadmap but not yet implemented; admin UI currently has no type column. Add when ready by extending schema, both input forms, the Zod schema in `POST /api/feedback`, and the admin table.
- Screenshot capture uses `html-to-image` and excludes `nav`, `[role=dialog]`, and Vaul overlays — see `feedback-provider.tsx`.

## Daily Card (Phase 1) + Print-on-Demand (Phase 2)

- Daily Card cron ticks hourly at minute 5 via GitHub Actions (`.github/workflows/daily-card-tick.yml`), NOT vercel.json — Vercel Hobby rejects sub-daily crons and an hourly vercel.json entry silently failed EVERY prod deploy 2026-05-07→2026-06-11. Per-user fanout: filter on user's local hour matches `dailyCardTime`, idempotent via `daily_card_delivery (userId, deliveryDate, channel)` unique index. Skips users with no deck — no starter-deck seed has been built yet (see plan §12.8).
- Daily Card draws insert directly into `readings` with `spreadType='daily'` — they bypass `checkDailyReadings` because the cron path doesn't call that gate (not a code-level bypass; just don't route through `/api/readings`).
- Print orders use `printOrders.deckSnapshot` JSONB frozen at order time + `onDelete: 'restrict'` on userId/deckId so a paid deck can't be orphaned by deletion.
- Print fulfillment is **manual in Phase 2** — webhook auto-forges a JSON manifest (not a ZIP) and sets order to `pack_ready`; admin downloads the manifest URL and places vendor order by hand. Mark-shipped UI sends the tracking email.
- Stripe webhook branches `checkout.session.completed` on `session.metadata.orderType === 'print_order'`. The subscription path is gated on `session.subscription` so the two never collide.
- Required env additions: `STRIPE_PRINT_DECK_PRICE_ID` (one-time $49 USD price). Optional per-country shipping rate IDs: `STRIPE_SHIPPING_RATE_{US,CA,GB}`.

## Cron / scheduled work

- Nightly digest runs via GitHub Actions, not Vercel Cron. Hobby plan caps Vercel Cron at 2/day and doesn't honour timezones. GH Actions is free, supports manual `workflow_dispatch` for testing.
- Repo secret `CRON_SECRET` must match the Vercel project env var of the same name. Both must be set or the workflow fails fast.
- Cron schedules are staggered ±5min across projects (Ubudian 03:17, MysTech 03:22) so digest emails arrive separately.

## Testing

- Playwright test-login: `GET /api/auth/test-login` (production-guarded). Use this for Playwright MCP verification — Google OAuth callbacks are only registered for `localhost:3000`.

## Known gaps to revisit

- No automatic spam dedup on feedback. Identical message from same user can be submitted repeatedly.
- `vercel.json` exists and may ONLY contain daily-or-slower crons on the Hobby plan; sub-daily jobs go in GitHub Actions. If Pro is adopted later they can move back.
- 12 pre-existing Vitest failures (4 files: ai/reading, ai/generate-deck, readings route, reading-flow-state) + matching tsc errors in test files — mock/type drift on main, predates the 2026-06 IA overhaul. `npm run build` unaffected.
- **Vercel Blob store SUSPENDED as of 2026-06-12** — all image uploads fail (card art, refinement, feedback screenshots). Needs dashboard action (Storage → Blob, quota/billing). UI degrades gracefully since the audit fixes.
- Visual/red-team audit harness: `scripts/audit-walk.mts` (npx tsx, needs dev server on :3000) — records screenshots/video/trace to `.audit/<date>/`. Report pattern: `docs/audit/`. Test user `test-user-e2e` has an ACTIVE PRO subscription in the prod DB — don't use it to test free-plan gating.

## Database (CRITICAL)

- Local `.env.local` DATABASE_URL is the **PRODUCTION** Neon DB (`ep-rough-wave-ahjjbb5b`) — same as Vercel prod env. `npm run db:push` from local migrates prod directly. Always pre-check data with read-only SQL before destructive DDL. Table names are singular (`deck`, `user_profile`, `chronicle_entry`).
- `npx drizzle-kit push` needs DATABASE_URL exported explicitly (`DATABASE_URL=$(grep ...) npx drizzle-kit push`); it doesn't read .env.local.

## IA overhaul (2026-06, ALL 4 phases shipped)

- Nav is Today (/today) / Deck (/decks) / Story (/story) / Settings. /home, /dashboard, /readings, /studio/*, /art-styles/*, /chronicle/today, /daily are all redirects — don't link to them in new code.
- /today IS the chronicle ritual for chronicle users (ChronicleFlow mounts directly); non-chronicle users get the editorial invitation with a /chronicle/setup CTA. Art styles live at /decks/styles; card refinement at /decks/[deckId]/cards/[cardId]; legacy /studio/cards/[cardId] resolves deckId server-side then redirects (used intentionally by components without deckId in scope: card-detail-modal, quick-draw, chronicle-flow, reading-refine-section).
- One streak only: chronicleSettings.streakCount. Daily email is a nudge (no pre-drawn card); old /daily?d= email links route to reading detail.
- deckType 'living' is gone (type, routes, table all removed); /decks/living redirect kept. AI reading context is assembled by buildSeekerContext (src/lib/ai/seeker-context.ts) — chronicle dialogue routes intentionally use only getChronicleKnowledge.
