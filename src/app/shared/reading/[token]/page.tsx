import { getSharedReadingByToken } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewSpreadLayout } from "@/components/readings/review-spread-layout";
import { StudioStyleBadge } from "@/components/studio/studio-style-badge";
import type { Metadata } from "next";
import type { SpreadType, CardImageStatus, CardType, CardOriginContext } from "@/types";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
  quick: "Quick Draw",
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

  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  const spreadType = reading.spreadType as SpreadType;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <header className="mb-10 text-center">
        <p className="eyebrow">A shared reading · {reading.deckTitle}</p>
        <h1
          className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          {SPREAD_LABELS[spreadType]}
        </h1>
        <div
          className="mt-3 flex items-center justify-center gap-3 text-sm"
          style={{ color: "var(--ink-mute)" }}
        >
          <span>
            {new Date(reading.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {reading.artStyleName && (
            <>
              <span style={{ color: "var(--ink-faint)" }}>·</span>
              <StudioStyleBadge
                styleName={reading.artStyleName}
                styleId={reading.artStyleId}
                linkToStudio={false}
              />
            </>
          )}
        </div>
      </header>

      {reading.question && (
        <div
          className="mx-auto mb-10 max-w-xl rounded-2xl border p-5 text-center hair"
          style={{ background: "var(--paper-card)" }}
        >
          <p className="eyebrow">The question</p>
          <p
            className="whisper mt-2 text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            &ldquo;{reading.question}&rdquo;
          </p>
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
      </div>

      {reading.interpretation && (
        <div
          className="mx-auto mt-10 max-w-2xl rounded-2xl border p-7 hair"
          style={{ background: "var(--paper-card)" }}
        >
          <p className="eyebrow">The weave</p>
          <div
            className="mt-4 whitespace-pre-wrap leading-relaxed"
            style={{ color: "var(--ink-soft)", fontSize: "16px" }}
            dangerouslySetInnerHTML={{
              __html: renderBoldMarkdown(reading.interpretation),
            }}
          />
        </div>
      )}

      {reading.artStyleName && (
        <div className="mt-12 text-center">
          <Link
            href={isLoggedIn ? "/decks/new" : "/api/auth/signin"}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors hover:border-[var(--ink)]"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            Create your own deck with this style →
          </Link>
        </div>
      )}
    </div>
  );
}
