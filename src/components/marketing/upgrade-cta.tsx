"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GoldButton } from "@/components/ui/gold-button";
import { startCheckout } from "@/lib/stripe/start-checkout";

interface UpgradeCtaProps {
  label: string;
  className?: string;
}

export function UpgradeCta({ label, className }: UpgradeCtaProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const result = await startCheckout();
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
    }
  };

  return (
    <GoldButton onClick={onClick} loading={loading} className={className}>
      {loading ? "Redirecting…" : label}
    </GoldButton>
  );
}
