# Feature 20: Polish & Animations

## Overview
Final polish pass across the entire app. Card flip/draw animations, page transitions, mobile responsiveness, loading states, error boundaries, and the mystical visual atmosphere (particle effects, gradients).

## User Stories
- As a user, I want smooth, magical animations when cards are drawn
- As a user, I want the app to feel responsive and polished on mobile
- As a user, I want clear loading states so I know when things are happening
- As a user, I want error messages that feel on-brand, not generic

## Requirements

### Must Have
- [ ] Card flip animation (3D CSS transform)
- [ ] Card draw animation (slide from deck, sequential reveal)
- [ ] Loading skeletons for all async content (decks, cards, readings)
- [ ] Error boundaries with themed error pages
- [ ] Toast notifications for user actions (save, delete, error)
- [ ] Mobile responsiveness pass on all pages
- [ ] Dark/light mode working consistently

### Nice to Have
- [ ] Subtle particle effects on landing page and reading pages
- [ ] Page transitions (fade between routes)
- [ ] Micro-interactions (button hover effects, focus states)
- [ ] Haptic feedback on mobile for card interactions
- [ ] Reduced motion support (prefers-reduced-motion media query)

## Animations

### Card Flip Animation
```css
/* 3D flip: face-down → face-up */
.card-container {
  perspective: 1000px;
}
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.card-inner.flipped {
  transform: rotateY(180deg);
}
.card-front, .card-back {
  backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}
```

### Card Draw Animation (Framer Motion)
```typescript
// Sequential reveal with stagger
<motion.div
  initial={{ opacity: 0, y: 50, rotateY: 180 }}
  animate={{ opacity: 1, y: 0, rotateY: 0 }}
  transition={{ delay: index * 0.8, duration: 0.6 }}
/>
```

### Shuffle Animation
- Stack of cards fans out slightly
- Cards shift positions rapidly for 1-2 seconds
- Settles back into stack
- First card lifts off top

### Page Loading States
| Page | Skeleton |
|------|----------|
| Deck list | Grid of card-shaped skeletons |
| Deck view | Card grid with shimmer placeholders |
| Reading history | List of reading entry skeletons |
| Dashboard | Stat card skeletons + activity list skeletons |

## Mobile Responsiveness

### Breakpoints
| Size | Viewport | Grid Columns |
|------|----------|-------------|
| Mobile | < 640px | 1 column |
| Tablet | 640-1024px | 2 columns |
| Desktop | > 1024px | 3-4 columns |

### Mobile-Specific Adjustments
- Sidebar → bottom sheet (hamburger trigger)
- Spread layouts scale down proportionally
- Celtic cross uses scrollable view on small screens
- Swipe review view is default on mobile
- Touch-friendly tap targets (min 44px)
- Card text readable without zooming

## Error Handling

### Error Boundary Page
```
┌────────────────────────────────────────┐
│                                        │
│        🔮                              │
│    The crystal has clouded...          │
│                                        │
│    Something went wrong.               │
│    Please try refreshing the page.     │
│                                        │
│    [🔄 Try Again]  [🏠 Go Home]       │
│                                        │
└────────────────────────────────────────┘
```

### Toast Notifications
- Success: "Deck saved" ✅ (gold accent)
- Error: "Failed to generate image" ❌ (red accent)
- Info: "1 reading remaining" ℹ️ (blue accent)
- Loading: "Generating your deck..." 🔄 (purple accent)

## Mystical Atmosphere

### Particle Effects (landing page, reading page)
- Subtle floating particles (stars/sparkles)
- CSS-only or lightweight canvas implementation
- Disabled if `prefers-reduced-motion` is set
- Very few particles, slow drift — atmosphere not distraction

### Gradient Backgrounds
- Pages use subtle radial gradients (purple → black)
- Card surfaces have slight gradient sheen
- Borders have faint glow on hover

### Typography
- Headings: slightly decorative (consider Inter with letter-spacing)
- Body: clean and readable
- Card titles: distinctive but legible

## Data Model
No new tables.

## Dependencies
- `framer-motion` (animations)
- Already using: ShadCN Skeleton, ShadCN Toast

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/cards/card-flip.tsx` | Create/modify | 3D flip animation component |
| `src/components/readings/card-draw-animation.tsx` | Modify | Enhanced draw animation |
| `src/components/shared/loading-states.tsx` | Create | Skeleton components for each page type |
| `src/app/error.tsx` | Create | Root error boundary |
| `src/app/(app)/error.tsx` | Create | App section error boundary |
| `src/app/not-found.tsx` | Create | Custom 404 page |
| `src/app/globals.css` | Modify | Add particle effects, refined theme colors |
| Multiple page files | Modify | Add loading skeletons, responsive tweaks |

## Testing Checklist
- [ ] Card flip animation smooth (no jank)
- [ ] Card draw animation sequential with correct timing
- [ ] Loading skeletons appear for all async pages
- [ ] Error boundary catches and displays themed error
- [ ] Custom 404 page displays
- [ ] Toast notifications appear for actions
- [ ] All pages work on mobile (320px-480px viewport)
- [ ] Sidebar converts to hamburger on mobile
- [ ] Spread layouts readable on mobile
- [ ] Dark mode consistent across all pages
- [ ] Light mode consistent across all pages
- [ ] Particle effects visible on landing/reading pages
- [ ] Particle effects respect prefers-reduced-motion
- [ ] Page doesn't shift/jump during loading
- [ ] Touch targets are large enough on mobile (44px+)
- [ ] Scroll behavior is smooth
- [ ] No horizontal overflow on any page

## Open Questions
1. Should we use Framer Motion for all animations or CSS-only where possible? **Default: CSS for simple animations (flip, hover). Framer Motion for complex sequences (card draw, page transitions).**
2. Should particle effects be canvas or CSS? **Default: CSS (pseudo-elements with keyframe animations). Lighter weight, no JS needed.**
3. Should we add a loading page/splash screen? **Default: No splash screen. Use ShadCN skeletons inline. Faster perceived performance.**
