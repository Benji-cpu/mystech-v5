/**
 * POST /api/decks/[deckId]/print/forge-back-and-box
 *
 * Generates the deck's print-required assets (card back + box art) via the
 * existing Stability pipeline. Idempotent — re-running overwrites prior
 * assets and updates `decks.cardBackImageUrl` / `boxArtImageUrl`.
 *
 * Body: { regenerate?: { back?: boolean; box?: boolean } }
 *   When omitted, generates whichever asset is missing.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { generateCardBackForDeck } from "@/lib/print/generate-back";
import { generateBoxArtForDeck } from "@/lib/print/generate-box";

export const maxDuration = 120;

export async function POST(
  request: Request,
  ctx: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deckId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as {
    regenerate?: { back?: boolean; box?: boolean };
  };

  const [deck] = await db
    .select({
      id: decks.id,
      cardBackImageUrl: decks.cardBackImageUrl,
      boxArtImageUrl: decks.boxArtImageUrl,
    })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
    .limit(1);
  if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  const wantBack = body.regenerate?.back ?? !deck.cardBackImageUrl;
  const wantBox = body.regenerate?.box ?? !deck.boxArtImageUrl;

  const [back, box] = await Promise.all([
    wantBack ? generateCardBackForDeck(deck.id) : Promise.resolve({ ok: true as const, skipped: true }),
    wantBox ? generateBoxArtForDeck(deck.id) : Promise.resolve({ ok: true as const, skipped: true }),
  ]);

  if (!back.ok) return NextResponse.json({ error: `back: ${back.error}` }, { status: 502 });
  if (!box.ok) return NextResponse.json({ error: `box: ${box.error}` }, { status: 502 });

  return NextResponse.json({
    ok: true,
    back: "skipped" in back && back.skipped ? null : { url: (back as { url: string }).url },
    box: "skipped" in box && box.skipped ? null : { url: (box as { url: string }).url },
  });
}
