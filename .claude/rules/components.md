---
paths:
  - "src/components/**/*.tsx"
---

# Component Rules

- Prefer server components. Use `'use client'` only when the component needs interactivity, hooks, or browser APIs
- Always accept `className?: string` and merge with `cn()` from `@/lib/utils`
- Use ShadCN/UI primitives from `src/components/ui/` — don't rebuild buttons, dialogs, inputs, etc.
- Dark theme by default. Use CSS variables (`--background`, `--card`, `--primary`, `--gold`) not hardcoded colors
- Glass morphism for card surfaces: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`
- Gold accent for mystical emphasis: `text-primary` (maps to gold in dark theme)
- Keep components small and focused — one responsibility per component
- Co-locate component-specific hooks and types with the component
- Use Framer Motion `motion.*` elements for any component that animates
- Interactive cards should use `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}`
- Multi-step flows use a single persistent shell — zones resize via `layout` animations, nothing unmounts between phases
- Mobile-first: design for 390px viewport, use responsive hooks for sizing, ensure all content fits in one viewport
