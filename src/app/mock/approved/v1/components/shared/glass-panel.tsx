"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassPanel({ children, className, onClick }: GlassPanelProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
