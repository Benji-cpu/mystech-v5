import { PostHog } from "posthog-node";
import type { AnalyticsEvent, AnalyticsProperties } from "./events";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (client) return client;
  const apiKey = process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;
  client = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export function captureServer(
  event: AnalyticsEvent,
  distinctId: string,
  properties?: AnalyticsProperties,
): void {
  const ph = getClient();
  if (!ph) return;
  try {
    ph.capture({ distinctId, event, properties });
  } catch (err) {
    console.error("[analytics] capture failed:", err);
  }
}

export function identifyServer(
  distinctId: string,
  properties?: AnalyticsProperties,
): void {
  const ph = getClient();
  if (!ph) return;
  try {
    ph.identify({ distinctId, properties });
  } catch (err) {
    console.error("[analytics] identify failed:", err);
  }
}

export async function flushAnalytics(): Promise<void> {
  const ph = getClient();
  if (!ph) return;
  try {
    await ph.flush();
  } catch (err) {
    console.error("[analytics] flush failed:", err);
  }
}
