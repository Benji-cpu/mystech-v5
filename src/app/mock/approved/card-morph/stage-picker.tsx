"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { STAGES, type StageId, type StageMeta } from "./stages";

interface StagePickerProps {
  activeId: StageId;
  onSelect: (id: StageId) => void;
}

export function StagePicker({ activeId, onSelect }: StagePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const card = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const scrollLeft =
        card.offsetLeft -
        container.offsetLeft -
        containerRect.width / 2 +
        cardRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto px-4 py-2 scrollbar-hide snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {STAGES.map((s) => {
        const isActive = s.id === activeId;
        return (
          <motion.button
            key={s.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelect(s.id)}
            className={cn(
              "shrink-0 snap-center rounded-lg px-3 py-1.5 text-left transition-colors",
              "border backdrop-blur-sm",
              isActive
                ? "bg-[#c9a94e]/15 border-[#c9a94e]/30"
                : "bg-white/5 border-white/8 hover:bg-white/8"
            )}
            whileTap={{ scale: 0.96 }}
          >
            <p
              className={cn(
                "text-[11px] font-medium leading-tight whitespace-nowrap",
                isActive ? "text-[#c9a94e]" : "text-white/40"
              )}
            >
              {s.name}
            </p>
            <span
              className={cn(
                "text-[9px]",
                isActive ? "text-[#c9a94e]/50" : "text-white/20"
              )}
            >
              {s.tech}
            </span>
          </motion.button>
        );
      })}
      <div className="shrink-0 w-4" />
    </div>
  );
}
