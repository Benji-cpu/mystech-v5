"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, Share2, Twitter, Mail, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import {
  twitterIntent,
  whatsappIntent,
  emailIntent,
  canUseWebShare,
  triggerWebShare,
} from "@/lib/sharing/intent-urls";
import { captureClient } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

type Props = {
  readingId: string;
  spreadType?: string;
  captureTargetRef?: React.RefObject<HTMLElement | null>;
};

export function ReadingCompleteShare({ readingId, spreadType, captureTargetRef }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      setGenerating(true);
      try {
        const res = await fetch(`/api/readings/${readingId}/share`, { method: "POST" });
        const data = await res.json();
        if (!cancelled && data.success) {
          setShareUrl(data.data.shareUrl);
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    }
    void generate();
    return () => {
      cancelled = true;
    };
  }, [readingId]);

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      captureClient(ANALYTICS_EVENTS.READING_SHARED, {
        method: "copy_link",
        reading_id: readingId,
        spread_type: spreadType,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please try again");
    }
  }

  async function download() {
    const target = captureTargetRef?.current;
    if (!target) {
      toast.error("Nothing to capture yet");
      return;
    }
    setDownloading(true);
    try {
      const dataUrl = await toPng(target, {
        backgroundColor: "#0a0614",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `mystech-reading-${readingId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
      captureClient(ANALYTICS_EVENTS.READING_DOWNLOADED, {
        reading_id: readingId,
        spread_type: spreadType,
      });
    } catch {
      toast.error("Couldn't create image. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function webShare() {
    if (!shareUrl) return;
    const ok = await triggerWebShare({
      url: shareUrl,
      title: "A reading from MysTech",
      text: "The cards had something to say. Take a look ✦",
    });
    if (ok) {
      captureClient(ANALYTICS_EVENTS.READING_SHARED, {
        method: "web_share",
        reading_id: readingId,
        spread_type: spreadType,
      });
    }
  }

  function handleIntent(method: "twitter" | "whatsapp" | "email") {
    captureClient(ANALYTICS_EVENTS.READING_SHARED, {
      method,
      reading_id: readingId,
      spread_type: spreadType,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium tracking-wide text-white/80">
          Your reading is complete
        </h3>
      </div>
      <p className="mb-5 text-sm text-white/50">
        Carry it with you — or share what the cards had to say.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={copy}
          disabled={!shareUrl || generating}
          variant="outline"
          size="sm"
          className="flex-1 min-w-[120px]"
        >
          {copied ? (
            <>
              <Check className="mr-1.5 h-4 w-4 text-green-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-4 w-4" />
              {generating ? "Preparing link..." : "Copy link"}
            </>
          )}
        </Button>
        {captureTargetRef && (
          <Button
            onClick={download}
            disabled={downloading}
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px]"
          >
            <Download className="mr-1.5 h-4 w-4" />
            {downloading ? "Creating..." : "Download"}
          </Button>
        )}
      </div>

      {shareUrl && (
        <div className="mt-3 flex flex-wrap gap-2">
          {canUseWebShare() && (
            <Button onClick={webShare} variant="ghost" size="sm">
              <Share2 className="mr-1.5 h-4 w-4" />
              Share...
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <a
              href={twitterIntent({ url: shareUrl, text: "A reading from MysTech ✦" })}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => handleIntent("twitter")}
            >
              <Twitter className="mr-1.5 h-4 w-4" />
              Twitter
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={whatsappIntent({ url: shareUrl, text: "A reading from MysTech" })}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => handleIntent("whatsapp")}
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={emailIntent({ url: shareUrl, text: "A reading from MysTech" })}
              onClick={() => handleIntent("email")}
            >
              <Mail className="mr-1.5 h-4 w-4" />
              Email
            </a>
          </Button>
        </div>
      )}
    </motion.div>
  );
}
