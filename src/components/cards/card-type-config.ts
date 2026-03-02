import { Sparkles, Shield, Milestone } from "lucide-react";
import type { CardType } from "@/types";
import type { LucideIcon } from "lucide-react";

export type CardTypeConfig = {
  label: string;
  icon: LucideIcon;
  borderClass: string;
  badgeClass: string;
  glowClass: string;
};

export const CARD_TYPE_CONFIG: Record<CardType, CardTypeConfig> = {
  general: {
    label: "Oracle Card",
    icon: Sparkles,
    borderClass: "border-border/50",
    badgeClass: "",
    glowClass: "",
  },
  obstacle: {
    label: "Obstacle Card",
    icon: Shield,
    borderClass: "border-amber-500/30",
    badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    glowClass: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  },
  threshold: {
    label: "Threshold Card",
    icon: Milestone,
    borderClass: "border-[#c9a94e]/40",
    badgeClass: "bg-[#c9a94e]/15 text-[#c9a94e] border border-[#c9a94e]/30",
    glowClass: "shadow-[0_0_20px_rgba(201,169,78,0.25)]",
  },
};
