"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleThumbnail } from "./style-thumbnail";
import { Badge } from "@/components/ui/badge";
import type { ArtStyle } from "@/types";

interface StylePickerGridProps {
  presets: ArtStyle[];
  customStyles?: ArtStyle[];
  selectedStyleId?: string | null;
  onSelect: (styleId: string) => void;
  onCreateCustom?: () => void;
}

export function StylePickerGrid({
  presets,
  customStyles = [],
  selectedStyleId,
  onSelect,
  onCreateCustom,
}: StylePickerGridProps) {
  const allStyles = [...presets, ...customStyles];

  return (
    <div className="grid grid-cols-3 gap-3">
      {allStyles.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onSelect(style.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors",
            selectedStyleId === style.id
              ? "bg-accent"
              : "hover:bg-accent/50"
          )}
        >
          <StyleThumbnail
            styleId={style.id}
            previewImages={style.previewImages}
            size="md"
            selected={selectedStyleId === style.id}
          />
          <span className="text-xs font-medium text-center leading-tight">
            {style.name}
          </span>
          {!style.isPreset && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Custom
            </Badge>
          )}
        </button>
      ))}

      {/* Custom slot */}
      {onCreateCustom && (
        <button
          type="button"
          onClick={onCreateCustom}
          className="flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-accent/50"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-[#c9a94e]/50">
            <Plus className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Custom
          </span>
        </button>
      )}
    </div>
  );
}
