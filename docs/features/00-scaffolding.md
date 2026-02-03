# Feature: Project Scaffolding (UI Shell)

## Overview
Build the basic app shell that all features plug into. Empty pages with navigation, consistent layout, loading states.

## What This Includes

### Layout Structure
```
┌─────────────────────────────────────────┐
│ Header (logo, nav, user menu)           │
├─────────────┬───────────────────────────┤
│             │                           │
│  Sidebar    │     Main Content          │
│  (nav)      │     (page content)        │
│             │                           │
│             │                           │
└─────────────┴───────────────────────────┘
```

### Marketing Layout (public pages)
- Simple header with logo + "Sign in" button
- No sidebar
- Footer with links

### App Layout (authenticated pages)
- Header with logo, breadcrumb, user menu
- Collapsible sidebar with navigation
- Main content area

## Pages to Create

### Marketing (Public)
| Route | Page | Content |
|-------|------|---------|
| `/` | Landing | Hero, features, CTA to sign in |
| `/pricing` | Pricing | Free vs Pro comparison |

### Auth
| Route | Page | Content |
|-------|------|---------|
| `/login` | Login | Google sign-in button |

### App (Protected - show "Coming Soon" placeholders)
| Route | Page | Placeholder Text |
|-------|------|------------------|
| `/dashboard` | Dashboard | "Your dashboard is coming soon" |
| `/decks` | Deck List | "Your decks will appear here" |
| `/decks/new` | New Deck | "Deck creation coming soon" |
| `/readings` | Readings | "Your readings will appear here" |
| `/readings/new` | New Reading | "Start a reading coming soon" |
| `/person-cards` | Person Cards | "Person cards coming soon" |
| `/art-styles` | Art Styles | "Art styles coming soon" |
| `/settings` | Settings | "Settings coming soon" |
| `/settings/billing` | Billing | "Billing coming soon" |

## Components to Build

### Layout Components (`/src/components/layout/`)
- `MarketingHeader` - Logo + Sign in button
- `MarketingFooter` - Links, copyright
- `AppHeader` - Logo, breadcrumb, user menu (placeholder)
- `AppSidebar` - Navigation links
- `UserMenu` - Avatar dropdown (placeholder until auth)

### UI Primitives (ShadCN)
Install these from ShadCN/UI:
- Button
- Card
- Avatar
- DropdownMenu
- Sheet (for mobile sidebar)
- Skeleton (for loading states)

### Placeholder Components
- `ComingSoon` - Reusable "coming soon" message with icon

## Navigation Structure

### Sidebar Links
```
📊 Dashboard        → /dashboard
📚 My Decks         → /decks
  └ + New Deck      → /decks/new
🎴 Readings         → /readings
  └ + New Reading   → /readings/new
👥 Person Cards     → /person-cards
🎨 Art Styles       → /art-styles
⚙️ Settings         → /settings
```

## Styling Direction

### Theme: Mystical/Dark
- Dark background (#0a0a0f or similar deep purple-black)
- Accent colors: Purple, gold, deep blue
- Subtle gradients and glows
- Card-like surfaces with soft shadows
- Typography: Clean, slightly mystical feel

### Mobile
- Sidebar collapses to hamburger menu
- Full-width content
- Touch-friendly tap targets

## File Structure After Scaffolding

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx        # Marketing layout
│   │   ├── page.tsx          # Landing page
│   │   └── pricing/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx        # Minimal centered layout
│   │   └── login/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx        # App layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── decks/
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── readings/
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── person-cards/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── billing/
│   │           └── page.tsx
│   ├── layout.tsx            # Root layout (providers, fonts)
│   └── globals.css
├── components/
│   ├── ui/                   # ShadCN components
│   ├── layout/
│   │   ├── marketing-header.tsx
│   │   ├── marketing-footer.tsx
│   │   ├── app-header.tsx
│   │   ├── app-sidebar.tsx
│   │   └── user-menu.tsx
│   └── shared/
│       └── coming-soon.tsx
```

## Testing Checklist

- [ ] Landing page loads at `/`
- [ ] Pricing page loads at `/pricing`
- [ ] Login page loads at `/login`
- [ ] All app pages show "Coming Soon" placeholders
- [ ] Sidebar navigation works (links go to correct pages)
- [ ] Mobile: Sidebar collapses to hamburger
- [ ] Dark theme applied consistently
- [ ] No console errors

## Notes

- Don't implement auth yet — just the UI shell
- User menu shows placeholder avatar
- Focus on layout and navigation working
- Polish can come later in Phase 5