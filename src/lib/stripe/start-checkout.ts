"use client";

export type StartCheckoutResult =
  | { ok: true }
  | { ok: false; error: string };

export async function startCheckout(): Promise<StartCheckoutResult> {
  try {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return { ok: true };
    }
    return { ok: false, error: data.error ?? "Failed to start checkout" };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
