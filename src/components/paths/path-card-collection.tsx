"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Milestone, Loader2 } from "lucide-react";
import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { cn } from "@/lib/utils";
import type { RetreatCard, CardType } from "@/types";

interface PathCardCollectionProps {
  pathId: string;
  className?: string;
}

export function PathCardCollection({ pathId, className }: PathCardCollectionProps) {
  const [cards, setCards] = useState<RetreatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { openCard, modalProps } = useCardDetailModal<RetreatCard>();

  useEffect(() => {
    fetch(`/api/paths/${pathId}/cards`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCards(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathId]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={cn("rounded-xl bg-white/5 border border-white/8 p-6 text-center", className)}>
        <p className="text-sm text-white/40">
          Complete chapters and readings to forge path cards.
        </p>
      </div>
    );
  }

  // Group cards by retreat
  const grouped = new Map<string, { retreatName: string; cards: RetreatCard[] }>();
  for (const card of cards) {
    const ctx = card.originContext;
    const retreatId = card.retreatId;
    const retreatName = ctx?.retreatName ?? "Unknown Chapter";
    if (!grouped.has(retreatId)) {
      grouped.set(retreatId, { retreatName, cards: [] });
    }
    grouped.get(retreatId)!.cards.push(card);
  }

  const TypeIcon = ({ type }: { type: CardType }) =>
    type === "obstacle" ? (
      <Shield className="h-3 w-3 text-amber-400" />
    ) : type === "threshold" ? (
      <Milestone className="h-3 w-3 text-gold" />
    ) : null;

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from(grouped.entries()).map(([retreatId, group]) => (
        <div key={retreatId} className="space-y-2">
          <p className="text-xs text-white/30 uppercase tracking-wider font-medium px-1">
            {group.retreatName}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {group.cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: idx * 0.06,
                }}
              >
                <div className="space-y-1">
                  <OracleCard
                    card={card}
                    size="sm"
                    onClick={() => openCard(card)}
                  />
                  <div className="flex items-center gap-1 px-0.5">
                    <TypeIcon type={card.cardType} />
                    <p className="text-[10px] text-white/30 truncate">
                      {card.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <CardDetailModal {...modalProps} />
    </div>
  );
}
