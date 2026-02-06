# Plan: Fix Card Flip Animation

## Problem Summary
The card flip animation doesn't work - text and cards appear on the same screen simultaneously. When viewing cards, text overlaps with the card image because:

1. **Missing `perspective-1000` class** - Tailwind CSS v4 doesn't have this utility built-in, so 3D transforms don't work
2. **Without perspective**, `backface-visibility: hidden` fails, causing both front and back faces to render simultaneously
3. **Back side text overflow** - Long meaning/guidance text overflows the card bounds

## Root Cause
Line 40 in `oracle-card.tsx` uses `className="perspective-1000"` but this class doesn't exist in Tailwind v4. Without the CSS `perspective` property, 3D transforms appear flat and broken.

## Solution

### 1. Add perspective utility to globals.css
Add custom CSS for the perspective property:
```css
.perspective-1000 {
  perspective: 1000px;
}
```

### 2. Improve card back content overflow handling
- Add text truncation with line-clamp for meaning/guidance
- Ensure content stays within card bounds
- Use smaller text sizes for long content

### 3. Minor cleanup
- Ensure proper z-index layering on front/back faces
- Add `absolute inset-0` to container if needed for stacking context

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add `.perspective-1000` utility class |
| `src/components/cards/oracle-card.tsx` | Add line-clamp to prevent text overflow on back side |

## Implementation Details

### globals.css changes
Add after the `@layer base` section:
```css
/* 3D Transform Utilities */
.perspective-1000 {
  perspective: 1000px;
}
```

### oracle-card.tsx changes
Update the back side content to use line-clamp:
- Meaning: `line-clamp-3` (max 3 lines)
- Guidance: `line-clamp-4` (max 4 lines)
- Or use flex-grow with `overflow-hidden` for adaptive sizing

## Verification
1. Open a deck with cards
2. If there's a context where flip is used (cards without onClick), click to flip
3. Verify:
   - Front shows only image + title
   - Back shows only text content
   - Flip animation is smooth 3D rotation
   - No text overflow or overlap
4. Check on mobile viewport (responsive)

## Notes
- In `DeckCardGrid`, clicking opens a modal rather than flipping (onClick is provided)
- The flip animation is only active when OracleCard has no onClick prop
- The modal (`CardDetailModal`) already handles long text well with scrolling
