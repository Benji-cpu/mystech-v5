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
  /**
   * Suppress the global `FocusHeader` because the route renders its own
   * header inside its layout. `FocusHeader` is `fixed top-0` with no
   * background, so on a route that owns its chrome it prints itself on top of
   * the content. Keeps `focusMode` (which dims the navs) intact.
   */
  ownHeader?: boolean;
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

  // Art styles (folded under /decks — static segment wins over [deckId])
  { pattern: /^\/decks\/styles\/new$/, backTarget: "/decks/styles", backLabel: "Art Styles" },
  { pattern: /^\/decks\/styles\/[^/]+\/edit$/, backTarget: "PARENT", backLabel: "Style" },
  { pattern: /^\/decks\/styles\/[^/]+$/, backTarget: "/decks/styles", backLabel: "Art Styles" },
  { pattern: /^\/decks\/styles$/, backTarget: "/decks", backLabel: "Decks" },

  // Card refinement (focus mode — lives under its deck)
  { pattern: /^\/decks\/[^/]+\/cards\/[^/]+$/, backTarget: "PARENT2", backLabel: "Deck", focusMode: true, focusTitle: "Card Refinement", focusSubtitle: "Refine the artwork" },

  // Deck detail + edit (NOT focus mode — simple forms)
  { pattern: /^\/decks\/[^/]+\/edit$/, backTarget: "PARENT", backLabel: "Back" },
  { pattern: /^\/decks\/[^/]+$/, backTarget: "/decks", backLabel: "Decks" },

  // Readings (focus mode for new reading flow)
  { pattern: /^\/readings\/quick$/, backTarget: "/today", backLabel: "Today", focusMode: true, focusTitle: "Quick Draw", focusSubtitle: "Pull a card" },
  { pattern: /^\/readings\/new$/, backTarget: "/story", backLabel: "Story", focusMode: true, ownHeader: true },
  { pattern: /^\/readings\/[^/]+$/, backTarget: "/story", backLabel: "Story" },

  // Paths — the "focus" picker, reached from Story
  { pattern: /^\/paths\/[^/]+$/, backTarget: "/paths", backLabel: "Focus" },
  { pattern: /^\/paths$/, backTarget: "/story", backLabel: "Story" },

  // Chronicle (focus mode — process flows). /chronicle/today now redirects to /today.
  { pattern: /^\/chronicle\/setup$/, backTarget: "/today", backLabel: "Today", focusMode: true, focusTitle: "Chronicle Setup", focusSubtitle: "Begin your practice" },

  // Settings
  { pattern: /^\/settings\/billing$/, backTarget: "/settings", backLabel: "Settings" },
  { pattern: /^\/settings\/[^/]+$/, backTarget: "/settings", backLabel: "Settings" },

  // Onboarding (focus mode — immersive first-run experience)
  { pattern: /^\/onboarding$/, backTarget: "/today", backLabel: "Today", focusMode: true },

  // Admin sub-pages
  { pattern: /^\/admin\/[^/]+$/, backTarget: "/admin", backLabel: "Admin" },
];

function getParentPath(pathname: string, levels = 1): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= levels) return "/";
  return "/" + segments.slice(0, -levels).join("/");
}

export function getNavContext(pathname: string): NavContext {
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0] ?? null;
  const depth = segments.length;

  // Check specific rules FIRST (handles depth-1 focus-mode paths like /onboarding)
  for (const rule of routeRules) {
    if (rule.pattern.test(pathname)) {
      const backTarget =
        rule.backTarget === "PARENT"
          ? getParentPath(pathname)
          : rule.backTarget === "PARENT2"
            ? getParentPath(pathname, 2)
            : rule.backTarget;
      // A route that renders its own header contributes no header content, so
      // `FocusHeader` finds nothing to draw and stays out of the way.
      if (rule.ownHeader) {
        return {
          section,
          depth,
          backTarget: null,
          backLabel: null,
          focusMode: rule.focusMode ?? false,
          focusTitle: null,
          focusSubtitle: null,
        };
      }

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
