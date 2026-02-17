import Link from "next/link";
import { MessageSquare, CheckSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DraftDeckWithPhase } from "@/types";

interface InProgressDecksProps {
  drafts: DraftDeckWithPhase[];
}

export function InProgressDecks({ drafts }: InProgressDecksProps) {
  if (drafts.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">In Progress</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {drafts.map((deck) => {
          const isChat = deck.journeyPhase === "chat";
          const Icon = isChat ? MessageSquare : CheckSquare;
          const phaseLabel = isChat ? "In conversation" : "Reviewing cards";

          return (
            <div
              key={deck.id}
              className="flex items-center gap-4 rounded-xl border border-[#c9a94e]/20 bg-[#c9a94e]/5 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a94e]/10">
                <Icon className="h-5 w-5 text-[#c9a94e]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{deck.title}</p>
                <p className="text-sm text-muted-foreground">{phaseLabel}</p>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-[#c9a94e] text-black hover:bg-[#b8993f]"
                asChild
              >
                <Link href={deck.resumeHref}>
                  Resume
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
