import { Compass, Layers, MessageCircle, Settings } from "lucide-react";
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
    href: "/home",
    label: "Path",
    icon: Compass,
    activePrefixes: ["/home", "/dashboard", "/paths", "/readings", "/chronicle"],
    minStage: 0,
  },
  {
    href: "/decks",
    label: "Deck",
    icon: Layers,
    activePrefixes: ["/decks", "/studio"],
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
