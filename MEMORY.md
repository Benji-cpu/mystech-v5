# MysTech v5 — Session Memory

Learned-experience notes that don't belong in CLAUDE.md. Keep entries concise (1–2 lines each); consolidate when this file approaches 200 lines.

## Feedback module

- The `archived` → `dismissed` one-off migration is DONE; prod has no `archived` rows (checked 2026-09-16).
- Two intentional entry points: `FeedbackFab` (marketing/shared, no screenshot) vs `FeedbackProvider` + `FeedbackSheet` (immersive shell, html-to-image screenshot). Don't consolidate — the surfaces have different UX needs.
- `feedback.type` field (bug/suggestion/general) is on the standardisation roadmap but not yet implemented; admin UI currently has no type column. Add when ready by extending schema, both input forms, the Zod schema in `POST /api/feedback`, and the admin table.
- Screenshot capture uses `html-to-image` and excludes `nav`, `[role=dialog]`, and Vaul overlays — see `feedback-provider.tsx`.
- Anonymous submissions are capped in memory per IP hash, not in the DB — per-instance and leaky on serverless. Signed-in users are capped 5/h in SQL.

## Daily Card (Phase 1) + Print-on-Demand (Phase 2)

- Daily Card cron ticks hourly at minute 5 via GitHub Actions (`.github/workflows/daily-card-tick.yml`), NOT vercel.json — Vercel Hobby rejects sub-daily crons and an hourly vercel.json entry silently failed EVERY prod deploy 2026-05-07→2026-06-11. Per-user fanout: filter on user's local hour matches `dailyCardTime`, idempotent via `daily_card_delivery (userId, deliveryDate, channel)` unique index. Skips users with no deck — no starter-deck seed has been built yet (see plan §12.8).
- Daily Card draws insert directly into `readings` with `spreadType='daily'` — they bypass `checkDailyReadings` because the cron path doesn't call that gate (not a code-level bypass; just don't route through `/api/readings`).
- Print orders use `printOrders.deckSnapshot` JSONB frozen at order time + `onDelete: 'restrict'` on userId/deckId so a paid deck can't be orphaned by deletion.
- Print fulfillment is **manual in Phase 2** — webhook auto-forges a JSON manifest (not a ZIP) and sets order to `pack_ready`; admin downloads the manifest URL and places vendor order by hand. Mark-shipped UI sends the tracking email.
- Stripe webhook branches `checkout.session.completed` on `session.metadata.orderType === 'print_order'`. The subscription path is gated on `session.subscription` so the two never collide.
- Required env additions: `STRIPE_PRINT_DECK_PRICE_ID` (one-time $49 USD price). Optional per-country shipping rate IDs: `STRIPE_SHIPPING_RATE_{US,CA,GB}`.

## Cron / scheduled work

- The nightly digest is **Vercel Cron + a Claude remote agent**, not GitHub Actions — see CLAUDE.md. GitHub Actions is only the hourly Daily Card tick, which Vercel Hobby cannot schedule.
- Hobby-tier Vercel cron is best-effort **within the hour**: `15 19 * * *` has been firing at ~20:11 UTC every night. Never design a two-stage job around a gap smaller than an hour.
- Repo secret `CRON_SECRET` must match the Vercel project env var of the same name.
- `VERCEL_TOKEN` was one dead credential shared by mystech-v5, programme-v1, wordzoo and cc-mastery — four blind spots, one fault. Rotated 2026-09-16; a serverless function reads env from its deployment snapshot, so each project needed a redeploy afterwards.
- The digest JSON is stamped with the **UTC** date. Anything reading it from Asia/Makassar after 08:00 WITA is a day out. Read the newest file; do not build the name from a clock.

## API input validation

- `lib/api/validate.ts` (`parseBody`) + `lib/api/schemas.ts` are the house pattern; 53 of 71 mutating routes use them. A new mutating route adds its schema there rather than casting the body.
- **Do not add `.strict()`.** It was tried on all of them 2026-09-16: it caught one real gap at compile time and would have 400'd the Chronicle conversation in production, because the client has always sent `deckId` to `chronicle/today/message` and the route has always ignored it. Zod's default strips unknown keys, which is what the old casts did.
- `auth/test-login` is deliberately left without a schema — dev-only, and already gated on an `@example.com` regex plus a role allowlist.

## Testing

- Playwright test-login is **POST** `/api/auth/test-login` (production-guarded). An optional `{email, role}` body, `@example.com` only, mints a genuinely fresh user — the default id `test-user-e2e` owns decks and a Pro subscription, so it cannot show you a stranger's first screen.
- `npm run build` followed by `npm run dev` in the same checkout wedges Turbopack: `/api/feedback` sat at "Compiling …" forever and every POST hung with no error. `rm -rf .next` fixed it. Never leave a production build behind before a dev walk.
- The deck page and the Chronicle poll on a timer, so Playwright's `networkidle` never settles on them. Use `domcontentloaded` plus an explicit wait.

## Known gaps to revisit

- No automatic spam dedup on feedback. Identical message from same user can be submitted repeatedly.
- `vercel.json` exists and may ONLY contain daily-or-slower crons on the Hobby plan; sub-daily jobs go in GitHub Actions. If Pro is adopted later they can move back.
- The 12 pre-existing Vitest failures are FIXED (2026-09-16); 40 files / 391 tests green, `tsc --noEmit` clean. `npm run lint` still reports 28 errors, all React Compiler rules ("setState synchronously within an effect"), untouched.
- **Vercel Blob store RESOLVED** — was suspended 2026-06-12; verified 2026-08-03 serving reads AND accepting writes (45 style swatches uploaded). Re-check with an actual `put` before ever claiming otherwise.
- Visual/red-team audit harness: `scripts/audit-walk.mts` (npx tsx, needs dev server on :3000) — records screenshots/video/trace to `.audit/<date>/`. Report pattern: `docs/audit/`. Test user `test-user-e2e` has an ACTIVE PRO subscription in the prod DB — don't use it to test free-plan gating.
- **Check the Stability balance before believing anything about art quality** — it hit zero on 2026-09-16 and every card in every new deck failed with 402 `payment_required`, with no fallback image. Topped up the same day. `GET https://api.stability.ai/v1/user/balance` with the key reads it in one call.
- **Google Cloud TTS billing was reopened 2026-09-17** and the good voice is live in MysTech and WordZoo — same project, 473497770902, billing account `01940B-45D0DE-C9E34D` on **mystechcards@gmail.com** (not b.hemsonstruthers, which 403s on that project).
- `FallbackTTSProvider` (`src/lib/voice/index.ts`) tries Cloud TTS, then Gemini TTS, which needs no billing and runs on the Gemini key — that is what kept read-aloud alive while billing was off. A Cloud failure now cools down for 10 minutes rather than latching for the life of the instance. This route has no blob cache; WordZoo's does, and Gemini costs ~9s a sentence, so add one if the fallback ever becomes the norm again.

## Card image generation (UNRESOLVED, now measured)

- The harness exists: `scripts/art-harness.ts`, 12 fixed subjects × 3 fixed seeds, contact sheet at `.art-harness/<variant>/SHEET.jpg`. **It is the only sanctioned way to judge a prompt change**, and **always run `--set=real` too** — the hand-written subjects are clean in a way production prompts are not, which is how v2 passed at 2/36 and still drew a woman on the first real deck. Numbers below are from it; full working in `docs/audit-2026-09.md`.
- **Baseline: 14 of 36 images contain a human figure**, concentrated in 5 of the 12 subjects. The failure tracks how *concrete* the subject is, not the style: a door, a lantern, a compass, a fox, a bridge and a mirror all render correctly in the same styles that turn "a glowing seed in a nebula" and "a crown on a plinth" into a robed woman. Abstract subject → the model falls back to its own "oracle card" prior.
- **v1 (subject first, framing last) is a real but partial improvement**: on the four worst subjects, 9 of 10 images had a figure at baseline, 6 of 10 under v1. Celestial went 0/3 → 3/3 correct. Mucha art-nouveau and Rider-Waite tarot did not move at all.
- **v2 shipped** (subject first + style attractors stripped): 2 of 36 on the hand-written set, both figurative canons broken. **v3 shipped** on top of it: 17 of 91 production cards end with "No human figures are present.", a diffusion model has no negation operator, and v2 had just moved that clause to the front. On six verbatim production prompts: v2 = 5/15, v3 = 0/15, with a control card that legitimately wants figures untouched.
- **The residual is fixed too**: a prompt naming no picturable object still drew a figure 2 of 3, and no image-prompt change reaches that. `DECK_GENERATION_SYSTEM_PROMPT` now requires every imagePrompt to OPEN on a concrete object, prefers objects over people, and is forbidden from writing exclusions. `scripts/prompt-harness.ts` measures it by READING the prompts, not counting images: 20 prompts, 0 abstractions, 0 exclusions.
- The negative prompt already lists person/human/face/woman/silhouette and does not work. On Stability Core a strong positive prior beats the negative list; the lever is the positive prompt.
- **A regenerated card overwrites the same blob path**, so the URL never changed and browsers/CDN kept serving the old picture — Retry and refine looked like no-ops with correct bytes in storage. The stored URL now carries the write time; don't remove it.
- `deck-generation.ts` tells the LLM to "state excluded elements explicitly in the imagePrompt", which writes negations like "No human figures are present" into a positive diffusion prompt. Suspicious, unproven, worth testing properly.

## Local environment

- **`~/Documents/Code` is inside iCloud Drive.** It restores deleted files as unreadable placeholders: `tsc` ran 26 minutes at 0% CPU on files deleted the day before, then errored TS6053 on them. `git status` showing untracked files you know you deleted is the tell — `rm -rf` them and re-run. Also delete `tsconfig.tsbuildinfo` when tsc behaves oddly. One restored file was a ROUTE, so a local build can disagree with production in both directions; trust `origin/main`.

## Repo shape (2026-09-16 cleanup)

- `src/app/mock` and `src/components/{lab,mock,transitions}` are GONE, and with them eleven dependencies including the whole three.js stack. Framer Motion is the only animation library left — do not reach for GSAP or React Spring, they are not installed.
- Legacy URLs are config redirects in `next.config.ts`, never `page.tsx` files whose body is `redirect()`. Internal links point at the real route.
- Root-level `*.png` is gitignored, so verification screenshots do not show as untracked — they also do not get committed, and 199 of them had accumulated on disk.

## Database (CRITICAL)

- Local `.env.local` DATABASE_URL is the **PRODUCTION** Neon DB (`ep-rough-wave-ahjjbb5b`) — same as Vercel prod env. `npm run db:push` from local migrates prod directly. Always pre-check data with read-only SQL before destructive DDL. Table names are singular (`deck`, `user_profile`, `chronicle_entry`).
- `npx drizzle-kit push` needs DATABASE_URL exported explicitly (`DATABASE_URL=$(grep ...) npx drizzle-kit push`); it doesn't read .env.local.

## IA overhaul (2026-06, ALL 4 phases shipped)

- Nav is Today (/today) / Deck (/decks) / Story (/story) / Settings. /home, /dashboard, /readings, /studio/*, /art-styles/*, /chronicle/today, /daily are all redirects — don't link to them in new code.
- /today IS the chronicle ritual for chronicle users (ChronicleFlow mounts directly); non-chronicle users get the editorial invitation with a /chronicle/setup CTA. Art styles live at /decks/styles; card refinement at /decks/[deckId]/cards/[cardId]; legacy /studio/cards/[cardId] resolves deckId server-side then redirects (used intentionally by components without deckId in scope: card-detail-modal, quick-draw, chronicle-flow, reading-refine-section).
- One streak only: chronicleSettings.streakCount. Daily email is a nudge (no pre-drawn card); old /daily?d= email links route to reading detail.
- deckType 'living' is gone (type, routes, table all removed); /decks/living redirect kept. AI reading context is assembled by buildSeekerContext (src/lib/ai/seeker-context.ts) — chronicle dialogue routes intentionally use only getChronicleKnowledge.
