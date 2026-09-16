import type { NextConfig } from "next";

/**
 * Legacy URLs from before the 2026-06 IA overhaul. These were twelve one-line
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
  { source: "/chronicle/today", destination: "/today" },
  { source: "/readings", destination: "/story" },
  { source: "/decks/living", destination: "/chronicle" },
  { source: "/studio", destination: "/decks" },
  { source: "/studio/styles", destination: "/decks/styles" },
  { source: "/studio/styles/:styleId", destination: "/decks/styles/:styleId/edit" },
  // `/art-styles/new` must precede `/art-styles/:styleId` or "new" is read as an id.
  { source: "/art-styles", destination: "/decks/styles" },
  { source: "/art-styles/new", destination: "/decks/styles/new" },
  { source: "/art-styles/:styleId/edit", destination: "/decks/styles/:styleId/edit" },
  { source: "/art-styles/:styleId", destination: "/decks/styles/:styleId" },
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
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default nextConfig;
