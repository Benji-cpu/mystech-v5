# MysTech v5 - Oracle Card Web App

## Project Overview
A Next.js web app where users create personalized oracle card decks based on life experiences, perform AI-powered readings, and share with others. Freemium model deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + ShadCN/UI |
| Auth | NextAuth.js (Google OAuth) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| AI Text | Google Gemini 2.5 Flash |
| AI Images | Google Imagen 4 Fast |
| AI SDK | Vercel AI SDK |
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
src/
├── app/
│   ├── (marketing)/        # Public pages (landing, pricing)
│   ├── (auth)/             # Login pages
│   ├── (app)/              # Authenticated app pages
│   │   ├── dashboard/
│   │   ├── decks/
│   │   ├── readings/
│   │   ├── person-cards/
│   │   ├── art-styles/
│   │   └── settings/
│   ├── api/                # API routes
│   └── shared/             # Public shared content (readings)
├── components/
│   ├── ui/                 # ShadCN primitives
│   ├── layout/             # App shell (sidebar, header)
│   ├── cards/              # Card display components
│   ├── decks/              # Deck-related components
│   ├── readings/           # Reading flow components
│   ├── chat/               # AI conversation UI
│   ├── art-styles/         # Art style picker + preview
│   └── shared/             # Reusable (usage indicator, upgrade prompt)
├── lib/
│   ├── db/                 # Drizzle client + schema (built incrementally)
│   ├── auth/               # NextAuth config
│   ├── ai/                 # Gemini + Imagen clients
│   │   └── prompts/        # AI prompt templates
│   └── stripe/             # Billing utilities
├── hooks/                  # React hooks
└── types/                  # TypeScript types
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

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
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
