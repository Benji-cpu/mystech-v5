"use client";

import { cn } from "@/lib/utils";
import { ART_STYLE_GRADIENTS } from "@/lib/constants";
import {
  Crown,
  Droplets,
  Star,
  Leaf,
  Hexagon,
  Skull,
  Flower2,
  Sun,
  Palette,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Crown,
  Droplets,
  Star,
  Leaf,
  Hexagon,
  Skull,
  Flower2,
  Sun,
};

interface StyleThumbnailProps {
  styleId: string;
  previewImages?: string[];
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const iconSizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function StyleThumbnail({
  styleId,
  previewImages,
  size = "md",
  selected = false,
  onClick,
}: StyleThumbnailProps) {
  const hasImages = previewImages && previewImages.length > 0;
  const gradientConfig = ART_STYLE_GRADIENTS[styleId];
  const IconComponent = gradientConfig
    ? ICON_MAP[gradientConfig.icon] ?? Palette
    : Palette;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg transition-all",
        sizeClasses[size],
        selected
          ? "ring-2 ring-[#c9a94e] ring-offset-2 ring-offset-background"
          : "ring-1 ring-border hover:ring-[#c9a94e]/50",
        onClick && "cursor-pointer"
      )}
    >
      {hasImages ? (
        <img
          src={previewImages[0]}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-gradient-to-br",
            gradientConfig?.gradient ?? "from-gray-700 to-gray-900"
          )}
        >
          <IconComponent
            className={cn(iconSizes[size], "text-white/70")}
          />
        </div>
      )}
    </button>
  );
}
