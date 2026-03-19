import { getSharedReadingByToken } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { ReviewSpreadLayout } from "@/components/readings/review-spread-layout";
import type { Metadata } from "next";
import type { SpreadType, CardImageStatus, CardType, CardOriginContext } from "@/types";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
};

function renderBoldMarkdown(text: string) {
  // Simple bold markdown rendering for server component
  return text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const reading = await getSharedReadingByToken(token);

  if (!reading) {
    return { title: "Reading Not Found" };
  }

  const spreadLabel =
    SPREAD_LABELS[reading.spreadType as SpreadType] ?? reading.spreadType;

  return {
    title: `${spreadLabel} Reading - MysTech`,
    description: reading.question
      ? `Oracle reading: "${reading.question}"`
      : `A ${spreadLabel.toLowerCase()} oracle card reading`,
    openGraph: {
      title: `${spreadLabel} Reading - MysTech`,
      description: reading.question
        ? `Oracle reading: "${reading.question}"`
        : `A ${spreadLabel.toLowerCase()} oracle card reading`,
    },
  };
}

export default async function SharedReadingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reading = await getSharedReadingByToken(token);

  if (!reading) notFound();

  const spreadType = reading.spreadType as SpreadType;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {reading.deckTitle}
        </p>
        <h1 className="text-2xl font-bold">
          {SPREAD_LABELS[spreadType]} Reading
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date(reading.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {reading.question && (
        <div className="max-w-xl mx-auto mb-8 p-3 rounded-lg bg-card/50 border border-border/50 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Question
          </p>
          <p className="text-sm italic">{reading.question}</p>
        </div>
      )}

      {/* Cards spread */}
      <div className="mb-8">
        <ReviewSpreadLayout
          spreadType={spreadType}
          cards={reading.cards
            .filter((rc) => rc.card?.id || rc.retreatCard?.id)
            .map((rc) => {
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
      </div>

      {/* Interpretation (static, not streaming) */}
      {reading.interpretation && (
        <div className="max-w-2xl mx-auto p-6 rounded-xl bg-card/50 border border-border/50">
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: renderBoldMarkdown(reading.interpretation),
            }}
          />
        </div>
      )}
    </div>
  );
}
