"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useImmersive } from "./immersive-provider";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { useFeedback } from "@/components/feedback/feedback-provider";
import { navTabs, BADGE_STORAGE_PREFIX, type NavTab } from "./nav-config";
import { cn } from "@/lib/utils";

// Routes that render with the Editorial Daylight palette.
// The nav adapts to match so it doesn't float as a dark bar over cream.
const DAYLIGHT_ROUTES = ["/home", "/decks", "/readings", "/settings", "/paths"];
// Routes that remain dark even though their parent prefix is daylight.
const DARK_EXCEPTIONS = ["/readings/new"];

function isDaylightRoute(pathname: string): boolean {
  if (DARK_EXCEPTIONS.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return false;
  }
  return DAYLIGHT_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export function BottomNav() {
  const pathname = usePathname();
  const daylight = isDaylightRoute(pathname);
  const { state } = useImmersive();
  const { stage } = useOnboarding();
  const { open: openFeedback } = useFeedback();
  const [dismissedBadges, setDismissedBadges] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  // Load dismissed badges from localStorage on mount
  useEffect(() => {
    const dismissed = new Set<string>();
    for (const tab of navTabs) {
      if (tab.badgeKey && localStorage.getItem(BADGE_STORAGE_PREFIX + tab.badgeKey)) {
        dismissed.add(tab.badgeKey);
      }
    }
    setDismissedBadges(dismissed);
  }, []);

  // Filter: visible by stage, exclude desktopOnly
  const visibleTabs = navTabs.filter(
    (tab) => stage >= tab.minStage && !tab.desktopOnly
  );

  function handleTabClick(tab: NavTab) {
    if (tab.badgeKey && !dismissedBadges.has(tab.badgeKey)) {
      localStorage.setItem(BADGE_STORAGE_PREFIX + tab.badgeKey, "1");
      setDismissedBadges((prev) => new Set([...prev, tab.badgeKey!]));
    }
  }

  function handleAction(tab: NavTab) {
    if (tab.actionId === "feedback") {
      openFeedback();
    }
  }

  const indicatorTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 30 };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t lg:hidden",
        daylight
          ? "border-[#E0D5BF]"
          : "bg-card/80 border-white/[0.06]"
      )}
      style={{
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
        background: daylight ? "rgba(251, 247, 238, 0.95)" : undefined,
        backdropFilter: daylight ? "blur(12px)" : undefined,
      }}
      aria-label="Main navigation"
    >
      {visibleTabs.map((tab) => {
        const isActive = !tab.isAction && tab.activePrefixes.some((prefix) =>
          pathname === prefix || pathname.startsWith(prefix + "/")
        );
        const showBadge = tab.badgeKey && !dismissedBadges.has(tab.badgeKey);
        const Icon = tab.icon;

        const accent = daylight ? "#1A1614" : undefined;
        const muted = daylight ? "#7A6E63" : undefined;

        const content = (
          <>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1.5 h-2 w-2 rounded-full ring-2",
                    daylight
                      ? "bg-[#A8863F] ring-[#FBF7EE]"
                      : "bg-gold ring-surface-deep"
                  )}
                />
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            {isActive && (
              <motion.span
                layoutId="nav-indicator"
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full",
                  daylight ? "bg-[#1A1614]" : "bg-gold"
                )}
                transition={indicatorTransition}
              />
            )}
          </>
        );

        const className = cn(
          "relative flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors",
          daylight
            ? isActive
              ? ""
              : ""
            : isActive
            ? "text-gold"
            : "text-white/40 hover:text-white/60"
        );
        const dynStyle = daylight
          ? { color: isActive ? accent : muted }
          : undefined;

        if (tab.isAction) {
          return (
            <button
              key={tab.actionId}
              type="button"
              onClick={() => handleAction(tab)}
              className={className}
              style={dynStyle}
              aria-label={tab.label}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => handleTabClick(tab)}
            className={className}
            style={dynStyle}
            aria-current={isActive ? "page" : undefined}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
