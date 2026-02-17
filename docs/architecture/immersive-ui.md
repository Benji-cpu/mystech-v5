# Immersive UI Architecture — Progressive Enhancement

## Vision

The MysTech experience should feel like consulting a digital oracle — atmospheric, immersive, slightly otherworldly. Instead of a standard SaaS dashboard, the app uses fluid transitions, persistent ambient elements, and choreographed animations to create continuity between views.

## Approach: Progressive Enhancement

**We keep Next.js App Router routing as the backbone.** Pages still exist at real URLs. Deep links, back button, URL sharing, and SSR all work normally. The immersive layer is built ON TOP of routing.

### What this means in practice:
- Pages at `/decks`, `/readings/new`, `/readings/[id]` etc. still exist
- The `(app)/layout.tsx` wraps all authenticated views with a persistent shell
- **Page transitions** are animated using Framer Motion's `AnimatePresence` in the layout
- **Shared layout animations** let elements (like deck cards) morph between pages via `layoutId`
- A **persistent background layer** (particles, gradients) lives in the layout and never unmounts
- Navigation still uses Next.js `<Link>` — but transitions between pages feel fluid

### What we do NOT do:
- No Zustand state machine replacing routing
- No single-page app with internal state-driven views
- No abandoning URLs or deep linking
- No custom back-button handling

## Technical Implementation

### 1. Persistent Background Layer

A canvas-based or CSS particle/gradient background that lives in the app layout and responds to the current route/mood.

```
src/app/(app)/layout.tsx
├── <BackgroundLayer />          ← Persistent, never unmounts
├── <AppSidebar /> (desktop)
├── <AppHeader /> (mobile)
├── <AnimatePresence mode="wait">
│   └── <PageTransition key={pathname}>
│       └── {children}           ← Actual page content
│   </PageTransition>
└── </AnimatePresence>
```

Background mood shifts based on route:
- `/dashboard` — default purple ambient
- `/readings/new` — deeper midnight blue, slower particles
- `/readings/[id]` (reveal phase) — warm golden undertone
- `/decks` — neutral, subtle movement

### 2. Page Transition System

Using Framer Motion `AnimatePresence` in the layout to animate page enter/exit:

```tsx
// In app layout — wraps {children} with route-aware transitions
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
```

### 3. Shared Layout Animations

When an element "becomes" another across pages (e.g., deck card in grid → deck detail):

```tsx
// On /decks page
<motion.div layoutId={`deck-${deck.id}`}>
  <DeckCard deck={deck} />
</motion.div>

// On /decks/[deckId] page — same layoutId, Framer handles the morph
<motion.div layoutId={`deck-${deck.id}`}>
  <DeckHeader deck={deck} />
</motion.div>
```

### 4. Intra-Page State Machines

Some flows ARE single-page experiences with internal state (but they live at a real URL):

- **Reading flow** (`/readings/new`) — wizard steps transition within the page
- **Deck creation journey** (`/decks/new/journey`) — AI conversation with visual accumulation

These use local React state or a lightweight Zustand store scoped to that page, NOT global navigation state.

### 6. Persistent Shell Pattern

Multi-step flows (reading ceremony, deck creation, card forging) must use a **persistent shell** where all zones stay mounted and animate their proportions — nothing unmounts between phases.

#### Shell Structure

```tsx
function FlowShell() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Status Zone — always mounted, content changes */}
      <div className="shrink-0">
        <motion.p
          key={state.phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {phaseLabel[state.phase]}
        </motion.p>
      </div>

      {/* Primary Zone — always mounted, flex proportion changes */}
      <motion.div
        layout
        className="min-h-0"
        animate={{
          flex: state.phase === "interpreting" ? "none" : 1,
          height: state.phase === "interpreting" ? "auto" : undefined,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Cards always here, animate position/size */}
      </motion.div>

      {/* Secondary Zone — always mounted, grows from h-0 */}
      <motion.div
        layout
        className="min-h-0"
        animate={{
          flex: showText ? 1 : 0,
          opacity: showText ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Interpretation text, completion UI, etc. */}
      </motion.div>
    </div>
  );
}
```

#### Key Principles

1. **Outer shell**: `h-[100dvh] flex flex-col overflow-hidden` — fills viewport, no scrolling between phases
2. **Zones stay mounted**: Each zone is always in the DOM. Visibility controlled by `flex`, `height`, and `opacity`
3. **`layout` on zone containers**: Framer Motion animates size changes smoothly
4. **State machine drives proportions**: `useReducer` determines zone flex values per phase
5. **Cards never unmount**: Cards use `layout` to animate between full-size spread and compact strip

#### Anti-Pattern vs Correct Pattern

```tsx
// ANTI-PATTERN: AnimatePresence swaps entire phases
<AnimatePresence mode="wait">
  {phase === "selecting" && <SelectionView />}
  {phase === "drawing" && <DrawingView />}
  {phase === "interpreting" && <InterpretationView />}
</AnimatePresence>
// Problem: each view fully unmounts, no morphing between phases

// CORRECT: Persistent zones that resize
<div className="h-[100dvh] flex flex-col">
  <motion.div layout animate={{ flex: phase === "selecting" ? 1 : 0, opacity: phase === "selecting" ? 1 : 0 }}>
    {/* Selection content — always mounted */}
  </motion.div>
  <motion.div layout animate={{ flex: isCardPhase ? 1 : 0 }}>
    {/* Card spread — always mounted */}
  </motion.div>
  <motion.div layout animate={{ flex: phase === "interpreting" ? 1 : 0, opacity: phase === "interpreting" ? 1 : 0 }}>
    {/* Interpretation — always mounted */}
  </motion.div>
</div>
```

#### When AnimatePresence IS Appropriate

- Modals and dialogs (truly enter/exit the DOM)
- Toast notifications
- Decorative overlays (celebration particles, golden wave sweeps)
- Individual list items being added/removed

Reference implementation: `src/app/mock/reading/materialization/page.tsx`

### 5. The Reading Ceremony

The reading flow is the emotional climax. The `/readings/new` page manages its own internal state:

```
reading_setup → card_draw → card_reveal → interpretation
```

Each transition is a choreographed animation sequence within a single page component. The background layer responds to these phases (deepening, warming, pulsing).

## Animation Libraries in Use

| Library | Role | When to Use |
|---------|------|-------------|
| Framer Motion | Page transitions, layout animations, gesture handling | Default choice for all UI animation |
| GSAP | Complex timelines, text reveals, precise sequencing | When you need frame-precise control |
| React Spring | Physics-based springs, trail/stagger effects | When Framer Motion springs aren't sufficient |
| React Three Fiber | 3D card rendering, shader effects, particle systems | Card visuals, lab experiments |

## Existing Animation Assets

The project already has 40+ transition/animation components:
- `src/components/transitions/framer/` — Spring physics, layout, AnimatePresence, drag, morph, stagger, flip
- `src/components/transitions/css/` — 3D flips, clip-path reveals, perspective transforms
- `src/components/transitions/gsap/` — Timeline sequences, GSAP flip, stagger, text reveal
- `src/components/transitions/spring/` — React Spring wobble, trails, chains, carousel
- `src/components/transitions/creative/` — Deck deal, smoke dissolve, stardust gather, portal vortex, golden unfold
- `src/components/lab/` — 3D cards, holographic shaders, nebula backgrounds, forging ceremony
- `src/hooks/use-card-reveal.ts` — Sequential card reveal state machine

## Design Tokens

### Colors
- Background: deep purple `oklch(0.13 0.03 285)`
- Card surface: `bg-white/5 backdrop-blur-xl border border-white/10`
- Gold accent: `oklch(0.75 0.12 85)` / `--gold` CSS variable
- Mystical glow: `shadow-purple-900/20`, `shadow-[0_0_30px_rgba(201,169,78,0.3)]`

### Animation Timing
- Enter animations: spring `{ stiffness: 300, damping: 30 }` (default)
- Exit animations: faster, `{ duration: 0.2, ease: "easeIn" }`
- Stagger: 0.06-0.1s between children
- Between card reveals: 1.5s delay (reading flow)
- Card reveal duration: 2s per card

### Glass Morphism Pattern
```
bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-purple-900/20
```
