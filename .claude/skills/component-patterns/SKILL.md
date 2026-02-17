---
name: component-patterns
description: Use when creating any new React component. Defines standard patterns for structure, styling, animation integration, and the MysTech design system.
---

# MysTech Component Patterns

## Standard Component Template

```tsx
'use client';

import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  // ... specific props
}

const variants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export function MyComponent({ className, ...props }: MyComponentProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("relative", className)}
    >
      {/* content */}
    </motion.div>
  );
}
```

## Server vs Client Components

- **Server component** (default): Data fetching, auth checks, layout wrappers
- **Client component** (`'use client'`): Forms, interactive elements, animations, hooks, browser APIs

Server components can render client components as children. Keep the client boundary as low as possible.

## Glass Card Pattern

The standard card treatment for MysTech — used for deck cards, reading cards, settings panels:

```tsx
<motion.div
  className={cn(
    "relative overflow-hidden rounded-2xl",
    "bg-white/5 backdrop-blur-xl",
    "border border-white/10",
    "shadow-lg shadow-purple-900/20",
    "hover:border-purple-500/30",
    "transition-colors duration-300",
    className,
  )}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Subtle gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
  <div className="relative z-10 p-6">
    {/* content */}
  </div>
</motion.div>
```

## Color System

Use CSS variables, not hardcoded colors:
- `text-primary` / `bg-primary` — gold accent in dark theme
- `text-foreground` / `bg-background` — theme-adaptive text/bg
- `text-muted-foreground` — subdued text
- `bg-card` / `text-card-foreground` — card surfaces
- `text-[color:var(--gold)]` — explicit gold when `text-primary` isn't appropriate

## Interactive Elements

```tsx
// Clickable cards
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="cursor-pointer"
>

// Buttons with glow
<Button className="shadow-[0_0_20px_rgba(201,169,78,0.3)]">

// Links that morph
<motion.div layoutId={`item-${id}`}>
```

## ShadCN/UI Usage

UI primitives live in `src/components/ui/`. Always use these instead of building from scratch:
- `Button`, `Input`, `Label`, `Textarea` — form elements
- `Card`, `CardHeader`, `CardContent` — layout containers
- `Dialog`, `AlertDialog` — modals
- `Select`, `Switch`, `Tabs` — controls
- `ScrollArea` — scrollable regions
- `Tooltip` — hover info
- `Sonner` (toast) — notifications via `toast()` from `sonner`

## File Organization

```
src/components/
├── ui/              # ShadCN primitives (don't modify unless extending)
├── layout/          # App shell (sidebar, header, page-header)
├── cards/           # OracleCard, CardDetailModal
├── decks/           # Deck grid, deck card, creation forms, draft review
├── readings/        # Spread layouts, card draw, reveal, interpretation
├── art-styles/      # Style picker, thumbnails
├── dashboard/       # Dashboard stats, quick actions
├── shared/          # Reusable (usage indicator, upgrade prompt, share button)
├── transitions/     # Animation demos (framer/, css/, gsap/, spring/, creative/)
├── lab/             # 3D experiments (Three.js, shaders)
├── admin/           # Admin panel components
├── billing/         # Subscription management
└── settings/        # Settings page components
```
