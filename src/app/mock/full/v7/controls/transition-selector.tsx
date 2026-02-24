"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TRANSITIONS, type TransitionId } from "../mirror-types";
import { MT, LIBRARY_COLORS } from "../mirror-theme";

// ─── Library Badge ───────────────────────────────────────────────────────────

function LibraryBadge({ library }: { library: string }) {
  const color = LIBRARY_COLORS[library] ?? MT.textDim;

  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      {library}
    </span>
  );
}

// ─── WebGL Badge ─────────────────────────────────────────────────────────────

function WebGLBadge() {
  return (
    <span
      className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{
        background: "rgba(4,158,244,0.12)",
        color: "#049ef4",
        border: "1px solid rgba(4,158,244,0.3)",
      }}
    >
      WebGL
    </span>
  );
}

// ─── Transition Item ─────────────────────────────────────────────────────────

function TransitionItem({
  id,
  name,
  description,
  library,
  isR3F,
  isActive,
  onClick,
}: {
  id: TransitionId;
  name: string;
  description: string;
  library: string;
  isR3F: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-colors relative"
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
      {/* Active indicator dot */}
      <div
        className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
        style={{
          background: isActive ? MT.gold : MT.border,
          boxShadow: isActive ? `0 0 6px ${MT.goldDim}` : "none",
          marginLeft: isActive ? 0 : "0px",
        }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs font-medium"
            style={{ color: isActive ? MT.gold : MT.text }}
          >
            {name}
          </span>
          {isR3F && <WebGLBadge />}
        </div>
        <p className="text-[10px] leading-snug" style={{ color: MT.textDim }}>
          {description}
        </p>
        <LibraryBadge library={library} />
      </div>
    </motion.button>
  );
}

// ─── Transition Selector ─────────────────────────────────────────────────────

interface TransitionSelectorProps {
  activeTransition: TransitionId;
  onSelect: (id: TransitionId) => void;
  className?: string;
}

export function TransitionSelector({
  activeTransition,
  onSelect,
  className,
}: TransitionSelectorProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {TRANSITIONS.map((t) => (
        <TransitionItem
          key={t.id}
          id={t.id}
          name={t.name}
          description={t.description}
          library={t.library}
          isR3F={t.isR3F}
          isActive={activeTransition === t.id}
          onClick={() => onSelect(t.id)}
        />
      ))}
    </div>
  );
}
