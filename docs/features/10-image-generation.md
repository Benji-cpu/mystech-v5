# Feature 10: AI Image Generation for Cards

## Overview
Generate card artwork using Google Imagen 4 Fast. Supports single card and batch generation. Images combine the card's image prompt with the deck's art style prompt. Generated images are stored in Vercel Blob.

## User Stories
- As a user, I want my cards to have beautiful AI-generated artwork
- As a user, I want to see images appear on my cards after generation
- As a user, I want to regenerate an image if I don't like it
- As a user, I want to see progress as images generate for a batch

## Requirements

### Must Have
- [ ] Imagen 4 Fast API wrapper
- [ ] Single card image generation endpoint
- [ ] Batch image generation for entire deck
- [ ] Image stored in Vercel Blob after generation
- [ ] Card image_status tracking (pending → generating → completed/failed)
- [ ] Retry failed generations up to 3 times
- [ ] UI shows generation progress (placeholder → real image)

### Nice to Have
- [ ] Image generation queue to avoid API rate limits
- [ ] Thumbnail + full-size versions
- [ ] Image regeneration with modified prompt

## UI/UX

### During Generation
- Card shows animated placeholder (shimmer/skeleton)
- Small status badge: "Generating..." with spinner
- When image arrives, it fades in smoothly

### Failed Generation
- Card shows placeholder with error icon
- "Retry" button on hover/click
- After 3 failures: "Image unavailable" with option to edit prompt and retry

### Batch Progress (on deck view during generation)
- Progress bar: "Generating images: 5/12"
- Cards fill in as images complete (real-time or polling)

## Technical Design

### Image Prompt Construction
```
Final prompt = "{card.imagePrompt}, {artStyle.stylePrompt}"

Example:
card.imagePrompt = "A single delicate flower pushing through spring soil, morning dew on petals"
artStyle.stylePrompt = "soft watercolor painting style, delicate washes of color, dreamy and ethereal"

Final = "A single delicate flower pushing through spring soil, morning dew on petals, soft watercolor painting style, delicate washes of color, dreamy and ethereal"
```

### Generation Flow
1. API receives card ID(s) to generate images for
2. For each card: set imageStatus = 'generating'
3. Call Imagen 4 Fast API
4. On success: upload image to Vercel Blob, set imageUrl + imageStatus = 'completed'
5. On failure: retry up to 3 times, then set imageStatus = 'failed'
6. Update deck status to 'completed' when all card images are done

### Vercel Blob Storage
- Path pattern: `cards/{deckId}/{cardId}.png`
- Images stored permanently (until deck deleted)
- Serve via Vercel Blob CDN URL

## Data Model
No new tables. Uses existing `cards` table fields: `imageUrl`, `imagePrompt`, `imageStatus`.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/generate-image` | Generate image for single card |
| POST | `/api/ai/generate-images-batch` | Generate images for all cards in deck |
| GET | `/api/decks/[deckId]/image-status` | Poll image generation progress |

### POST `/api/ai/generate-image`
**Input:**
```json
{
  "cardId": "abc123"
}
```

### POST `/api/ai/generate-images-batch`
**Input:**
```json
{
  "deckId": "abc123"
}
```

## Dependencies
- `@google/generative-ai` or direct API calls to Imagen 4 Fast
- `@vercel/blob` for image storage

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Imagen API rate limit hit | Queue remaining images, retry with backoff |
| Imagen rejects prompt (safety filter) | Mark as failed, suggest user edit the image prompt |
| Vercel Blob upload fails | Retry upload, keep generated image in memory |
| User deletes deck while images generating | Cancel remaining generations (check deck exists before upload) |
| Very long image prompt | Truncate to Imagen's max input length |
| No BLOB_READ_WRITE_TOKEN set | Return clear error, don't attempt upload |
| Free tier user has no image credits left | Block generation, show upgrade prompt |

## Testing Checklist
- [ ] Single card image generates and appears on card
- [ ] Batch generation processes all cards in a deck
- [ ] Image stored in Vercel Blob with correct path
- [ ] Card imageStatus transitions correctly
- [ ] Failed images show retry button
- [ ] Retry works and updates card on success
- [ ] Art style prompt is appended to card image prompt
- [ ] Progress indicator shows during batch generation
- [ ] Usage counter incremented per image generated
- [ ] Generation blocked when image credits exhausted

## Open Questions
1. Should we use the Google Generative AI SDK or direct REST API for Imagen? **Default: Use `@google/generative-ai` SDK if it supports Imagen 4 Fast, otherwise direct REST.**
2. Image dimensions? **Default: 1024x1536 (2:3 tarot ratio) or nearest supported size.**
3. Should we generate a low-res preview first, then high-res? **Default: No, generate at target resolution directly. Simpler.**
