# MysTech v5 - Oracle Card Web App

## Project Overview
A Next.js web app where users create personalized oracle card decks based on life experiences, perform AI-powered readings, and share with others. Freemium model deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + ShadCN/UI |
| Auth | NextAuth.js v5 beta (Google OAuth) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| AI Text | Google Gemini 2.5 Flash |
| AI Images | Google Imagen 4 Fast |
| AI SDK | Vercel AI SDK |
| Animation | Framer Motion + GSAP + React Spring |
| 3D/Shaders | React Three Fiber + Three.js |
| Payments | Stripe |
| File Storage | Vercel Blob |
| Deployment | Vercel |

---

## Design Decisions

These decisions were made during planning and should be followed throughout implementation:

### Visual & Theme
- **UI Theme**: Mystical/dark — deep purples (#0a0118), gold accents (#c9a94e), subtle star particles
- **Dark mode**: Default. Light mode supported via toggle
- **Card style**: Tarot-inspired proportions with art style customization
- **Glass morphism**: Card surfaces use `bg-white/5 backdrop-blur-xl border border-white/10`

### Immersive UI (Progressive Enhancement)
- **Keep Next.js routing** — all pages have real URLs. Deep links, back button, and sharing work normally
- **Layer transitions on top** — Framer Motion `AnimatePresence` in layout for page transitions
- **Shared layout animations** — `layoutId` lets elements morph between pages (e.g., deck card → deck detail)
- **Persistent background** — Ambient particle/gradient layer in app layout, never unmounts, responds to current route
- **Intra-page flows** — Reading ceremony and deck creation are single-page wizards with internal state transitions
- **Spring physics always** — Never use linear/ease durations for animation
- Full architecture details: @docs/architecture/immersive-ui.md

### Mobile-First Development
- **This is non-negotiable** — every component, page, and flow MUST work at 390px before any desktop enhancement
- **Design for 390px first**, then enhance for tablet/desktop
- All layouts must use `dvh` units and responsive flex/grid — no fixed pixel widths
- Card sizes calculated dynamically from viewport via hooks (never fixed Tailwind size classes in flows)
- Touch targets: minimum 44x44px
- Test every flow in Chrome DevTools mobile simulator before desktop
- Reduce particle counts and animation complexity on mobile (check `isMobile` from responsive hooks)
- Scrollable content within zones is allowed (e.g., interpretation text), but the zone structure itself must fit in one viewport
- Everything visible in one viewport — no scrolling required to complete a flow step

### Persistent Shell Pattern (Flow Architecture)
- **This is the mandatory architecture for ALL multi-step flows** — there are no exceptions
- **Every multi-step flow uses a single persistent component** that stays mounted from start to finish
- When building any new flow, start with the shell structure first, then add content to zones
- The shell contains **zones** (card zone, text/UI zone, status zone) whose flex proportions animate based on the current phase
- Phase transitions cause zones to **resize** (e.g., card zone shrinks from `flex-1` to `flex-none`, text zone grows from `h-0` to `flex-1`), not swap
- **Nothing unmounts during a flow** — use conditional visibility (`opacity-0 h-0 overflow-hidden`) and Framer Motion `layout` animations instead of `AnimatePresence mode="wait"` between phases
- **One component, changing contents** — transitions show different content inside the same container, never swap the container itself. The container morphs (size, shape, position) while its contents animate in/out within it
- If you find yourself writing `AnimatePresence mode="wait"` between phases, STOP and refactor to zones
- `AnimatePresence` is reserved for elements that truly enter/exit (toast notifications, modals), NOT for phase transitions within a flow
- Sub-components within zones can change, but the zone containers themselves stay mounted
- State machine (`useReducer`) drives what's visible and how zones are proportioned
- Reference implementation: `src/app/mock/reading/ceremony/page.tsx`
- Anti-pattern: `{phase === "A" ? <ComponentA /> : <ComponentB />}` — this unmounts A and mounts B
- Correct pattern: One shell with zones that animate their `flex`, `height`, `opacity` based on phase

### Authentication
- **Google OAuth only** — no email magic links for MVP
- **JWT sessions** for serverless compatibility
- Landing page after login: `/dashboard`

### AI
- **Personality**: "Wise mystic guide" tone for conversation ("Let us explore the threads of your story...")
- **Tiered quality**: Free = Gemini 2.0 Flash-Lite, Pro = Gemini 2.5 Flash
- **Structured output**: Gemini JSON schema mode for card generation
- **Streaming**: All AI text responses streamed via Vercel AI SDK

### Deck Creation
- **Two modes**: Simple (one-shot prompt + card count + style) and Full Journey (AI conversation)
- **Art styles**: 3x3 grid picker — 8 presets (Tarot Classic, Watercolor Dream, Celestial, Botanical, Abstract Mystic, Dark Gothic, Art Nouveau, Ethereal Light) + 1 custom slot
- **Art style preview**: Gallery of 4-6 sample images per style
- **Art style sharing**: Peer-to-peer via link with accept/reject
- **Draft review**: Three view modes (list with checkboxes, swipe, grid). Users can remove cards and generate replacements
- **Card images**: Simple mode = auto-generate. Journey = after draft review, user confirms then batch generate

### Readings
- **Spreads**: Preset only — single (1), 3-card (3), 5-card (5), Celtic cross (10). No custom spreads for now
- **Draw pool**: Single deck + optional person cards
- **Sharing**: Individual readings shareable via unique link (public, no auth). Reading history page is NOT shareable

### Billing
- **Free tier**: 10 cards/mo, 5 readings/mo, 5 images/mo, 2 decks, 5 person cards, 3-card spread only
- **Pro tier ($4.99/mo)**: 100 cards/mo, 50 readings/mo, 100 images/mo, unlimited decks, 50 person cards, all spreads

---

## Project Structure

```
.claude/
├── rules/                  # Auto-loaded coding rules (scoped by file path)
├── skills/                 # On-demand workflow guides (invocable via /skill-name)
│   ├── immersive-transitions/  # Page transition & animation patterns
│   ├── reading-experience/     # Reading ceremony flow
│   └── component-patterns/     # Component structure templates
└── agents/                 # Subagent definitions for parallel work

src/
├── app/
│   ├── (marketing)/        # Public pages (landing, pricing)
│   ├── (auth)/             # Login pages
│   ├── (app)/              # Authenticated app pages
│   │   ├── dashboard/
│   │   ├── home/
│   │   ├── decks/
│   │   ├── readings/
│   │   ├── art-styles/
│   │   ├── explore/        # Public deck discovery (with styles/ sub-routes)
│   │   ├── profile/
│   │   └── settings/
│   ├── (admin)/            # Admin panel
│   ├── api/                # API routes
│   ├── shared/             # Public shared content (readings, decks)
│   └── mock/               # Design prototypes & animation experiments
├── components/
│   ├── ui/                 # ShadCN primitives
│   ├── layout/             # App shell (sidebar, header)
│   ├── admin/              # Admin panel components (prompt FAB tool)
│   ├── auth/               # OAuth buttons (google-sign-in-button)
│   ├── billing/            # Stripe billing UI
│   ├── cards/              # Card display components
│   ├── dashboard/          # Dashboard widgets (stats, quick-actions, upgrade-cta)
│   ├── decks/              # Deck-related components
│   ├── explore/            # Public deck discovery
│   ├── guide/              # Lyra onboarding AI guide
│   ├── home/               # Home page navigation (radio-nav)
│   ├── immersive/          # Persistent background, page transitions, ambient effects
│   ├── marketing/          # Landing page sections (hero, pricing, features)
│   ├── mock/               # Mock/prototype components
│   ├── readings/           # Reading flow components
│   ├── art-styles/         # Art style picker + preview
│   ├── settings/           # Settings page components
│   ├── voice/              # TTS/STT controls
│   ├── transitions/        # Animation demos (framer/, css/, gsap/, spring/, creative/)
│   ├── lab/                # 3D experiments (Three.js, shaders)
│   └── shared/             # Reusable (usage indicator, upgrade prompt)
├── lib/
│   ├── db/                 # Drizzle client + schema (built incrementally)
│   ├── auth/               # NextAuth config
│   ├── ai/                 # Gemini + Imagen clients
│   │   └── prompts/        # AI prompt templates
│   ├── stripe/             # Billing utilities
│   ├── usage/              # Usage tracking and plan limits
│   └── voice/              # TTS/STT backend (providers, audio queue, sentence buffer)
├── hooks/                  # React hooks
├── test/                   # Test infrastructure (setup, mocks/)
└── types/                  # TypeScript types

e2e/                        # Playwright E2E tests
scripts/                    # Build/dev scripts
public/                     # Static assets

docs/
├── features/               # Feature specs (one per feature)
├── architecture/           # Architecture decision records
│   ├── immersive-ui.md     # Immersive UI vision & approach
│   └── radio-nav-and-profile.md  # Radio nav & profile architecture
├── ai-prompts.md           # AI prompt documentation
└── mocks/                  # Standalone HTML animation prototypes
```

---

## Git Strategy

### Branch Naming
- Feature branches: `feature/00-scaffolding`, `feature/01-auth`, `feature/02-database-foundation`, etc.
- Each feature gets its own branch off `main`
- Merge to `main` after feature is tested and working

### Commit Convention
- `feat: [description]` — new feature
- `fix: [description]` — bug fix
- `docs: [description]` — documentation only
- `refactor: [description]` — code restructuring
- `style: [description]` — formatting, no logic change

### Workflow
1. Create feature branch: `git checkout -b feature/XX-name`
2. Build the feature following its spec
3. Test against the spec's testing checklist
4. Commit with descriptive message
5. Merge to main (or PR if collaborating)
6. Update ROADMAP.md status

### Remote
- GitHub: https://github.com/Benji-cpu/mystech-v5.git
- Deploy target: Vercel (connected to GitHub)

---

## Feature Documentation

Individual feature specs live in `/docs/features/`. Before implementing any feature:
1. Read the feature spec if it exists
2. If no spec exists, work with user to create one first
3. Follow the build → test → commit pattern

See `/docs/ROADMAP.md` for feature status and build order.
See `/docs/MASTER_PLAN.md` for full architectural context.

---

## Database Strategy

**Schema is built incrementally.** Each feature adds only the tables it needs.

- Do NOT create a comprehensive schema.ts upfront
- Each feature spec lists its own data model
- When building a feature, add its tables to `src/lib/db/schema.ts`
- Run `npm run db:push` to sync after schema changes
- Schema progression example:
  - Auth → users, accounts, sessions
  - Deck CRUD → decks, cards
  - Art styles → art_styles, art_style_shares + FK on decks
  - Readings → readings, reading_cards
  - Etc.

---

## Engineering Principles

### Development Workflow
- **Feature-by-feature**: Build one feature completely before starting the next
- **Spec first**: Always review/create the spec before coding
- **Test after each feature**: Verify functionality before committing
- **Commit often**: Each working feature = one commit
- **Branch per feature**: Create git branch before starting work

### Code Style
- Use TypeScript strict mode
- Prefer server components; use `'use client'` only when needed
- API routes return typed responses
- Keep components small and focused
- Co-locate related files (component + its hooks + its types)

### AI Integration
- Use Vercel AI SDK `streamText()` for all text generation
- Store prompts in `/src/lib/ai/prompts/` as exported constants
- Always stream AI responses to the UI
- Handle AI errors gracefully with user-friendly messages

### Database
- Use Drizzle ORM for all database operations
- Run migrations with `npm run db:push`
- Never commit credentials or connection strings

### Testing Checklist (per feature)
- [ ] Happy path works
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] Auth protected (if applicable)
- [ ] Unit tests for utility functions and schemas
- [ ] API route tests for all endpoints
- [ ] E2E tests for critical user flows

---

## Testing

### Test Runners

| Runner | Purpose | Command |
|--------|---------|---------|
| Vitest | Unit + integration tests | `npm test` |
| Vitest (watch) | Dev mode with auto-rerun | `npm run test:watch` |
| Playwright | E2E browser tests | `npm run test:e2e` |
| Playwright (UI) | E2E with interactive UI | `npm run test:e2e:ui` |

### Test Conventions

- **Co-location**: Test files live next to the code they test (e.g., `route.test.ts` next to `route.ts`)
- **Naming**: `*.test.ts` for Vitest, `*.spec.ts` for Playwright
- **Mock helpers**: Use `src/test/mocks/db.ts` and `src/test/mocks/auth.ts` for common mocks
- **E2E auth**: Use `e2e/helpers/auth.ts` `loginAsTestUser()` which calls the dev-only `/api/auth/test-login` route

### What to Test Per Feature

- **Utility functions**: Pure logic, schemas, prompt builders → Vitest unit tests
- **API routes**: Auth checks, validation, error handling, success paths → Vitest with mocked db/auth
- **Critical user flows**: Multi-page journeys (deck creation, readings) → Playwright E2E
- **Skip**: ShadCN primitives, layout components, server component data-fetching wrappers

---

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

---

## Dev Server Management

Agents frequently need a running dev server for E2E tests, manual verification, or browser preview. Follow these conventions to avoid orphaned processes and port conflicts.

### Port Convention

| Port | Role | Notes |
|------|------|-------|
| 3000 | Canonical | Google OAuth callbacks configured here; Playwright default |
| 3001 | Fallback 1 | Use when 3000 is occupied |
| 3002 | Fallback 2 | Use when 3000 and 3001 are occupied |

If all three are taken, ask the user before proceeding.

### Rules

1. **Check before starting** — always probe the port first:
   ```bash
   lsof -ti :3000                                                    # PID using the port (empty = free)
   curl -s -o /dev/null -w '%{http_code}' http://localhost:3000      # 200 = server responding
   ```
2. **Reuse existing servers** — if a dev server is already running on the target port, use it. Never kill a server you didn't start.
3. **Start in background with PID capture**:
   ```bash
   npm run dev &                  # starts on 3000 (default)
   DEV_PID=$!
   # or for an alternate port:
   PORT=3001 npm run dev &
   DEV_PID=$!
   ```
4. **Wait for ready** — poll until the server responds before running tests:
   ```bash
   for i in {1..30}; do
     curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 | grep -q '200' && break
     sleep 1
   done
   ```
5. **Clean up when done** — kill only the server you started, then verify:
   ```bash
   kill $DEV_PID
   lsof -ti :3000  # should be empty
   ```

### Verification Workflow (7-step)

When an agent needs a dev server, follow this sequence:

1. **CHECK** — `lsof -ti :3000` / `curl` to see if a server is already running
2. **START** — only if no server found; capture PID
3. **VERIFY** — poll until the server responds with 200
4. **USE** — run tests, open browser, etc.
5. **CHECK LOGS** — if something fails, check the server output
6. **CLEANUP** — `kill $DEV_PID` (only the server you started)
7. **REPORT** — confirm port is free with `lsof`

### Auth Constraint

Google OAuth redirect URIs are registered for `localhost:3000` only. On alternate ports (3001/3002), use the dev-only test login endpoint instead:

```
POST /api/auth/test-login
```

### Playwright Integration

`playwright.config.ts` reads `process.env.PORT` (default `3000`), so you can run E2E tests on an alternate port:

```bash
PORT=3001 npm run test:e2e
```

---

## Context Management

- If context usage exceeds 60%, inform the user before continuing
- Between major features, context may be cleared and restarted fresh
- The documentation files (`docs/features/`, `CLAUDE.md`, `ROADMAP.md`) are persistent memory — always re-read the relevant spec when starting a feature
- When resuming after context clear: read CLAUDE.md → ROADMAP.md → relevant feature spec

---

## Environment Variables

All credentials stored in `.env.local` — never commit to git.

Required services:
- Neon (database)
- Google Cloud (OAuth + AI)
- Stripe (billing — test keys for dev, live keys stored separately)
- Vercel (blob storage — available after first deploy)

---

## Working With This Project

When asked to implement something:

1. **Check if feature spec exists** in `/docs/features/`
2. **If no spec**: Ask clarifying questions to create one first
3. **If spec exists**: Follow it precisely
4. **After building**: Run the app, test the feature, report results
5. **On success**: Commit with descriptive message

When asked to plan something:

1. Use plan mode (don't write code)
2. Ask clarifying questions about edge cases, UX, and constraints
3. Document decisions in the feature spec
4. Get user approval before implementing

When handling uncertainty:

1. Make a reasonable default decision
2. Document it in the spec's "Open Questions" section
3. Flag it in your completion report
4. Do NOT stop for every question — use judgment

---

## Claude Code Configuration

### Skills (invoke via `/skill-name`)
- `/immersive-transitions` — Page transition patterns, shared layout animations, background system
- `/reading-experience` — Reading ceremony flow (draw, reveal, interpretation)
- `/component-patterns` — Component structure templates, glass morphism, design system

### Rules (auto-loaded when editing matching files)
- `.claude/rules/animation.md` — Animation rules (loads when editing transitions/, readings/, lab/)
- `.claude/rules/components.md` — Component conventions (loads when editing any component)

### Agents (for parallel work delegation)
- `animation-specialist` — Framer Motion animations, card reveals, visual effects
- `ui-builder` — React components, pages, layouts
- `full-app-mocker` — Creates complete full-app UI mock prototypes under /app/mock/full/

### Detailed Architecture
- @docs/architecture/immersive-ui.md — Full immersive UI vision and technical approach
