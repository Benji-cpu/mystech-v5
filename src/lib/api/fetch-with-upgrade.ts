"use client";

import { showUpgradeModal } from "@/components/billing/upgrade-modal";
import type { ApiErrorCode } from "@/types";

type ApiErrorPayload = {
  success: false;
  error: string;
  code?: ApiErrorCode;
};

const UPGRADE_CODES = new Set<ApiErrorCode>(["USAGE_LIMIT_EXCEEDED", "PLAN_RESTRICTION"]);

function reasonFromError(payload: ApiErrorPayload) {
  if (payload.code === "PLAN_RESTRICTION") return "spread_restriction";
  if (payload.error.toLowerCase().includes("first-day")) return "welcome_grant_exhausted";
  if (payload.error.toLowerCase().includes("credit")) return "credits";
  return "daily_reading_limit";
}

/**
 * Fetch wrapper that auto-triggers the UpgradeModal when the server returns
 * a usage/plan error via the `code` field. Returns the Response so callers
 * can still inspect non-upgrade errors normally.
 */
export async function fetchWithUpgrade(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);
  if (response.ok) return response;

  // Only try to parse JSON error for 402/403 — other failures handled by caller
  if (response.status === 402 || response.status === 403) {
    try {
      const clone = response.clone();
      const payload = (await clone.json()) as ApiErrorPayload;
      if (payload.code && UPGRADE_CODES.has(payload.code)) {
        showUpgradeModal({
          reason: reasonFromError(payload) as Parameters<typeof showUpgradeModal>[0]["reason"],
          message: payload.error,
        });
      }
    } catch {
      // Non-JSON response; fall through
    }
  }
  return response;
}
