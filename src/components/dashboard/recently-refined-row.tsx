"use client";

import Image from "next/image";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefinedCard {
  cardId: string;
  cardTitle: string;
  imageUrl: string | null;
  imageStatus: string;
  deckId: string;
}

interface RecentlyRefinedRowProps {
  cards: RefinedCard[];
  className?: string;
}

export function RecentlyRefinedRow({ cards, className }: RecentlyRefinedRowProps) {
  if (cards.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          Recently Refined
        </h3>
        <Link
          href="/studio"
          className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
        >
          Studio
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {cards.map((card) => (
          <Link
            key={card.cardId}
            href={`/studio/cards/${card.cardId}`}
            className="shrink-0 group"
          >
            <div className="relative w-14 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-primary/30 transition-colors">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.cardTitle}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-white/5" />
              )}
            </div>
            <p className="text-[10px] text-white/30 mt-1 truncate w-14 text-center group-hover:text-white/50 transition-colors">
              {card.cardTitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
