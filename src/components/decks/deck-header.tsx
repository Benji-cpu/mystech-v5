import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteDeckButton } from "./delete-deck-button";
import { ShareButton } from "@/components/shared/share-button";
import { AdoptDeckButton } from "@/components/shared/adopt-deck-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { Deck } from "@/types";

interface DeckHeaderProps {
  deck: Deck;
  artStyleName?: string;
  shareToken?: string | null;
  isAdopter?: boolean;
  ownerName?: string | null;
}

export function DeckHeader({ deck, artStyleName, shareToken, isAdopter, ownerName }: DeckHeaderProps) {
  return (
    <GlassPanel className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white/90">{deck.title}</h1>
            <Badge
              variant={deck.status === "completed" ? "default" : "secondary"}
            >
              {deck.status}
            </Badge>
          </div>
          {deck.description && (
            <p className="text-white/60">{deck.description}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-[#c9a94e]">
            <span>
              {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
            </span>
            {artStyleName && (
              <>
                <span>&middot;</span>
                <span>{artStyleName}</span>
              </>
            )}
            {isAdopter && ownerName && (
              <>
                <span>&middot;</span>
                <span>by {ownerName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdopter ? (
            <AdoptDeckButton
              deckId={deck.id}
              isAdopted
            />
          ) : (
            deck.status === "completed" && (
              <>
                <ShareButton
                  shareEndpoint={`/api/decks/${deck.id}/share`}
                  revokeEndpoint={`/api/decks/${deck.id}/share`}
                  contentType="deck"
                  existingShareToken={shareToken}
                />
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/decks/${deck.id}/edit`}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
              </>
            )
          )}
        </div>
      </div>

      {deck.theme && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs uppercase tracking-wider text-white/30 mb-1">Seed</p>
          <p className="text-sm text-white/40 italic leading-relaxed">
            &ldquo;{deck.theme}&rdquo;
          </p>
          {artStyleName && (
            <p className="text-xs text-white/25 mt-1">{artStyleName}</p>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
