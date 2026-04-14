"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useImmersive } from "./immersive-provider";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { useFeedback } from "@/components/feedback/feedback-provider";
import { navTabs, BADGE_STORAGE_PREFIX, type NavTab } from "./nav-config";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  const pathname = usePathname();
  const { state } = useImmersive();
  const { stage } = useOnboarding();
  const { open: openFeedback } = useFeedback();
  const [hovered, setHovered] = useState(false);
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

  if (state.focusMode) return null;

  const visibleTabs = navTabs.filter((tab) => stage >= tab.minStage);

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
    <motion.nav
      className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col bg-card/80 border-r border-white/[0.06]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ width: hovered ? 200 : 64 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06] overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gold/20 flex items-center justify-center">
            <span className="text-gold text-sm font-display font-bold">M</span>
          </div>
          <motion.span
            className="text-sm font-display font-semibold text-foreground/80 whitespace-nowrap"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            MysTech
          </motion.span>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 flex flex-col gap-1 px-2 py-4">
        {visibleTabs.map((tab) => {
          const isActive = !tab.isAction && tab.activePrefixes.some(
            (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
          );
          const showBadge = tab.badgeKey && !dismissedBadges.has(tab.badgeKey);
          const Icon = tab.icon;

          const itemClassName = cn(
            "relative flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] transition-colors overflow-hidden",
            isActive
              ? "bg-white/[0.08] text-gold"
              : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
          );

          const content = (
            <>
              <div className="relative shrink-0">
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold ring-2 ring-card" />
                )}
              </div>
              <motion.span
                className="text-sm font-medium whitespace-nowrap"
                animate={{ opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.15 }}
              >
                {tab.label}
              </motion.span>
            </>
          );

          if (tab.isAction) {
            return (
              <button
                key={tab.actionId}
                type="button"
                onClick={() => handleAction(tab)}
                className={itemClassName}
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
              className={itemClassName}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
