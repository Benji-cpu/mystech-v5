# MysTech v5

Personalised oracle card decks with AI readings and sharing. Freemium.

- **Live at:** https://mystech-v5.vercel.app (Vercel project `mystech-v5`). No lead chat.
- **Repo:** `Benji-cpu/mystech-v5`, branch `main`. A push to `main` deploys.
- **Stack:** Next.js 16, Neon Postgres through Drizzle, NextAuth v5 beta (Google), Gemini 2.5 Flash through the Vercel AI SDK, Stability AI Core for card art (`src/lib/ai/stability.ts`), Framer Motion, Stripe, Vercel Blob.

## Commands

- `npm run dev` (port 3000; use 3001 or 3002 if it is taken and sign in through `/api/auth/test-login`), `npm run build`, `npm test` (Vitest), `npm run test:e2e` (Playwright).
- Database: `npm run db:generate`, `npm run db:push`, `npm run db:studio`.
- Art styles: `ART_STYLE_PRESETS` in `src/lib/constants.ts` is the source. `npx tsx scripts/seed-art-styles.ts` puts them in the database; `--rows-only` spends nothing on images.

## How it works

- It is built for the phone first. A multi-step flow (a reading, forging a card, the chronicle) keeps one shell mounted and animates its zones; nothing unmounts between steps.
- The design patterns are written up as skills in `.claude/skills/`: `component-patterns`, `immersive-transitions`, `reading-experience`.
- Old URLs are redirects in `next.config.ts`, not pages.
- A Stability AI balance of zero returns 402 and every card fails.
- Crons: the daily card (`/api/cron/daily-card`) and the prepare step of the paused nightly routine, which writes `digests/` through the GitHub API.
- Google Cloud project `473497770902` (text-to-speech; billing is off) belongs to `mystechcards@gmail.com`.

## Older notes

`docs/claude-md-2026-11-10.md` is this file as it was before 10 Nov 2026 (card art renditions, billing tiers, env vars, the routine pipeline). Look a fact up there; its rules no longer apply.
