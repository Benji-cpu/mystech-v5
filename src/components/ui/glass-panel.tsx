"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type GlassPanelVariant = "solid" | "translucent" | "elevated";

const variantStyles: Record<GlassPanelVariant, string> = {
  /** Nav bars, modal backdrops, structural containers — no blur */
  solid: "bg-card border border-border",
  /** Cards over ambient background — light blur */
  translucent: "bg-card/70 backdrop-blur-sm border border-border",
  /** Primary CTA, most important element — stronger presence */
  elevated: "bg-popover backdrop-blur-sm border border-border shadow-sm",
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
