export interface FeedbackContext {
  pageUrl: string;
  pageTitle: string;
  routeParams: Record<string, string>;
  viewportWidth: number;
  viewportHeight: number;
  userAgent: string;
  contextSummary: string;
}

const ROUTE_PATTERNS: Array<{
  pattern: RegExp;
  label: string;
  params: string[];
}> = [
  { pattern: /^\/decks\/([^/]+)\/cards\/([^/]+)$/, label: "Deck > Card", params: ["deckId", "cardId"] },
  { pattern: /^\/decks\/([^/]+)$/, label: "Deck", params: ["deckId"] },
  { pattern: /^\/decks$/, label: "Decks", params: [] },
  { pattern: /^\/readings\/([^/]+)$/, label: "Reading", params: ["readingId"] },
  { pattern: /^\/readings$/, label: "Readings", params: [] },
  { pattern: /^\/paths\/([^/]+)$/, label: "Path", params: ["pathId"] },
  { pattern: /^\/paths$/, label: "Paths", params: [] },
  { pattern: /^\/chronicle/, label: "Chronicle", params: [] },
  { pattern: /^\/guide/, label: "Guide", params: [] },
  { pattern: /^\/today/, label: "Today", params: [] },
  { pattern: /^\/settings/, label: "Settings", params: [] },
  { pattern: /^\/admin/, label: "Admin", params: [] },
  { pattern: /^\/shared\/([^/]+)$/, label: "Shared", params: ["shareToken"] },
  { pattern: /^\/$/, label: "Home", params: [] },
];

export function captureFeedbackContext(): FeedbackContext {
  const pathname = window.location.pathname;
  const pageTitle = document.title;

  const routeParams: Record<string, string> = {};
  let contextSummary = pathname;

  for (const route of ROUTE_PATTERNS) {
    const match = pathname.match(route.pattern);
    if (match) {
      contextSummary = route.label;
      route.params.forEach((param, i) => {
        if (match[i + 1]) {
          routeParams[param] = match[i + 1];
        }
      });
      break;
    }
  }

  return {
    pageUrl: window.location.href,
    pageTitle,
    routeParams,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    contextSummary,
  };
}
