"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DemoWrapperProps {
  title: string;
  description: string;
  library: "CSS" | "Framer Motion" | "React Spring" | "GSAP" | "Creative";
  children: (playing: boolean, onReset: () => void) => React.ReactNode;
  className?: string;
}

const libraryColors: Record<string, string> = {
  CSS: "bg-blue-500/20 text-blue-300",
  "Framer Motion": "bg-pink-500/20 text-pink-300",
  "React Spring": "bg-green-500/20 text-green-300",
  GSAP: "bg-yellow-500/20 text-yellow-300",
  Creative: "bg-purple-500/20 text-purple-300",
};

export function DemoWrapper({
  title,
  description,
  library,
  children,
  className,
}: DemoWrapperProps) {
  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);

  const handlePlay = () => setPlaying(true);
  const handleReset = useCallback(() => {
    setPlaying(false);
    setKey((k) => k + 1);
  }, []);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
            libraryColors[library]
          )}
        >
          {library}
        </span>
      </div>

      {/* Stage */}
      <div className="flex-1 min-h-[280px]" key={key}>
        {children(playing, handleReset)}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handlePlay}
          disabled={playing}
          className="flex-1 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Play
        </button>
        <button
          onClick={handleReset}
          className="flex-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
