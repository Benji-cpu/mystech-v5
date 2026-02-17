import { Sprout } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserLivingDeck, getLivingDeckSettings, getCardsForDeck, canGenerateLivingDeckCard, getUserCardFeedback } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { LivingDeckSetup } from "@/components/decks/living-deck-setup";
import { LivingDeckView } from "@/components/decks/living-deck-view";
import type { Card, ArtStyle } from "@/types";

export default async function LivingDeckPage() {
  const user = await requireAuth();

  const deck = await getUserLivingDeck(user.id!);

  if (!deck) {
    // Show setup — fetch art styles
    const allStyles = await db.select().from(artStyles).where(eq(artStyles.isPreset, true));
    const presetStyles: ArtStyle[] = allStyles.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      stylePrompt: s.stylePrompt,
      previewImages: (s.previewImages ?? []) as string[],
      isPreset: s.isPreset,
      createdBy: s.createdBy,
      isPublic: s.isPublic,
      shareToken: s.shareToken,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Living Deck"
          subtitle="A daily mirror of your evolving journey."
          icon={Sprout}
        />
        <div className="mt-6">
          <LivingDeckSetup presetStyles={presetStyles} />
        </div>
      </div>
    );
  }

  // Fetch deck data
  const [settings, cardRows, canGenerate] = await Promise.all([
    getLivingDeckSettings(deck.id),
    getCardsForDeck(deck.id),
    canGenerateLivingDeckCard(deck.id),
  ]);

  const cardsData: Card[] = cardRows.map((c) => ({
    id: c.id,
    deckId: c.deckId,
    cardNumber: c.cardNumber,
    title: c.title,
    meaning: c.meaning,
    guidance: c.guidance,
    imageUrl: c.imageUrl,
    imagePrompt: c.imagePrompt,
    imageStatus: c.imageStatus as Card["imageStatus"],
    createdAt: c.createdAt,
  })).reverse(); // Most recent first

  const feedbackMap = await getUserCardFeedback(
    user.id!,
    cardsData.map((c) => c.id)
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Living Deck"
        subtitle={`${deck.cardCount} card${deck.cardCount !== 1 ? 's' : ''} and growing`}
        icon={Sprout}
      />
      <div className="mt-6">
        <LivingDeckView
          deckId={deck.id}
          initialCards={cardsData}
          generationMode={(settings?.generationMode ?? "manual") as "manual" | "auto"}
          canGenerateToday={canGenerate}
          feedbackMap={feedbackMap}
        />
      </div>
    </div>
  );
}
