import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";

/** Legacy route — card refinement now lives under the deck at /decks/[deckId]/cards/[cardId]. */
export default async function LegacyCardStudioPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const user = await requireAuth();
  const { cardId } = await params;

  const [result] = await db
    .select({ deckId: cards.deckId })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, cardId), eq(decks.userId, user.id!)))
    .limit(1);

  if (!result) notFound();
  redirect(`/decks/${result.deckId}/cards/${cardId}`);
}
