"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Layers, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface QuickAccessCard {
  icon: LucideIcon;
  label: string;
  stat: string;
  secondaryStat?: string;
  href: string;
  accent: string;
  /** Subtle tint for the card background */
  tint: string;
  /** Minimum onboarding stage to show this card */
  minStage: number;
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
      icon: Sparkles,
      label: "Readings",
      stat: data.readingCount === 0
        ? "Draw first"
        : `${data.readingCount} reading${data.readingCount !== 1 ? "s" : ""}`,
      href: data.readingCount === 0 ? "/readings/new" : "/readings",
      accent: "text-purple-400/80",
      tint: "bg-purple-500/[0.04]",
      minStage: 0,
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
      tint: "bg-orange-500/[0.04]",
      minStage: 0,
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
      tint: "bg-amber-500/[0.04]",
      minStage: 2,
    },
    {
      icon: Map,
      label: data.pathName ?? "Paths",
      stat: data.pathWaypoint ?? "Explore",
      href: "/paths",
      accent: "text-emerald-400/80",
      tint: "bg-emerald-500/[0.04]",
      minStage: 3,
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
  const { stage } = useOnboarding();
  const cards = resolveCards(data).filter((card) => stage >= card.minStage);

  if (cards.length === 0) return null;

  const [primary, ...rest] = cards;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Primary card — full width, more prominent */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
      >
        <Link
          href={primary.href}
          className={cn(
            "group flex items-center gap-4 p-4 rounded-2xl",
            "bg-white/[0.05] backdrop-blur-sm border border-white/[0.08]",
            "hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "active:scale-[0.98] transition-transform",
            primary.tint
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.06]",
              primary.accent
            )}
          >
            <primary.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">
              {primary.label}
            </p>
            <p className="text-xs text-white/40 truncate">{primary.stat}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
        </Link>
      </motion.div>

      {/* Secondary cards — compact row */}
      {rest.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {rest.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.16 + i * 0.06 }}
            >
              <Link
                href={card.href}
                className={cn(
                  "group flex flex-col items-center gap-2 p-3 rounded-2xl text-center",
                  "bg-white/[0.03] border border-white/[0.06]",
                  "hover:bg-white/[0.06] hover:border-white/[0.1] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "active:scale-[0.98] transition-transform",
                  card.tint
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.06]",
                    card.accent
                  )}
                >
                  <card.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-xs font-medium text-white/80 truncate">
                    {card.label}
                  </p>
                  <p className="text-[11px] text-white/40 truncate">
                    {card.stat}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
