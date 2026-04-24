"use client";

import Image from "next/image";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefineCard {
  id: string;
  title: string;
  imageUrl: string | null;
  imageStatus: string;
}

interface ReadingRefineSectionProps {
  cards: RefineCard[];
  className?: string;
}

export function ReadingRefineSection({ cards, className }: ReadingRefineSectionProps) {
  const refinableCards = cards.filter(
    (c) => c.imageStatus === "completed" && c.imageUrl
  );

  if (refinableCards.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          Refine Your Cards
        </h3>
        <p className="text-xs text-white/30 mt-0.5">Fine-tune the artwork</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {refinableCards.map((card) => (
          <Link
            key={card.id}
            href={`/studio/cards/${card.id}`}
            className="shrink-0 group"
          >
            <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-primary/30 transition-colors">
              <Image
                src={card.imageUrl!}
                alt={card.title}
                fill
                sizes="64px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Wand2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <p className="text-[10px] text-white/30 mt-1 truncate w-16 text-center group-hover:text-white/50 transition-colors">
              {card.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
