"use client";

import posthog from "posthog-js";
import type { AnalyticsEvent, AnalyticsProperties } from "./events";

export function captureClient(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch (err) {
    console.error("[analytics] capture failed:", err);
  }
}
