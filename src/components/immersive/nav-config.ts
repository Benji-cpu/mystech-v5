import { Home, Sparkles, Map, Layers, Settings, MessageSquarePlus } from "lucide-react";
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
  { href: "/home", label: "Home", icon: Home, activePrefixes: ["/home", "/dashboard"], minStage: 0 },
  { href: "/readings/quick", label: "Draw", icon: Sparkles, activePrefixes: ["/readings"], minStage: 0 },
  { href: "/decks", label: "Decks", icon: Layers, activePrefixes: ["/decks", "/chronicle"], minStage: 2, badgeKey: "decks" },
  { href: "/paths", label: "Paths", icon: Map, activePrefixes: ["/paths"], minStage: 3, badgeKey: "paths" },
  { href: "#", label: "Feedback", icon: MessageSquarePlus, activePrefixes: [], minStage: 0, isAction: true, actionId: "feedback" },
  { href: "/settings", label: "Settings", icon: Settings, activePrefixes: ["/settings"], minStage: 0, desktopOnly: true },
];
