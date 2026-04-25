import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorialHeaderProps {
  /** Optional back link rendered above the title as an eyebrow-style link. */
  backHref?: string;
  backLabel?: string;
  /** Small eyebrow label above the title. Useful for section/context marker. */
  eyebrow?: string;
  /** Primary title in Fraunces serif. */
  title: string;
  /** Optional italic subtitle in Fraunces. */
  whisper?: string;
  /** Optional plain text helper below the whisper. */
  meta?: string;
  /** Optional action cluster on the right on larger viewports. */
  actions?: React.ReactNode;
  className?: string;
  /** Title scale. "lg" (default), "xl" for hero pages, "md" for compact. */
  size?: "md" | "lg" | "xl";
}

const sizeClass = {
  md: "text-2xl sm:text-3xl leading-tight",
  lg: "text-[clamp(2rem,7vw,3.25rem)] leading-[0.98]",
  xl: "text-[clamp(2.5rem,9vw,4rem)] leading-[0.95]",
} as const;

export function EditorialHeader({
  backHref,
  backLabel = "Back",
  eyebrow,
  title,
  whisper,
  meta,
  actions,
  className,
  size = "lg",
}: EditorialHeaderProps) {
  return (
    <header className={cn("", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="eyebrow inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={14} /> {backLabel}
        </Link>
      )}

      <div
        className={cn(
          "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between",
          backHref ? "mt-6" : ""
        )}
      >
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1
            className={cn("display", sizeClass[size], eyebrow ? "mt-2" : "")}
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h1>
          {whisper && (
            <p
              className="whisper mt-3 max-w-xl text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {whisper}
            </p>
          )}
          {meta && (
            <p className="mt-3 text-sm" style={{ color: "var(--ink-mute)" }}>
              {meta}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
