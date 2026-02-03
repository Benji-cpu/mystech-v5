# MysTech v5 - Master Plan

> This document captures the full architectural plan and design decisions made during the planning phase. It serves as a reference — the actual build follows the individual feature specs in `/docs/features/`.

## Product Overview

A Next.js web app where users create personalized oracle card decks based on life experiences, perform AI-powered readings, upload photos for person-based cards, collaborate on decks with friends/family, and share readings. Freemium model (Free + Pro) deployed on Vercel.

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
| AI Text | Google Gemini 2.5 Flash (Pro) / 2.0 Flash-Lite (Free) |
| AI Images | Google Imagen 4 Fast ($0.02/image) |
| AI SDK | Vercel AI SDK (streaming support) |
| Payments | Stripe (subscriptions + billing portal) |
| File Storage | Vercel Blob |
| Deployment | Vercel |

**Estimated AI cost per active user/month: ~$0.22** (95.6% gross margin at $4.99/month Pro tier)

---

## Design Decisions

These were decided during the planning phase with user input:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Theme | Mystical/dark — deep purples (#0a0118), gold accents (#c9a94e) | User preference |
| Auth | Google OAuth only (no email magic links) | Simplicity for MVP |
| AI Personality | "Wise mystic guide" tone | Fits product theme |
| Deck Creation | Two modes: Simple (one-shot) and Full Journey (conversation) | Simple for quick use, Journey for depth |
| Art Styles | 3x3 grid (8 presets + 1 custom slot) | Visually appealing selection |
| Art Style Presets | Tarot Classic, Watercolor Dream, Celestial, Botanical, Abstract Mystic, Dark Gothic, Art Nouveau, Ethereal Light | Covers range of aesthetics |
| Art Style Sharing | Peer-to-peer via link with accept/reject (not marketplace) | Simpler, avoids spam |
| Art Style Preview | Gallery of 4-6 sample images per style + description | Helps users choose |
| Draft Review | Three view modes (list with checkboxes, swipe, grid) | Different preferences + devices |
| Card Replacement | Users can remove draft cards and generate replacements | Avoids losing card count |
| Card Images | Simple mode = auto-generate all. Journey = after draft review | Matches each flow's pace |
| Readings | Single deck per reading + optional person cards | Keep it focused |
| Spreads | Preset only (single, 3-card, 5-card, Celtic cross). No custom for now | Scope management |
| Reading Sharing | Individual readings shareable via link (not history page) | Privacy-respecting |
| Stripe Mode | Test keys active for dev, live keys stored separately | Safety |

---

## Subscription Tiers

| Feature | Free | Pro ($4.99/mo) |
|---------|------|----------------|
| Card creations/month | 10 | 100 |
| Readings/month | 5 | 50 |
| AI image generations/month | 5 | 100 |
| Max decks | 2 | Unlimited |
| Person cards | 5 | 50 |
| Deck collaboration | View only | Full edit access |
| Spread types | 3-card only | All spreads |
| Reading history | Last 10 | Unlimited |
| AI quality | Gemini 2.0 Flash-Lite | Gemini 2.5 Flash |

---

## Key Feature Flows

### Deck Creation — Simple Mode
1. User clicks "New Deck" → chooses "Quick Create"
2. Enters: text description, card count, art style (3x3 picker)
3. Sees credit cost preview
4. AI generates card definitions (structured output) + images
5. Deck status: draft → generating → completed

### Deck Creation — Full Journey Mode
1. User clicks "New Deck" → chooses "Guided Journey"
2. Enters: deck title, theme, card count, art style
3. AI conversation (streaming) — wise mystic guide
4. AI extracts anchors (themes, emotions, symbols) during conversation
5. When ready: AI generates card drafts (text-only)
6. User reviews drafts in 3 view modes (list/swipe/grid)
7. Can remove cards → "Generate Replacements" to fill gaps
8. Confirms deck → image generation starts
9. Deck status: draft → generating → completed

### Reading Flow
1. Select deck (from user's completed decks)
2. Optionally add person cards to draw pool
3. Choose spread: single, 3-card, 5-card, Celtic cross
4. Optionally enter question/intention
5. Cards drawn with flip animation
6. AI interprets reading (streaming)
7. Reading saved, shareable via link

### Collaboration Flow
1. Deck owner invites collaborator via link
2. Collaborator previews invitation, accepts/rejects
3. Editor role: add/edit/delete cards. Viewer: read-only
4. Activity log tracks all changes

---

## Technical Architecture

### AI Integration
- **Structured output**: Gemini JSON schema mode for card generation
- **Streaming**: Vercel AI SDK `streamText()` for conversations and interpretations
- **Image generation**: Background job pattern — trigger, poll, update with Vercel Blob storage
- **Tiered quality**: Free = Gemini 2.0 Flash-Lite, Pro = Gemini 2.5 Flash
- **Prompt caching**: System prompts cached for 90% input cost reduction

### Database Strategy
- Schema built incrementally per feature (not all at once)
- Each feature spec lists only its own tables
- Drizzle ORM with `drizzle-kit push` for migrations
- Neon serverless driver for connection pooling

### Auth Architecture
- JWT sessions for serverless compatibility
- NextAuth.js with Drizzle adapter
- Google OAuth provider only
- Custom session callback includes user ID

### State Management
- Server components by default
- Client components with `use client` only when needed
- No global state library — React Query for client-side data fetching where needed

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
│   ├── db/                 # Drizzle client + schema
│   ├── auth/               # NextAuth config
│   ├── ai/                 # Gemini + Imagen clients
│   │   └── prompts/        # AI prompt templates
│   └── stripe/             # Billing utilities
├── hooks/                  # React hooks
└── types/                  # TypeScript types
```

---

## Environment Variables

```
DATABASE_URL          # Neon PostgreSQL connection string
NEXTAUTH_SECRET       # Random secret for JWT signing
NEXTAUTH_URL          # App URL (http://localhost:3000 for dev)
GOOGLE_CLIENT_ID      # Google OAuth client ID
GOOGLE_CLIENT_SECRET  # Google OAuth client secret
GOOGLE_GENERATIVE_AI_API_KEY  # Gemini + Imagen API key
STRIPE_SECRET_KEY     # Stripe test mode secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe test mode publishable
STRIPE_SECRET_KEY_LIVE              # Stripe live mode (DO NOT USE IN DEV)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE  # Stripe live mode
STRIPE_WEBHOOK_SECRET  # Stripe webhook signing secret
BLOB_READ_WRITE_TOKEN  # Vercel Blob storage token
NEXT_PUBLIC_APP_URL    # Public app URL
```

---

## Build Order

Features are built incrementally. See `/docs/ROADMAP.md` for current status and `/docs/features/` for individual specs.

Phase 0: Foundation (scaffolding, auth, database setup)
Phase 1: Core deck features (CRUD, art styles, simple + journey creation, images)
Phase 2: Person cards & readings (upload, spreads, AI interpretation)
Phase 3: Social (sharing, collaboration)
Phase 4: Billing (Stripe, usage limits)
Phase 5: Polish (animations, mobile, loading states)
