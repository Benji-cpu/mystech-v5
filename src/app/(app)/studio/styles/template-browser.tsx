"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  ImagePlus,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ArtStyle, StyleCategory } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

interface TemplateBrowserProps {
  styles: ArtStyle[];
  currentUserId: string;
}

type CategoryFilter = "all" | "my-styles" | StyleCategory;

interface CategoryTab {
  id: CategoryFilter;
  label: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_TABS: CategoryTab[] = [
  { id: "all", label: "All" },
  { id: "my-styles", label: "My Styles" },
  { id: "classical", label: "Classical" },
  { id: "modern", label: "Modern" },
  { id: "cultural", label: "Cultural" },
  { id: "illustration", label: "Illustration" },
  { id: "photography", label: "Photography" },
  { id: "period", label: "Period" },
  { id: "nature", label: "Nature" },
];

// ── Style Card ─────────────────────────────────────────────────────────────

interface StyleBrowserCardProps {
  style: ArtStyle;
  currentUserId: string;
}

function StyleBrowserCard({ style, currentUserId }: StyleBrowserCardProps) {
  const isOwned = style.createdBy === currentUserId;
  const isPreset = style.isPreset;

  const badge = isPreset
    ? { label: "Preset", variant: "secondary" as const }
    : isOwned
    ? { label: "Custom", variant: "outline" as const }
    : { label: "Shared", variant: "default" as const };

  const previewImage =
    Array.isArray(style.previewImages) && style.previewImages.length > 0
      ? style.previewImages[0]
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-colors hover:border-gold/30 hover:bg-white/[0.08]"
    >
      {/* Preview thumbnail */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-indigo-900/30">
        {previewImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewImage}
            alt={style.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles className="h-8 w-8 text-white/10" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-white/90 truncate">
            {style.name}
          </span>
          <Badge
            variant={badge.variant}
            className="text-[10px] px-1.5 py-0 shrink-0"
          >
            {badge.label}
          </Badge>
        </div>
        {style.description && (
          <p className="text-xs text-white/40 line-clamp-2">
            {style.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-7 border-white/10 hover:border-gold/40"
        >
          <Link href={`/decks/new?style=${style.id}`}>Use</Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="flex-1 text-xs h-7 hover:bg-white/5"
        >
          <Link href={`/studio/styles/${style.id}`}>Customize</Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export function TemplateBrowser({
  styles,
  currentUserId,
}: TemplateBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStyles = useMemo(() => {
    let result = styles;

    // Category filter
    if (activeCategory === "my-styles") {
      result = result.filter((s) => s.createdBy === currentUserId);
    } else if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }

    // Search filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [styles, activeCategory, searchQuery, currentUserId]);

  return (
    <div className="space-y-6">
      {/* Top actions row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <Input
            placeholder="Search styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 placeholder:text-white/30 text-white/80 focus-visible:border-gold/40 focus-visible:ring-0"
          />
        </div>

        {/* Create from Reference CTA */}
        <Button
          asChild
          className="bg-gradient-to-r from-gold to-gold-bright text-black font-semibold hover:shadow-lg hover:shadow-gold/20 shrink-0"
        >
          <Link href="/studio/styles/new">
            <ImagePlus className="h-4 w-4" />
            Create from Reference Images
          </Link>
        </Button>
      </div>

      {/* Category tabs — horizontal scroll on mobile */}
      <div className="-mx-4 sm:mx-0">
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 sm:px-0 pb-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  activeCategory === tab.id
                    ? "bg-gold text-black shadow-lg shadow-gold/20"
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">
          {filteredStyles.length === 0
            ? "No styles found"
            : `${filteredStyles.length} style${filteredStyles.length === 1 ? "" : "s"}`}
        </p>
        <button className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      {/* Grid */}
      {filteredStyles.length > 0 ? (
        <motion.div
          key={`${activeCategory}-${searchQuery}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredStyles.map((style) => (
            <StyleBrowserCard
              key={style.id}
              style={style}
              currentUserId={currentUserId}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Sparkles className="h-10 w-10 text-white/10" />
          <p className="text-white/30 text-sm">
            {searchQuery
              ? `No styles match "${searchQuery}"`
              : activeCategory === "my-styles"
              ? "You haven't created any custom styles yet"
              : `No styles in the ${activeCategory} category yet`}
          </p>
          {activeCategory === "my-styles" && !searchQuery && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-2 border-white/10 text-white/60 hover:border-gold/40"
            >
              <Link href="/studio/styles/new">
                <ImagePlus className="h-4 w-4" />
                Create your first style
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
