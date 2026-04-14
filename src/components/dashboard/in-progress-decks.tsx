import Link from "next/link";
import { MessageSquare, CheckSquare, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import type { DraftDeckWithPhase } from "@/types";

interface InProgressDecksProps {
  drafts: DraftDeckWithPhase[];
}

export function InProgressDecks({ drafts }: InProgressDecksProps) {
  if (drafts.length === 0) return null;

  return (
    <div>
      <SectionHeader className="mb-4">In Progress</SectionHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {drafts.map((deck) => {
          const isChat = deck.journeyPhase === "chat";
          const Icon = isChat ? MessageSquare : CheckSquare;
          const phaseLabel = isChat ? "In conversation" : "Reviewing cards";

          return (
            <GlassPanel
              key={deck.id}
              className="flex items-center gap-4 border-gold/20 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white/90">{deck.title}</p>
                <p className="text-sm text-white/40">{phaseLabel}</p>
              </div>
              <Link
                href={deck.resumeHref}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-gold to-gold-bright px-3 py-1.5 text-sm font-semibold text-black"
              >
                Resume
                <ArrowRight className="h-3 w-3" />
              </Link>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
