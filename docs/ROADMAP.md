# MysTech v5 - Feature Roadmap

## Status Key
- ⬜ Not started
- 📋 Spec complete
- 🔨 Building
- ✔️ Complete

---

## Phase 0: Foundation

| # | Feature | Status | Spec | Dependencies |
|---|---------|--------|------|--------------|
| 00 | Project scaffolding (layout, navigation, empty pages) | 📋 | [`00-scaffolding.md`](features/00-scaffolding.md) | None |
| 01 | Authentication (Google OAuth) | ✔️ | [`01-auth.md`](features/01-auth.md) | 00 |
| 02 | Database foundation (Drizzle + Neon setup) | ✔️ | [`02-database-foundation.md`](features/02-database-foundation.md) | None |
| 03 | TypeScript types & shared utilities | 📋 | [`03-types-utilities.md`](features/03-types-utilities.md) | 02 |
| 04 | App layout & navigation | 📋 | [`04-app-layout.md`](features/04-app-layout.md) | 00 |
| 05 | Landing page & auth pages | 📋 | [`05-landing-auth-pages.md`](features/05-landing-auth-pages.md) | 04, 01 |

---

## Phase 1: Core Deck Features

| # | Feature | Status | Spec | Dependencies |
|---|---------|--------|------|--------------|
| 06 | Art styles system (presets + custom + sharing) | ⬜ | [`06-art-styles.md`](features/06-art-styles.md) | 02, 01 |
| 07 | Deck CRUD (create, list, view, edit, delete) | ⬜ | [`07-deck-crud.md`](features/07-deck-crud.md) | 02, 01, 06 |
| 08 | Deck creation — Simple mode (one-shot) | ⬜ | [`08-deck-creation-simple.md`](features/08-deck-creation-simple.md) | 07, 06 |
| 09 | Deck creation — Journey mode (conversation) | ⬜ | [`09-deck-creation-journey.md`](features/09-deck-creation-journey.md) | 07, 06 |
| 10 | AI image generation for cards | ⬜ | [`10-image-generation.md`](features/10-image-generation.md) | 07, 06 |
| 11 | Ad-hoc card management (add/edit/delete/reorder) | ⬜ | [`11-card-management.md`](features/11-card-management.md) | 07, 10 |

---

## Phase 2: Person Cards & Readings

| # | Feature | Status | Spec | Dependencies |
|---|---------|--------|------|--------------|
| 12 | Person cards with photo upload | ⬜ | [`12-person-cards.md`](features/12-person-cards.md) | 02, 01 |
| 13 | Reading flow (spreads, card draw, animation) | ⬜ | [`13-reading-flow.md`](features/13-reading-flow.md) | 07, 12 |
| 14 | AI reading interpretation (streaming) | ⬜ | [`14-reading-ai.md`](features/14-reading-ai.md) | 13 |
| 15 | Reading history & sharing | ⬜ | [`15-reading-history-sharing.md`](features/15-reading-history-sharing.md) | 14 |

---

## Phase 3: Social & Collaboration

| # | Feature | Status | Spec | Dependencies |
|---|---------|--------|------|--------------|
| 16 | Deck collaboration (invite, roles, activity log) | ⬜ | [`16-deck-collaboration.md`](features/16-deck-collaboration.md) | 07, 01 |

---

## Phase 4: Billing & Limits

| # | Feature | Status | Spec | Dependencies |
|---|---------|--------|------|--------------|
| 17 | Stripe billing (subscriptions, portal) | ⬜ | [`17-stripe-billing.md`](features/17-stripe-billing.md) | 01, 02 |
| 18 | Usage tracking & limit enforcement | ⬜ | [`18-usage-limits.md`](features/18-usage-limits.md) | 17 |
| 19 | Settings page (profile, account) | ⬜ | [`19-settings.md`](features/19-settings.md) | 01 |

---

## Phase 5: Polish

| # | Feature | Status | Spec | Dependencies |
|---|---------|--------|------|--------------|
| 20 | Polish & animations (flip, draw, mobile, loading) | ⬜ | [`20-polish-animations.md`](features/20-polish-animations.md) | All |

---

## Notes

- Features should be built in dependency order
- Each feature gets spec'd before building
- Database schema grows incrementally — each feature adds only its own tables
- Commit after each complete feature
- Update status in this file as you progress
- See `MASTER_PLAN.md` for full architectural decisions
