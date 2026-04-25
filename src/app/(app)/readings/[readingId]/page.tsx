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
import { Button } from "@/components/ui/button";
import { LYRA_READING_DETAIL } from "@/components/guide/lyra-constants";
import { ReadingInterpretation } from "@/components/readings/reading-interpretation";
import { ReadingFeedback } from "@/components/readings/reading-feedback";
import { ReadingRefineSection } from "@/components/readings/reading-refine-section";
import { ShareButton } from "@/components/shared/share-button";
import { DeleteReadingButton } from "@/components/readings/delete-reading-button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredList } from "@/components/ui/staggered-list";
import { EditorialShell } from "@/components/editorial";
import type {
  SpreadType,
  CardImageStatus,
  CardType,
  CardOriginContext,
  ReadingFeedback as FeedbackType,
} from "@/types";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
  quick: "Quick Draw",
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
      <div
        className="max-w-2xl mx-auto rounded-2xl border p-6 space-y-3 hair"
        style={{ background: "var(--paper-card)" }}
      >
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
          .filter((rc) => rc.card?.id || rc.retreatCard?.id)
          .map((rc) => {
            // Coalesce deck card or retreat card into unified Card shape
            const c = rc.card?.id ? rc.card : null;
            const r = rc.retreatCard?.id ? rc.retreatCard : null;
            return {
              id: rc.id,
              card: {
                id: (c?.id ?? r?.id)!,
                deckId: c?.deckId ?? "",
                cardNumber: c?.cardNumber ?? 0,
                title: (c?.title ?? r?.title)!,
                meaning: (c?.meaning ?? r?.meaning)!,
                guidance: (c?.guidance ?? r?.guidance)!,
                imageUrl: c?.imageUrl ?? r?.imageUrl ?? null,
                imageBlurData: c?.imageBlurData ?? null,
                imagePrompt: c?.imagePrompt ?? r?.imagePrompt ?? null,
                imageStatus: (c?.imageStatus ?? r?.imageStatus ?? "pending") as CardImageStatus,
                cardType: ((c?.cardType ?? r?.cardType) ?? "general") as CardType,
                originContext: ((c ? c.originContext : r?.originContext) ?? null) as CardOriginContext | null,
                createdAt: (c?.createdAt ?? r?.createdAt)!,
              },
              positionName: rc.positionName,
            };
          })}
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

      {/* Refine cards */}
      <div className="max-w-2xl mx-auto">
        <ReadingRefineSection
          cards={cardsWithData
            .filter((rc) => rc.card?.id)
            .map((rc) => ({
              id: rc.card!.id,
              title: rc.card!.title,
              imageUrl: rc.card!.imageUrl,
              imageStatus: rc.card!.imageStatus,
            }))}
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
    <EditorialShell>
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <Link
          href="/readings"
          className="eyebrow inline-flex items-center gap-2 hover:underline"
        >
          ← Readings
        </Link>

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">A reading · {SPREAD_LABELS[spreadType]}</p>
            <h1
              className="display mt-3 text-[clamp(2rem,7vw,3rem)] leading-[0.98]"
              style={{ color: "var(--ink)" }}
            >
              {deck?.title ?? "Unknown deck"}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
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
        </header>

        {reading.question && (
          <div
            className="mt-6 rounded-2xl border p-5 hair"
            style={{ background: "var(--paper-card)" }}
          >
            <p className="eyebrow">Your question</p>
            <p
              className="whisper mt-2 text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              &ldquo;{reading.question}&rdquo;
            </p>
          </div>
        )}

        <div className="mt-10">
          <Suspense fallback={<ReadingDetailSkeleton />}>
            <ReadingDetailContent
              readingId={readingId}
              deckId={reading.deckId}
              spreadType={spreadType}
              interpretation={reading.interpretation}
              feedback={(reading.feedback as FeedbackType) ?? null}
            />
          </Suspense>
        </div>
      </div>
    </EditorialShell>
  );
}
