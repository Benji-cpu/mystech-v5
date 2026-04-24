import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { Zap, MessageCircle, ArrowLeft } from "lucide-react";
import { LYRA_DECK_CREATION } from "@/components/guide/lyra-constants";
import { AstroNudgeBanner } from "@/components/shared/astro-nudge-banner";

export default async function NewDeckPage() {
  await requireAuth();

  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-2xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <Link
          href="/decks"
          className="eyebrow inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={14} /> Decks
        </Link>

        <header className="mt-6">
          <p className="eyebrow">New deck</p>
          <h1
            className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            How shall we begin?
          </h1>
          <p
            className="whisper mt-3 text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            Two doors to the same room. Pick the one that fits your mood.
          </p>
        </header>

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
    </div>
  );
}
