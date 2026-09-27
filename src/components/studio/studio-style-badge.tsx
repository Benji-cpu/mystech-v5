import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioStyleBadgeProps {
  styleName: string;
  className?: string;
}

export function StudioStyleBadge({ styleName, className }: StudioStyleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-white/5 border border-white/10 text-gold/80",
        className
      )}
    >
      <Palette className="h-3 w-3" />
      {styleName}
    </span>
  );
}
