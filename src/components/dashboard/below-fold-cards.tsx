"use client";

import { motion } from "framer-motion";
import { FileStack, Map, Flame, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BelowFoldCard, BelowFoldCardType } from "@/lib/dashboard/resolve-below-fold";

interface BelowFoldCardsProps {
  cards: BelowFoldCard[];
  className?: string;
}

const iconMap: Record<BelowFoldCardType, typeof FileStack> = {
  "draft-deck": FileStack,
  "path-progress": Map,
  "chronicle-streak": Flame,
  "deck-overview": Layers,
};

const accentMap: Record<BelowFoldCardType, string> = {
  "draft-deck": "text-amber-400/80",
  "path-progress": "text-emerald-400/80",
  "chronicle-streak": "text-orange-400/80",
  "deck-overview": "text-primary/60",
};

export function BelowFoldCards({ cards, className }: BelowFoldCardsProps) {
  if (cards.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {cards.map((card, i) => {
        const Icon = iconMap[card.type];
        const accent = accentMap[card.type];

        return (
          <motion.div
            key={card.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: i * 0.1,
            }}
          >
            <Link
              href={card.href}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/10 transition-colors"
            >
              <div
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.06] shrink-0",
                  accent
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">
                  {card.title}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-white/40 truncate">
                    {card.subtitle}
                  </p>
                )}
              </div>

              <span className="text-xs text-primary/60 font-medium shrink-0 group-hover:text-primary/80 transition-colors">
                {card.ctaLabel}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
