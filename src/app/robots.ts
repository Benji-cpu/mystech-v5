import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/shared/"],
        disallow: [
          "/api/",
          "/today",
          "/story",
          "/settings/",
          "/profile",
          "/studio/",
          "/admin/",
          "/onboarding/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
