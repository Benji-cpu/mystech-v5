# Feature 06: Art Styles System

## Overview
Art styles define the visual aesthetic of card images. Users pick from 8 curated presets in a 3x3 grid (9th slot = custom). Users can create custom styles, preview them, and share with others via accept/reject links.

## User Stories
- As a user, I want to browse art style presets so I can choose a look for my deck
- As a user, I want to preview what a style looks like before committing
- As a user, I want to create a custom art style with my own description
- As a user, I want to share my custom style with a friend via a link
- As a recipient, I want to preview a shared style and accept or reject it

## Requirements

### Must Have
- [ ] 3x3 style picker grid component (8 presets + 1 "Custom" slot)
- [ ] Each preset has: name, description, style_prompt, preview thumbnail
- [ ] Style detail/preview page showing 4-6 sample images + description
- [ ] Custom style creation: name + description text input
- [ ] Art styles browsing page listing user's available styles (presets + accepted shares + custom)
- [ ] Preset styles seeded in database

### Nice to Have
- [ ] Share custom style via link with accept/reject
- [ ] Preview generation for custom styles (generate 2-3 sample images)
- [ ] Style favorites/bookmarking

## UI/UX

### Art Styles Page (`/art-styles`)
- Grid of available styles (presets always shown, then custom/shared)
- Each style card: thumbnail preview, name, badge (preset/custom/shared)
- Click to open detail view

### Style Picker Component (used during deck creation)
```
┌─────────┬─────────┬─────────┐
│ Tarot   │ Water-  │ Celes-  │
│ Classic │ color   │ tial    │
├─────────┼─────────┼─────────┤
│ Botan-  │ Abstract│ Dark    │
│ ical    │ Mystic  │ Gothic  │
├─────────┼─────────┼─────────┤
│ Art     │ Ether-  │    +    │
│ Nouveau │ eal     │ Custom  │
└─────────┴─────────┴─────────┘
```
- Each cell: square thumbnail + name below
- Selected style has gold border highlight
- "Custom" slot opens creation dialog

### Style Detail View (`/art-styles/[styleId]`)
- Large header with style name + description
- Gallery grid of 4-6 sample images
- "Use this style" button (navigates to deck creation with style pre-selected)
- If custom + owned: "Share" button, "Edit" button
- If shared: shows "Shared by [name]"

### Custom Style Creation (dialog or page)
- Name input
- Description textarea ("Describe the visual style you want...")
- Preview button (generates 2-3 sample images)
- Save button

### Share Flow
1. Owner clicks "Share" on custom style → gets a share link
2. Recipient opens link → sees style preview page
3. Clicks "Add to My Styles" or "Decline"
4. Accepted styles appear in recipient's style list

## Data Model

### New Tables

```
art_styles
├── id              text (PK, cuid)
├── name            text (not null)
├── description     text
├── stylePrompt     text (not null) — the prompt fragment appended to image generation
├── previewImages   jsonb (array of image URLs)
├── isPreset        boolean (default false)
├── createdBy       text (FK → users, nullable for presets)
├── isPublic        boolean (default false)
├── shareToken      text (unique, nullable)
├── createdAt       timestamp (default now)
└── updatedAt       timestamp (default now)

art_style_shares
├── id              text (PK, cuid)
├── styleId         text (FK → art_styles)
├── sharedWithUserId text (FK → users)
├── accepted        boolean (nullable — null=pending, true=accepted, false=rejected)
└── createdAt       timestamp (default now)
UNIQUE(styleId, sharedWithUserId)
```

### Preset Data (seeded)

| Name | Style Prompt Fragment |
|------|----------------------|
| Tarot Classic | "classical tarot card art style, gilded gold borders, medieval illuminated manuscript aesthetic, rich jewel tones" |
| Watercolor Dream | "soft watercolor painting style, delicate washes of color, dreamy and ethereal, paper texture visible" |
| Celestial | "cosmic celestial art, deep space nebulae, stars and constellations, midnight blue and gold, astronomical illustration" |
| Botanical | "detailed botanical illustration style, vintage natural history, pressed flowers and herbs, earthy muted tones" |
| Abstract Mystic | "sacred geometry art, abstract spiritual symbols, mandala patterns, third eye motifs, vibrant energy colors" |
| Dark Gothic | "dark gothic art style, dramatic chiaroscuro, ravens and thorns, cathedral windows, moody atmospheric" |
| Art Nouveau | "Art Nouveau style, flowing organic lines, Alphonse Mucha inspired, ornate floral borders, elegant curves" |
| Ethereal Light | "ethereal soft glow art, pastel luminescence, angelic light rays, translucent layers, heavenly atmosphere" |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/art-styles` | List available styles (presets + user's custom + accepted shares) |
| POST | `/api/art-styles` | Create custom style |
| GET | `/api/art-styles/[styleId]` | Get style detail with preview images |
| PATCH | `/api/art-styles/[styleId]` | Update custom style (owner only) |
| DELETE | `/api/art-styles/[styleId]` | Delete custom style (owner only) |
| POST | `/api/art-styles/[styleId]/share` | Generate share link |
| GET | `/api/art-styles/shared/[token]` | Get shared style preview (public) |
| POST | `/api/art-styles/shared/[token]/accept` | Accept shared style |
| POST | `/api/art-styles/shared/[token]/reject` | Reject shared style |

## Pages

| Route | Description |
|-------|-------------|
| `/art-styles` | Browse all available styles |
| `/art-styles/[styleId]` | Style detail/preview |
| `/art-styles/new` | Create custom style |
| `/art-styles/shared/[token]` | Public shared style preview |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User deletes custom style that's used by a deck | Style stays on the deck (soft reference), just can't be used for new decks |
| Shared style — sharer deletes it | Show "Style no longer available" to recipients |
| Custom style with no preview images | Show placeholder with style description |
| User creates duplicate style name | Allow it — names don't need to be unique |
| Free tier user creates custom style | Allowed — custom styles don't count against limits (only image generation does) |

## Testing Checklist
- [ ] 8 preset styles visible in style picker grid
- [ ] 9th slot shows "Custom" option
- [ ] Clicking a preset shows detail page with description
- [ ] Can create a custom style with name and description
- [ ] Custom style appears in style list
- [ ] Can share a custom style and get a link
- [ ] Shared link shows preview page (no auth required to view)
- [ ] Recipient can accept and style appears in their list
- [ ] Style picker works when embedded in deck creation flow
- [ ] Selected style has visual highlight

## Open Questions
1. Should preview images for presets be pre-generated and stored, or generated on demand? **Default: Pre-generated and stored as static assets or in Vercel Blob. Seeded during setup.**
2. How many preview images for custom styles? **Default: Generate 2-3 sample images when user creates custom style. This costs ~$0.04-0.06 per custom style.**
3. Can free tier users create custom styles? **Default: Yes, but generating preview images counts against their image generation limit.**

## Test Coverage

| Test File | Type | What it covers |
|-----------|------|----------------|
| `src/app/api/art-styles/route.test.ts` | Vitest | GET returns presets + user styles, POST creates custom style, auth checks, validation |
| `e2e/art-styles.spec.ts` | Playwright | Art style picker visibility, preset display, style selection |
