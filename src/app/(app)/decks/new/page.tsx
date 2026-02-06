import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { Sparkles, MessageCircle } from "lucide-react";

export default async function NewDeckPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Deck</h1>
        <p className="text-muted-foreground mt-1">
          Choose how you&apos;d like to create your oracle deck.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Quick Create */}
        <Link
          href="/decks/new/simple"
          className="group block rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-[#c9a94e]/30 hover:shadow-lg"
        >
          <div className="mb-3 rounded-full bg-[#c9a94e]/10 p-3 w-fit">
            <Sparkles className="h-6 w-6 text-[#c9a94e]" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Quick Create</h3>
          <p className="text-sm text-muted-foreground">
            Describe your deck and we&apos;ll create it instantly. Fast and
            simple.
          </p>
        </Link>

        {/* Guided Journey */}
        <Link
          href="/decks/new/journey"
          className="group block rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-purple-500/30 hover:shadow-lg"
        >
          <div className="mb-3 rounded-full bg-purple-500/10 p-3 w-fit">
            <MessageCircle className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Guided Journey</h3>
          <p className="text-sm text-muted-foreground">
            A wise guide will explore your theme with you through conversation,
            crafting deeply personal cards.
          </p>
        </Link>
      </div>
    </div>
  );
}
