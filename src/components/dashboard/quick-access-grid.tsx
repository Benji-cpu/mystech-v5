"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Layers, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface QuickAccessCard {
  icon: LucideIcon;
  label: string;
  stat: string;
  secondaryStat?: string;
  href: string;
  accent: string;
}

export interface QuickAccessData {
  pathName: string | null;
  pathWaypoint: string | null;
  deckCount: number;
  draftCount: number;
  readingCount: number;
  chronicleStreakCount: number;
  hasChronicle: boolean;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

function resolveCards(data: QuickAccessData): QuickAccessCard[] {
  return [
    {
      icon: Map,
      label: data.pathName ?? "Paths",
      stat: data.pathWaypoint ?? "Explore",
      href: "/paths",
      accent: "text-emerald-400/80",
    },
    {
      icon: Layers,
      label: "Your Decks",
      stat: data.deckCount === 0
        ? "Create first"
        : `${data.deckCount} deck${data.deckCount !== 1 ? "s" : ""}`,
      secondaryStat: data.draftCount > 0
        ? `${data.draftCount} draft${data.draftCount !== 1 ? "s" : ""}`
        : undefined,
      href: data.deckCount === 0 ? "/onboarding" : "/decks",
      accent: "text-amber-400/80",
    },
    {
      icon: Sparkles,
      label: "Readings",
      stat: data.readingCount === 0
        ? "Draw first"
        : `${data.readingCount} reading${data.readingCount !== 1 ? "s" : ""}`,
      href: data.readingCount === 0 ? "/readings/new" : "/readings",
      accent: "text-purple-400/80",
    },
    {
      icon: BookOpen,
      label: "Chronicle",
      stat: !data.hasChronicle
        ? "Set up"
        : data.chronicleStreakCount > 0
          ? `${data.chronicleStreakCount}-day streak`
          : "Start streak",
      href: data.hasChronicle ? "/chronicle/today" : "/chronicle/setup",
      accent: "text-orange-400/80",
    },
  ];
}

export function QuickAccessGrid({
  data,
  className,
}: {
  data: QuickAccessData;
  className?: string;
}) {
  const cards = resolveCards(data);

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 + i * 0.06 }}
        >
          <Link
            href={card.href}
            className="group flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/10 transition-colors min-h-[100px]"
          >
            <div
              className={cn(
                "flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.06]",
                card.accent
              )}
            >
              <card.icon className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">
                {card.label}
              </p>
              <p className="text-xs text-white/40 truncate">
                {card.stat}
              </p>
              {card.secondaryStat && (
                <p className="text-[11px] text-white/25 truncate">
                  {card.secondaryStat}
                </p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
