---
paths:
  - "src/components/transitions/**/*"
  - "src/components/readings/**/*"
  - "src/components/lab/**/*"
  - "src/hooks/use-card-reveal*"
  - "src/app/globals.css"
---

# Animation Rules

- Use spring physics for all motion — never `{ duration: X, ease: "linear" }`
- Default spring config: `{ type: "spring", stiffness: 300, damping: 30 }`
- Exit animations must be faster than enter animations
- Use `AnimatePresence` only for truly entering/exiting elements (modals, toasts, notifications). Within multi-step flows, use the persistent shell pattern — zones stay mounted and animate their layout/size/opacity. Never use `AnimatePresence mode="wait"` to swap between flow phases
- Stagger children with 0.06-0.1s intervals — never show 3+ elements simultaneously
- Use `layoutId` when an element transforms between views (e.g., deck card → deck detail)
- Framer Motion is the default choice. Use GSAP only for frame-precise timelines. Use React Spring only when Framer's springs are insufficient
- Card reveals: 2s reveal duration, 1.5s delay between cards (adjustable via `useCardReveal` hook)
- Background effects must interpolate smoothly between states — never jump
- All animations must work on mobile (test touch gestures, reduce particle counts)
- Existing transition demos are in `src/components/transitions/` — reference these before building new patterns
