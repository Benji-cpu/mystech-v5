import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakPill({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  if (streak <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium hair border",
        className
      )}
      style={{ background: "var(--paper-card)", color: "var(--gold)" }}
    >
      <Flame className="size-3" />
      Day {streak}
    </span>
  );
}
