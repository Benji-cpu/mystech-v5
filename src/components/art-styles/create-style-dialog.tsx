"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomStyleForm } from "./custom-style-form";
import type { ArtStyle } from "@/types";

interface CreateStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (style: ArtStyle) => void;
}

export function CreateStyleDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateStyleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Style</DialogTitle>
          <DialogDescription>
            Define a custom art style for your oracle cards.
          </DialogDescription>
        </DialogHeader>
        <CustomStyleForm
          redirectOnSuccess={false}
          onSuccess={(style) => {
            onCreated?.(style);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
