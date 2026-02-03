# Feature 04: App Layout & Navigation

## Overview
Build the three layout shells (marketing, auth, app) with navigation, theme provider, and responsive sidebar. All pages start as empty placeholders — content comes in later features.

## Requirements

### Must Have
- [ ] Root layout with ThemeProvider (dark default), SessionProvider, Toaster
- [ ] Marketing layout: navbar with logo + "Sign in" button, footer
- [ ] Auth layout: minimal centered layout for login
- [ ] App layout: collapsible sidebar + header with user menu
- [ ] Theme toggle (dark/light) in header
- [ ] Responsive: sidebar collapses to hamburger on mobile
- [ ] Mystical dark theme applied via CSS variables

### Nice to Have
- [ ] Sidebar collapse animation (smooth transition)
- [ ] Active link highlighting in sidebar
- [ ] Breadcrumb in app header

## UI/UX

### Marketing Layout
```
┌──────────────────────────────────────────┐
│ [Logo]               [Features] [Pricing] [Sign In] │
├──────────────────────────────────────────┤
│                                          │
│              Page Content                │
│                                          │
├──────────────────────────────────────────┤
│ Footer: links, copyright                 │
└──────────────────────────────────────────┘
```

### App Layout
```
┌──────────────────────────────────────────┐
│ [☰] [Logo]        [🌙] [Avatar ▼]       │
├─────────┬────────────────────────────────┤
│ Dashboard│                               │
│ My Decks │       Page Content            │
│ Readings │                               │
│ Person   │                               │
│ Art Styles                               │
│ Settings │                               │
├─────────┴────────────────────────────────┤
```

### Sidebar Navigation Links
| Label | Icon | Route |
|-------|------|-------|
| Dashboard | LayoutDashboard | /dashboard |
| My Decks | Layers | /decks |
| Readings | BookOpen | /readings |
| Person Cards | Users | /person-cards |
| Art Styles | Palette | /art-styles |
| Settings | Settings | /settings |

### Theme Colors (CSS Variables)
```css
/* Dark mode (default) */
--background: #0a0118;        /* Deep purple-black */
--foreground: #e8e0f0;        /* Light lavender text */
--card: #130a24;              /* Slightly lighter card surfaces */
--card-foreground: #e8e0f0;
--primary: #c9a94e;           /* Gold accent */
--primary-foreground: #0a0118;
--secondary: #1a0f2e;         /* Purple secondary */
--accent: #7c3aed;            /* Vivid purple accent */
--muted: #1a0f2e;
--muted-foreground: #8b7fa8;
--border: #2a1a4e;
--ring: #c9a94e;
```

## Components to Build

| Component | Path | Description |
|-----------|------|-------------|
| MarketingNavbar | `src/components/layout/marketing-navbar.tsx` | Logo + nav links + sign in button |
| MarketingFooter | `src/components/layout/marketing-footer.tsx` | Footer links, copyright |
| AppSidebar | `src/components/layout/app-sidebar.tsx` | Collapsible navigation sidebar |
| AppHeader | `src/components/layout/app-header.tsx` | Logo, theme toggle, user avatar menu |
| ThemeToggle | `src/components/layout/theme-toggle.tsx` | Dark/light mode switch |
| UserMenu | `src/components/layout/user-menu.tsx` | Avatar dropdown (profile, billing, sign out) |
| Providers | `src/components/providers.tsx` | Wraps ThemeProvider + SessionProvider |

## Data Model
No new database tables.

## Dependencies to Install
- `next-themes` (theme provider)
- `lucide-react` (icons)
- ShadCN components: button, avatar, dropdown-menu, sheet (mobile sidebar), separator, tooltip

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/layout.tsx` | Modify — add Providers wrapper |
| `src/app/globals.css` | Modify — add mystical theme CSS variables |
| `src/app/(marketing)/layout.tsx` | Create |
| `src/app/(auth)/layout.tsx` | Create |
| `src/app/(app)/layout.tsx` | Create |
| `src/components/providers.tsx` | Create |
| `src/components/layout/marketing-navbar.tsx` | Create |
| `src/components/layout/marketing-footer.tsx` | Create |
| `src/components/layout/app-sidebar.tsx` | Create |
| `src/components/layout/app-header.tsx` | Create |
| `src/components/layout/theme-toggle.tsx` | Create |
| `src/components/layout/user-menu.tsx` | Create |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User not logged in visits /dashboard | Redirect to /login (handled by auth feature, but layout should not break) |
| Very long sidebar on small screens | Scrollable sidebar content |
| Theme flash on page load | `next-themes` handles with `suppressHydrationWarning` |

## Testing Checklist
- [ ] Marketing layout renders at `/` with navbar and footer
- [ ] Auth layout renders at `/login` with centered content
- [ ] App layout renders at `/dashboard` with sidebar and header
- [ ] Sidebar links navigate to correct routes
- [ ] Theme toggle switches between dark and light
- [ ] Dark theme uses mystical purple/gold colors
- [ ] Mobile: sidebar collapses to hamburger menu
- [ ] Mobile: hamburger opens sidebar as overlay (Sheet)
- [ ] No hydration errors in console

## Open Questions
1. Should the sidebar be collapsible (icon-only mode) on desktop too? **Default: No, full sidebar only. Mobile gets hamburger.**
2. Should we add a breadcrumb trail? **Default: Yes in header, showing current section.**
