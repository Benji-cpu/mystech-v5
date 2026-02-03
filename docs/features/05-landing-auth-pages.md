# Feature 05: Landing Page & Auth Pages

## Overview
Build the marketing landing page, pricing page, login page, and initial dashboard. These are the first pages users see and the entry point to the app.

## Requirements

### Must Have
- [ ] Landing page with hero, features section, CTA
- [ ] Pricing page with Free vs Pro comparison
- [ ] Login page with Google OAuth button
- [ ] Dashboard page with welcome message and quick actions
- [ ] Mystical visual theme throughout

### Nice to Have
- [ ] Animated hero elements (subtle particle effects)
- [ ] Testimonial section on landing page
- [ ] FAQ section on pricing page

## UI/UX

### Landing Page (`/`)
```
┌────────────────────────────────────────┐
│ HERO SECTION                           │
│ "Create Your Personal Oracle"          │
│ Subtitle about personalized decks      │
│ [Get Started Free]  [Learn More]       │
│                                        │
├────────────────────────────────────────┤
│ FEATURES (3-column grid)               │
│ 🎴 AI-Crafted Decks                   │
│ 🔮 Meaningful Readings                │
│ 👥 Share & Collaborate                 │
├────────────────────────────────────────┤
│ HOW IT WORKS (3 steps)                 │
│ 1. Tell Your Story → 2. Get Your Deck │
│ → 3. Discover Insights                │
├────────────────────────────────────────┤
│ CTA SECTION                            │
│ "Begin Your Journey"                   │
│ [Create Free Account]                  │
└────────────────────────────────────────┘
```

### Pricing Page (`/pricing`)
- Centered comparison table/cards
- Free tier card (left) and Pro tier card (right, highlighted)
- Feature-by-feature comparison with checkmarks
- CTA buttons: "Start Free" and "Go Pro"
- Uses the limit values from `PLAN_LIMITS` constants

### Login Page (`/login`)
- Centered card on mystical dark background
- App logo/name at top
- "Sign in to MysTech" heading
- Google OAuth button (styled, with Google icon)
- Subtle decorative elements (stars, gradient)
- Link back to home page

### Dashboard (`/dashboard`)
- Welcome message with user's name
- Quick stats cards: deck count, reading count, credits remaining
- Quick action buttons: "Create New Deck", "Start a Reading"
- Recent activity feed (empty state for new users)
- Upgrade CTA card if on free plan

## Pages to Create

| Route | File | Layout |
|-------|------|--------|
| `/` | `src/app/(marketing)/page.tsx` | Marketing |
| `/pricing` | `src/app/(marketing)/pricing/page.tsx` | Marketing |
| `/login` | `src/app/(auth)/login/page.tsx` | Auth |
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` | App |

## Data Model
No new database tables. Dashboard reads from existing user/session data.

## Components to Build

| Component | Path | Description |
|-----------|------|-------------|
| HeroSection | `src/components/marketing/hero-section.tsx` | Landing page hero |
| FeatureGrid | `src/components/marketing/feature-grid.tsx` | Feature highlights |
| HowItWorks | `src/components/marketing/how-it-works.tsx` | Step-by-step section |
| PricingCards | `src/components/marketing/pricing-cards.tsx` | Free vs Pro comparison |
| GoogleSignInButton | `src/components/auth/google-sign-in-button.tsx` | Styled Google OAuth button |
| DashboardStats | `src/components/dashboard/dashboard-stats.tsx` | Quick stats cards |
| QuickActions | `src/components/dashboard/quick-actions.tsx` | Action buttons |
| EmptyState | `src/components/shared/empty-state.tsx` | Reusable empty state with icon + message |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Dashboard for brand new user (no decks/readings) | Show empty states with CTAs to create first deck |
| User visits /dashboard without auth | Redirect to /login |
| User visits /login while already logged in | Redirect to /dashboard |
| Google OAuth popup blocked | Show fallback message |

## Testing Checklist
- [ ] Landing page loads at `/` with all sections
- [ ] Feature grid shows 3 feature cards
- [ ] CTA buttons link to /login
- [ ] Pricing page shows Free vs Pro comparison
- [ ] Pricing uses correct limit values
- [ ] Login page shows Google sign-in button
- [ ] Google OAuth flow works (redirects to Google, comes back)
- [ ] Dashboard shows after successful login
- [ ] Dashboard shows user's name from Google profile
- [ ] Dashboard empty state is friendly for new users
- [ ] All pages use mystical dark theme
- [ ] Mobile responsive on all pages

## Open Questions
1. Should the landing page have actual card imagery or abstract illustrations? **Default: Abstract mystical illustrations — we don't have real card images yet.**
2. Should the pricing page link to Stripe Checkout directly or just to the sign-up flow? **Default: Link to /login first, billing comes after account creation.**
