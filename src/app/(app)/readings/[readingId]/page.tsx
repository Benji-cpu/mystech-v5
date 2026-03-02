import { Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredList } from "@/components/ui/staggered-list";
import type {
  SpreadType,
  CardImageStatus,
  CardType,
  ReadingFeedback as FeedbackType,
} from "@/types";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
};

function ReadingDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="flex flex-wrap items-start justify-center gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="w-32 aspect-[2/3] rounded-xl" />
            <Skeleton className="h-3 w-16 mt-2" />
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="max-w-2xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

async function ReadingDetailContent({
  readingId,
  spreadType,
  interpretation,
  feedback,
}: {
  readingId: string;
  deckId: string;
  spreadType: SpreadType;
  interpretation: string | null;
  feedback: FeedbackType | null;
}) {
  const cardsWithData = await getReadingCardsWithData(readingId);

  return (
    <StaggeredList className="space-y-8">
      {/* Cards spread */}
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
              cardType: (rc.card!.cardType ?? 'general') as CardType,
              originContext: rc.card!.originContext ?? null,
              createdAt: rc.card!.createdAt,
            },
            positionName: rc.positionName,
          }))}
      />

      {/* Interpretation */}
      <div className="max-w-2xl mx-auto">
        <ReadingInterpretation
          readingId={readingId}
          existingInterpretation={interpretation}
        />
        <ReadingFeedback
          readingId={readingId}
          existingFeedback={feedback}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Link href="/readings/new">
          <Button variant="outline" className="gap-2">
            {LYRA_READING_DETAIL.newReading}
          </Button>
        </Link>
      </div>
    </StaggeredList>
  );
}

export default async function ReadingViewPage({
  params,
}: {
  params: Promise<{ readingId: string }>;
}) {
  const user = await requireAuth();
  const { readingId } = await params;

  const reading = await getReadingByIdForUser(readingId, user.id!);
  if (!reading) notFound();

  const deck = await getDeckByIdForUser(reading.deckId, user.id!);
  const spreadType = reading.spreadType as SpreadType;

  return (
    <AnimatedPage className="p-4 sm:p-6 lg:p-8">
      {/* Header - renders immediately */}
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

      {/* Suspended content */}
      <Suspense fallback={<ReadingDetailSkeleton />}>
        <ReadingDetailContent
          readingId={readingId}
          deckId={reading.deckId}
          spreadType={spreadType}
          interpretation={reading.interpretation}
          feedback={(reading.feedback as FeedbackType) ?? null}
        />
      </Suspense>
    </AnimatedPage>
  );
}
