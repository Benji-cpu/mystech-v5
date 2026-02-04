import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers } from "lucide-react";
import type { Deck } from "@/types";

interface DeckCardProps {
  deck: Deck;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  generating: "secondary",
  completed: "default",
};

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <Link
      href={`/decks/${deck.id}`}
      className="group block rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-[#c9a94e]/30 hover:shadow-lg"
    >
      {/* Cover Image */}
      <div className="aspect-[3/2] overflow-hidden bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
        {deck.coverImageUrl ? (
          <img
            src={deck.coverImageUrl}
            alt={deck.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Layers className="h-10 w-10 text-[#c9a94e]/30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-1">
            {deck.title}
          </h3>
          <Badge variant={statusVariant[deck.status] ?? "outline"} className="text-[10px] shrink-0">
            {deck.status}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
