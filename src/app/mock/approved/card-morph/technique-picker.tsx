"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TechniqueMeta, TechniqueId } from "./types";

interface TechniquePickerProps {
  techniques: TechniqueMeta[];
  activeId: TechniqueId;
  onSelect: (id: TechniqueId) => void;
}

export function TechniquePicker({
  techniques,
  activeId,
  onSelect,
}: TechniquePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active card into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const card = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const scrollLeft =
        card.offsetLeft - container.offsetLeft - containerRect.width / 2 + cardRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {techniques.map((t, i) => {
        const isActive = t.id === activeId;
        return (
          <motion.button
            key={t.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelect(t.id)}
            className={cn(
              "shrink-0 snap-center rounded-xl px-4 py-2.5 text-left transition-colors min-w-[120px]",
              "border backdrop-blur-sm",
              isActive
                ? "bg-white/10 border-[#c9a94e]/40 shadow-[0_0_12px_rgba(201,169,78,0.15)]"
                : "bg-white/5 border-white/10 hover:bg-white/8"
            )}
            whileTap={{ scale: 0.96 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  isActive
                    ? "bg-[#c9a94e]/30 text-[#c9a94e]"
                    : "bg-white/10 text-white/40"
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-[#c9a94e]/70" : "text-white/30"
                )}
              >
                {t.library}
              </span>
            </div>
            <p
              className={cn(
                "text-xs font-medium leading-tight",
                isActive ? "text-white/90" : "text-white/50"
              )}
            >
              {t.name}
            </p>
          </motion.button>
        );
      })}
      {/* Trailing spacer for scroll padding */}
      <div className="shrink-0 w-4" />
    </div>
  );
}
