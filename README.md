# MysTech

Turns a person's life story into a personalised oracle deck — AI text and AI art, one card
at a time — then runs readings and a daily ritual on it.

Live at **https://mystech-v5.vercel.app**.

## What it actually does

1. **You talk to Lyra.** A short conversation about what is going on in your life.
2. **A deck is forged from it.** Each card gets a title, a meaning, guidance, and its own
   generated painting in an art style you pick from 45 presets.
3. **You draw from it.** One card, three cards, five cards, or a Celtic cross; Lyra reads
   the spread against the story the cards came from, not against a generic tarot canon.
4. **Chronicle.** A daily practice: a few minutes with Lyra, and the day becomes a card.
   Your deck grows with you.
5. **Print.** A physical deck can be ordered; fulfilment is manual today.

Free tier is 11 lifetime card credits and one reading a day. Pro is $4.99/mo — 50 credits a
month, five readings a day, every spread, the better model. A printed deck is $49.

## Running it

```bash
npm install
cp .env.example .env.local     # then fill it in — see "Environment" below
npm run dev                    # http://localhost:3000
```

`.env.local` in this repo points at the **production** database. `npm run db:push` migrates
production. Read `CLAUDE.md` before running anything that writes.

```bash
npm test             # Vitest — 391 tests, 40 files
npx tsc --noEmit     # typecheck
npm run lint         # eslint (28 pre-existing errors, all React Compiler rules)
npm run build        # production build
```

Signing in locally goes through Google OAuth. For a headless walk, `POST /api/auth/test-login`
mints a session without it — dev only, 404 in production. An optional `{ email, role }` body
(any `@example.com` address) mints a *different*, genuinely new user, which is the only way
to see what a stranger sees.

## Environment

| Purpose | Variables |
|---|---|
| Database | `DATABASE_URL` (Neon) |
| Auth | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| AI text | `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini 2.5 Flash) |
| AI art | `STABILITY_AI_API_KEY` (Stability AI Core) |
| Storage | `BLOB_READ_WRITE_TOKEN` (Vercel Blob) |
| Payments | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PORTAL_CONFIG_ID` |
| Nightly cron | `CRON_SECRET`, `GITHUB_TOKEN`, `VERCEL_TOKEN` |
| Email | `RESEND_API_KEY`, `ADMIN_EMAIL` |
| Optional | `GOOGLE_CLOUD_TTS_API_KEY` (read-aloud), `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM` |

**Card art is the thing to watch.** A Stability balance of zero returns `402 payment_required`
and every card in every new deck fails. There is no fallback image.

## Layout

```
src/app/(marketing)/    landing, pricing
src/app/(app)/          today · decks · story · chronicle · paths · settings · profile
src/app/(admin)/admin/  feedback queue, prompts, users, deployments
src/app/api/            108 routes
src/lib/ai/prompts/     every system prompt, one file per surface
src/lib/db/schema.ts    Drizzle schema — the source of truth for the database
scripts/art-harness.ts  seeded N-sample card-art harness (see below)
digests/                nightly health digests, committed by the cron
docs/audit-2026-09.md   the last full read of this app, and what it found
```

Twelve pre-2026-06 URLs are config redirects in `next.config.ts`, not pages.

## Card art

Art quality is the product's biggest open problem: for abstract subjects the model falls back
to its own "oracle card" prior — a robed woman — whatever the card was about. **Never tune the
prompt from one image.** The harness exists for exactly this:

```bash
npx tsx scripts/art-harness.ts --variant=baseline        # 12 fixed subjects × 3 seeds
npx tsx scripts/art-harness.ts --variant=v1 --subjects=star-seed,veiled-galaxy
```

It writes a contact sheet to `.art-harness/<variant>/SHEET.jpg`. Look at the sheet, count the
failures, and only then change a prompt. `docs/audit-2026-09.md` has the current baseline.

## Nightly

Vercel cron gathers health data at ~20:10 UTC and commits `digests/<date>.json`; a Claude Code
remote agent reads it at 21:00 UTC and commits the markdown beside it. `CLAUDE.md` has the
architecture and the runbook.

## Shipping

Direct to `main`, push, Vercel deploys. No pull requests anywhere in this repo.
