"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

interface FloatingDraftButtonProps {
  cardCount: number;
  hasUpdates: boolean;
  onClick: () => void;
}

export function FloatingDraftButton({
  cardCount,
  hasUpdates,
  onClick,
}: FloatingDraftButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-6 z-40 shadow-lg",
        hasUpdates && "animate-pulse"
      )}
      size="lg"
    >
      <Eye className="w-4 h-4 mr-2" />
      View Draft ({cardCount} cards)
      {hasUpdates && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#c9a94e] rounded-full" />
      )}
    </Button>
  );
}
