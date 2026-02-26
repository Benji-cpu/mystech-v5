import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_DECK_CREATION } from "@/components/guide/lyra-constants";
import { AstroNudgeBanner } from "@/components/shared/astro-nudge-banner";

export default async function NewDeckPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
      <AstroNudgeBanner />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Quick Create */}
        <Link
          href="/decks/new/simple"
          className="group block rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-[#c9a94e]/30 hover:shadow-lg"
        >
          <div className="mb-3 rounded-full bg-[#c9a94e]/10 p-3 w-fit">
            <LyraSigil size="sm" state="dormant" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Quick Create</h3>
          <p className="text-sm text-muted-foreground">
            {LYRA_DECK_CREATION.quickCreate}
          </p>
        </Link>

        {/* Guided Journey */}
        <Link
          href="/decks/new/journey"
          className="group block rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-[#c9a94e]/30 hover:shadow-lg"
        >
          <div className="mb-3 rounded-full bg-[#c9a94e]/10 p-3 w-fit">
            <LyraSigil size="sm" state="attentive" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Guided Journey</h3>
          <p className="text-sm text-muted-foreground">
            {LYRA_DECK_CREATION.guidedJourney}
          </p>
        </Link>
      </div>
    </div>
  );
}
