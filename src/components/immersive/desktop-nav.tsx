"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useImmersive } from "./immersive-provider";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { useFeedback } from "@/components/feedback/feedback-provider";
import { navTabs, BADGE_STORAGE_PREFIX, type NavTab } from "./nav-config";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * The desktop rail is a fixed 64px and never changes width.
 *
 * It used to expand to 200px on hover, which floated an opaque panel over the
 * left edge of whatever was on screen — a chronicle bubble, a reading header.
 * Labels now appear as a pill beside the hovered icon instead, so the rail
 * never covers content and the page never reflows.
 *
 * 64px is mirrored by `--nav-rail` in globals.css, which is what every
 * full-bleed (`fixed inset-0`) surface insets by. Change both together.
 */
export function DesktopNav() {
  const pathname = usePathname();
  const { state } = useImmersive();
  const { stage } = useOnboarding();
  const { open: openFeedback } = useFeedback();
  const [dismissedBadges, setDismissedBadges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dismissed = new Set<string>();
    for (const tab of navTabs) {
      if (tab.badgeKey && localStorage.getItem(BADGE_STORAGE_PREFIX + tab.badgeKey)) {
        dismissed.add(tab.badgeKey);
      }
    }
    setDismissedBadges(dismissed);
  }, []);

  // In focus mode, render only the feedback shortcut so users can always reach it.
  const focusMode = state.focusMode;

  const visibleTabs = focusMode
    ? navTabs.filter((tab) => tab.actionId === "feedback")
    : navTabs.filter((tab) => stage >= tab.minStage);

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

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 bottom-0 z-50 w-16 hidden lg:flex flex-col border-r bg-card/95 border-border backdrop-blur-md",
        focusMode && "opacity-60 hover:opacity-100 transition-opacity"
      )}
      aria-label="Main navigation"
    >
      {/* Logo area */}
      {!focusMode && (
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-border">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: "color-mix(in oklab, var(--accent-gold) 15%, transparent)" }}
          >
            <span className="text-sm font-display font-bold" style={{ color: "var(--accent-gold)" }}>
              M
            </span>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 flex flex-col gap-1 py-4">
        {visibleTabs.map((tab) => {
          const isActive =
            !tab.isAction &&
            tab.activePrefixes.some(
              (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
            );

          return (
            <RailItem
              key={tab.isAction ? tab.actionId : tab.href}
              tab={tab}
              isActive={isActive}
              showBadge={Boolean(tab.badgeKey && !dismissedBadges.has(tab.badgeKey))}
              onSelect={() => (tab.isAction ? handleAction(tab) : handleTabClick(tab))}
            />
          );
        })}
      </div>

      {/* Theme toggle pinned to bottom */}
      {!focusMode && (
        <div className="px-2 py-3 border-t border-border flex items-center justify-center">
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
}

interface RailItemProps {
  tab: NavTab;
  isActive: boolean;
  showBadge: boolean;
  onSelect: () => void;
}

/** One icon in the rail, with its label revealed beside it on hover or focus. */
function RailItem({ tab, isActive, showBadge, onSelect }: RailItemProps) {
  const [revealed, setRevealed] = useState(false);
  const Icon = tab.icon;

  const triggerClassName = cn(
    "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
    isActive
      ? "bg-foreground text-background"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  );

  const body = (
    <>
      <div className="relative">
        <Icon className="w-5 h-5" />
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        )}
      </div>
      {/* The pill is decorative — this is what names the control. */}
      <span className="sr-only">{tab.label}</span>
    </>
  );

  return (
    <div
      className="relative flex justify-center"
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
    >
      {tab.isAction ? (
        <button type="button" onClick={onSelect} className={triggerClassName}>
          {body}
        </button>
      ) : (
        <Link
          href={tab.href}
          onClick={onSelect}
          className={triggerClassName}
          aria-current={isActive ? "page" : undefined}
        >
          {body}
        </Link>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.span
            aria-hidden
            // y is animated rather than set with a class: Framer's inline
            // transform would otherwise wipe out `-translate-y-1/2`.
            initial={{ opacity: 0, x: -6, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{
              opacity: 0,
              x: -4,
              y: "-50%",
              transition: { type: "spring", stiffness: 500, damping: 40 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-none absolute left-full top-1/2 ml-2 z-10 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm"
          >
            {tab.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
