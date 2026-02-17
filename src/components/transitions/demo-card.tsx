"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface DemoCardProps {
  title?: string;
  imageUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-[120px] h-[180px]",
  md: "w-[150px] h-[225px]",
  lg: "w-[200px] h-[300px]",
};

export function DemoCard({
  title = "The Oracle",
  imageUrl,
  className,
  style,
  size = "md",
}: DemoCardProps) {
  return (
    <div
      className={cn(
        sizes[size],
        "relative rounded-xl overflow-hidden border border-[#c9a94e]/40 shadow-lg shadow-purple-900/20",
        "bg-gradient-to-b from-[#1a0530] to-[#0a0118]",
        className
      )}
      style={style}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
      )}
      {/* Gold inner border */}
      <div className="absolute inset-[3px] rounded-[9px] border border-[#c9a94e]/20 pointer-events-none" />
      {/* Gold corner accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#c9a94e]/60" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#c9a94e]/60" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#c9a94e]/60" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#c9a94e]/60" />
      {/* Title */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-center text-xs font-medium text-[#c9a94e] tracking-wide">
          {title}
        </p>
      </div>
      {/* Star accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-[#c9a94e]/30 text-2xl pointer-events-none">
        ✦
      </div>
    </div>
  );
}

/** Card back — used for flip animations */
export function DemoCardBack({
  className,
  style,
  size = "md",
}: Omit<DemoCardProps, "title" | "imageUrl">) {
  return (
    <div
      className={cn(
        sizes[size],
        "relative rounded-xl overflow-hidden border border-[#c9a94e]/40 shadow-lg shadow-purple-900/20",
        "bg-gradient-to-b from-[#180428] to-[#0d0020]",
        className
      )}
      style={style}
    >
      {/* Sacred geometry pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border border-[#c9a94e]/30 rotate-45" />
        <div className="absolute w-12 h-12 border border-[#c9a94e]/20 rounded-full" />
        <div className="absolute w-20 h-20 border border-[#c9a94e]/10 rounded-full" />
      </div>
      <div className="absolute inset-[3px] rounded-[9px] border border-[#c9a94e]/20 pointer-events-none" />
    </div>
  );
}

export const DEMO_CARDS = [
  { title: "The Dreamer", imageUrl: "https://picsum.photos/seed/dreamer/300/450" },
  { title: "The Alchemist", imageUrl: "https://picsum.photos/seed/alchemist/300/450" },
  { title: "The Wanderer", imageUrl: "https://picsum.photos/seed/wanderer/300/450" },
  { title: "The Mirror", imageUrl: "https://picsum.photos/seed/mirror/300/450" },
  { title: "The Flame", imageUrl: "https://picsum.photos/seed/flame/300/450" },
  { title: "The Guardian", imageUrl: "https://picsum.photos/seed/guardian/300/450" },
];
