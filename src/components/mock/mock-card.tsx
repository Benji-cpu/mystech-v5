"use client";

import { cn } from "@/lib/utils";
import type { MockCard } from "./mock-data";

type CardSize = "sm" | "md" | "lg" | "xl";

interface MockCardFrontProps {
  card: MockCard;
  size?: CardSize;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const sizes: Record<CardSize, string> = {
  sm: "w-[100px] h-[150px]",
  md: "w-[140px] h-[210px]",
  lg: "w-[180px] h-[270px]",
  xl: "w-[220px] h-[330px]",
};

export function MockCardFront({ card, size = "md", width, height, className, style }: MockCardFrontProps) {
  const useInline = width !== undefined && height !== undefined;
  const hideTitle = width !== undefined && width < 80;

  return (
    <div
      className={cn(
        !useInline && sizes[size],
        "relative rounded-xl overflow-hidden border border-[#c9a94e]/40 shadow-lg shadow-purple-900/20",
        "bg-gradient-to-b from-[#1a0530] to-[#0a0118]",
        className
      )}
      style={useInline ? { width, height, ...style } : style}
    >
      <img
        src={card.imageUrl}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-[3px] rounded-[9px] border border-[#c9a94e]/20 pointer-events-none" />
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#c9a94e]/60" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#c9a94e]/60" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#c9a94e]/60" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#c9a94e]/60" />
      {!hideTitle && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-center text-xs font-medium text-[#c9a94e] tracking-wide">
            {card.title}
          </p>
        </div>
      )}
    </div>
  );
}

interface MockCardBackProps {
  size?: CardSize;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function MockCardBack({ size = "md", width, height, className, style }: MockCardBackProps) {
  const useInline = width !== undefined && height !== undefined;
  const isSmall = width !== undefined && width < 80;

  return (
    <div
      className={cn(
        !useInline && sizes[size],
        "relative rounded-xl overflow-hidden border border-[#c9a94e]/40 shadow-lg shadow-purple-900/20",
        "bg-gradient-to-b from-[#180428] to-[#0d0020]",
        className
      )}
      style={useInline ? { width, height, ...style } : style}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn("border border-[#c9a94e]/30 rotate-45", isSmall ? "w-8 h-8" : "w-16 h-16")} />
        <div className={cn("absolute border border-[#c9a94e]/20 rounded-full", isSmall ? "w-6 h-6" : "w-12 h-12")} />
        <div className={cn("absolute border border-[#c9a94e]/10 rounded-full", isSmall ? "w-10 h-10" : "w-20 h-20")} />
      </div>
      <div className="absolute inset-[3px] rounded-[9px] border border-[#c9a94e]/20 pointer-events-none" />
    </div>
  );
}
