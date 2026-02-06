"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles } from "lucide-react";

interface FinalizeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cardCount: number;
  isLoading: boolean;
}

export function FinalizeConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  cardCount,
  isLoading,
}: FinalizeConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalize Your Deck?</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              You&apos;re about to create {cardCount} cards. This will use:
            </p>
            <ul className="list-disc list-inside text-sm">
              <li>{cardCount} card credits</li>
              <li>{cardCount} image credits</li>
            </ul>
            <p className="pt-2">
              Images will be generated for each card. This may take a few minutes.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Go Back
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Deck
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
