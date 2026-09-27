/**
 * The app's public origin, with no trailing slash.
 *
 * Trimmed because the production value of NEXT_PUBLIC_APP_URL once ended in a
 * newline: every copied share link carried it, and so did the Stripe
 * return_url. Read the origin from here, never from process.env directly.
 */
export const APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/+$/, "") ||
  "https://mystech-v5.vercel.app";
