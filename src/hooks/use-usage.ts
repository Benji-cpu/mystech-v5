"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { UsageStatus } from "@/types";

const WARNING_SHOWN_KEY = "mystech_credit_warning_shown";

export function useUsage() {
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      const json = await res.json();
      if (json.success) {
        setUsage(json.data);
        setError(null);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Failed to load usage data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, loading, error, refetch: fetchUsage };
}

/**
 * Check remaining credits and show a warning toast once per session
 * when <=20% remaining. Call this after successful billable operations.
 */
export function checkCreditWarning(usage: UsageStatus | null) {
  if (!usage || usage.plan === "admin") return;
  if (typeof window === "undefined") return;

  const { credits } = usage;
  if (!isFinite(credits.limit) || credits.limit === 0) return;

  const pctRemaining = credits.remaining / credits.limit;
  if (pctRemaining > 0.2) return;

  // Only show once per session
  if (sessionStorage.getItem(WARNING_SHOWN_KEY)) return;
  sessionStorage.setItem(WARNING_SHOWN_KEY, "true");

  toast.warning(`You have ${credits.remaining} credit${credits.remaining !== 1 ? "s" : ""} remaining`);
}
