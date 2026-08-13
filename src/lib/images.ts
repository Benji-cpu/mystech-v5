/**
 * Card art comes in two renditions: a WebP web derivative on `imageUrl`, which
 * every browser surface renders through next/image, and the full-resolution PNG
 * master on `imagePrintUrl`.
 *
 * Two renderers cannot read WebP and must be handed the master:
 *   - Satori (`next/og` ImageResponse) decodes PNG/JPEG/SVG only, so a WebP
 *     `<img>` silently drops out of the share card.
 *   - Email. Outlook's Word rendering engine has no WebP support, so a daily
 *     card would arrive as a broken image for a slice of recipients.
 *
 * Cards forged before the split have no `imagePrintUrl`; for those `imageUrl`
 * is still the original PNG, which is why this falls back rather than throwing.
 */
export function printImageUrl(
  card: { imageUrl?: string | null; imagePrintUrl?: string | null } | null | undefined
): string | null {
  if (!card) return null;
  return card.imagePrintUrl ?? card.imageUrl ?? null;
}
