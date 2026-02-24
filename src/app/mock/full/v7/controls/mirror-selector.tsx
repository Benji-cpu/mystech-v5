"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MIRRORS, type MirrorId, type MirrorMeta } from "../mirror-types";
import { MT } from "../mirror-theme";

// ─── Shape SVGs ─────────────────────────────────────────────────────────────

function ShapeThumbnail({ shape }: { shape: MirrorMeta["shape"] }) {
  const stroke = MT.textDim;
  const strokeW = "1.5";

  switch (shape) {
    case "circle":
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
          <circle cx="20" cy="20" r="15" fill="none" stroke={stroke} strokeWidth={strokeW} />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 40 50" className="w-full h-full" aria-hidden="true">
          <ellipse cx="20" cy="25" rx="14" ry="20" fill="none" stroke={stroke} strokeWidth={strokeW} />
        </svg>
      );
    case "arch":
      return (
        <svg viewBox="0 0 40 50" className="w-full h-full" aria-hidden="true">
          <path
            d="M6 46 L6 22 Q6 4 20 4 Q34 4 34 22 L34 46 Z"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 32 50" className="w-full h-full" aria-hidden="true">
          <rect x="3" y="3" width="26" height="44" rx="3" fill="none" stroke={stroke} strokeWidth={strokeW} />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
          <circle cx="20" cy="20" r="16" fill="none" stroke={stroke} strokeWidth={strokeW} />
          <circle cx="20" cy="20" r="11" fill="none" stroke={stroke} strokeWidth="0.75" />
        </svg>
      );
    case "irregular":
      return (
        <svg viewBox="0 0 40 46" className="w-full h-full" aria-hidden="true">
          <polygon
            points="20,3 35,9 39,24 33,39 20,43 7,39 1,24 5,9"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
        </svg>
      );
    case "rectangle":
    default:
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full" aria-hidden="true">
          <rect x="4" y="4" width="36" height="36" rx="2" fill="none" stroke={stroke} strokeWidth={strokeW} />
        </svg>
      );
  }
}

// ─── Mirror Thumbnail ────────────────────────────────────────────────────────

function MirrorThumbnail({
  mirror,
  isActive,
  onClick,
}: {
  mirror: MirrorMeta;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center gap-1.5 p-2 rounded-lg text-left transition-colors"
      style={{
        background: isActive ? "rgba(201,169,78,0.08)" : "transparent",
        border: `1px solid ${isActive ? MT.gold : MT.border}`,
        boxShadow: isActive ? `0 0 0 1px ${MT.gold}` : "none",
      }}
      title={mirror.description}
    >
      {/* Shape preview */}
      <div
        className="w-8 h-8 flex items-center justify-center"
        style={{
          filter: isActive ? `drop-shadow(0 0 4px ${MT.goldDim})` : "none",
        }}
      >
        <ShapeThumbnail shape={mirror.shape} />
      </div>

      {/* Name */}
      <span
        className="text-[9px] leading-tight text-center font-medium truncate w-full"
        style={{ color: isActive ? MT.gold : MT.textMuted }}
      >
        {mirror.name}
      </span>

      {/* Active dot */}
      {isActive && (
        <motion.div
          layoutId="mirror-active-dot"
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: MT.gold }}
        />
      )}
    </motion.button>
  );
}

// ─── Section Label ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2 mt-1">
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: MT.textDim }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: MT.border }} />
    </div>
  );
}

// ─── Mirror Selector ─────────────────────────────────────────────────────────

interface MirrorSelectorProps {
  activeMirror: MirrorId;
  onSelect: (id: MirrorId) => void;
  className?: string;
}

export function MirrorSelector({
  activeMirror,
  onSelect,
  className,
}: MirrorSelectorProps) {
  const ornate = MIRRORS.filter((m) => m.category === "ornate");
  const mystical = MIRRORS.filter((m) => m.category === "mystical");

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <SectionLabel label="Ornate" />
        <div className="grid grid-cols-3 gap-1.5">
          {ornate.map((mirror) => (
            <MirrorThumbnail
              key={mirror.id}
              mirror={mirror}
              isActive={activeMirror === mirror.id}
              onClick={() => onSelect(mirror.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel label="Mystical" />
        <div className="grid grid-cols-3 gap-1.5">
          {mystical.map((mirror) => (
            <MirrorThumbnail
              key={mirror.id}
              mirror={mirror}
              isActive={activeMirror === mirror.id}
              onClick={() => onSelect(mirror.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
