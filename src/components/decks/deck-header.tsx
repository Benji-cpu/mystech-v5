import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteDeckButton } from "./delete-deck-button";
import type { Deck } from "@/types";

interface DeckHeaderProps {
  deck: Deck;
  artStyleName?: string;
}

export function DeckHeader({ deck, artStyleName }: DeckHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          <Badge
            variant={deck.status === "completed" ? "default" : "secondary"}
          >
            {deck.status}
          </Badge>
        </div>
        {deck.description && (
          <p className="text-muted-foreground">{deck.description}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
          </span>
          {artStyleName && (
            <>
              <span>&middot;</span>
              <span>{artStyleName}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/decks/${deck.id}/edit`}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
        <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
      </div>
    </div>
  );
}
