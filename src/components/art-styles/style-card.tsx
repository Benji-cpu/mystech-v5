import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StyleThumbnail } from "./style-thumbnail";
import type { ArtStyle } from "@/types";

interface StyleCardProps {
  style: ArtStyle;
  currentUserId?: string;
  selected?: boolean;
  onClick?: () => void;
}

function getStyleBadge(style: ArtStyle, currentUserId?: string) {
  if (style.isPreset) return { label: "Preset", variant: "secondary" as const };
  if (style.createdBy === currentUserId)
    return { label: "Custom", variant: "outline" as const };
  return { label: "Shared", variant: "default" as const };
}

export function StyleCard({
  style,
  currentUserId,
  selected,
  onClick,
}: StyleCardProps) {
  const badge = getStyleBadge(style, currentUserId);

  const content = (
    <div className="flex flex-col items-center gap-2">
      <StyleThumbnail
        styleId={style.id}
        previewImages={style.previewImages}
        size="lg"
        selected={selected}
        onClick={onClick}
      />
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-white/90">{style.name}</span>
        <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0">
          {badge.label}
        </Badge>
      </div>
    </div>
  );

  if (onClick) {
    return content;
  }

  return (
    <Link
      href={`/art-styles/${style.id}`}
      className="group block rounded-2xl bg-white/5 border border-white/10 p-3 transition-colors hover:border-gold/30 hover:bg-white/[0.08]"
    >
      {content}
    </Link>
  );
}
