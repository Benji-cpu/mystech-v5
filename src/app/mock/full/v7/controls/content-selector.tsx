"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTENTS, type ContentId } from "../mirror-types";
import { MT } from "../mirror-theme";

// ─── Content Item ────────────────────────────────────────────────────────────

function ContentItem({
  id,
  name,
  description,
  isActive,
  onClick,
}: {
  id: ContentId;
  name: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative"
      style={{
        background: isActive ? "rgba(201,169,78,0.06)" : "transparent",
        borderLeft: `2px solid ${isActive ? MT.gold : "transparent"}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }
      }}
    >
      {/* Active indicator */}
      <div
        className="shrink-0 w-1.5 h-1.5 rounded-full"
        style={{
          background: isActive ? MT.gold : MT.border,
          boxShadow: isActive ? `0 0 6px ${MT.goldDim}` : "none",
        }}
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium leading-snug"
          style={{ color: isActive ? MT.gold : MT.text }}
        >
          {name}
        </p>
        <p className="text-[10px] leading-snug mt-0.5" style={{ color: MT.textDim }}>
          {description}
        </p>
      </div>
    </motion.button>
  );
}

// ─── Content Selector ────────────────────────────────────────────────────────

interface ContentSelectorProps {
  activeContent: ContentId;
  onSelect: (id: ContentId) => void;
  className?: string;
}

export function ContentSelector({
  activeContent,
  onSelect,
  className,
}: ContentSelectorProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {CONTENTS.map((c) => (
        <ContentItem
          key={c.id}
          id={c.id}
          name={c.name}
          description={c.description}
          isActive={activeContent === c.id}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}
