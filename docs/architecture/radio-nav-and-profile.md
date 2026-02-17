# Radio Navigation & Profile Hub

## Vision

The app home is a **cosmic radio** — a space where navigation nodes (Decks, Readings, Art Styles) float like stations you can tune into. One node is **You**: selecting it opens a single **Profile** page that holds everything personal: dashboard (decks, stats, quick actions) and settings (profile, account, billing) in one place.

- **Home** = Radio/cosmos experience. No list of links; you "click into" floating destinations.
- **Profile** = The unified personal hub. Replaces the old split between "Dashboard" and "Settings."

## Experience Flow

1. User lands (after login or via "Home") on the **radio view**: ambient background, a few floating orbs/cards/nodes.
2. Each node is a destination:
   - **Decks** → `/decks`
   - **Readings** → `/readings`
   - **Art Styles** → `/art-styles`
   - **You** (personal icon) → `/profile`
3. Selecting **You** takes them to **Profile**, which is one scrollable (or tabbed) page:
   - **Overview** (dashboard): welcome, in-progress decks, stats, quick actions, recent activity, upgrade CTA.
   - **Settings**: profile form, connected account, subscription, delete account (same content as current `/settings`, optionally with a "Billing" link to `/settings/billing` for deep link).

Sidebar and header stay consistent:
- **Sidebar**: Home (radio), Decks, Readings, Art Styles, Profile. Usage at bottom.
- **Header**: Logo → Home, User avatar → dropdown (Profile, Settings deep link, Billing, Admin if applicable, Sign out). Profile in dropdown can go to `/profile` (same page, maybe scroll to settings section or just open profile).

## Design Principles

- **Radio = discovery, not menu.** The home feels like a space with destinations, not a nav list. Use depth, subtle motion, and glass orbs/cards so each node feels like a place to "tune in."
- **Profile = one place for "me".** No mental split between "my dashboard" and "my settings." One URL, one scroll (or tabs: Overview | Account & settings).
- **URLs preserved.** `/decks`, `/readings`, `/art-styles`, `/profile` all remain. `/dashboard` redirects to `/profile` for backwards compatibility. Post-login redirect can go to `/home` (radio) so the first impression is the cosmic home.

## Technical Notes

- **Home** at `/home`: client component with Framer Motion for floating nodes; optional subtle canvas/CSS background (stars, gradient) to reinforce "space."
- **Profile** at `/profile`: server component that composes existing dashboard blocks and settings sections; optional client tabs (Overview | Account) for clarity.
- **Auth:** Allow `/home` and `/profile` in app routes; redirect after login to `/home`.
- **Sidebar:** Replace "Dashboard" with "Home" (`/home`), add "Profile" (`/profile`). User menu: "Profile" → `/profile`, "Settings" → `/profile#settings` or keep `/settings` as alias.

## Open Questions

- Whether to keep a separate `/settings` route or fully fold into `/profile` (recommend: keep `/settings` as redirect to `/profile` or same layout with shared sections).
- Strength of "radio" metaphor on mobile (e.g. same floating nodes with touch, or simplified grid of large targets).
