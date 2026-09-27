"use client";

import { useMemo } from "react";
import { LyraSigil } from "./lyra-sigil";
import { pickGreeting } from "./lyra-constants";

interface LyraGreetingProps {
  userName: string;
  deckCount: number;
  readingCount: number;
  className?: string;
}

export function LyraGreeting({
  userName,
  deckCount,
  readingCount,
  className,
}: LyraGreetingProps) {
  const greeting = useMemo(
    () => pickGreeting({ deckCount, readingCount }),
    // Stable for the entire day — pickGreeting uses date as seed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deckCount > 0, readingCount > 0]
  );

  return (
    <div
      className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 space-y-2 ${className ?? ""}`}
    >
      <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
        <LyraSigil size="sm" state="attentive" className="shrink-0" />
        <span>
          {userName && userName !== "Seeker" && (
            <span className="text-gold/80">{userName}, </span>
          )}
          {greeting}
        </span>
      </p>
    </div>
  );
}
