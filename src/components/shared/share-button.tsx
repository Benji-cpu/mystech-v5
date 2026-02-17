"use client";

import { useState } from "react";
import { Share2, Copy, Check, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareButtonProps {
  shareEndpoint: string;
  revokeEndpoint: string;
  contentType: "reading" | "deck" | "art style";
  existingShareToken?: string | null;
}

export function ShareButton({
  shareEndpoint,
  revokeEndpoint,
  contentType,
  existingShareToken,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoked, setRevoked] = useState(false);

  async function generateLink() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(shareEndpoint, { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Failed to generate share link");
        return;
      }

      setShareUrl(data.data.shareUrl);
      setRevoked(false);
    } catch {
      setError("Failed to generate share link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function revokeLink() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(revokeEndpoint, { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Failed to revoke share link");
        return;
      }

      setShareUrl(null);
      setRevoked(true);
    } catch {
      setError("Failed to revoke share link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: input select
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && !shareUrl && !revoked) {
      generateLink();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {contentType}</DialogTitle>
          <DialogDescription>
            Share this {contentType} with others using the link below. Anyone
            with the link can view it.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">
            {shareUrl ? "Revoking..." : "Generating share link..."}
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {revoked && !loading && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share link has been revoked. The {contentType} is no longer
              accessible to others.
            </p>
            <Button variant="outline" size="sm" onClick={generateLink}>
              <Share2 className="h-4 w-4 mr-1" />
              Generate New Link
            </Button>
          </div>
        )}

        {shareUrl && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-xs"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={revokeLink}
            >
              <Link2Off className="h-4 w-4 mr-1" />
              Revoke Sharing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
