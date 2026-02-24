"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ZODIAC_SIGNS, ELEMENT_STYLES } from "./lyra-v3-data";
import type { ZodiacConstellation, ZodiacElement } from "./lyra-v3-data";

interface ZodiacPickerProps {
  onSelect: (zodiacId: string, element: ZodiacElement) => void;
  selectedId: string | null;
  className?: string;
}

export function ZodiacPicker({ onSelect, selectedId, className }: ZodiacPickerProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 px-2",
        className
      )}
    >
      {ZODIAC_SIGNS.map((sign, i) => (
        <ZodiacCard
          key={sign.id}
          sign={sign}
          isSelected={selectedId === sign.id}
          onSelect={() => onSelect(sign.id, sign.element)}
          index={i}
        />
      ))}
    </div>
  );
}

// ── Individual Zodiac Card ─────────────────────────────────────────────

interface ZodiacCardProps {
  sign: ZodiacConstellation;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function ZodiacCard({ sign, isSelected, onSelect, index }: ZodiacCardProps) {
  const elementStyle = ELEMENT_STYLES[sign.element];

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.04,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center gap-0.5 p-2 rounded-xl",
        "backdrop-blur transition-colors duration-200",
        "touch-manipulation",
        isSelected
          ? "ring-1 ring-amber-400/40 bg-amber-900/10"
          : "bg-white/5"
      )}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: isSelected
          ? elementStyle.haloColor + "60"
          : elementStyle.haloColor + "18",
        background: isSelected
          ? undefined
          : `radial-gradient(ellipse at 50% 20%, ${elementStyle.haloGlow.replace(/[\d.]+\)$/, "0.06)")}, transparent 70%)`,
      }}
    >
      {/* Zodiac symbol */}
      <span
        className="text-xl sm:text-2xl leading-none"
        style={{ color: isSelected ? elementStyle.haloColor : elementStyle.haloColor + "90" }}
      >
        {sign.symbol}
      </span>

      {/* Mini constellation */}
      <div className="relative w-12 h-8 sm:w-16 sm:h-14 flex-shrink-0">
        <svg viewBox="0 0 100 80" className="w-full h-full" fill="none">
          {/* Lines */}
          {sign.lines.map(([from, to], li) => {
            const s1 = sign.stars[from];
            const s2 = sign.stars[to];
            return (
              <motion.line
                key={`${sign.id}-l-${li}`}
                x1={s1.x * 100}
                y1={s1.y * 100}
                x2={s2.x * 100}
                y2={s2.y * 100}
                stroke={isSelected ? elementStyle.haloColor : "rgba(255,255,255,0.15)"}
                strokeWidth={isSelected ? 1 : 0.5}
                animate={{
                  opacity: isSelected ? [0.4, 0.7, 0.4] : 0.3,
                }}
                transition={
                  isSelected
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
              />
            );
          })}
          {/* Stars */}
          {sign.stars.map((star, si) => (
            <motion.circle
              key={`${sign.id}-s-${si}`}
              cx={star.x * 100}
              cy={star.y * 100}
              r={star.brightness > 0.7 ? 3 : 2}
              fill={isSelected ? elementStyle.haloColor : "#c9a94e"}
              animate={{
                opacity: isSelected
                  ? [0.6, 1, 0.6]
                  : star.brightness * 0.6 + 0.2,
              }}
              transition={
                isSelected
                  ? { duration: 1.5 + si * 0.2, repeat: Infinity, ease: "easeInOut" }
                  : {}
              }
            />
          ))}
        </svg>
      </div>

      {/* Sign name */}
      <span
        className={cn(
          "text-xs font-serif tracking-wide",
          isSelected ? "text-amber-200" : "text-white/60"
        )}
      >
        {sign.name}
      </span>

      {/* Date range */}
      <span className="text-[9px] text-white/30 leading-tight">
        {sign.dateRange}
      </span>

      {/* Element label */}
      <span
        className="text-[8px] uppercase tracking-widest mt-0.5"
        style={{ color: elementStyle.haloColor + "70" }}
      >
        {elementStyle.label}
      </span>
    </motion.button>
  );
}

// ── Selected zodiac display (flies into sky zone) ───────────────────────

interface ZodiacSkyDisplayProps {
  sign: ZodiacConstellation;
  showGhostStars: boolean;
  className?: string;
}

export function ZodiacSkyDisplay({ sign, showGhostStars, className }: ZodiacSkyDisplayProps) {
  const elementStyle = ELEMENT_STYLES[sign.element];

  return (
    <motion.div
      layoutId={`zodiac-sky-${sign.id}`}
      className={cn("relative", className)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Ghost stars */}
        {showGhostStars &&
          sign.ghostStarPositions.map((gs, i) => (
            <motion.circle
              key={`ghost-${i}`}
              cx={gs.x * 100}
              cy={gs.y * 100}
              r={2}
              fill="#c9a94e"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.04, 0.08, 0.04] }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}

        {/* Constellation lines */}
        {sign.lines.map(([from, to], i) => {
          const s1 = sign.stars[from];
          const s2 = sign.stars[to];
          return (
            <motion.line
              key={`sky-line-${i}`}
              x1={s1.x * 100}
              y1={s1.y * 100}
              x2={s2.x * 100}
              y2={s2.y * 100}
              stroke={elementStyle.haloColor}
              strokeWidth={0.8}
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                pathLength: { type: "spring", stiffness: 100, damping: 20, delay: i * 0.15 },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          );
        })}

        {/* Stars with element-colored halos */}
        {sign.stars.map((star, i) => (
          <motion.g key={`sky-star-${i}`}>
            <motion.circle
              cx={star.x * 100}
              cy={star.y * 100}
              r={star.brightness > 0.7 ? 6 : 4}
              fill={elementStyle.haloGlow}
              animate={{
                opacity: [0.1, 0.25, 0.1],
                r: star.brightness > 0.7
                  ? [6, 7, 6]
                  : [4, 5, 4],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx={star.x * 100}
              cy={star.y * 100}
              r={star.brightness > 0.7 ? 2.5 : 1.8}
              fill="#c9a94e"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 20 },
                opacity: { duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          </motion.g>
        ))}

        {/* Sign name */}
        <motion.text
          x={50}
          y={92}
          textAnchor="middle"
          fill="rgba(201, 169, 78, 0.5)"
          fontSize={6}
          fontFamily="serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          {sign.name} {sign.symbol}
        </motion.text>
      </svg>
    </motion.div>
  );
}
