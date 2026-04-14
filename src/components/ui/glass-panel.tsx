"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type GlassPanelVariant = "solid" | "translucent" | "elevated";

const variantStyles: Record<GlassPanelVariant, string> = {
  /** Nav bars, modal backdrops, structural containers — no blur */
  solid: "bg-card border border-white/[0.06]",
  /** Cards over ambient background — light blur */
  translucent: "bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]",
  /** Primary CTA, most important element — stronger presence */
  elevated: "bg-white/[0.08] backdrop-blur-sm border border-white/[0.1]",
};

interface GlassPanelProps {
  children: ReactNode;
  variant?: GlassPanelVariant;
  className?: string;
  onClick?: () => void;
}

export function GlassPanel({
  children,
  variant = "translucent",
  className,
  onClick,
}: GlassPanelProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
