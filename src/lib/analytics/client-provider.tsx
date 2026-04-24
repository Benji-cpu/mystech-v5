"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

function initPostHog() {
  if (typeof window === "undefined") return false;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;
  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      autocapture: false,
    });
  }
  return true;
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

function IdentityTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (status === "authenticated" && session?.user) {
      const user = session.user as { id?: string; email?: string; name?: string };
      const id = user.id ?? user.email;
      if (id) {
        posthog.identify(id, {
          email: user.email,
          name: user.name,
        });
      }
    } else if (status === "unauthenticated") {
      posthog.reset();
    }
  }, [session, status]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const enabled = typeof window !== "undefined" && initPostHog();

  if (!enabled) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PageViewTracker />
      <IdentityTracker />
      {children}
    </PHProvider>
  );
}
