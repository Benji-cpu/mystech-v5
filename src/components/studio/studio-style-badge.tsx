import Link from "next/link";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioStyleBadgeProps {
  styleName: string;
  styleId?: string | null;
  /** Whether to wrap in a link to the style's Studio page. Default: true */
  linkToStudio?: boolean;
  className?: string;
}

export function StudioStyleBadge({
  styleName,
  styleId,
  linkToStudio = true,
  className,
}: StudioStyleBadgeProps) {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-white/5 border border-white/10 text-gold/80",
        linkToStudio && styleId && "hover:bg-white/10 hover:border-white/20 transition-colors",
        className
      )}
    >
      <Palette className="h-3 w-3" />
      {styleName}
    </span>
  );

  if (linkToStudio && styleId) {
    return (
      <Link href={`/studio/styles/${styleId}`} onClick={(e) => e.stopPropagation()}>
        {badge}
      </Link>
    );
  }

  return badge;
}
