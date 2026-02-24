"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ZODIAC_SIGNS, ELEMENT_STYLES, type ZodiacConstellation } from "./lyra-v4-data";
import { SPRINGS } from "./lyra-v4-theme";

interface ZodiacPickerProps {
  onSelect: (sign: ZodiacConstellation) => void;
  selectedId: string | null;
  className?: string;
}

export function ZodiacPicker({ onSelect, selectedId, className }: ZodiacPickerProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-3", className)}>
      {ZODIAC_SIGNS.map((sign, i) => {
        const el = ELEMENT_STYLES[sign.element];
        const isSelected = selectedId === sign.id;

        return (
          <motion.button
            key={sign.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRINGS.gentle, delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(sign)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border transition-colors touch-manipulation",
              isSelected
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-white/8 bg-white/3 hover:border-white/15"
            )}
          >
            <span className="text-2xl sm:text-3xl leading-none">{sign.symbol}</span>
            <span className="text-[10px] sm:text-xs text-white/60 leading-tight">{sign.name}</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: el.haloColor + "80" }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
