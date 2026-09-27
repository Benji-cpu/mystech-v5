import type { NextConfig } from "next";

/**
 * Legacy URLs from before the 2026-06 IA overhaul. These were one-line
 * `page.tsx` files whose entire body was `redirect(...)` — each one a route,
 * a server render and a file to keep in your head. Config redirects do the
 * same job at the edge, and query strings carry over on their own.
 *
 * Routes that have to look something up before they know where to send you
 * (`/daily?d=`, `/studio/cards/[cardId]`, `/chronicle`) stay as pages.
 */
const legacyRedirects = [
  { source: "/home", destination: "/today" },
  { source: "/dashboard", destination: "/today" },
  { source: "/chronicle/today", destination: "/chronicle" },
  { source: "/readings", destination: "/story" },
  { source: "/decks/living", destination: "/chronicle" },
  { source: "/studio", destination: "/decks" },
  { source: "/studio/styles/:path*", destination: "/decks" },
  { source: "/art-styles/:path*", destination: "/decks" },
];

/**
 * Features removed on 2026-09-27 (Ben's call: all had ~zero use). Their pages
 * are gone; the URLs land somewhere live instead of a 404. The DB tables
 * behind them are still there — dropping them is a separate decision.
 */
const removedFeatureRedirects = [
  // Paths, circles, practices
  { source: "/paths/:path*", destination: "/today" },
  // Style studio (custom art styles)
  { source: "/decks/styles/:path*", destination: "/decks" },
  { source: "/shared/art-styles/:path*", destination: "/" },
  // Print
  { source: "/decks/:deckId/print", destination: "/decks/:deckId" },
  { source: "/orders/:path*", destination: "/decks" },
  { source: "/admin/print-orders", destination: "/admin" },
  // Journey mode — deck creation is the one form at /decks/new now
  { source: "/decks/new/journey/:path*", destination: "/decks/new" },
  { source: "/decks/new/simple", destination: "/decks/new" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [...legacyRedirects, ...removedFeatureRedirects].map((r) => ({
      ...r,
      permanent: true,
    }));
  },
};

export default nextConfig;
