"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props =
  | { deckId: string; mode: "forge-assets"; hasBack: boolean; hasBox: boolean }
  | { deckId: string; mode: "checkout"; hasBack: true; hasBox: true };

export function PrintCheckoutCTA(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function forgeAssets() {
    setLoading(true);
    try {
      const res = await fetch(`/api/decks/${props.deckId}/print/forge-back-and-box`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error ?? "Couldn't generate assets");
        return;
      }
      toast.success("Forged. Refreshing…");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch(`/api/decks/${props.deckId}/print/checkout`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        toast.error(data?.error ?? "Couldn't start checkout");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  if (props.mode === "forge-assets") {
    const label = props.hasBack && props.hasBox
      ? "Regenerate assets"
      : props.hasBack
        ? "Generate box art"
        : props.hasBox
          ? "Generate card back"
          : "Generate card back & box art";
    return (
      <Button onClick={forgeAssets} disabled={loading} className="mt-4 w-full">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        <span className="ml-2">{label}</span>
      </Button>
    );
  }

  return (
    <Button onClick={checkout} disabled={loading} className="mt-5 w-full">
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      <span className={loading ? "ml-2" : ""}>Get your printed deck</span>
    </Button>
  );
}
