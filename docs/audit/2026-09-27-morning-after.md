# The morning after — walk of 27 Sep 2026

The question: what happens the morning after someone makes their deck? Answer on
26 Sep: nothing. This is the evidence behind the commits of 27 Sep and what is
still open. Measured against the production database from local dev (390×844,
headless, fresh `@example.com` accounts, all deleted afterwards).

## Found on the way in (not in the brief)

- **Every new account's first deck failed since 16 Sep.** The initiation posts
  `mode: "onboarding"` to `/api/ai/generate-deck`; the zod schema added in
  318f6a8 only allowed `simple | journey`, so "Shape my deck" returned 400 for
  everyone. Fixed and deployed first (151b0d0).
- **Signed-out visitors always lost their destination.** Once `auth()` is given
  a middleware function, NextAuth ignores a `false` from the `authorized`
  callback, so protected pages fell through to `redirect("/login")` with no
  `next`. The login page also read only `next`, never `callbackUrl`.
- **Shared readings overflowed a phone.** `useResponsiveCardSize` read
  `window.innerWidth` in a `useState` initialiser; hydration kept the server's
  1024px sizes, so three 160px cards sat on a 390px page.
- **The one real activated user never saw her art.** Trish's three cards were
  only painted by the 16 Sep backfill, 100 days after her session.
- **Readings with no interpretation had no generation log at all**: the model
  call died with the browser before `onFinish`, it never errored.

## Before / after

| | Before | After |
|---|---|---|
| New account can make a deck (prod) | No — 400 since 16 Sep | Yes (151b0d0, live) |
| Taps from arriving to the first reading | 6 (Not now, Continue, Continue, I'm ready, Shape my deck, Enter) | 2 (Shape my deck, Enter) |
| Forced narration before the question | ~17 s | 0 s |
| Art on the cards when the reading is dealt | 0 of 3 (0 of 3 still at the close) | 3 of 3 (reveal waited 18.6 s; 45 s cap) |
| Arrival → reading dealt, bot speed | 36.9 s | 34.9 s |
| Arrival → reading dealt, human estimate (+~40 s to type) | ~77 s, no art | ~75 s, with art |
| Daily-card rows with a Resend message id | 0 of 67 | rows are only written with one |
| Days a daily-card row was written | ~41% (35/83, 32/79) | every day a tick lands after the hour (5–6 ticks/day, 20–26 Sep) |
| Days a card was actually delivered | 0 | waiting on the Resend domain |
| Reading saved if the tab closes | No | Yes — verified aborting before the first byte and mid-stream |

## The walk

1. **Share link → stranger → sign-in, keeping where they came from.** Local:
   pass. Share URLs come from one trimmed `APP_URL`; the AI text is escaped;
   one CTA ("Make a deck from your own words") → `/login?next=/onboarding`;
   the login page says "Welcome." not "Welcome back". Production: waiting on
   deploy; the Google sign-in of a fresh account needs Ben.
2. **Own reading in under two minutes, art in place.** Local: pass (above).
   Production: waiting on deploy, and on a first real sign-in to confirm
   Gemini in production (no route that calls Gemini is reachable without a
   session, and test-login is off in production).
3. **Next morning the card arrives and one tap opens it as a reading.** Our
   side done: due from the chosen hour; accounts without a profile row
   included; the timezone is taken from `x-vercel-ip-timezone` when the first
   deck is made; a delivery is recorded only when Resend accepts it; the tap
   (`/daily?on=<date>`) makes a single-card reading of that card from their
   own deck, and a signed-out tap returns there after login (verified
   locally). Waiting on Ben: `mystech.app` verified in Resend.
4. **Every finished reading is saved.** Local: pass.

## Chronicle or deck-plus-readings as the daily ritual

| | Chronicle | Daily card from their deck |
|---|---|---|
| External users who ever used it | 0 | 1 (Trish, three-card, ~2.5 min in) |
| All usage | Ben 17 entries (3 completed), e2e 7; longest streak ever 2 | Ben 53 readings, e2e 22 |
| Effort per day | a typed conversation with Lyra, a forge (~15 s art), then a reading | one tap from the email; the reading streams |
| Cost per day, free plan | 1 of 11 lifetime credits; the first deck takes 3, so day 9 ends in a raw 403 | 0 credits |

Recommendation: the daily card is the ritual; Chronicle stays as the optional
deeper practice until it has a user. With a yes, `/today`'s primary action for
a deck owner becomes today's card instead of `/chronicle/setup`.

## Unused features (need Ben's yes to delete)

| Feature | Usage (all time) |
|---|---|
| Paths / circles / practices | 2 path-progress rows, 2 practice rows (Ben + e2e) |
| Guidance | 0 completions |
| Style studio (custom art styles) | 0 custom styles |
| Print | 0 orders |
| Astrology | 1 profile |
| Deck adoption | 0 |
| Journey mode (conversation-built decks) | 1 deck, 1 user |
| Quick readings page | 9 readings, 2 users (the daily-card tap now uses the `quick` spread type itself) |

## Left behind

- Card art for the three walk decks (`cards/<deckId>/*`) is still in Vercel Blob;
  the DB rows are deleted.
- Test accounts from the 15 Sep walk (`test-walk-0915`, `-0915b`,
  `test-walk-admin`) predate this session and were left alone.
