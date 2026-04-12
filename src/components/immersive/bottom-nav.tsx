"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Map, Layers } from "lucide-react";
import { useImmersive } from "./immersive-provider";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pathname prefixes that mark this tab as active */
  activePrefixes: string[];
  /** Minimum onboarding stage to show this tab */
  minStage: number;
  /** Storage key for badge dismissal */
  badgeKey?: string;
}

const BADGE_STORAGE_PREFIX = "mystech:dismissed-nav-badges:";

const tabs: Tab[] = [
  { href: "/home", label: "Home", icon: Home, activePrefixes: ["/home", "/dashboard"], minStage: 0 },
  { href: "/readings/quick", label: "Draw", icon: Sparkles, activePrefixes: ["/readings"], minStage: 0 },
  { href: "/decks", label: "Decks", icon: Layers, activePrefixes: ["/decks", "/chronicle"], minStage: 2, badgeKey: "decks" },
  { href: "/paths", label: "Paths", icon: Map, activePrefixes: ["/paths"], minStage: 3, badgeKey: "paths" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { state } = useImmersive();
  const { stage } = useOnboarding();
  const [dismissedBadges, setDismissedBadges] = useState<Set<string>>(new Set());

  // Load dismissed badges from localStorage on mount
  useEffect(() => {
    const dismissed = new Set<string>();
    for (const tab of tabs) {
      if (tab.badgeKey && localStorage.getItem(BADGE_STORAGE_PREFIX + tab.badgeKey)) {
        dismissed.add(tab.badgeKey);
      }
    }
    setDismissedBadges(dismissed);
  }, []);

  // Completely unmount during focus mode
  if (state.focusMode) return null;

  const visibleTabs = tabs.filter((tab) => stage >= tab.minStage);

  function handleTabClick(tab: Tab) {
    if (tab.badgeKey && !dismissedBadges.has(tab.badgeKey)) {
      localStorage.setItem(BADGE_STORAGE_PREFIX + tab.badgeKey, "1");
      setDismissedBadges((prev) => new Set([...prev, tab.badgeKey!]));
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/5 backdrop-blur-xl border-t border-white/10"
      style={{ height: 64, paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.activePrefixes.some((prefix) =>
          pathname === prefix || pathname.startsWith(prefix + "/")
        );
        const showBadge = tab.badgeKey && !dismissedBadges.has(tab.badgeKey);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors",
              isActive ? "text-[#c9a94e]" : "text-white/40 hover:text-white/60"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-[#c9a94e] ring-2 ring-[#0a0118]" />
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
