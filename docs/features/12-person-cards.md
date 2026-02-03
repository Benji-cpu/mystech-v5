# Feature 12: Person Cards with Photo Upload

## Overview
Person cards represent people in the user's life (family, friends, mentors). Users upload a photo, add personal details, and write the card's meaning and guidance. Person cards can be included in reading draw pools alongside regular deck cards.

## User Stories
- As a user, I want to create a card for my grandmother with her photo
- As a user, I want to write what this person means to me as the card's meaning
- As a user, I want to include person cards when I do a reading
- As a user, I want to manage my collection of person cards

## Requirements

### Must Have
- [ ] Photo upload via Vercel Blob (jpg/png/webp, max 5MB)
- [ ] Person card creation form: photo, name, relationship, description, meaning, guidance
- [ ] Person card list page with photo thumbnails
- [ ] Person card detail/edit page
- [ ] Person card delete with confirmation
- [ ] Enforce person card limit (free: 5, pro: 50)

### Nice to Have
- [ ] Drag-and-drop photo upload
- [ ] Photo crop/resize before upload
- [ ] Relationship type dropdown (parent, sibling, friend, partner, mentor, etc.)

## UI/UX

### Person Cards List (`/person-cards`)
- Grid of person card thumbnails (photo + name + relationship)
- "Add Person Card" button
- Empty state: "Create a card for someone special in your life"

### New Person Card (`/person-cards/new`)
```
┌────────────────────────────────────────────┐
│ Create a Person Card                       │
│                                            │
│ ┌──────────────┐                          │
│ │              │  Name: [___________]     │
│ │  Drop photo  │  Relationship: [______] │
│ │  here or     │                          │
│ │  click to    │  Description:            │
│ │  upload      │  [_____________________] │
│ │              │  [_____________________] │
│ └──────────────┘                          │
│                                            │
│ What does this person mean to you?         │
│ (This becomes the card's meaning)          │
│ [_______________________________________] │
│ [_______________________________________] │
│                                            │
│ What guidance does this person represent?  │
│ [_______________________________________] │
│ [_______________________________________] │
│                                            │
│ [Save Person Card]                         │
└────────────────────────────────────────────┘
```

### Person Card Display Component
- Tarot-proportioned card (2:3 ratio)
- Photo as card image (with slight artistic filter/border matching deck theme)
- Name as card title
- Relationship shown as subtitle
- Back of card: meaning + guidance text

## Data Model

### New Table

```
person_cards
├── id              text (PK, cuid)
├── userId          text (FK → users, cascade delete)
├── name            text (not null)
├── relationship    text
├── description     text
├── photoUrl        text (nullable — Vercel Blob URL)
├── photoBlobKey    text (nullable — Vercel Blob pathname for deletion)
├── meaning         text
├── guidance        text
├── createdAt       timestamp (default now)
└── updatedAt       timestamp (default now)
INDEX on userId
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/person-cards` | List user's person cards |
| POST | `/api/person-cards` | Create person card |
| GET | `/api/person-cards/[cardId]` | Get person card detail |
| PATCH | `/api/person-cards/[cardId]` | Update person card |
| DELETE | `/api/person-cards/[cardId]` | Delete person card (+ blob cleanup) |
| POST | `/api/upload` | Upload photo to Vercel Blob |

### POST `/api/upload`
**Input:** multipart/form-data with `file` field
**Process:**
1. Validate file type (jpg/png/webp) and size (≤5MB)
2. Upload to Vercel Blob
3. Return `{ url, pathname }` — URL for display, pathname for deletion

### DELETE flow
When deleting a person card:
1. Delete blob using `del(pathname)` from `@vercel/blob`
2. Delete database record

## Dependencies
- `@vercel/blob` — file upload and storage

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Upload non-image file | Reject with "Please upload a JPG, PNG, or WebP image" |
| Upload file >5MB | Reject with "Image must be under 5MB" |
| No BLOB_READ_WRITE_TOKEN | Show error "Photo upload requires Vercel deployment" |
| Delete person card used in a reading | Keep reading_cards reference (reading still viewable), person card record deleted |
| Person card limit reached | Show "Upgrade to Pro for more person cards" |
| Upload fails mid-transfer | Show error, allow retry |
| Photo URL expires or breaks | Vercel Blob URLs are permanent, shouldn't happen |

## Testing Checklist
- [ ] Can upload a photo (jpg, png, webp)
- [ ] Upload rejects invalid file types
- [ ] Upload rejects files >5MB
- [ ] Can create person card with all fields
- [ ] Person card appears in list with photo thumbnail
- [ ] Can view person card detail with full photo
- [ ] Can edit person card (name, relationship, meaning, etc.)
- [ ] Can replace photo on existing card
- [ ] Can delete person card (photo removed from Blob too)
- [ ] Person card limit enforced for free tier
- [ ] Empty state shown when no person cards
- [ ] Mobile responsive layout

## Open Questions
1. Should person cards have a decorative border/frame? **Default: Yes, a subtle ornate frame that distinguishes them from regular oracle cards. Gold border for person cards.**
2. Should we auto-crop photos to card ratio? **Default: Yes, center-crop to 2:3 ratio on the client side before upload. Use CSS object-fit as fallback.**
3. Can person cards exist without a photo? **Default: Yes — photo is optional. Show a decorative placeholder with the person's initial.**
