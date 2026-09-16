# MysTech v5 — what is built

This file said every feature from 06 onward was unbuilt while all of them were live in
production. It was last touched in February 2026 and had become actively misleading — a new
session reading it would have started building things that already shipped. Rewritten
2026-09-16 against the running app.

The per-feature specs in `docs/features/` are the original plans. They are history: several
were superseded during the build and the code is the authority now.

## Shipped and live

| # | Feature | Where it lives |
|---|---|---|
| 00–05 | Scaffolding, Google OAuth, Drizzle + Neon, types, app layout, landing | `src/app/(marketing)`, `src/auth.config.ts` |
| 06 | Art styles — 45 presets, custom styles, sharing | `/decks/styles`, `ART_STYLE_PRESETS` in `src/lib/constants.ts` |
| 07+08+10 | Deck creation, AI card text, AI card art | `/decks/new/simple`, `src/lib/ai/prompts/deck-generation.ts`, `src/lib/ai/stability.ts` |
| 09 | Deck creation, conversation mode | `/decks/new/journey` |
| 11 | Card management — edit, refine, reorder, per-card art retry | `/decks/[deckId]/cards/[cardId]` |
| 13 | Reading flow — single, three-card, five-card, Celtic cross | `src/components/readings/reading-flow.tsx` |
| 14 | Streaming AI interpretation | `src/lib/ai/prompts/reading-interpretation.ts` |
| 15 | Reading history and public sharing | `/story`, `/shared/reading/[token]` |
| 17 | Stripe subscriptions and portal | `/settings/billing`, `src/app/api/webhooks/stripe` |
| 18 | Usage tracking and limit enforcement | `src/lib/usage/` |
| 19 | Settings and profile | `/settings`, `/profile` |
| 20 | Polish, transitions, mobile | throughout |

## Shipped, and not in the original plan

| Feature | Where |
|---|---|
| **Chronicle** — the daily practice with Lyra; a conversation becomes a card | `/today`, `src/components/chronicle/` |
| **Paths** — guided multi-step practice sequences | `/paths` |
| **Astrology context** — natal chart woven into readings | `src/lib/astrology/` |
| **Voice** — speech-to-text input and read-aloud interpretation | `src/lib/voice/`, `src/hooks/use-text-to-speech.ts` |
| **Print orders** — a physical deck, fulfilled by hand from a manifest | `/orders`, `/decks/[deckId]/print` |
| **Daily card delivery** — an emailed card on a schedule you set | `/settings/daily-card`, `api/cron/daily-card` |
| **Admin** — feedback queue, prompt overrides, users, deployment events | `/admin` |
| **Nightly digest** — health data committed to `digests/` and synthesised by an agent | `api/cron/nightly-routine`, `.claude/agents/nightly-routine.md` |

## Planned, never built

| # | Feature | Status |
|---|---|---|
| 12 | Person cards with photo upload | Not built. No upload path, no schema for it. |
| 16 | Deck collaboration — invite, roles, activity log | Not built as specified. What exists is one-way: a public deck can be **adopted** by another user (`deck_adoption`), and art styles can be shared by token. No roles, no invitations, no activity log. |

## What is actually open

Not features — these are the things standing between the app and being good. See
`docs/audit-2026-09.md` for the evidence behind each.

1. **Card art draws a robed human figure for abstract subjects**, whatever the card is
   about. 14 of 36 baseline samples. The single biggest quality gap, because the deck is
   the product.
2. **The Stability balance is zero**, so no new deck gets any art at all.
3. **No starter deck**, so a new user's first day depends on them finishing a conversation
   with Lyra before anything exists to draw from.
4. **Print fulfilment is manual** — fine at this volume, but the buyer-facing state has to
   stay honest about it.
