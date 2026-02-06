# Implementation Plan: Feature 07+08+10 — Simple Mode Deck Creation (End-to-End)

## Summary

Combine Features 07 (Deck CRUD), 08 (Simple Mode AI Text), and 10 (AI Image Generation) into a single feature branch. This delivers a complete working deck creation flow: user describes a deck, AI generates card definitions via Gemini, AI generates card images via Stability AI, images stored in Vercel Blob.

**Branch**: `feature/07-deck-crud` (from `main`, after Feature 06 is merged)

**Key tech changes from original specs**:
- Image generation uses **Stability AI** (not Google Imagen) — `stable-image/generate/core` endpoint
- Images stored in **Vercel Blob** (`cards/{deckId}/{cardId}.png`)
- Text generation uses **Gemini** via Vercel AI SDK `generateObject()` with Zod schemas
- No mock mode — use real Stability AI API (basic tier)

---

## Pre-requisites (User handles before starting)

- [ ] Commit and merge `feature/06-art-styles` to `main`
- [ ] Run `npm run db:push` and `npm run db:seed` for art styles tables
- [ ] Ensure `.env.local` has: `GOOGLE_GENERATIVE_AI_API_KEY`, `STABILITY_AI_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `DATABASE_URL`

---

## Step 0: Update Roadmap & Feature Specs

Update docs to reflect the combined approach, phase restructuring, and Stability AI change.

### Roadmap restructuring (`docs/ROADMAP.md`):

**Phase 0: Foundation** — Update statuses:
- 00 Scaffolding: ✔️, 01 Auth: ✔️, 02 Database: ✔️, 03 Types: ✔️, 04 Layout: ✔️, 05 Landing/Auth: ✔️

**Phase 1a: Core Deck Features** (current focus)
| # | Feature | Status |
|---|---------|--------|
| 06 | Art Styles | ✔️ Complete |
| 07+08+10 | Simple Deck Creation (CRUD + AI text + AI images) | 🔨 Building |

**Phase 1b: Advanced Deck Features** (moved from Phase 1 + Phase 2)
| # | Feature | Status |
|---|---------|--------|
| 09 | Deck Creation — Journey mode | ⬜ Not started |
| 11 | Ad-hoc Card Management | ⬜ Not started |
| 12 | Person Cards with photo upload | ⬜ Not started |

**Phase 2: Readings** (standalone)
| # | Feature | Status |
|---|---------|--------|
| 13 | Reading flow (spreads, card draw) | ⬜ Not started |
| 14 | AI reading interpretation | ⬜ Not started |
| 15 | Reading history & sharing | ⬜ Not started |

**Phase 3**: Social & Collaboration (16) — unchanged
**Phase 4**: Billing & Limits (17, 18, 19) — unchanged
**Phase 5**: Polish (20) — unchanged

### Feature spec updates:
- **`docs/features/07-deck-crud.md`** — Add note: combined with 08+10 on branch `feature/07-deck-crud`
- **`docs/features/08-deck-creation-simple.md`** — Note combined build with 07+10
- **`docs/features/10-image-generation.md`** — Change from Google Imagen to **Stability AI** (`stable-image/generate/core` endpoint), add Vercel Blob storage details, update API route examples

---

## Step 1: Install Dependencies & Environment

### New npm packages:
```bash
npm install ai @ai-sdk/google @vercel/blob zod
```

### New env vars in `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=<already set>
STABILITY_AI_API_KEY=<already set>
BLOB_READ_WRITE_TOKEN=<from vercel env pull>
```

---

## Step 2: Database Schema — `decks`, `cards`, `deckMetadata` tables

**File**: `src/lib/db/schema.ts`

Add three tables following the existing pattern (snake_case DB columns, cuid2 PKs, timestamps):

**`decks` table**: id, userId (FK users), title, description, theme, status (draft/generating/completed), cardCount, isPublic, coverImageUrl, artStyleId (FK art_styles, SET NULL on delete), createdAt, updatedAt. Index on userId.

**`cards` table**: id, deckId (FK decks, CASCADE), cardNumber, title, meaning, guidance, imageUrl, imagePrompt, imageStatus (pending/generating/completed/failed), createdAt, updatedAt. Index on deckId.

**`deckMetadata` table**: deckId (PK, FK decks, CASCADE), extractedAnchors (jsonb), conversationSummary, generationPrompt, draftCards (jsonb), isReady (boolean), updatedAt.

Then run: `npm run db:push`

---

## Step 3: Database Query Helpers

**New file**: `src/lib/db/queries.ts`

Reusable functions:
- `getDeckByIdForUser(deckId, userId)` — fetch deck + ownership check
- `getUserDeckCount(userId)` — count decks for limit enforcement
- `getCardsForDeck(deckId)` — fetch all cards ordered by cardNumber
- `getArtStyleForDeck(artStyleId)` — fetch art style by ID

---

## Step 4: Deck CRUD API Routes

All routes follow the existing art-styles pattern: `getCurrentUser()` auth check, `ApiResponse<T>` typed responses.

| File | Methods | Description |
|------|---------|-------------|
| `src/app/api/decks/route.ts` | GET, POST | List user's decks (paginated), Create deck |
| `src/app/api/decks/[deckId]/route.ts` | GET, PATCH, DELETE | Get deck+cards, Update metadata, Delete (cascade + blob cleanup) |
| `src/app/api/decks/[deckId]/cards/route.ts` | GET, POST | List cards, Add card |
| `src/app/api/decks/[deckId]/cards/[cardId]/route.ts` | PATCH, DELETE | Update card, Delete card |

**Key behaviors**:
- POST /api/decks enforces free tier limit (2 decks) via `getUserDeckCount()`
- DELETE /api/decks also deletes card images from Vercel Blob (best-effort)
- All routes verify deck ownership (`deck.userId === currentUser.id`)

---

## Step 5: AI Text Generation (Gemini)

### New files:

**`src/lib/ai/gemini.ts`** — Gemini client setup via `@ai-sdk/google`
```
export const geminiModel = google("gemini-2.5-flash-preview-04-17");
```

**`src/lib/ai/prompts/deck-generation.ts`** — System + user prompts for card generation
- System: "Wise mystic oracle deck designer" personality
- User: Injects title, description, cardCount

**`src/lib/ai/schemas.ts`** — Zod schemas for Gemini structured output
- `generatedDeckSchema` with cards array (cardNumber, title, meaning, guidance, imagePrompt)

**`src/app/api/ai/generate-deck/route.ts`** — Core generation endpoint
- POST with `{ title, description, cardCount, artStyleId }`
- Flow: auth check -> validate inputs -> check deck limit -> create deck (status: draft) -> create deckMetadata -> call Gemini `generateObject()` -> insert cards -> update deck status to 'generating' -> return `{ deckId }`
- Retries Gemini up to 2x on failure
- Accepts card count mismatch (updates cardCount to actual)

---

## Step 6: AI Image Generation (Stability AI)

### New files:

**`src/lib/ai/stability.ts`** — Stability AI REST wrapper
- Calls `https://api.stability.ai/v2beta/stable-image/generate/core`
- Uses `multipart/form-data` with Bearer auth
- Aspect ratio: `2:3` (tarot proportions)
- Output: PNG buffer
- No SDK needed, direct fetch

**`src/lib/ai/image-generation.ts`** — Orchestrator
- `generateCardImage(cardId, imagePrompt, artStylePrompt, deckId)`
- Combines card imagePrompt + art style stylePrompt into final prompt
- Updates imageStatus: pending -> generating -> completed/failed
- Uploads to Vercel Blob at path `cards/{deckId}/{cardId}.png`
- Retries up to 3x with exponential backoff (1s, 2s, 4s)

### API routes:

| File | Method | Description |
|------|--------|-------------|
| `src/app/api/ai/generate-image/route.ts` | POST | Single card image (`{ cardId }`) |
| `src/app/api/ai/generate-images-batch/route.ts` | POST | All cards in deck (`{ deckId }`), sequential with 500ms delay |
| `src/app/api/decks/[deckId]/image-status/route.ts` | GET | Poll progress (counts by imageStatus) |

**Batch strategy**: Process cards sequentially within the API route. For large decks that might hit Vercel's timeout, process as many as possible and return — the client re-triggers for remaining cards.

---

## Step 7: Oracle Card Component

**New files in `src/components/cards/`**:

**`oracle-card.tsx`** — Core card component (client)
- 2:3 aspect ratio (`aspect-[2/3]`)
- Front: image (or skeleton/placeholder by imageStatus) + title overlay
- Click to flip: CSS 3D transform, shows meaning + guidance
- Status indicators: skeleton (pending), spinner (generating), image (completed), error+retry (failed)
- Props: `{ card: Card, onRetryImage?, size: 'sm'|'md'|'lg' }`

**`card-detail-modal.tsx`** — Full card view in Dialog modal
- Large image, title, meaning, guidance
- Regenerate Image button if failed

---

## Step 8: Deck List & View Pages

### Deck List (`/decks`)

**Modify**: `src/app/(app)/decks/page.tsx` — Replace ComingSoon with server component that fetches decks

**New components in `src/components/decks/`**:
- `deck-grid.tsx` — Grid layout (3 col desktop, 2 tablet, 1 mobile)
- `deck-card.tsx` — Individual card in grid (cover image, title, card count, status badge, date)
- `empty-deck-state.tsx` — "Create your first oracle deck" CTA

### Deck View (`/decks/[deckId]`)

**New page**: `src/app/(app)/decks/[deckId]/page.tsx` — Server component, fetch deck+cards+art style

**New components**:
- `deck-header.tsx` — Title, description, status badge, action buttons (Edit, Delete)
- `deck-card-grid.tsx` — Grid of OracleCard components, click opens CardDetailModal
- `delete-deck-button.tsx` — Delete with confirmation Dialog
- `generation-progress.tsx` — Progress bar shown during image generation

---

## Step 9: Deck Creation Flow (Simple Mode)

### Mode Selector (`/decks/new`)

**Modify**: `src/app/(app)/decks/new/page.tsx` — Replace ComingSoon with mode selector
- "Quick Create" card -> links to `/decks/new/simple`
- "Guided Journey" card -> shows "Coming Soon" badge, not clickable

### Simple Create Form (`/decks/new/simple`)

**New page**: `src/app/(app)/decks/new/simple/page.tsx` — Server component, fetch art styles, check deck limit

**New component**: `src/components/decks/simple-create-form.tsx` (client)
- Title input, description textarea
- Card count buttons: [5] [10] [15] [20], default 10
- Art style picker: reuse `StylePickerGrid` from Feature 06
- Credit cost preview text
- "Generate My Deck" button

### Generation flow (client-side):
1. Submit -> POST `/api/ai/generate-deck` (creates deck + generates card text)
2. On success -> POST `/api/ai/generate-images-batch` (fire-and-forget)
3. Navigate to `/decks/[deckId]`
4. Deck view shows cards with text content + skeleton images
5. Poll `/api/decks/[deckId]/image-status` every 3s via `useImageGenerationProgress` hook
6. As images complete, refresh to show them
7. When all done, show success toast

### Hooks:
- `src/hooks/use-image-generation-progress.ts` — Polls image status, returns counts
- `src/hooks/use-deck-generation.ts` — Manages the two-phase generation flow (text then images)

---

## Step 10: Deck Edit Page

**New page**: `src/app/(app)/decks/[deckId]/edit/page.tsx`

**New component**: `src/components/decks/deck-edit-form.tsx` (client)
- Edit title, description, theme. Art style shown but not editable.
- Save -> PATCH `/api/decks/[deckId]`, redirect to deck view

---

## ShadCN Components to Install

```bash
npx shadcn@latest add progress
npx shadcn@latest add label
```

(badge, dialog, input, textarea already added by Feature 06)

---

## Complete File Manifest

### Modified files (8):
1. `docs/ROADMAP.md` — Phase restructuring
2. `docs/features/07-deck-crud.md` — Combined build note
3. `docs/features/08-deck-creation-simple.md` — Combined build note
4. `docs/features/10-image-generation.md` — Stability AI change
5. `package.json` — New dependencies
6. `src/lib/db/schema.ts` — Add 3 tables
7. `src/app/(app)/decks/page.tsx` — Replace ComingSoon
8. `src/app/(app)/decks/new/page.tsx` — Replace ComingSoon

### New files (~30):
**Database**: `src/lib/db/queries.ts`
**API - Deck CRUD**: `src/app/api/decks/route.ts`, `[deckId]/route.ts`, `[deckId]/cards/route.ts`, `[deckId]/cards/[cardId]/route.ts`
**API - AI**: `src/app/api/ai/generate-deck/route.ts`, `generate-image/route.ts`, `generate-images-batch/route.ts`, `src/app/api/decks/[deckId]/image-status/route.ts`
**AI lib**: `src/lib/ai/gemini.ts`, `stability.ts`, `image-generation.ts`, `prompts/deck-generation.ts`, `schemas.ts`
**Card components**: `src/components/cards/oracle-card.tsx`, `card-detail-modal.tsx`
**Deck components**: `src/components/decks/deck-grid.tsx`, `deck-card.tsx`, `empty-deck-state.tsx`, `deck-header.tsx`, `deck-card-grid.tsx`, `delete-deck-button.tsx`, `simple-create-form.tsx`, `generation-progress.tsx`, `deck-edit-form.tsx`
**Pages**: `src/app/(app)/decks/new/simple/page.tsx`, `src/app/(app)/decks/[deckId]/page.tsx`, `src/app/(app)/decks/[deckId]/edit/page.tsx`
**Hooks**: `src/hooks/use-image-generation-progress.ts`, `src/hooks/use-deck-generation.ts`
**ShadCN**: `src/components/ui/progress.tsx`, `src/components/ui/label.tsx`

---

## Verification / Testing

1. **Schema**: `npm run db:push` succeeds, tables created in Neon
2. **CRUD API**: Create deck via POST, list via GET, update via PATCH, delete via DELETE — verify with curl or browser console
3. **AI Text**: POST `/api/ai/generate-deck` with test data, verify cards created in DB with title/meaning/guidance/imagePrompt
4. **AI Images**: POST `/api/ai/generate-image` with a cardId, verify image appears in Vercel Blob and card imageUrl updated
5. **Batch Images**: POST `/api/ai/generate-images-batch`, verify all cards get images
6. **Full flow**: Navigate to /decks/new -> Quick Create -> fill form -> Generate -> watch cards + images appear on deck view page
7. **Deck limit**: Create 2 decks (free tier max), verify 3rd is blocked with upgrade prompt
8. **Delete**: Delete a deck, verify cards and images are cleaned up
9. **Edit**: Edit deck title/description, verify changes saved
10. **Mobile**: Test responsive grid on mobile viewport
11. **Card flip**: Click oracle card, verify flip animation and meaning/guidance display

---

## Error Handling

| Error | Handling |
|-------|----------|
| No auth | 401 -> redirect to /login |
| Deck limit reached | 403 -> show upgrade prompt |
| Gemini failure | Retry 2x, then 502 with message, deck stays draft |
| Stability AI failure | Retry 3x with backoff, set imageStatus=failed, show retry button |
| Content filtered (Stability) | imageStatus=failed, suggest editing prompt |
| Vercel Blob upload failure | Retry upload, then mark failed |
| Deck deleted during generation | Check deck exists before each image upload |

---

## Commit Strategy

Granular commits as each step is completed:
1. `docs: update roadmap and feature specs for combined 07+08+10 build`
2. `feat: add deck, card, and deck metadata database schema`
3. `feat: add deck CRUD API routes`
4. `feat: add AI text generation with Gemini for deck creation`
5. `feat: add AI image generation with Stability AI`
6. `feat: add oracle card and deck UI components`
7. `feat: add simple mode deck creation flow with generation progress`
8. `feat: add deck edit page`

---

## Existing Code Patterns to Follow

Reference these files for consistent patterns:
- **API routes**: `src/app/api/art-styles/route.ts` — auth via `getCurrentUser()`, `ApiResponse<T>` typed responses
- **DB schema**: `src/lib/db/schema.ts` — snake_case DB columns, cuid2 PKs, Drizzle syntax
- **Types**: `src/types/index.ts` — Deck, Card, ArtStyle types already defined
- **Constants**: `src/lib/constants.ts` — PLAN_LIMITS for tier enforcement
- **Auth helpers**: `src/lib/auth/helpers.ts` — `getCurrentUser()`, `requireAuth()`
- **Components**: `src/components/art-styles/` — client component patterns with ShadCN

---

## Test Coverage (Combined)

Tests covering the full simple deck creation flow across Features 07, 08, and 10:

| Test File | Type | What it covers |
|-----------|------|----------------|
| `src/lib/ai/schemas.test.ts` | Vitest | Card/deck Zod schema validation |
| `src/lib/ai/prompts/deck-generation.test.ts` | Vitest | Prompt builder correctness |
| `src/app/api/ai/generate-deck/route.test.ts` | Vitest | AI generation route — auth, validation, env check, retries, success |
| `src/app/api/decks/route.test.ts` | Vitest | Deck CRUD list/create |
| `src/app/api/decks/[deckId]/route.test.ts` | Vitest | Deck CRUD get/update/delete |
| `src/app/api/art-styles/route.test.ts` | Vitest | Art style list/create |
| `e2e/auth.spec.ts` | Playwright | Auth redirect, login page |
| `e2e/deck-creation.spec.ts` | Playwright | Simple deck creation form flow |
| `e2e/art-styles.spec.ts` | Playwright | Art style picker in creation flow |
