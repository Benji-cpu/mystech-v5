import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { Zap, MessageCircle } from "lucide-react";
import { LYRA_DECK_CREATION } from "@/components/guide/lyra-constants";
import { AstroNudgeBanner } from "@/components/shared/astro-nudge-banner";
import { EditorialShell, EditorialHeader } from "@/components/editorial";

export default async function NewDeckPage() {
  await requireAuth();

  return (
    <EditorialShell>
      <div className="mx-auto max-w-2xl px-6 pb-28 pt-24 sm:px-10 sm:pt-28">
        <EditorialHeader
          eyebrow="New deck"
          title="How shall we begin?"
          whisper="Two doors to the same room. Pick the one that fits your mood."
        />

        <div className="mt-8">
          <AstroNudgeBanner />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/decks/new/journey"
            className="group block rounded-3xl border p-6 transition-colors hair hover:border-[var(--ink-soft)]"
            style={{ background: "var(--paper-card)" }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "var(--paper-warm)",
                color: "var(--accent-gold)",
              }}
            >
              <MessageCircle size={22} strokeWidth={1.5} />
            </div>
            <p className="eyebrow" style={{ color: "var(--accent-gold)" }}>
              Recommended
            </p>
            <h3
              className="display mt-2 text-xl leading-tight"
              style={{ color: "var(--ink)" }}
            >
              Guided Journey
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--ink-mute)" }}
            >
              {LYRA_DECK_CREATION.guidedJourney}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 text-sm transition-transform group-hover:translate-x-1"
              style={{ color: "var(--ink)" }}
            >
              Begin →
            </span>
          </Link>

          <Link
            href="/decks/new/simple"
            className="group block rounded-3xl border p-6 transition-colors hair hover:border-[var(--ink-soft)]"
            style={{ background: "var(--paper-card)" }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "var(--paper-warm)",
                color: "var(--ink-soft)",
              }}
            >
              <Zap size={22} strokeWidth={1.5} />
            </div>
            <p className="eyebrow">Quick</p>
            <h3
              className="display mt-2 text-xl leading-tight"
              style={{ color: "var(--ink)" }}
            >
              Quick Create
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--ink-mute)" }}
            >
              {LYRA_DECK_CREATION.quickCreate}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 text-sm transition-transform group-hover:translate-x-1"
              style={{ color: "var(--ink-soft)" }}
            >
              Begin →
            </span>
          </Link>
        </div>
      </div>
    </EditorialShell>
  );
}
