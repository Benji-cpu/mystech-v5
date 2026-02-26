import { requireAuth } from "@/lib/auth/helpers";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
  getDeckByIdForUser,
} from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { ReviewSpreadLayout } from "@/components/readings/review-spread-layout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LYRA_READING_DETAIL } from "@/components/guide/lyra-constants";
import { ReadingInterpretation } from "@/components/readings/reading-interpretation";
import { ReadingFeedback } from "@/components/readings/reading-feedback";
import { ShareButton } from "@/components/shared/share-button";
import { DeleteReadingButton } from "@/components/readings/delete-reading-button";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { SpreadType, CardImageStatus, ReadingFeedback as FeedbackType } from "@/types";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
};

export default async function ReadingViewPage({
  params,
}: {
  params: Promise<{ readingId: string }>;
}) {
  const user = await requireAuth();
  const { readingId } = await params;

  const reading = await getReadingByIdForUser(readingId, user.id!);
  if (!reading) notFound();

  const cardsWithData = await getReadingCardsWithData(readingId);
  const deck = await getDeckByIdForUser(reading.deckId, user.id!);

  const spreadType = reading.spreadType as SpreadType;

  return (
    <AnimatedPage className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <AnimatedItem className="mb-8">
        <Link
          href="/readings"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Readings
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white/90">
              {SPREAD_LABELS[spreadType]} Reading
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {deck?.title ?? "Unknown Deck"} &middot;{" "}
              {new Date(reading.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton
              shareEndpoint={`/api/readings/${readingId}/share`}
              revokeEndpoint={`/api/readings/${readingId}/share`}
              contentType="reading"
              existingShareToken={reading.shareToken}
            />
            <DeleteReadingButton readingId={readingId} />
          </div>
        </div>

        {reading.question && (
          <GlassPanel className="mt-4 p-3">
            <p className="text-xs text-[#c9a94e] uppercase tracking-wider mb-1">
              Your Question
            </p>
            <p className="text-sm italic text-white/90">{reading.question}</p>
          </GlassPanel>
        )}
      </AnimatedItem>

      {/* Cards spread */}
      <AnimatedItem className="mb-8">
        <ReviewSpreadLayout
          spreadType={spreadType}
          cards={cardsWithData
            .filter((rc) => rc.card)
            .map((rc) => ({
              id: rc.id,
              card: {
                id: rc.card!.id,
                deckId: rc.card!.deckId,
                cardNumber: rc.card!.cardNumber,
                title: rc.card!.title,
                meaning: rc.card!.meaning,
                guidance: rc.card!.guidance,
                imageUrl: rc.card!.imageUrl,
                imagePrompt: rc.card!.imagePrompt,
                imageStatus: rc.card!.imageStatus as CardImageStatus,
                createdAt: rc.card!.createdAt,
              },
              positionName: rc.positionName,
            }))}
        />
      </AnimatedItem>

      {/* Interpretation */}
      <AnimatedItem>
        <div className="max-w-2xl mx-auto">
          <ReadingInterpretation
            readingId={readingId}
            existingInterpretation={reading.interpretation}
          />
          <ReadingFeedback
            readingId={readingId}
            existingFeedback={(reading.feedback as FeedbackType) ?? null}
          />
        </div>
      </AnimatedItem>

      {/* Actions */}
      <AnimatedItem>
        <div className="flex justify-center mt-8">
          <Link href="/readings/new">
            <Button variant="outline" className="gap-2">
              {LYRA_READING_DETAIL.newReading}
            </Button>
          </Link>
        </div>
      </AnimatedItem>
    </AnimatedPage>
  );
}
