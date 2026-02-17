import { requireAuth } from "@/lib/auth/helpers";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
  getDeckByIdForUser,
} from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { OracleCard } from "@/components/cards/oracle-card";
import { SPREAD_POSITIONS } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LYRA_READING_DETAIL } from "@/components/guide/lyra-constants";
import { ReadingInterpretation } from "@/components/readings/reading-interpretation";
import { ReadingFeedback } from "@/components/readings/reading-feedback";
import { ShareButton } from "@/components/shared/share-button";
import { DeleteReadingButton } from "@/components/readings/delete-reading-button";
import type { SpreadType, Card, CardImageStatus, ReadingFeedback as FeedbackType } from "@/types";

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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/readings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Readings
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {SPREAD_LABELS[spreadType]} Reading
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
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
          <div className="mt-4 p-3 rounded-lg bg-card/50 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Your Question
            </p>
            <p className="text-sm italic">{reading.question}</p>
          </div>
        )}
      </div>

      {/* Cards grid */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-center gap-6">
          {cardsWithData.map((rc) => {
            if (!rc.card) return null;

            const card: Card = {
              id: rc.card.id,
              deckId: rc.card.deckId,
              cardNumber: rc.card.cardNumber,
              title: rc.card.title,
              meaning: rc.card.meaning,
              guidance: rc.card.guidance,
              imageUrl: rc.card.imageUrl,
              imagePrompt: rc.card.imagePrompt,
              imageStatus: rc.card.imageStatus as CardImageStatus,
              createdAt: rc.card.createdAt,
            };

            return (
              <div key={rc.id} className="flex flex-col items-center">
                <OracleCard card={card} size="sm" />
                <p className="mt-2 text-xs text-muted-foreground uppercase tracking-wider text-center">
                  {rc.positionName}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation */}
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

      {/* Actions */}
      <div className="flex justify-center mt-8">
        <Link href="/readings/new">
          <Button variant="outline" className="gap-2">
            {LYRA_READING_DETAIL.newReading}
          </Button>
        </Link>
      </div>
    </div>
  );
}
