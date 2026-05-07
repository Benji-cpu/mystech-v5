"use client";

import { useEffect, useRef } from "react";

/**
 * Fire-and-forget POST to /api/daily-card/open on mount. Used by /daily so a
 * user landing from the email link is counted as an opener (advances streak,
 * sets openedAt). Idempotent server-side per local day.
 */
export function DailyCardOpenTracker({ deliveryId }: { deliveryId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch("/api/daily-card/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryId }),
      keepalive: true,
    }).catch(() => {});
  }, [deliveryId]);
  return null;
}
