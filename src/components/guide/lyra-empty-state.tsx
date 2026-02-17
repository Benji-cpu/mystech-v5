import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LyraSigil } from "./lyra-sigil";

interface LyraEmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function LyraEmptyState({
  message,
  actionLabel,
  actionHref,
}: LyraEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <LyraSigil size="lg" state="dormant" className="mb-6" />
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      {actionLabel && actionHref && (
        <Button asChild variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
