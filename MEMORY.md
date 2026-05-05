# MysTech v5 — Session Memory

Learned-experience notes that don't belong in CLAUDE.md. Keep entries concise (1–2 lines each); consolidate when this file approaches 200 lines.

## Pending one-off migrations

- After deploying the feedback status enum alignment, run once on prod DB: `UPDATE feedback SET status = 'dismissed' WHERE status = 'archived';` — there's no DB-level enum constraint, so existing `archived` rows will display as fallback styling until converted.

## Feedback module

- Two intentional entry points: `FeedbackFab` (marketing/shared, no screenshot) vs `FeedbackProvider` + `FeedbackSheet` (immersive shell, html-to-image screenshot). Don't consolidate — the surfaces have different UX needs.
- `feedback.type` field (bug/suggestion/general) is on the standardisation roadmap but not yet implemented; admin UI currently has no type column. Add when ready by extending schema, both input forms, the Zod schema in `POST /api/feedback`, and the admin table.
- Screenshot capture uses `html-to-image` and excludes `nav`, `[role=dialog]`, and Vaul overlays — see `feedback-provider.tsx`.

## Cron / scheduled work

- Nightly digest runs via GitHub Actions, not Vercel Cron. Hobby plan caps Vercel Cron at 2/day and doesn't honour timezones. GH Actions is free, supports manual `workflow_dispatch` for testing.
- Repo secret `CRON_SECRET` must match the Vercel project env var of the same name. Both must be set or the workflow fails fast.
- Cron schedules are staggered ±5min across projects (Ubudian 03:17, MysTech 03:22) so digest emails arrive separately.

## Testing

- Playwright test-login: `GET /api/auth/test-login` (production-guarded). Use this for Playwright MCP verification — Google OAuth callbacks are only registered for `localhost:3000`.

## Known gaps to revisit

- No automatic spam dedup on feedback. Identical message from same user can be submitted repeatedly.
- `vercel.json` does not exist yet; if Pro plan is adopted later, sub-daily project-specific crons can move there.
