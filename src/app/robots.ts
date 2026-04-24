import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mystech-v5.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/shared/"],
        disallow: [
          "/api/",
          "/home",
          "/dashboard",
          "/settings/",
          "/profile",
          "/studio/",
          "/admin/",
          "/onboarding/",
          "/mock/",
          "/lab/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
