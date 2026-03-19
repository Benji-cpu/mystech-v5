"use client";
import { LyraSigil } from "./lyra-sigil";

interface LyraHeaderProps {
  state?: "dormant" | "attentive" | "speaking";
  size?: "sm" | "md" | "lg";
}

export function LyraHeader({ state = "attentive", size = "lg" }: LyraHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <LyraSigil size={size} state={state} />
      <span className="text-[10px] text-[#c9a94e]/50 tracking-[0.25em] uppercase">Lyra</span>
    </div>
  );
}
