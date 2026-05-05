# MysTech v5 - Oracle Card Web App

Personalized oracle card decks, AI-powered readings, and sharing. Freemium on Vercel.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + ShadCN/UI |
| Auth | NextAuth.js v5 beta (Google OAuth) |
| Database | PostgreSQL (Neon serverless) via Drizzle ORM |
| AI Text | Google Gemini 2.5 Flash (via Vercel AI SDK) |
| AI Images | Google Imagen 4 Fast |
| Animation | Framer Motion + GSAP + React Spring |
| 3D/Shaders | React Three Fiber + Three.js |
| Payments | Stripe |
| File Storage | Vercel Blob |

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm test             # Run all Vitest tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Playwright with interactive UI
```

## Deployment

- **Platform**: Vercel
- **Project**: `mystech-v5`
- **Production URL**: https://mystech-v5.vercel.app
- **Git Remote**: https://github.com/Benji-cpu/mystech-v5.git

## Cron Jobs

Scheduled via a **Claude Code remote agent** registered through claude.ai (https://claude.ai/code/scheduled). The HTTP cron route still verifies `Authorization: Bearer ${CRON_SECRET}` and returns 401 without it.

| Backend | Schedule (UTC) | Local (WITA) | Endpoint / file |
|---------|----------------|--------------|-----------------|
| Claude Code remote agent | `22 19 * * *` | 03:22 Bali | calls `GET /api/cron/nightly-routine?digest=true`; agent prompt at `.claude/agents/nightly-routine.md` |

The nightly route runs feedback digest + project health checks (stuck readings, failed AI generations, idle public decks) and emails a summary to `ADMIN_EMAIL` via Resend. The remote agent calls this route, then writes a versioned `digests/YYYY-MM-DD.md` and opens a draft PR with the human-review layer on top.

## Feedback Module

Standardised cross-project feedback collection. Schema: `feedback` table in `src/lib/db/schema.ts`.

- **Status enum**: `new | reviewed | resolved | dismissed` (aligned with Ubudian template)
- **User-facing**: `FeedbackFab` (marketing/shared layouts, Dialog) and `FeedbackProvider` + `FeedbackSheet` (immersive shell, Sheet with html-to-image screenshot capture)
- **API**:
  - `POST /api/feedback` — public, rate-limited 50/h per signed-in user, screenshots → Vercel Blob
  - `GET /api/admin/feedback` — tester+admin gated, paginated, filterable by status
  - `PATCH /api/admin/feedback/[id]` — admin only, updates status + adminNotes
  - `DELETE /api/admin/feedback/[id]` — admin only
- **Admin UI**: `/admin/feedback` (table + filter + detail dialog with screenshot, status actions, admin notes)
- **Digest**: included in nightly-routine cron (counts by status + new-in-24h)

---

## Critical Conventions

### Mobile-First (Non-Negotiable)
- Every component, page, and flow MUST work at 390px before any desktop enhancement
- Use `dvh` units and responsive flex/grid — no fixed pixel widths
- Card sizes calculated dynamically from viewport via hooks (never fixed Tailwind size classes in flows)
- Touch targets: minimum 44x44px
- Reduce particle counts and animation complexity on mobile (check `isMobile` from responsive hooks)

### Persistent Shell Pattern (Mandatory for Multi-Step Flows)
- Every multi-step flow uses a single persistent component with **zones** that resize — nothing unmounts between phases
- State machine (`useReducer`) drives zone proportions via `flex`, `height`, `opacity` with Framer Motion `layout`
- `AnimatePresence mode="wait"` between phases is an anti-pattern — refactor to zones
- `AnimatePresence` is only for elements that truly enter/exit (modals, toasts, overlays)
- See `.claude/rules/flow-patterns.md` for full details and code patterns
- Reference implementation: `src/app/mock/reading/ceremony/page.tsx`

### Immersive UI
- Next.js routing is the backbone — real URLs, deep links, SSR all work normally
- Page transitions via Framer Motion `AnimatePresence` in layout; shared morphs via `layoutId`
- Spring physics always — never linear/ease durations
- Invoke `/immersive-transitions` skill for detailed patterns

### Database
- Schema built incrementally — each feature adds only the tables it needs
- All queries MUST be scoped by `userId` — never expose cross-user data
- Use Drizzle ORM for all operations; run `npm run db:push` after schema changes

### AI Integration
- **Tone**: "Wise mystic guide" ("Let us explore the threads of your story...")
- **Tiers**: Free = Gemini 2.0 Flash-Lite, Pro = Gemini 2.5 Flash
- **Streaming**: All AI text responses streamed via Vercel AI SDK `streamText()`
- **Prompts**: Store in `src/lib/ai/prompts/` as exported constants

### Auth & Middleware
- Use `getCurrentUser()` for optional auth, `requireAuth()` to throw if unauthenticated
- Plan detection: `const plan = user.plan ?? "free"` — check limits via `src/lib/usage/plans.ts`
- Google OAuth redirect URIs registered for `localhost:3000` only; use `/api/auth/test-login` on other ports
- Middleware sets `x-pathname` header for layout routing

### API Response Pattern
- Return `ApiResponse<T>` from `@/types` with appropriate status codes
- Always validate with Zod before processing; return 400 on validation failure
- Auth-protected routes call `requireAuth()` first

### Billing Tiers
- Limits live in `src/lib/constants.ts` (`PLAN_LIMITS`) — change there, not here. Enforced by `src/lib/usage/usage.ts` (`checkCredits`, `checkDailyReadings`, `checkVoiceCharacters`) and `src/lib/db/queries.ts` (`getUserPlan`).
- **Free**: 11 lifetime credits (never reset), 1 reading/day, spreads = `single` + `three_card`, `standard` AI model. First-day welcome grant of 3 readings within 24h of signup (see `WELCOME_READING_GRANT`).
- **Pro ($4.99/mo)**: 50 credits/month (reset on calendar month boundary), 5 readings/day, all spreads (`single`, `three_card`, `five_card`, `celtic_cross`), `master_oracle` AI model.
- **Admin** (role-based): unlimited everything, bypasses subscription check.
- Credits are spent on image generation, card refinement, and deck generation/confirmation. Readings are gated separately by `checkDailyReadings`. Voice TTS has its own monthly character cap.
- `past_due` status keeps Pro access (grace period); `canceled` keeps Pro until `currentPeriodEnd` then drops to free.

### Terminology
- For the Paths feature, use path-oriented language: "path," "trail," "waypoint," "retreat"
- Never use the word "journey" when referring to Paths

### Imports
- Always use `@/` path alias — never relative imports outside the same directory

---

## Testing

| Runner | Purpose | Command |
|--------|---------|---------|
| Vitest | Unit + integration | `npm test` / `npm run test:watch` |
| Playwright | E2E browser tests | `npm run test:e2e` / `npm run test:e2e:ui` |

- Co-locate test files: `*.test.ts` (Vitest), `*.spec.ts` (Playwright)
- Mock helpers: `src/test/mocks/db.ts`, `src/test/mocks/auth.ts`
- E2E auth: `loginAsTestUser()` via dev-only `/api/auth/test-login`
- **Test per feature**: utility functions (Vitest), API routes (Vitest + mocked db/auth), critical flows (Playwright)
- **Skip**: ShadCN primitives, layout wrappers, server component data-fetching

### Front-End Verification (Mandatory)

After implementing any UI or front-end change, verify the result using Playwright MCP:

1. **Authenticate**: Navigate to the dev server, then call `POST /api/auth/test-login` to get a session cookie (bypasses OAuth)
2. **Navigate**: Go to the affected page(s)
3. **Screenshot**: Take screenshots at both mobile (390px) and desktop widths
4. **Review**: Examine the screenshots to confirm the implementation works as expected
5. **Fix**: If something looks wrong, fix it before considering the task complete

This is non-negotiable — never claim a UI change is done without visual verification.

---

## Dev Server

| Port | Role | Notes |
|------|------|-------|
| 3000 | Canonical | OAuth callbacks + Playwright default |
| 3001 | Fallback 1 | Use `/api/auth/test-login` for auth |
| 3002 | Fallback 2 | Use `/api/auth/test-login` for auth |

- Check port before starting: `lsof -ti :3000`
- Reuse existing servers — never kill a server you didn't start
- Start in background with PID capture; clean up when done
- If all three ports are taken, ask the user

## Environment Variables

**Required (Database):** `DATABASE_URL`
**Required (Auth):** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
**Required (AI):** `GOOGLE_GENERATIVE_AI_API_KEY`
**Required (Stripe):** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PORTAL_CONFIG_ID`
**Required (Storage):** `BLOB_READ_WRITE_TOKEN`
**Required (Cron):** `CRON_SECRET` (also set the same value as a GitHub repo secret)
**Required (Email):** `RESEND_API_KEY`, `ADMIN_EMAIL` (digest destination)
**Optional:** `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM`

---

## Feature Workflow

1. Check for feature spec in `/docs/features/` — if none exists, create one first
2. Read `/docs/ROADMAP.md` for build order and status
3. Read `/docs/MASTER_PLAN.md` for full architectural context
4. Build, test, commit following the spec

---

## Claude Code Configuration

### Skills (invoke via `/skill-name`)
- `/immersive-transitions` — Page transitions, layout animations, background system
- `/reading-experience` — Reading ceremony flow (draw, reveal, interpretation)
- `/component-patterns` — Component structure, glass morphism, design system

### Rules (auto-loaded by file path)
- `.claude/rules/animation.md` — Animation rules (transitions/, readings/, lab/)
- `.claude/rules/components.md` — Component conventions (all components)
- `.claude/rules/flow-patterns.md` — Persistent shell pattern details (readings/, chronicle/, guide/, mock/)

### MCP Servers

**Local** (configured in `~/.claude.json`, scoped to this project):
- `neon` — Remote HTTP (`mcp.neon.tech`) — Neon database management, SQL queries, branch management
- `playwright` — General browser automation, accessibility snapshots, screenshots
- `vercel` — Remote HTTP (OAuth) — Deployment management, logs, Vercel docs
- `stripe` — Remote HTTP (OAuth) — Stripe billing management, customer/subscription ops

### Agents (parallel work delegation)
- `animation-specialist` — Framer Motion animations, card reveals, visual effects
- `ui-builder` — React components, pages, layouts
- `full-app-mocker` — Full-app UI mock prototypes under `/app/mock/full/`
