import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { Zap, MessageCircle } from "lucide-react";
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
          className="group block rounded-2xl p-6 transition-all bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] shadow-lg shadow-purple-900/20 hover:border-gold/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(201,169,78,0.15)]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold mb-3">
            <Zap className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Quick Create</h3>
          <p className="text-sm text-muted-foreground">
            {LYRA_DECK_CREATION.quickCreate}
          </p>
        </Link>

        {/* Guided Journey */}
        <Link
          href="/decks/new/journey"
          className="group block rounded-2xl p-6 transition-all bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] shadow-lg shadow-purple-900/20 hover:border-gold/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(201,169,78,0.15)]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold mb-3">
            <MessageCircle className="h-7 w-7" />
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
