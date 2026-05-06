import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MysTech",
    short_name: "MysTech",
    description:
      "Personalised oracle decks and AI-guided readings.",
    start_url: "/",
    display: "standalone",
    background_color: "#15110E",
    theme_color: "#15110E",
    icons: [
      { src: "/brand/logo-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
