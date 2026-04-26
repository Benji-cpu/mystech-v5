"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PostHogProvider } from "@/lib/analytics/client-provider";
import { UpgradeModal } from "@/components/billing/upgrade-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <PostHogProvider>
          {children}
          <UpgradeModal />
        </PostHogProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
