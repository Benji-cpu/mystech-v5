---
paths:
  - "src/components/readings/**/*"
  - "src/components/chronicle/**/*"
  - "src/components/guide/**/*"
  - "src/app/mock/**/*"
  - "src/app/(app)/readings/**/*"
  - "src/app/(app)/chronicle/**/*"
---

# Persistent Shell Pattern — Flow Architecture

Every multi-step flow (reading ceremony, card forging, chronicle) uses a single persistent component. Nothing unmounts between phases.

## Shell Structure

- Outer shell: `h-[100dvh] flex flex-col overflow-hidden` — fills viewport, no page scroll
- Zones (card zone, text zone, status zone) stay mounted for the entire flow
- `useReducer` state machine drives which zones are visible and their flex proportions
- Framer Motion `layout` prop on zone containers animates size changes smoothly

## Zone Mechanics

- Zones resize via animated `flex`, `height`, and `opacity` — they never unmount
- Use `motion.div` with `layout` on every zone container
- Phase transitions = zone proportion changes (e.g., card zone shrinks, text zone grows)
- Scrollable content within zones is fine, but zone structure fits one viewport
- Sub-components inside zones can swap; the zone containers themselves stay mounted

## Anti-Pattern vs Correct

```tsx
// WRONG: AnimatePresence swaps entire phases — each unmounts fully
<AnimatePresence mode="wait">
  {phase === "selecting" && <SelectionView />}
  {phase === "interpreting" && <InterpretationView />}
</AnimatePresence>

// RIGHT: Persistent zones that resize
<div className="h-[100dvh] flex flex-col">
  <motion.div layout animate={{ flex: phase === "selecting" ? 1 : 0 }}>
    {/* Selection — always mounted */}
  </motion.div>
  <motion.div layout animate={{ flex: phase === "interpreting" ? 1 : 0 }}>
    {/* Interpretation — always mounted */}
  </motion.div>
</div>
```

## When AnimatePresence IS Appropriate

- Modals and dialogs (truly enter/exit the DOM)
- Toast notifications
- Decorative overlays (celebration particles, golden sweeps)
- Individual list items being added/removed

## Reference Implementations

- Reading ceremony: `src/app/mock/reading/ceremony/page.tsx`
- Materialization flow: `src/app/mock/reading/materialization/page.tsx`
- Path flow: `src/app/mock/paths/path-flow-shell.tsx`
