import { cn } from "@/lib/utils";

interface HairRuleProps {
  className?: string;
  /** Use the soft rule variant. */
  soft?: boolean;
}

export function HairRule({ className, soft = false }: HairRuleProps) {
  return (
    <hr
      className={cn("border-0 border-t", className)}
      style={{ borderTopColor: `var(${soft ? "--line-soft" : "--line"})` }}
    />
  );
}
