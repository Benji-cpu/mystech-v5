import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, decks, artStyles, cardOverrides } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { CardRefinement } from "@/components/studio/card-refinement";
import { EditorialShell } from "@/components/editorial";
import type { PlanType, StyleCategory } from "@/types";

export default async function CardStudioPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const user = await requireAuth();
  const { cardId } = await params;

  // Fetch card with deck + art style info
  const [result] = await db
    .select({
      card: cards,
      deck: {
        id: decks.id,
        title: decks.title,
        userId: decks.userId,
        artStyleId: decks.artStyleId,
      },
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, cardId), eq(decks.userId, user.id!)))
    .limit(1);

  if (!result) notFound();

  // Fetch art style if deck has one
  let artStyleData = null;
  if (result.deck.artStyleId) {
    const [style] = await db
      .select()
      .from(artStyles)
      .where(eq(artStyles.id, result.deck.artStyleId))
      .limit(1);
    if (style) {
      artStyleData = {
        id: style.id,
        name: style.name,
        stylePrompt: style.stylePrompt,
        parameters: style.parameters ?? null,
        category: (style.category as StyleCategory) ?? null,
      };
    }
  }

  // Fetch existing card override
  const [existingOverride] = await db
    .select()
    .from(cardOverrides)
    .where(eq(cardOverrides.cardId, cardId))
    .limit(1);

  const plan: PlanType = await getUserPlan(user.id!);

  return (
    <EditorialShell>
      <CardRefinement
        card={{
          id: result.card.id,
          deckId: result.card.deckId,
          title: result.card.title,
          meaning: result.card.meaning,
          guidance: result.card.guidance,
          imageUrl: result.card.imageUrl,
          imagePrompt: result.card.imagePrompt,
          imageStatus: result.card.imageStatus as "pending" | "generating" | "completed" | "failed",
          cardNumber: result.card.cardNumber,
        }}
        deckTitle={result.deck.title}
        artStyle={artStyleData}
        existingOverride={
          existingOverride
            ? {
                id: existingOverride.id,
                imagePrompt: existingOverride.imagePrompt,
                parameters: existingOverride.parameters as Record<string, unknown> | null,
              }
            : null
        }
        plan={plan}
      />
    </EditorialShell>
  );
}
