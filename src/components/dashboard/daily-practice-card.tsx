"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Headphones,
  ChevronRight,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PracticeNudge {
  title: string;
  durationMin: number;
  pathId: string;
  pathName: string;
}

export interface DailyPracticeData {
  deckCount: number;
  hasChronicle: boolean;
  completedChronicleToday: boolean;
  chronicleStreakCount: number;
  practiceNudge: PracticeNudge | null;
}

interface ResolvedAction {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  celebratory?: boolean;
}

function resolveAction(data: DailyPracticeData): ResolvedAction {
  // 1. No decks — initiation
  if (data.deckCount === 0) {
    return {
      icon: Wand2,
      title: "Begin Your Initiation",
      subtitle: "Create your first oracle deck",
      href: "/onboarding",
    };
  }

  // 2. Chronicle not done today
  if (data.hasChronicle && !data.completedChronicleToday) {
    return {
      icon: BookOpen,
      title: "Your Daily Card Awaits",
      subtitle: "Continue your Chronicle practice",
      href: "/chronicle/today",
      badge:
        data.chronicleStreakCount > 0
          ? `${data.chronicleStreakCount}-day streak`
          : undefined,
    };
  }

  // 3. Practice nudge from path
  if (data.practiceNudge) {
    return {
      icon: Headphones,
      title: `Today's Practice: ${data.practiceNudge.title}`,
      subtitle: data.practiceNudge.pathName,
      href: `/paths/${data.practiceNudge.pathId}`,
    };
  }

  // 4. Fallback — quick draw
  if (data.hasChronicle && data.completedChronicleToday) {
    // All caught up
    return {
      icon: CheckCircle2,
      title: "All Caught Up",
      subtitle: "Draw a card for extra insight",
      href: "/readings/quick",
      celebratory: true,
    };
  }

  return {
    icon: Sparkles,
    title: "Draw a Card",
    subtitle: "Pull a quick insight from your deck",
    href: "/readings/quick",
  };
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

export function DailyPracticeCard({
  data,
  className,
}: {
  data: DailyPracticeData;
  className?: string;
}) {
  const action = resolveAction(data);
  const Icon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.15 }}
      className={cn(className)}
    >
      <Link href={action.href}>
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-white/[0.03] backdrop-blur-sm",
            "border",
            action.celebratory
              ? "border-emerald-500/20"
              : "border-gold/20",
            "p-4",
            "hover:bg-white/[0.07] transition-colors",
            "group"
          )}
        >
          {/* Gold accent gradient */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none bg-gradient-to-br",
              action.celebratory
                ? "from-emerald-500/5 to-transparent"
                : "from-gold/5 to-transparent"
            )}
          />

          <div className="relative z-10 flex items-center gap-2">
            {/* Icon */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                action.celebratory
                  ? "bg-emerald-500/15"
                  : "bg-gold/15"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  action.celebratory
                    ? "text-emerald-400"
                    : "text-gold"
                )}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">
                {action.title}
              </p>
              <p className="text-xs text-white/40 truncate mt-0.5">
                {action.subtitle}
              </p>
            </div>

            {/* Badge or chevron */}
            <div className="flex items-center gap-2 shrink-0">
              {action.badge && (
                <span className="text-[10px] font-medium text-gold/70 bg-gold/10 px-2 py-0.5 rounded-full">
                  {action.badge}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
