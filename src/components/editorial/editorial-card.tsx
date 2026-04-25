import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "card" | "warm";

interface CommonProps {
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
  /** Padding preset. Default is "lg" (p-7). Use "md" for p-5, "sm" for p-4. */
  padding?: "sm" | "md" | "lg";
}

const toneBg: Record<Tone, string> = {
  card: "var(--paper-card)",
  warm: "var(--paper-warm)",
};

const padMap = { sm: "p-4", md: "p-5", lg: "p-7" } as const;

interface EditorialCardProps extends CommonProps {
  as?: "div" | "article" | "section";
}

export function EditorialCard({
  className,
  tone = "card",
  padding = "lg",
  children,
  as = "div",
}: EditorialCardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn("rounded-3xl border hair", padMap[padding], className)}
      style={{ background: toneBg[tone] }}
    >
      {children}
    </Tag>
  );
}

interface EditorialCardLinkProps extends CommonProps {
  href: string;
  /** When true, applies a subtle hover border color change. Default true. */
  interactive?: boolean;
}

export function EditorialCardLink({
  href,
  className,
  tone = "card",
  padding = "lg",
  children,
  interactive = true,
}: EditorialCardLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-3xl border hair",
        padMap[padding],
        interactive && "transition-colors hover:border-[var(--ink-soft)]",
        className
      )}
      style={{ background: toneBg[tone] }}
    >
      {children}
    </Link>
  );
}
