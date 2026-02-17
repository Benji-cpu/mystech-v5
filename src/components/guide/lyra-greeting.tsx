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
      className={`flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 ${className ?? ""}`}
    >
      <LyraSigil size="md" state="attentive" className="flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{greeting}</p>
      </div>
    </div>
  );
}
