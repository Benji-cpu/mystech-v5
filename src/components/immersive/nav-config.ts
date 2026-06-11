import { Sun, Layers, MessageCircle, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavTab {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pathname prefixes that mark this tab as active */
  activePrefixes: string[];
  /** Minimum onboarding stage to show this tab */
  minStage: number;
  /** Storage key for badge dismissal */
  badgeKey?: string;
  /** Only show in desktop sidebar, not bottom nav */
  desktopOnly?: boolean;
  /** If true, renders as a button that triggers an action instead of a link */
  isAction?: boolean;
  /** Identifies which action to trigger (e.g. "feedback") */
  actionId?: string;
}

export const BADGE_STORAGE_PREFIX = "mystech:dismissed-nav-badges:";

export const navTabs: NavTab[] = [
  {
    href: "/today",
    label: "Today",
    icon: Sun,
    activePrefixes: ["/today", "/home", "/dashboard", "/paths", "/readings", "/chronicle", "/daily"],
    minStage: 0,
  },
  {
    href: "/decks",
    label: "Deck",
    icon: Layers,
    activePrefixes: ["/decks", "/studio", "/art-styles"],
    minStage: 0,
  },
  {
    href: "#feedback",
    label: "Feedback",
    icon: MessageCircle,
    activePrefixes: [],
    minStage: 0,
    isAction: true,
    actionId: "feedback",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    activePrefixes: ["/settings"],
    minStage: 0,
  },
];
