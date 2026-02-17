---
name: immersive-transitions
description: Use when building page transitions, view animations, shared layout morphs, or the persistent background layer. Covers the progressive enhancement approach to immersive UI.
---

# Immersive Transition System

MysTech uses progressive enhancement — Next.js routing stays, but transitions between pages and within pages feel fluid and atmospheric.

## Page Transitions (Between Routes)

Page transitions happen in the `(app)/layout.tsx` using Framer Motion `AnimatePresence`:

```tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Wrap {children} in the layout
function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

## Shared Layout Animations (Cross-Page Morphing)

When an element appears on two pages and should morph between them, use `layoutId`:

```tsx
// Page A: Deck grid
<motion.div layoutId={`deck-${deck.id}`}>
  <DeckCard deck={deck} />
</motion.div>

// Page B: Deck detail — same layoutId
<motion.div layoutId={`deck-${deck.id}`}>
  <DeckHeader deck={deck} />
</motion.div>
```

Both pages must be wrapped in `<LayoutGroup>` (or share a common layout with AnimatePresence).

## Intra-Page Transitions (Within a Single Route)

For wizard flows (reading setup, deck creation), use local state with AnimatePresence:

```tsx
const [step, setStep] = useState<'select' | 'spread' | 'draw'>('select');

<AnimatePresence mode="wait">
  {step === 'select' && (
    <motion.div
      key="select"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <DeckSelector onSelect={() => setStep('spread')} />
    </motion.div>
  )}
  {/* ... more steps */}
</AnimatePresence>
```

## Choreographed Children (Stagger Pattern)

When a view has multiple elements that should appear sequentially:

```tsx
const container = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const child = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 35 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

<motion.div variants={container} initial="initial" animate="animate" exit="exit">
  {items.map(item => (
    <motion.div key={item.id} variants={child}>
      {/* content */}
    </motion.div>
  ))}
</motion.div>
```

## Persistent Background Layer

The background lives in the app layout and never unmounts. It responds to route changes:

```tsx
const backgroundMoods: Record<string, { hue: number; saturation: number; speed: number }> = {
  '/dashboard': { hue: 270, saturation: 40, speed: 0.3 },
  '/readings/new': { hue: 240, saturation: 60, speed: 0.1 },
  '/decks': { hue: 275, saturation: 35, speed: 0.25 },
};
```

The background interpolates between moods smoothly using `useSpring` or CSS transitions.

## Existing Assets

Before building new animations, check these existing implementations:
- `src/components/transitions/framer/` — Spring, layout, presence, drag, morph, stagger, flip
- `src/components/transitions/creative/` — Deck deal, stardust gather, portal vortex, golden unfold
- `src/components/lab/` — 3D cards, holographic shaders, nebula backgrounds
- `src/hooks/use-card-reveal.ts` — Sequential card reveal sequencer

## Rules

1. Spring physics always — never linear/ease durations
2. AnimatePresence for every mount/unmount
3. Stagger children — never show 3+ elements simultaneously
4. `layoutId` when an element transforms between views
5. Exit animations faster than enter animations
6. Background interpolates smoothly — never jumps
7. Mobile: test touch, reduce particles, ensure gestures work
