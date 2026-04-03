"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleThumbnail } from "@/components/art-styles/style-thumbnail";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ArtStyle, StyleCategory } from "@/types";

interface EnhancedStylePickerProps {
  styles: ArtStyle[];
  selectedStyleId?: string | null;
  onSelect: (styleId: string) => void;
  className?: string;
}

const CATEGORY_TABS: { id: "all" | StyleCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "classical", label: "Classical" },
  { id: "modern", label: "Modern" },
  { id: "cultural", label: "Cultural" },
  { id: "illustration", label: "Illustration" },
  { id: "photography", label: "Photo" },
  { id: "period", label: "Period" },
  { id: "nature", label: "Nature" },
];

export function EnhancedStylePicker({
  styles,
  selectedStyleId,
  onSelect,
  className,
}: EnhancedStylePickerProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | StyleCategory>(
    "all"
  );

  // Separate custom styles and preset styles
  const customStyles = useMemo(
    () => styles.filter((s) => !s.isPreset),
    [styles]
  );
  const filteredStyles = useMemo(() => {
    const base =
      activeCategory === "all"
        ? styles
        : styles.filter((s) => s.category === activeCategory);
    return base;
  }, [styles, activeCategory]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Category tabs — horizontal scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all",
                activeCategory === tab.id
                  ? "bg-[#c9a94e] text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* My Styles row (if user has custom styles) */}
      {customStyles.length > 0 && activeCategory === "all" && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1.5">
            My Styles
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {customStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => onSelect(style.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 rounded-lg shrink-0 transition-colors",
                  selectedStyleId === style.id
                    ? "bg-[#c9a94e]/10"
                    : "hover:bg-white/5"
                )}
              >
                <div className="relative">
                  <StyleThumbnail
                    styleId={style.id}
                    previewImages={style.previewImages}
                    size="sm"
                    selected={selectedStyleId === style.id}
                  />
                  {selectedStyleId === style.id && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#c9a94e] flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-black" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">
                  {style.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Style grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {filteredStyles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors",
              selectedStyleId === style.id
                ? "bg-[#c9a94e]/10"
                : "hover:bg-white/5"
            )}
          >
            <div className="relative">
              <StyleThumbnail
                styleId={style.id}
                previewImages={style.previewImages}
                size="md"
                selected={selectedStyleId === style.id}
              />
              {selectedStyleId === style.id && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#c9a94e] flex items-center justify-center">
                  <Check className="h-3 w-3 text-black" />
                </div>
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium text-center leading-tight",
                selectedStyleId === style.id && "text-[#c9a94e]"
              )}
            >
              {style.name}
            </span>
            {!style.isPreset && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                Custom
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Customize in Studio link */}
      {selectedStyleId && (
        <div className="flex justify-center pt-1">
          <Link
            href={`/studio/styles/${selectedStyleId}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Settings2 className="h-3 w-3" />
            Customize in Studio
          </Link>
        </div>
      )}
    </div>
  );
}
