"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChronicleInterests } from "@/types";

// ── Data ─────────────────────────────────────────────────────────────────────

const SPIRITUAL_INTERESTS = [
  "Astrology / Zodiac",
  "Tarot & Divination",
  "Numerology",
  "I Ching / Chinese Traditions",
  "Kabbalah / Mysticism",
  "Chakras / Energy Work",
  "Crystals / Herbalism",
  "Shamanism / Nature Spirits",
];

const LIFE_DOMAINS = [
  "Relationships & Love",
  "Career & Purpose",
  "Health & Wellness",
  "Creativity & Expression",
  "Spiritual Growth",
  "Personal Development",
  "Family & Home",
  "Finances & Abundance",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChronicleInterestsProps {
  selected: ChronicleInterests;
  onChange: (interests: ChronicleInterests) => void;
  className?: string;
}

// ── Chip ──────────────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

function Chip({ label, isSelected, onToggle }: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
        "border focus:outline-none",
        isSelected
          ? "bg-gold/20 border-gold/50 text-gold shadow-[0_0_12px_rgba(201,169,78,0.15)]"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white/90"
      )}
    >
      {label}
    </motion.button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface ChipSectionProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}

function ChipSection({ title, items, selected, onToggle }: ChipSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            isSelected={selected.includes(item)}
            onToggle={() => onToggle(item)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChronicleInterests({
  selected,
  onChange,
  className,
}: ChronicleInterestsProps) {
  function toggleSpiritual(item: string) {
    const next = selected.spiritual.includes(item)
      ? selected.spiritual.filter((s) => s !== item)
      : [...selected.spiritual, item];
    onChange({ ...selected, spiritual: next });
  }

  function toggleLifeDomain(item: string) {
    const next = selected.lifeDomains.includes(item)
      ? selected.lifeDomains.filter((d) => d !== item)
      : [...selected.lifeDomains, item];
    onChange({ ...selected, lifeDomains: next });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <ChipSection
        title="Spiritual Interests"
        items={SPIRITUAL_INTERESTS}
        selected={selected.spiritual}
        onToggle={toggleSpiritual}
      />
      <ChipSection
        title="Life Domains"
        items={LIFE_DOMAINS}
        selected={selected.lifeDomains}
        onToggle={toggleLifeDomain}
      />
    </div>
  );
}
