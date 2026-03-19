"use client";

import { useMemo } from "react";
import { LyraSigil } from "./lyra-sigil";
import { pickCelestialGreeting } from "./lyra-constants";
import {
  MOON_PHASE_EMOJI,
  MOON_TRANSIT_NOTES,
  ZODIAC_GLYPHS,
  getElementAlignment,
} from "@/lib/astrology/celestial-text";
import type { ZodiacSign } from "@/lib/astrology/birth-chart";

interface LyraGreetingProps {
  userName: string;
  deckCount: number;
  readingCount: number;
  moonPhase?: string;
  moonSign?: string;
  sunSign?: string | null;
  className?: string;
}

export function LyraGreeting({
  userName,
  deckCount,
  readingCount,
  moonPhase,
  moonSign,
  sunSign,
  className,
}: LyraGreetingProps) {
  const greeting = useMemo(
    () => pickCelestialGreeting({ deckCount, readingCount, moonPhase, moonSign }),
    // Stable for the entire day — pickCelestialGreeting uses date as seed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deckCount > 0, readingCount > 0, moonPhase, moonSign]
  );

  const hasCelestial = !!moonPhase && !!moonSign;
  const emoji = hasCelestial ? (MOON_PHASE_EMOJI[moonPhase] ?? "\u{1F315}") : null;
  const glyph = hasCelestial ? (ZODIAC_GLYPHS[moonSign as ZodiacSign] ?? "") : null;
  const transitNote = hasCelestial ? (MOON_TRANSIT_NOTES[moonSign] ?? "") : null;
  const alignment = hasCelestial && sunSign ? getElementAlignment(sunSign, moonSign) : null;

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-2 ${className ?? ""}`}
    >
      <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
        <LyraSigil size="sm" state="attentive" className="shrink-0" />
        <span>
          {userName && userName !== "Seeker" && (
            <span className="text-[#c9a94e]/80">{userName}, </span>
          )}
          {greeting}
        </span>
      </p>

      {hasCelestial && (
        <p className="text-sm text-white/60">
          <span className="text-base mr-1">{emoji}</span>
          <span className="font-medium text-white/70">{moonPhase}</span>
          {" "}
          <span className="text-white/40">in {moonSign} {glyph}</span>
          {transitNote && (
            <span className="text-white/40"> &mdash; {transitNote.toLowerCase()}</span>
          )}
        </p>
      )}

      {alignment?.note && (
        <p className="text-xs text-[#c9a94e]/70 leading-relaxed">
          {alignment.note}
        </p>
      )}
    </div>
  );
}
