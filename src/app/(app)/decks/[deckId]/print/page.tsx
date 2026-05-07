import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { count } from "drizzle-orm";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";
import { PrintCheckoutCTA } from "@/components/print/checkout-cta";
import { PRINT_DECK_PRICE_USD_CENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DeckPrintPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const user = await requireAuth();
  const { deckId } = await params;

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id!)))
    .limit(1);
  if (!deck) notFound();

  const [{ count: finishedCount } = { count: 0 }] = await db
    .select({ count: count() })
    .from(cards)
    .where(and(eq(cards.deckId, deck.id), eq(cards.imageStatus, "completed")));

  const cardsNeeded = Math.max(0, deck.printableMinCards - Number(finishedCount));
  const printable = cardsNeeded === 0;
  const hasAssets = Boolean(deck.cardBackImageUrl && deck.boxArtImageUrl);
  const priceUsd = (PRINT_DECK_PRICE_USD_CENTS / 100).toFixed(2);

  return (
    <EditorialShell>
      <div className="mb-6">
        <Link
          href={`/decks/${deck.id}`}
          className="inline-flex items-center gap-2 text-sm hover:opacity-80"
          style={{ color: "var(--ink-mute)" }}
        >
          <ArrowLeft className="size-4" />
          Back to deck
        </Link>
      </div>

      <EditorialHeader
        eyebrow="Print on demand"
        title={`Print ${deck.title}`}
        whisper="Hold your deck in your hands. We print, box, and ship — you receive a tangible deck of your own cards."
      />

      <div className="space-y-6">
        <EditorialCard padding="lg" tone="warm">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
                Personalised oracle deck
              </p>
              <p className="mt-2 text-3xl font-light" style={{ color: "var(--ink-strong)" }}>
                ${priceUsd} <span className="text-base" style={{ color: "var(--ink-mute)" }}>USD</span>
              </p>
            </div>
            <p className="text-xs max-w-[18rem]" style={{ color: "var(--ink-mute)" }}>
              Plus shipping. 7–10 business days production. Refundable within 24h of order.
            </p>
          </div>
        </EditorialCard>

        {!printable ? (
          <EditorialCard padding="md">
            <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
              <strong>Add {cardsNeeded} more {cardsNeeded === 1 ? "card" : "cards"}</strong> to unlock printing. We require at least {deck.printableMinCards} finished cards for a complete printed deck.
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
              Currently: {Number(finishedCount)} / {deck.printableMinCards} finished cards.
            </p>
          </EditorialCard>
        ) : !hasAssets ? (
          <EditorialCard padding="md">
            <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
              Forge your card-back and box art before you order. We&rsquo;ll generate both in the deck&rsquo;s art style — you can regenerate either if you&rsquo;d like a different feel.
            </p>
            <PrintCheckoutCTA
              deckId={deck.id}
              mode="forge-assets"
              hasBack={Boolean(deck.cardBackImageUrl)}
              hasBox={Boolean(deck.boxArtImageUrl)}
            />
          </EditorialCard>
        ) : (
          <>
            <EditorialCard padding="md">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--ink-mute)" }}>
                Deck assets
              </p>
              <div className="grid grid-cols-2 gap-4">
                <AssetTile label="Card back" url={deck.cardBackImageUrl!} />
                <AssetTile label="Box art" url={deck.boxArtImageUrl!} />
              </div>
              <PrintCheckoutCTA
                deckId={deck.id}
                mode="checkout"
                hasBack={true}
                hasBox={true}
              />
            </EditorialCard>

            <EditorialCard padding="md" tone="warm">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-mute)" }}>
                What you&rsquo;ll receive
              </p>
              <ul className="text-sm space-y-1" style={{ color: "var(--ink-strong)" }}>
                <li>· {Number(finishedCount)} printed oracle cards</li>
                <li>· Card-back design unique to your deck</li>
                <li>· Tuck-box with custom cover art</li>
                <li>· Shipping address collected at checkout</li>
              </ul>
            </EditorialCard>
          </>
        )}
      </div>
    </EditorialShell>
  );
}

function AssetTile({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: "var(--ink-mute)" }}>
        {label}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        className="w-full rounded-md border hair"
        style={{ aspectRatio: "2/3", objectFit: "cover" }}
      />
    </div>
  );
}
