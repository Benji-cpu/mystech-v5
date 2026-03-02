"use client";

import { useState } from "react";
import { Compass, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpgradeCta } from "@/components/dashboard/upgrade-cta";
import { CelestialProfile } from "@/components/settings/celestial-profile";

import type { PlanType, AstrologyProfile } from "@/types";

interface OverviewCollapsibleProps {
  deckCount: number;
  plan: PlanType;
  creditsUsed: number;
  creditsLimit: number;
  readingsToday: number;
  readingsPerDay: number;
  isLifetimeCredits: boolean;
  celestialProfile?: AstrologyProfile | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function OverviewCollapsible({
  deckCount,
  plan,
  creditsUsed,
  creditsLimit,
  readingsToday,
  readingsPerDay,
  isLifetimeCredits,
  celestialProfile,
  open: controlledOpen,
  onOpenChange,
  className,
}: OverviewCollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger
        className={cn(
          "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
          "p-4 cursor-pointer transition-colors hover:bg-white/[0.07]",
          "flex items-center justify-between w-full"
        )}
      >
        <div className="flex items-center gap-2.5">
          <Compass className="h-4 w-4 text-white/50" />
          <span className="text-sm font-medium text-white/80">
            Your Sanctum
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="h-4 w-4 text-white/40" />
        </motion.div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="space-y-6 pt-4">
          <DashboardStats
            deckCount={deckCount}
            plan={plan}
            creditsUsed={creditsUsed}
            creditsLimit={creditsLimit}
            readingsToday={readingsToday}
            readingsPerDay={readingsPerDay}
            isLifetimeCredits={isLifetimeCredits}
          />
          {celestialProfile !== undefined && (
            <CelestialProfile profile={celestialProfile} />
          )}
          <QuickActions />
          {plan === "free" && <UpgradeCta />}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
