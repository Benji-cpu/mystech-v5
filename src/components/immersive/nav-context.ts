export interface NavContext {
  section: string | null;
  depth: number;
  backTarget: string | null;
  backLabel: string | null;
  focusMode: boolean;
  focusTitle: string | null;
  focusSubtitle: string | null;
}

interface RouteRule {
  pattern: RegExp;
  backTarget: string;
  backLabel: string;
  focusMode?: boolean;
  focusTitle?: string;
  focusSubtitle?: string;
}

/**
 * Ordered rules — first match wins.
 * Dynamic segments use [^/]+ to match any ID.
 */
const routeRules: RouteRule[] = [
  // Deck creation sub-flows (focus mode — multi-step ceremonies)
  { pattern: /^\/decks\/new\/journey\/[^/]+\/review$/, backTarget: "/decks", backLabel: "Decks", focusMode: true, focusTitle: "Guided Journey", focusSubtitle: "Review your cards" },
  { pattern: /^\/decks\/new\/journey\/[^/]+\/chat$/, backTarget: "/decks", backLabel: "Decks", focusMode: true, focusTitle: "Guided Journey", focusSubtitle: "Conversation with Lyra" },
  { pattern: /^\/decks\/new\/journey$/, backTarget: "/decks/new", backLabel: "Create Deck", focusMode: true, focusTitle: "Guided Journey", focusSubtitle: "Setup your journey" },
  { pattern: /^\/decks\/new\/simple$/, backTarget: "/decks/new", backLabel: "Create Deck", focusMode: true, focusTitle: "Quick Create", focusSubtitle: "Build a deck in minutes" },
  { pattern: /^\/decks\/new$/, backTarget: "/decks", backLabel: "Decks", focusMode: true, focusTitle: "Create Deck", focusSubtitle: "Choose your path" },

  // Deck detail + edit (NOT focus mode — simple forms)
  { pattern: /^\/decks\/[^/]+\/edit$/, backTarget: "PARENT", backLabel: "Back" },
  { pattern: /^\/decks\/[^/]+$/, backTarget: "/decks", backLabel: "Decks" },

  // Readings (focus mode for new reading flow)
  { pattern: /^\/readings\/new$/, backTarget: "/readings", backLabel: "Readings", focusMode: true, focusTitle: "New Reading", focusSubtitle: "Consult the cards" },
  { pattern: /^\/readings\/[^/]+$/, backTarget: "/readings", backLabel: "Readings" },

  // Paths (journey system)
  { pattern: /^\/paths\/[^/]+$/, backTarget: "/paths", backLabel: "Paths" },

  // Chronicle (focus mode — process flows)
  { pattern: /^\/chronicle\/today$/, backTarget: "/decks", backLabel: "Decks", focusMode: true, focusTitle: "Daily Chronicle", focusSubtitle: "Today's practice" },
  { pattern: /^\/chronicle\/setup$/, backTarget: "/dashboard", backLabel: "Dashboard", focusMode: true, focusTitle: "Chronicle Setup", focusSubtitle: "Begin your practice" },

  // Settings
  { pattern: /^\/settings\/billing$/, backTarget: "/settings", backLabel: "Settings" },
  { pattern: /^\/settings\/[^/]+$/, backTarget: "/settings", backLabel: "Settings" },

  // Onboarding (focus mode — immersive first-run experience)
  { pattern: /^\/onboarding$/, backTarget: "/dashboard", backLabel: "Dashboard", focusMode: true },

  // Admin sub-pages
  { pattern: /^\/admin\/[^/]+$/, backTarget: "/admin", backLabel: "Admin" },
];

function getParentPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "/";
  return "/" + segments.slice(0, -1).join("/");
}

export function getNavContext(pathname: string): NavContext {
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0] ?? null;
  const depth = segments.length;

  // Check specific rules FIRST (handles depth-1 focus-mode paths like /onboarding)
  for (const rule of routeRules) {
    if (rule.pattern.test(pathname)) {
      const backTarget = rule.backTarget === "PARENT" ? getParentPath(pathname) : rule.backTarget;
      return {
        section,
        depth,
        backTarget,
        backLabel: rule.backLabel,
        focusMode: rule.focusMode ?? false,
        focusTitle: rule.focusTitle ?? null,
        focusSubtitle: rule.focusSubtitle ?? null,
      };
    }
  }

  // Depth 0 or 1 = top level, no back navigation (after rule check)
  if (depth <= 1) {
    return { section, depth, backTarget: null, backLabel: null, focusMode: false, focusTitle: null, focusSubtitle: null };
  }

  // Fallback for unknown deep routes: go to section root
  const sectionRoot = "/" + segments[0];
  const sectionLabel = segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, " ");
  return { section, depth, backTarget: sectionRoot, backLabel: sectionLabel, focusMode: false, focusTitle: null, focusSubtitle: null };
}
