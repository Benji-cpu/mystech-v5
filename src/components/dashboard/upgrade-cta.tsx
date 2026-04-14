"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GoldButton } from "@/components/ui/gold-button";
import { toast } from "sonner";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_DASHBOARD } from "@/components/guide/lyra-constants";

export function UpgradeCta() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <GlassPanel className="mt-6 border-gold/30 p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <LyraSigil size="lg" state="dormant" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white/90">
            {LYRA_DASHBOARD.upgradeCta.title}
          </h3>
          <p className="text-sm text-white/40">
            {LYRA_DASHBOARD.upgradeCta.description}
          </p>
        </div>
        <GoldButton onClick={handleUpgrade} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Redirecting...
            </>
          ) : (
            "Go Pro - $4.99/mo"
          )}
        </GoldButton>
      </div>
    </GlassPanel>
  );
}
