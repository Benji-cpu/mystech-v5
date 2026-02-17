export interface NavContext {
  section: string | null;
  depth: number;
  backTarget: string | null;
  backLabel: string | null;
}

interface RouteRule {
  pattern: RegExp;
  backTarget: string;
  backLabel: string;
}

/**
 * Ordered rules — first match wins.
 * Dynamic segments use [^/]+ to match any ID.
 */
const routeRules: RouteRule[] = [
  // Deck creation sub-flows
  { pattern: /^\/decks\/new\/journey\/[^/]+\/review$/, backTarget: "/decks", backLabel: "Decks" },
  { pattern: /^\/decks\/new\/journey\/[^/]+\/chat$/, backTarget: "/decks", backLabel: "Decks" },
  { pattern: /^\/decks\/new\/journey$/, backTarget: "/decks/new", backLabel: "Create Deck" },
  { pattern: /^\/decks\/new\/simple$/, backTarget: "/decks/new", backLabel: "Create Deck" },
  { pattern: /^\/decks\/new$/, backTarget: "/decks", backLabel: "Decks" },

  // Deck detail + edit
  { pattern: /^\/decks\/[^/]+\/edit$/, backTarget: "PARENT", backLabel: "Back" },
  { pattern: /^\/decks\/[^/]+$/, backTarget: "/decks", backLabel: "Decks" },

  // Readings
  { pattern: /^\/readings\/new$/, backTarget: "/readings", backLabel: "Readings" },
  { pattern: /^\/readings\/[^/]+$/, backTarget: "/readings", backLabel: "Readings" },

  // Explore (art styles)
  { pattern: /^\/explore\/styles\/new$/, backTarget: "/explore", backLabel: "Explore" },
  { pattern: /^\/explore\/styles\/[^/]+\/edit$/, backTarget: "PARENT", backLabel: "Back" },
  { pattern: /^\/explore\/styles\/[^/]+$/, backTarget: "/explore", backLabel: "Explore" },

  // Settings
  { pattern: /^\/settings\/billing$/, backTarget: "/settings", backLabel: "Settings" },
  { pattern: /^\/settings\/[^/]+$/, backTarget: "/settings", backLabel: "Settings" },

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

  // Depth 0 or 1 = top level, no back navigation
  if (depth <= 1) {
    return { section, depth, backTarget: null, backLabel: null };
  }

  // Check specific rules
  for (const rule of routeRules) {
    if (rule.pattern.test(pathname)) {
      const backTarget = rule.backTarget === "PARENT" ? getParentPath(pathname) : rule.backTarget;
      return { section, depth, backTarget, backLabel: rule.backLabel };
    }
  }

  // Fallback for unknown deep routes: go to section root
  const sectionRoot = "/" + segments[0];
  const sectionLabel = segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, " ");
  return { section, depth, backTarget: sectionRoot, backLabel: sectionLabel };
}
