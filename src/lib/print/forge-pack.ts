/**
 * Forge a print-pack manifest for an order.
 *
 * Phase 2 (manual fulfillment): we don't ZIP — we emit a JSON manifest with
 * stable, fully-qualified URLs to every asset the admin needs to upload to
 * the print vendor. That keeps the lib zero-dependency and lets the admin
 * eyeball the asset count before committing to a vendor order.
 *
 * Phase 4 can wrap this with a real ZIP step if/when admin ergonomics demand
 * it (or the vendor's API requires a single archive upload).
 *
 * The manifest URL is persisted on `printOrders.printPackUrl`. Re-running
 * regenerates the manifest (idempotent, blob upload allows overwrite).
 */
import { db } from "@/lib/db";
import { cards, decks, printOrders } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { put } from "@vercel/blob";

export type PrintPackManifest = {
  schemaVersion: 1;
  orderId: string;
  generatedAt: string; // ISO
  deck: {
    id: string;
    title: string;
    theme: string | null;
    cardCount: number;
    cardBackImageUrl: string;
    boxArtImageUrl: string;
    coverImageUrl: string | null;
  };
  cards: Array<{
    cardId: string;
    cardNumber: number;
    title: string;
    imageUrl: string;
  }>;
  shipping: {
    name: string | null;
    address: object | null;
  };
};

export async function forgePrintPack(
  orderId: string
): Promise<
  | { ok: true; manifestUrl: string; cardCount: number }
  | { ok: false; error: string }
> {
  const [order] = await db
    .select({
      id: printOrders.id,
      deckId: printOrders.deckId,
      deckSnapshot: printOrders.deckSnapshot,
      shippingName: printOrders.shippingName,
      shippingAddress: printOrders.shippingAddress,
    })
    .from(printOrders)
    .where(eq(printOrders.id, orderId))
    .limit(1);
  if (!order) return { ok: false, error: "Order not found" };

  const [deck] = await db
    .select({
      id: decks.id,
      title: decks.title,
      theme: decks.theme,
      coverImageUrl: decks.coverImageUrl,
      cardBackImageUrl: decks.cardBackImageUrl,
      boxArtImageUrl: decks.boxArtImageUrl,
    })
    .from(decks)
    .where(eq(decks.id, order.deckId))
    .limit(1);
  if (!deck) return { ok: false, error: "Deck not found" };
  if (!deck.cardBackImageUrl || !deck.boxArtImageUrl) {
    return { ok: false, error: "Deck is missing card-back or box art" };
  }

  // Pull card images. Prefer the snapshot's cardIds (frozen at order time);
  // fall back to live cards table if the snapshot is empty.
  const snapshotCardIds = order.deckSnapshot.cardIds ?? [];
  const cardRows = await db
    .select({
      id: cards.id,
      cardNumber: cards.cardNumber,
      title: cards.title,
      imageUrl: cards.imageUrl,
      imageStatus: cards.imageStatus,
    })
    .from(cards)
    .where(
      snapshotCardIds.length > 0
        ? and(eq(cards.deckId, deck.id), inArray(cards.id, snapshotCardIds))
        : eq(cards.deckId, deck.id)
    )
    .orderBy(asc(cards.cardNumber));

  const renderedCards = cardRows
    .filter((c) => c.imageStatus === "completed" && c.imageUrl)
    .map((c) => ({
      cardId: c.id,
      cardNumber: c.cardNumber,
      title: c.title,
      imageUrl: c.imageUrl as string,
    }));

  if (renderedCards.length === 0) {
    return { ok: false, error: "No finished card images found for this order" };
  }

  const manifest: PrintPackManifest = {
    schemaVersion: 1,
    orderId: order.id,
    generatedAt: new Date().toISOString(),
    deck: {
      id: deck.id,
      title: deck.title,
      theme: deck.theme,
      cardCount: renderedCards.length,
      cardBackImageUrl: deck.cardBackImageUrl,
      boxArtImageUrl: deck.boxArtImageUrl,
      coverImageUrl: deck.coverImageUrl,
    },
    cards: renderedCards,
    shipping: {
      name: order.shippingName,
      address: order.shippingAddress ?? null,
    },
  };

  const buffer = Buffer.from(JSON.stringify(manifest, null, 2), "utf8");
  const blob = await put(`print/orders/${order.id}/manifest.json`, buffer, {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });

  await db
    .update(printOrders)
    .set({
      printPackUrl: blob.url,
      status: "pack_ready",
    })
    .where(eq(printOrders.id, orderId));

  return { ok: true, manifestUrl: blob.url, cardCount: renderedCards.length };
}
