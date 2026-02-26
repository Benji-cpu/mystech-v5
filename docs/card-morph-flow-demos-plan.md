# Card Morph → Immersive Flow Demos

## Context

The card-morph mockup at `/mock/approved/card-morph` is a dev tool: pick a technique, pick a stage, click "Reveal Card." Two problems:

1. **Techniques have visible scaffolding at rest** — grid fragments, flap overlays, diamond clips, gold backgrounds show even when nothing is animating, making it unclear what the technique vs content is
2. **The mockup doesn't show how techniques integrate into real user flows** — it's a lab tool, not an experience

**Goal:** Transform the mockup into **immersive flow demos** that choreograph all 7 techniques through realistic app scenarios. Each technique fires at a specific transition moment within a flow. The existing explorer remains as a secondary "Technique Lab" tab.

## Architecture

### Page Layout

Replace the single `MorphExplorer` with a **tabbed layout**:

```
Tab 1: "Oracle Journey"   — Reading ceremony flow (4 techniques)
Tab 2: "Card Forge"       — Deck creation flow (3 techniques)
Tab 3: "Technique Lab"    — Existing morph-explorer (dev tool)
```

All 7 techniques used exactly once across the two flows.

### How Technique Transitions Work in Flows

Each flow step is wrapped by a technique component. The technique assigned to a step handles the **outgoing transition** from that step. Sequence:

1. User sees step N content inside technique N's wrapper
2. User taps "Continue" — `stageTransition` key set on technique N
3. Technique N animates to its hidden state (scatter/fold/warp/collapse)
4. At midpoint: reducer swaps `phase` → React renders step N+1 content
5. Technique N animates back to visible, revealing step N+1
6. Transition complete → swap technique wrapper to technique N+1 (for the next transition)

The wrapper swap at step 6 happens after the animation completes. Since both the finishing technique (in its visible/revealed state) and the next technique (in its initial state) are wrapping the same content, the swap is handled by matching visual states.

### Technique Indicator

A floating label appears during each transition showing the technique name + library tag. Positioned top-right, animates in/out with the transition.

---

## Flow 1: Oracle Journey (Reading Ceremony)

**5 steps, 4 transitions.** Uses: DisplacementWave, CanvasParticles, PerspectiveFold, ClipPathSculpt.

### Steps & Content

| Step | Content | Mood |
|------|---------|------|
| `welcome` | Glass panel with oracle sparkle icon, "What guidance do you seek?" text, "Begin Reading" CTA | `default` |
| `summoning` | Summoning Circle stage component in active state (rings glowing, runes visible). "The portal opens..." status text | `midnight` |
| `dealt` | 3 `MockCardBack` components in horizontal spread (Past / Present / Future labels). "Your cards have been drawn" status | `card-draw` |
| `revealed` | 3 `MockCardFront` components showing drawn cards (The Dreamer, The Alchemist, The Wanderer). Card titles + meanings visible | `card-reveal` |
| `interpreting` | Compressed card strip at top + streaming `MOCK_INTERPRETATION` text in glass panel. "Begin Another Reading" reset button when complete | `completion` |

### Transitions

| From → To | Technique | Visual Description |
|-----------|-----------|-------------------|
| welcome → summoning | **Displacement Wave** | Screen warps with heat haze distortion, clears to reveal summoning circle |
| summoning → dealt | **Canvas Particles** | 500 gold particles scatter from circle center, reconverge into 3 card positions |
| dealt → revealed | **Perspective Fold** | Origami flaps close over card backs, reopen revealing card fronts |
| revealed → interpreting | **Clip-Path Sculpt** | Card view collapses to a zero-area polygon point, expands to reveal interpretation |

### State Machine (`oracle-journey-state.ts`)

```ts
type OraclePhase = "welcome" | "summoning" | "dealt" | "revealed" | "interpreting" | "complete";

interface OracleJourneyState {
  phase: OraclePhase;
  drawnCards: MockCard[];        // 3 cards selected at start
  displayedText: string;         // Streaming interpretation text
  transitioning: boolean;
  transitionKey: string | null;
  activeTechnique: TechniqueId;  // Technique wrapping current step
}

type OracleJourneyAction =
  | { type: "ADVANCE" }
  | { type: "MIDPOINT" }
  | { type: "TRANSITION_COMPLETE" }
  | { type: "STREAM_TICK"; text: string }
  | { type: "RESET" };
```

**Technique-to-phase mapping:** (which technique wraps each phase for its outgoing transition)
- `welcome` → `displacement-wave`
- `summoning` → `canvas-particles`
- `dealt` → `perspective-fold`
- `revealed` → `clip-path-sculpt`
- `interpreting` → none (final step, no outgoing transition)

### Persistent Shell Zones

```
┌─────────────────────────┐
│  Status Zone (phase label) │  ← shrink-0, AnimatePresence text
├─────────────────────────┤
│                         │
│  Card Zone              │  ← flex-1 normally, flex-none during interpreting
│  (technique wraps this) │     Technique wrapper + step content lives here
│                         │
├─────────────────────────┤
│  Text Zone              │  ← flex 0→1 during interpreting phase
│  (interpretation text)  │     Streaming mock text + reset button
├─────────────────────────┤
│  Action Zone (CTA btn)  │  ← shrink-0, "Continue" / "Draw Cards" etc.
└─────────────────────────┘
```

---

## Flow 2: Card Forge (Deck Creation)

**4 steps, 3 transitions.** Uses: SpringProperty, ShatterReconstitute, LayoutTeleport.

### Steps & Content

| Step | Content | Mood |
|------|---------|------|
| `prompt` | Glass panel with "Describe your vision" text, mock theme tags (Tarot Classic, Celestial, etc. from `MOCK_THEMES`), "Begin Forging" CTA | `default` |
| `forging` | Crystal Orb stage component in active state (orb glowing, pulsing). "Channeling your vision..." status text. Simulated progress indicator | `forging` |
| `review` | 2×2 grid of `MockCardFront` components. "Your cards have been forged" title. Gold borders on cards | `golden` |
| `complete` | Single hero card (large `MockCardFront`), "Deck Created" celebration text, gold shimmer, "Forge Another" reset button | `completion` |

### Transitions

| From → To | Technique | Visual Description |
|-----------|-----------|-------------------|
| prompt → forging | **Spring Property** | Prompt panel squishes to zero via spring physics, bounces back revealing crystal orb |
| forging → review | **Shatter & Reconstitute** | Crystal orb shatters into 48 fragments, fragments reconverge into card grid |
| review → complete | **Layout Teleport** | Grid cards collapse to center (scale 0), single hero card expands from center |

### State Machine (`card-forging-state.ts`)

```ts
type ForgingPhase = "prompt" | "forging" | "review" | "complete";

interface CardForgingState {
  phase: ForgingPhase;
  forgedCards: MockCard[];       // 4 cards
  transitioning: boolean;
  transitionKey: string | null;
  activeTechnique: TechniqueId;
}
```

**Technique mapping:**
- `prompt` → `spring-property`
- `forging` → `shatter-reconstitute`
- `review` → `layout-teleport`
- `complete` → none

---

## Shared Components

### `flows/technique-indicator.tsx` (NEW)

Floating label showing active technique during transitions:
```tsx
// Fixed top-right, glass morphism pill
// Shows: technique name + library tag
// AnimatePresence enter/exit, visible only when state.transitioning=true
```

### `flows/flow-shell.tsx` (NEW)

Shared persistent shell layout (status zone + card zone + text zone + action zone). Both flows use this to ensure consistent zone behavior. Accepts zone contents as render props or children.

### `flows/flow-cta.tsx` (NEW)

Shared CTA button component. Shows phase-specific label, disabled during transitions, glass morphism styling with gold accent when available.

---

## File Structure

```
src/app/mock/approved/card-morph/
├── page.tsx                              # MODIFY: Tab navigation
├── morph-explorer.tsx                    # KEEP (Tab 3: Technique Lab)
├── types.ts                              # KEEP (existing technique types)
├── technique-picker.tsx                  # KEEP
├── stage-picker.tsx                      # KEEP
├── techniques/                           # KEEP (all 7 unchanged)
├── stages/                               # KEEP (all 9 unchanged)
└── flows/                                # NEW DIRECTORY
    ├── technique-indicator.tsx            # Floating transition label
    ├── flow-shell.tsx                     # Shared persistent shell layout
    ├── flow-cta.tsx                       # Shared CTA button
    ├── oracle-journey.tsx                 # Reading ceremony flow
    ├── oracle-journey-state.ts            # Oracle flow reducer
    ├── card-forging.tsx                   # Card creation flow
    └── card-forging-state.ts              # Forging flow reducer
```

**7 new files, 1 modified file.** Existing technique/stage code untouched.

---

## Key Reusable Assets

| Asset | Location | Used For |
|-------|----------|----------|
| `MockCardFront`, `MockCardBack` | `@/components/mock/mock-card.tsx` | Card display in all flows |
| `MOCK_CARDS` (12 cards) | `@/components/mock/mock-data.ts` | Drawing 3 cards for Oracle, 4 for Forge |
| `MOCK_INTERPRETATION` | `@/components/mock/mock-data.ts` | Streaming text in Oracle interpreting step |
| `MOCK_THEMES` | `@/components/mock/mock-data.ts` | Theme tags in Forge prompt step |
| `SummoningCircle` stage | `stages/summoning-circle.tsx` | Oracle summoning step content |
| `CrystalOrb` stage | `stages/crystal-orb.tsx` | Forge forging step content |
| `techniqueRegistry` | `techniques/index.ts` | Dynamic technique component lookup |
| `TECHNIQUES` metadata | `types.ts` | Technique names/libraries for indicator |
| `MockImmersiveShell` | `@/components/mock/mock-immersive-shell.tsx` | Background mood system |
| `useMockImmersive` | `@/components/mock/mock-immersive-provider.tsx` | Mood preset switching per phase |

---

## Implementation Order

1. Create `flows/` directory + shared components (flow-shell, flow-cta, technique-indicator)
2. Create Oracle Journey state machine + flow component
3. Create Card Forging state machine + flow component
4. Modify `page.tsx` to add tab navigation (Oracle Journey | Card Forge | Technique Lab)
5. Test both flows end-to-end on mobile and desktop

---

## Verification

1. Navigate to `http://localhost:3000/mock/approved/card-morph`
2. Default tab is **Oracle Journey**
3. Tap "Begin Reading" — Displacement Wave warps screen, summoning circle appears
4. Tap "Draw Cards" — Canvas Particles stream into 3 card positions
5. Tap "Reveal Cards" — Perspective Fold unfolds cards
6. Tap "Read the Cards" — Clip-Path Sculpt collapses and expands into interpretation
7. Text streams in, "Begin Another Reading" resets to welcome
8. Technique indicator label appears during each transition showing technique name
9. Switch to **Card Forge** tab
10. Tap "Begin Forging" — Spring Property squishes prompt, reveals crystal orb
11. Auto-advance after simulated forge time — Shatter fragments reform into card grid
12. Tap "Finalize Deck" — Layout Teleport collapses grid to hero card
13. "Forge Another" resets
14. Switch to **Technique Lab** tab — existing morph-explorer works as before
15. All flows work on 390px mobile viewport
16. Rapid-clicking CTAs during transitions is blocked by `transitioning` flag
